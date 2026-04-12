import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  reviewer_initial: string;
}

interface ReviewListProps {
  userId: string;
}

const ReviewList = ({ userId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer_id")
        .eq("reviewed_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", reviewerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        setReviews(data.map(r => {
          const profile = profileMap.get(r.reviewer_id);
          return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            reviewer_name: profile?.full_name || "User",
            reviewer_initial: (profile?.full_name?.charAt(0) || "U").toUpperCase(),
          };
        }));
      }
      setLoading(false);
    };
    fetchReviews();
  }, [userId]);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />;
  if (reviews.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>;

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="border border-border rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {r.reviewer_initial}
              </div>
              <span className="text-sm font-medium">{r.reviewer_name}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "text-accent fill-accent" : "text-muted"}`} />
              ))}
            </div>
          </div>
          {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
          <p className="text-xs text-muted-foreground">
            {new Date(r.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
