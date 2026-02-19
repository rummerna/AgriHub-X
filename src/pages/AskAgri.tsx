import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, CheckCircle, Plus, Eye } from "lucide-react";
import { questions } from "@/data/mock";

const AskAgri = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Ask Agri</h1>
          <p className="text-muted-foreground text-sm">Ask questions and get expert answers</p>
        </div>
        <Button className="gap-1.5"><Plus className="w-4 h-4" /> Ask Question</Button>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
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
        ))}
      </div>
    </div>
  );
};

export default AskAgri;
