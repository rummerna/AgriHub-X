import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, X } from "lucide-react";
import { trendingTopics } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import ImageGrid from "@/components/ImageGrid";
import PostReactions from "@/components/PostReactions";

interface Post {
  id: string;
  author: string;
  county: string;
  country: string;
  content: string;
  tags: string[];
  upvotes: number;
  comments: number;
  time: string;
  imageUrls: string[];
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const { isLoggedIn, supabaseUser } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles_public" as any).select("user_id, full_name, country, county").in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setPosts(data.map((p: any) => {
        const prof = profileMap.get(p.user_id);
        return {
          id: p.id,
          author: prof?.full_name || "Unknown",
          county: prof?.county || "",
          country: prof?.country || "",
          content: p.content,
          tags: [],
          upvotes: p.likes || 0,
          comments: p.comments || 0,
          time: new Date(p.created_at).toLocaleDateString(),
          imageUrls: p.image_urls || [],
        };
      }));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!supabaseUser || !newContent.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      user_id: supabaseUser.id,
      content: newContent.trim(),
      image_urls: newImages.length > 0 ? newImages : [],
    });
    if (error) {
      toast({ title: "Failed to post", description: error.message, variant: "destructive" });
    } else {
      setNewContent("");
      setNewImages([]);
      setShowNew(false);
      toast({ title: "Post published!" });
      fetchPosts();
    }
    setPosting(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Agri Community</h1>
          <p className="text-muted-foreground text-sm">Connect with farmers in your region</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowNew(!showNew)}>
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? "Cancel" : "New Post"}
        </Button>
      </div>

      {showNew && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="What's on your farm today?" rows={3} />
            <ImageUpload bucket="post-images" folder={supabaseUser?.id || "anon"} maxImages={5} images={newImages} onChange={setNewImages} />
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={posting || !newContent.trim() || !isLoggedIn}>
                {posting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Posting...</> : "Post to Community"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm">Be the first to share something with the community!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-primary">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.county}{post.county && post.country ? ", " : ""}{post.country} · {post.time}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{post.content}</p>
                  {post.imageUrls.length > 0 && <ImageGrid images={post.imageUrls} />}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <PostReactions postId={post.id} commentCount={post.comments} />
                </CardContent>
              </Card>
            ))
          )}
        </div>

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
        </aside>
      </div>
    </div>
  );
};

export default Community;
