import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Plus } from "lucide-react";
import { communityPosts, trendingTopics } from "@/data/mock";

const Community = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Agri Community</h1>
          <p className="text-muted-foreground text-sm">Connect with farmers in your region</p>
        </div>
        <Button className="gap-1.5"><Plus className="w-4 h-4" /> New Post</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="md:col-span-2 space-y-4">
          {communityPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-primary">
                    {post.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{post.author}</p>
                      {"isDemo" in post && post.isDemo && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground">DEMO</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.county}, {post.country} · {post.time}</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{post.content}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {post.upvotes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" /> {post.comments}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-sm">🔥 Trending Topics</h3>
              <div className="flex flex-wrap gap-1.5">
                {trendingTopics.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">⚠️ Alerts</h3>
              <p className="text-xs text-muted-foreground">🌧️ Rain expected in Machakos tomorrow</p>
              <p className="text-xs text-muted-foreground">🐛 Fall armyworm alert in Kisumu</p>
              <p className="text-xs text-muted-foreground">☕ Coffee berry disease rising in highlands</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Community;
