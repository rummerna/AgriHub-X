import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const posts = [
  { id: "1", title: "The Pawpaw Tree That Started It All: Blessed's Story", category: "Founder's Journey", excerpt: "When Blessed's pawpaw tree began dying, he searched everywhere for help. What he found instead was a problem affecting millions of farmers…", date: "Feb 15, 2026" },
  { id: "2", title: "25 Farmers, 25 Stories: What We Learned Riding Bicycles Through Tala", category: "Farmer Stories", excerpt: "Blessed rode his bicycle across the Tala region to meet farmers directly. Their responses shaped everything about AgriHubX…", date: "Feb 10, 2026" },
  { id: "3", title: "Building an App from Scratch: Nixon's Self-Taught Journey", category: "School Innovation", excerpt: "Every line of code was written specifically for AgriHubX. No templates, no frameworks — just determination and WiFi…", date: "Feb 5, 2026" },
  { id: "4", title: "How Privacy Became Our Priority: Lessons from Farmers", category: "Agricultural Tips", excerpt: "25 farmers told us the same thing: they were uncomfortable with apps tracking their location. So we built AgriHubX without GPS…", date: "Jan 28, 2026" },
];

const Blog = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-display font-bold text-center mb-2">Blog</h1>
    <p className="text-center text-muted-foreground mb-6">Stories from the field, insights for farmers</p>

    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder="Search articles…" className="pl-10" />
    </div>

    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <div className="aspect-video bg-muted rounded-t-lg" />
          <CardContent className="p-4">
            <Badge variant="secondary" className="text-xs mb-2">{post.category}</Badge>
            <h3 className="font-semibold mb-1">{post.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{post.excerpt}</p>
            <p className="text-xs text-muted-foreground">{post.date}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="shadow-md">
      <CardContent className="p-6 text-center">
        <h3 className="font-display font-semibold mb-2">Subscribe for Updates</h3>
        <p className="text-sm text-muted-foreground mb-3">Get farming tips and AgriHubX news in your inbox</p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <Input placeholder="Your email" type="email" />
          <Button>Subscribe</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Blog;
