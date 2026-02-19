import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const openings = [
  { title: "Student Intern – Software Development", location: "St. John Tala High School", type: "Internship" },
  { title: "Student Intern – Community Outreach", location: "Tala Region", type: "Internship" },
  { title: "Agricultural Research Assistant", location: "Remote / Tala", type: "Part-time" },
  { title: "Content Creator (Farmer Stories)", location: "Remote", type: "Volunteer" },
  { title: "School Ambassador Program", location: "Any School in Kenya", type: "Volunteer" },
];

const Careers = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <section className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Grow With Us 🌱</h1>
      <p className="text-muted-foreground max-w-xl mx-auto">Join a student-led startup that's transforming agriculture. Gain hands-on experience, make real impact, and grow your skills.</p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-display font-semibold mb-4">Current Openings</h2>
      <div className="space-y-3">
        {openings.map((job) => (
          <Card key={job.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{job.type}</Badge>
                <Button size="sm">Apply</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="font-display font-semibold mb-2">Benefits</h3>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Hands-on experience in a real startup</li>
          <li>Impact-driven work that helps real farmers</li>
          <li>Mentorship from teachers and peers</li>
          <li>Certificate of participation</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export default Careers;
