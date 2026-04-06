import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  orderId: string;
  reviewedId: string;
  onSubmitted?: () => void;
}

const ReviewForm = ({ orderId, reviewedId, onSubmitted }: ReviewFormProps) => {
  const { supabaseUser } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!supabaseUser || rating === 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        order_id: orderId,
        reviewer_id: supabaseUser.id,
        reviewed_id: reviewedId,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;

      // Update reviewed user's avg rating
      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewed_id", reviewedId);

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await supabase.from("profiles").update({
          rating_avg: Math.round(avg * 100) / 100,
          rating_count: allReviews.length,
        }).eq("user_id", reviewedId);
      }

      toast({ title: "Review submitted!" });
      onSubmitted?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(i)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                i <= (hovered || rating) ? "text-accent fill-accent" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-muted-foreground ml-2 self-center">
          {rating > 0 ? `${rating}/5` : "Select rating"}
        </span>
      </div>
      <Textarea
        placeholder="Write your review (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={500}
      />
      <Button onClick={handleSubmit} disabled={rating === 0 || submitting} size="sm">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
        Submit Review
      </Button>
    </div>
  );
};

export default ReviewForm;
