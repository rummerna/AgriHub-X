import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import { searchSuggestions, products, communityPosts, questions, services } from "@/data/mock";

const Search = () => {
  const [query, setQuery] = useState("");

  const hasQuery = query.length > 1;
  const q = query.toLowerCase();

  const matchedProducts = hasQuery ? products.filter((p) => p.title.toLowerCase().includes(q)) : [];
  const matchedPosts = hasQuery ? communityPosts.filter((p) => p.content.toLowerCase().includes(q)) : [];
  const matchedQuestions = hasQuery ? questions.filter((p) => p.question.toLowerCase().includes(q)) : [];
  const matchedServices = hasQuery ? services.filter((p) => p.provider.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : [];

  const noResults = hasQuery && matchedProducts.length + matchedPosts.length + matchedQuestions.length + matchedServices.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search crops, fertilizers, weather, prices, or services…"
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

      {matchedProducts.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Products</h3>
          {matchedProducts.map((p) => (
            <Card key={p.id} className="mb-2"><CardContent className="p-3 text-sm flex justify-between"><span>{p.title}</span><span className="font-bold text-primary">{p.currency} {p.price.toLocaleString()}</span></CardContent></Card>
          ))}
        </section>
      )}

      {matchedPosts.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Community Posts</h3>
          {matchedPosts.map((p) => (
            <Card key={p.id} className="mb-2"><CardContent className="p-3 text-sm">{p.content.slice(0, 100)}…</CardContent></Card>
          ))}
        </section>
      )}

      {matchedQuestions.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Questions</h3>
          {matchedQuestions.map((q) => (
            <Card key={q.id} className="mb-2"><CardContent className="p-3 text-sm">{q.question}</CardContent></Card>
          ))}
        </section>
      )}

      {matchedServices.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Services</h3>
          {matchedServices.map((s) => (
            <Card key={s.id} className="mb-2"><CardContent className="p-3 text-sm flex justify-between"><span>{s.provider}</span><Badge variant="secondary" className="text-xs">{s.category}</Badge></CardContent></Card>
          ))}
        </section>
      )}

      {noResults && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results found for "{query}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try searching for maize, fertilizer, or vet services</p>
        </div>
      )}
    </div>
  );
};

export default Search;
