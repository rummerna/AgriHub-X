import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import { mailtoLink } from "@/data/contact";
import { blogPosts, filterArticles, isValidSubscriptionEmail, SUBSCRIPTION_SUBJECT } from "@/data/publicContent";

const blogJsonLd = {
  "@context": "https://schema.org", "@type": "Blog", name: "AgriHubX Blog", url: "https://agrihubx.lovable.app/blog",
  blogPost: blogPosts.map(post => ({ "@type": "BlogPosting", headline: post.title, articleSection: post.category, description: post.excerpt, articleBody: post.body.join("\n\n"), author: { "@type": "Organization", name: "AgriHubX" } })),
};

const Blog = () => {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const posts = filterArticles(blogPosts, query);
  const subscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidSubscriptionEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    window.location.href = mailtoLink(SUBSCRIPTION_SUBJECT, `Hello AgriHubX team, I'd like to request updates at ${email.trim()}. Please let me know if updates become available.`);
    toast("Subscription request prepared", { description: "Send it from your email app. You have not been subscribed automatically." });
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Seo title="AgriHubX Blog — Development & Privacy" description="Read about building AgriHubX with AI-assisted tools and its approach to location privacy." path="/blog" ogType="article" jsonLd={blogJsonLd} />
      <h1 className="text-3xl font-display font-bold text-center mb-2">Blog</h1>
      <p className="text-center text-muted-foreground mb-6">Development notes and privacy insights</p>
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input aria-label="Search articles" placeholder="Search articles…" className="pl-10 min-h-11" value={query} onChange={event => setQuery(event.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-8 items-start">
        {posts.map(post => {
          const open = expanded.includes(post.id);
          return <Card key={post.id} className="hover:shadow-lg transition-shadow"><CardContent className="p-4">
            <Badge variant="secondary" className="text-xs mb-2">{post.category}</Badge>
            <h2 className="font-semibold mb-1"><Button variant="link" className="h-auto min-h-11 p-0 text-left whitespace-normal justify-start text-foreground font-semibold" aria-expanded={open} aria-controls={`article-${post.id}`} onClick={() => setExpanded(values => open ? values.filter(id => id !== post.id) : [...values, post.id])}>{post.title}{open ? <ChevronUp /> : <ChevronDown />}</Button></h2>
            <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
            {open && <div id={`article-${post.id}`} className="space-y-3 border-t border-border pt-3 text-sm leading-relaxed">{post.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>}
          </CardContent></Card>;
        })}
        {posts.length === 0 && <p role="status" className="sm:col-span-2 text-center py-8 text-muted-foreground">No articles match</p>}
      </div>
      <section className="border-t border-border py-6 text-center">
        <h2 className="font-display font-semibold mb-2">Subscribe for Updates</h2>
        <p className="text-sm text-muted-foreground mb-3">Request updates by email. There is no automatic newsletter subscription.</p>
        <form onSubmit={subscribe} noValidate className="max-w-sm mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input aria-label="Your email" placeholder="Your email" type="email" className="min-w-0 min-h-11" value={email} onChange={event => { setEmail(event.target.value); setEmailError(""); }} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "subscription-error" : undefined} />
            <Button type="submit" className="min-h-11">Subscribe</Button>
          </div>
          {emailError && <p id="subscription-error" role="alert" className="text-sm text-destructive mt-2">{emailError}</p>}
        </form>
      </section>
    </div>
  );
};
export default Blog;
