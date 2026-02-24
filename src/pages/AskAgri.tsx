import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, CheckCircle, Plus, Eye, Loader2, X } from "lucide-react";
import { questions as mockQuestions } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
}

const AskAgri = () => {
  const [dbQuestions, setDbQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTags, setNewTags] = useState("");
  const [posting, setPosting] = useState(false);
  const { isLoggedIn, supabaseUser, user } = useAuth();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const userIds = [...new Set(data.map(q => q.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      setDbQuestions(data.map((q) => ({
        id: q.id,
        question: q.title,
        author: nameMap.get(q.user_id) || "Unknown",
        tags: q.tags || [],
        upvotes: q.votes || 0,
        answers: q.answers || 0,
        time: new Date(q.created_at).toLocaleDateString(),
        followed: false,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleAsk = async () => {
    if (!supabaseUser || !newTitle.trim()) return;
    setPosting(true);
    const tags = newTags.split(",").map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from("questions").insert({
      user_id: supabaseUser.id,
      title: newTitle.trim(),
      body: newBody.trim() || null,
      tags: tags.length > 0 ? tags : null,
    });
    if (error) {
      toast({ title: "Failed to post question", description: error.message, variant: "destructive" });
    } else {
      setNewTitle(""); setNewBody(""); setNewTags("");
      setShowNew(false);
      toast({ title: "Question posted!" });
      fetchQuestions();
    }
    setPosting(false);
  };

  const allQuestions = [...dbQuestions, ...mockQuestions.filter(mq => !dbQuestions.some(dq => dq.question === mq.question))];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Ask Agri</h1>
          <p className="text-muted-foreground text-sm">Ask questions and get expert answers</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowNew(!showNew)}>
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? "Cancel" : "Ask Question"}
        </Button>
      </div>

      {showNew && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What's your question?" />
            <Textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Add more details (optional)..." rows={3} />
            <Input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Tags (comma-separated, e.g. Maize, Pest Control)" />
            <div className="flex justify-end">
              <Button onClick={handleAsk} disabled={posting || !newTitle.trim() || !isLoggedIn}>
                {posting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Posting...</> : "Ask Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
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
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    {q.bestAnswer && (
                      <div className="bg-muted rounded-lg p-3 text-sm mb-2">
                        <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Best Answer</p>
                        <p className="text-muted-foreground">{q.bestAnswer}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>by {q.author}</span>
                      <span>{q.time}</span>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Eye className="w-3 h-3" /> {q.followed ? "Following" : "Follow"}
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
