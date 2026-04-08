import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Loader2, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const searchSuggestions = [
  "Maize", "Fertilizer", "Dairy farming", "Tractor rental",
  "Tomato seeds", "Pest control", "Veterinary", "Avocado",
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setProducts([]); setPosts([]); setQuestions([]); setServices([]);
      return;
    }
    const timer = setTimeout(() => searchAll(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchAll = async (q: string) => {
    setLoading(true);
    const pattern = `%${q}%`;
    const [
      { data: prods },
      { data: ps },
      { data: qs },
      { data: svcs },
    ] = await Promise.all([
      supabase.from("products").select("id, title, price, currency, category, county, country").ilike("title", pattern).limit(10),
      supabase.from("posts").select("id, content, created_at").ilike("content", pattern).limit(10),
      supabase.from("questions").select("id, title, tags").ilike("title", pattern).limit(10),
      supabase.from("services").select("id, title, category, price, currency, location").ilike("title", pattern).eq("status", "active").limit(10),
    ]);
    setProducts(prods || []);
    setPosts(ps || []);
    setQuestions(qs || []);
    setServices(svcs || []);
    setLoading(false);
  };

  const hasQuery = query.length >= 2;
  const totalResults = products.length + posts.length + questions.length + services.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search products, posts, questions, services…"
          className="pl-11 h-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!hasQuery && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Suggestions</h3>
          <div className="flex flex-wrap gap-2">
            {searchSuggestions.map((s) => (
              <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setQuery(s)}>{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {hasQuery && !loading && totalResults === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results found for "{query}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}

      {hasQuery && !loading && totalResults > 0 && (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            {products.length > 0 && <TabsTrigger value="products">Products ({products.length})</TabsTrigger>}
            {posts.length > 0 && <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>}
            {questions.length > 0 && <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>}
            {services.length > 0 && <TabsTrigger value="services">Services ({services.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {products.length > 0 && (
              <section>
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Products</h3>
                {products.map(p => (
                  <Link key={p.id} to={`/marketplace/${p.id}`}>
                    <Card className="mb-2 hover:shadow-md transition-shadow">
                      <CardContent className="p-3 text-sm flex justify-between items-center">
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.county}, {p.country}</p>
                        </div>
                        <span className="font-bold text-primary">{p.currency || "KES"} {Number(p.price).toLocaleString()}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </section>
            )}
            {services.length > 0 && (
              <section>
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Services</h3>
                {services.map(s => (
                  <Link key={s.id} to={`/services/${s.id}`}>
                    <Card className="mb-2 hover:shadow-md transition-shadow">
                      <CardContent className="p-3 text-sm flex justify-between items-center">
                        <div>
                          <p className="font-medium">{s.title}</p>
                          <Badge variant="secondary" className="text-xs mt-1">{s.category}</Badge>
                        </div>
                        {s.price && <span className="font-bold text-primary">{s.currency || "KES"} {Number(s.price).toLocaleString()}</span>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </section>
            )}
            {posts.length > 0 && (
              <section>
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Community Posts</h3>
                {posts.map(p => (
                  <Card key={p.id} className="mb-2"><CardContent className="p-3 text-sm">{p.content?.slice(0, 120)}…</CardContent></Card>
                ))}
              </section>
            )}
            {questions.length > 0 && (
              <section>
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Questions</h3>
                {questions.map(q => (
                  <Card key={q.id} className="mb-2"><CardContent className="p-3 text-sm">{q.title}</CardContent></Card>
                ))}
              </section>
            )}
          </TabsContent>

          {products.length > 0 && (
            <TabsContent value="products" className="space-y-2">
              {products.map(p => (
                <Link key={p.id} to={`/marketplace/${p.id}`}>
                  <Card className="mb-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 text-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.category} · {p.county}, {p.country}</p>
                      </div>
                      <span className="font-bold text-primary">{p.currency || "KES"} {Number(p.price).toLocaleString()}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>
          )}
          {posts.length > 0 && (
            <TabsContent value="posts" className="space-y-2">
              {posts.map(p => (
                <Card key={p.id} className="mb-2"><CardContent className="p-3 text-sm">{p.content?.slice(0, 200)}…</CardContent></Card>
              ))}
            </TabsContent>
          )}
          {questions.length > 0 && (
            <TabsContent value="questions" className="space-y-2">
              {questions.map(q => (
                <Card key={q.id} className="mb-2"><CardContent className="p-3 text-sm">{q.title}</CardContent></Card>
              ))}
            </TabsContent>
          )}
          {services.length > 0 && (
            <TabsContent value="services" className="space-y-2">
              {services.map(s => (
                <Link key={s.id} to={`/services/${s.id}`}>
                  <Card className="mb-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 text-sm flex justify-between items-center">
                      <span>{s.title}</span>
                      <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default Search;
