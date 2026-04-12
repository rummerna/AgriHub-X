import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsUp, ThumbsDown, CheckCircle, Plus, Eye, Loader2, X,
  Sparkles, AlertTriangle, BookOpen, ArrowRight,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import ImageGrid from "@/components/ImageGrid";
import ReactMarkdown from "react-markdown";

interface Question {
  id: string;
  question: string;
  author: string;
  tags: string[];
  upvotes: number;
  answers: number;
  bestAnswer?: string;
  time: string;
  followed: boolean;
  imageUrls: string[];
}

interface AIAnswer {
  answer: string;
  confidence: number;
  category: string;
  sources: string[];
  related_questions: string[];
  urgency: string;
  actionable_steps: string[];
}

const urgencyColors: Record<string, string> = {
  high: "text-destructive",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-muted-foreground",
};

const AskAgri = () => {
  const [dbQuestions, setDbQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  // AI state
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<"up" | "down" | null>(null);
  const [activeAiQuestion, setActiveAiQuestion] = useState<string | null>(null);

  const { isLoggedIn, supabaseUser, user } = useAuth();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const userIds = [...new Set(data.map((q) => q.user_id))];
      const { data: profiles } = await supabase
        .from("profiles_public" as any)
        .select("user_id, full_name")
        .in("user_id", userIds);
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

      setDbQuestions(
        data.map((q: any) => ({
          id: q.id,
          question: q.title,
          author: nameMap.get(q.user_id) || "Unknown",
          tags: q.tags || [],
          upvotes: q.votes || 0,
          answers: q.answers || 0,
          time: new Date(q.created_at).toLocaleDateString(),
          followed: false,
          imageUrls: q.image_urls || [],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAsk = async () => {
    if (!supabaseUser || !newTitle.trim()) return;
    setPosting(true);
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const { error } = await supabase.from("questions").insert({
      user_id: supabaseUser.id,
      title: newTitle.trim(),
      body: newBody.trim() || null,
      tags: tags.length > 0 ? tags : null,
      image_urls: newImages.length > 0 ? newImages : [],
    });
    if (error) {
      toast({ title: "Failed to post question", description: error.message, variant: "destructive" });
    } else {
      setNewTitle("");
      setNewBody("");
      setNewTags("");
      setNewImages([]);
      setShowNew(false);
      toast({ title: "Question posted!" });
      fetchQuestions();
    }
    setPosting(false);
  };

  const askAI = async (question: string, questionId: string, body?: string, tags?: string[], imageUrls?: string[]) => {
    setAiLoading(true);
    setAiAnswer(null);
    setAiFeedback(null);
    setActiveAiQuestion(questionId);

    try {
      const { data, error } = await supabase.functions.invoke("ask-agri-ai", {
        body: {
          question,
          body: body || "",
          tags: tags || [],
          imageUrls: imageUrls || [],
          userCounty: user?.county || "",
          userCrops: [],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiAnswer(data as AIAnswer);
    } catch (e: any) {
      toast({
        title: "AI couldn't answer",
        description: e.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleRelatedQuestion = (q: string) => {
    setNewTitle(q);
    setShowNew(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allQuestions: Question[] = dbQuestions;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Ask Agri</h1>
          <p className="text-muted-foreground text-sm">
            Ask questions and get AI-powered + expert answers
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowNew(!showNew)}>
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? "Cancel" : "Ask Question"}
        </Button>
      </div>

      {showNew && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What's your question?"
            />
            <Textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Add more details (optional)..."
              rows={3}
            />
            <Input
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Tags (comma-separated, e.g. Maize, Pest Control)"
            />
            <ImageUpload
              bucket="question-images"
              folder={supabaseUser?.id || "anon"}
              maxImages={3}
              images={newImages}
              onChange={setNewImages}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => askAI(newTitle, "new-question", newBody, newTags.split(",").map(t => t.trim()).filter(Boolean), newImages)}
                disabled={aiLoading || !newTitle.trim()}
                className="gap-1.5"
              >
                {aiLoading && activeAiQuestion === "new-question" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Ask AI First
              </Button>
              <Button
                onClick={handleAsk}
                disabled={posting || !newTitle.trim() || !isLoggedIn}
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" /> Posting...
                  </>
                ) : (
                  "Post Question"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Answer Panel */}
      {(aiLoading || aiAnswer) && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">AI AgriBot Answer</h3>
              {aiAnswer && (
                <Badge
                  variant={aiAnswer.urgency === "high" ? "destructive" : "secondary"}
                  className="ml-auto text-xs"
                >
                  {aiAnswer.urgency === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {aiAnswer.category}
                </Badge>
              )}
            </div>

            {aiLoading ? (
              <div className="flex items-center gap-3 py-6 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing your question...</span>
              </div>
            ) : aiAnswer ? (
              <div className="space-y-4">
                {/* Confidence bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Confidence: {Math.round(aiAnswer.confidence * 100)}%
                  </span>
                  <Progress value={aiAnswer.confidence * 100} className="h-2 flex-1" />
                  {aiAnswer.confidence < 0.6 && (
                    <span className="text-xs text-destructive whitespace-nowrap">
                      Consider consulting an expert
                    </span>
                  )}
                </div>

                {/* Main answer */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{aiAnswer.answer}</ReactMarkdown>
                </div>

                {/* Actionable steps */}
                {aiAnswer.actionable_steps?.length > 0 && (
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-primary" /> Action Steps
                    </p>
                    <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                      {aiAnswer.actionable_steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Sources */}
                {aiAnswer.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    {aiAnswer.sources.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Related questions */}
                {aiAnswer.related_questions?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Related questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiAnswer.related_questions.map((rq, i) => (
                        <button
                          key={i}
                          onClick={() => handleRelatedQuestion(rq)}
                          className="text-xs text-primary hover:underline flex items-center gap-0.5"
                        >
                          <ArrowRight className="w-3 h-3" /> {rq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Was this helpful?</span>
                  <button
                    onClick={() => {
                      setAiFeedback("up");
                      toast({ title: "Thanks for your feedback!" });
                    }}
                    className={`p-1 rounded hover:bg-primary/10 transition-colors ${aiFeedback === "up" ? "text-primary" : "text-muted-foreground"}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setAiFeedback("down");
                      toast({ title: "We'll work to improve. Consider posting for expert advice." });
                    }}
                    className={`p-1 rounded hover:bg-destructive/10 transition-colors ${aiFeedback === "down" ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => {
                      setAiAnswer(null);
                      setActiveAiQuestion(null);
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          allQuestions.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 text-center min-w-[50px]">
                    <button className="flex flex-col items-center hover:text-primary transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-sm font-semibold">{q.upvotes}</span>
                    </button>
                    <div className="text-xs text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mx-auto" />
                      {q.answers}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{q.question}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {q.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {q.imageUrls.length > 0 && <ImageGrid images={q.imageUrls} maxVisible={3} />}
                    {q.bestAnswer && (
                      <div className="bg-muted rounded-lg p-3 text-sm mb-2">
                        <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Best Answer
                        </p>
                        <p className="text-muted-foreground">{q.bestAnswer}</p>
                      </div>
                    )}

                    {/* AI answer inline for this question */}
                    {activeAiQuestion === q.id && aiAnswer && !aiLoading && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm mb-2">
                        <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Answer ({Math.round(aiAnswer.confidence * 100)}%)
                        </p>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown>{aiAnswer.answer}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>by {q.author}</span>
                      <span>{q.time}</span>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Eye className="w-3 h-3" /> {q.followed ? "Following" : "Follow"}
                      </button>
                      <button
                        onClick={() => askAI(q.question, q.id, undefined, q.tags, q.imageUrls)}
                        disabled={aiLoading}
                        className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                      >
                        {aiLoading && activeAiQuestion === q.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI Answer
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AskAgri;
