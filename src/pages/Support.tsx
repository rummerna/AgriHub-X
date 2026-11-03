import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, User, ShoppingCart, Users, Cpu, Shield, Mail, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, mailtoLink, whatsappLink } from "@/data/contact";
import { supportFaqs, popularFaqIds, filterFaqs, faqCount, type HelpCategory } from "@/data/supportFaqs";

const categories: { icon: typeof BookOpen; label: HelpCategory }[] = [
  { icon: BookOpen, label: "Getting Started" }, { icon: User, label: "Account & Profile" },
  { icon: ShoppingCart, label: "Marketplace" }, { icon: Users, label: "Community" },
  { icon: Cpu, label: "AI Ask Agri" }, { icon: Shield, label: "Privacy & Security" },
];
const focusStyle = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const Support = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HelpCategory>();
  const [openAnswers, setOpenAnswers] = useState<string[]>([]);
  const faqs = filterFaqs(query, selected);
  const openPopular = (id: string) => {
    setSelected(undefined);
    setQuery("");
    setOpenAnswers(values => values.includes(id) ? values : [...values, id]);
    requestAnimationFrame(() => document.getElementById(`faq-${id}`)?.scrollIntoView({ block: "start", behavior: "instant" }));
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Seo title="Help Center & Support — AgriHubX" description="Search real answers about AgriHubX accounts, listings, community, AI guidance and location privacy." path="/support" />
      <h1 className="text-3xl font-display font-bold text-center mb-2">How Can We Help?</h1>
      <p className="text-center text-muted-foreground mb-6">Search questions or browse by category</p>
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input aria-label="Search support questions" placeholder="Search support questions…" className="pl-10 min-h-11" value={query} onChange={event => setQuery(event.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {categories.map(({ icon: Icon, label }) => <Button key={label} variant="outline" aria-pressed={selected === label} onClick={() => setSelected(value => value === label ? undefined : label)} className={`h-auto min-h-20 p-4 justify-start whitespace-normal text-left ${selected === label ? "border-primary bg-primary/10" : ""}`}>
          <span className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></span>
          <span><span className="block font-semibold text-sm">{label}</span><span className="block text-sm text-muted-foreground">{faqCount(label)} answers</span></span>
        </Button>)}
      </div>
      {selected && <Button variant="ghost" onClick={() => setSelected(undefined)} className="min-h-11 mb-4">Show all categories</Button>}
      <section className="my-8" aria-label="Help answers">
        <Accordion type="multiple" value={openAnswers} onValueChange={setOpenAnswers}>
          {categories.map(({ label }) => {
            const group = faqs.filter(faq => faq.category === label);
            if (!group.length) return null;
            return <section key={label} className="mb-6">
              <h2 className="text-lg font-display font-semibold mb-2">{label}</h2>
              {group.map(faq => <AccordionItem key={faq.id} value={faq.id} id={`faq-${faq.id}`} className="scroll-mt-20">
                <AccordionTrigger className={`min-h-11 text-left gap-3 text-sm rounded ${focusStyle}`}>{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>)}
            </section>;
          })}
        </Accordion>
        {!faqs.length && <p role="status" className="text-center py-8 text-muted-foreground">No questions match</p>}
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-display font-semibold mb-3">Popular Articles</h2>
        <div className="space-y-2">{popularFaqIds.map(id => {
          const faq = supportFaqs.find(item => item.id === id);
          return faq ? <Button key={id} variant="outline" className="w-full h-auto min-h-11 py-3 text-left justify-start whitespace-normal" onClick={() => openPopular(id)}>{faq.question}</Button> : null;
        })}</div>
      </section>
      <section className="border-t border-border pt-6 text-center">
        <Button asChild className="min-h-11 h-auto whitespace-normal"><Link to="/contact">Still stuck? Contact us</Link></Button>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <Button asChild variant="outline" className="h-auto min-h-11 py-3 whitespace-normal"><a href={mailtoLink("Support request", "Hello AgriHubX team, I need help with: ")}><Mail /><span className="break-all">{CONTACT_EMAIL}</span></a></Button>
          <Button asChild variant="outline" className="h-auto min-h-11 py-3 whitespace-normal"><a href={whatsappLink("Hello AgriHubX team, I need help with: ")} target="_blank" rel="noopener noreferrer"><MessageCircle />{WHATSAPP_DISPLAY}</a></Button>
        </div>
      </section>
    </div>
  );
};
export default Support;
