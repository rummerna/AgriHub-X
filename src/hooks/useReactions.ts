import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReactionCounts {
  upvote: number;
  downvote: number;
  love: number;
  insightful: number;
}

export const useReactions = (targetType: string, targetId: string) => {
  const [counts, setCounts] = useState<ReactionCounts>({ upvote: 0, downvote: 0, love: 0, insightful: 0 });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { supabaseUser } = useAuth();
  const { toast } = useToast();

  const fetchReactions = useCallback(async () => {
    const { data } = await supabase
      .from("reactions")
      .select("reaction_type, user_id")
      .eq("target_type", targetType)
      .eq("target_id", targetId);

    if (data) {
      const c: ReactionCounts = { upvote: 0, downvote: 0, love: 0, insightful: 0 };
      let myReaction: string | null = null;
      data.forEach((r) => {
        if (r.reaction_type in c) c[r.reaction_type as keyof ReactionCounts]++;
        if (r.user_id === supabaseUser?.id) myReaction = r.reaction_type;
      });
      setCounts(c);
      setUserReaction(myReaction);
    }
  }, [targetType, targetId, supabaseUser?.id]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggleReaction = useCallback(async (type: string) => {
    if (!supabaseUser) {
      toast({ title: "Please sign in to react", variant: "destructive" });
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      if (userReaction === type) {
        // Remove reaction (toggle off)
        await supabase
          .from("reactions")
          .delete()
          .eq("target_type", targetType)
          .eq("target_id", targetId)
          .eq("user_id", supabaseUser.id);
        setUserReaction(null);
        setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type as keyof ReactionCounts] - 1) }));
      } else {
        // Remove old reaction if exists
        if (userReaction) {
          await supabase
            .from("reactions")
            .delete()
            .eq("target_type", targetType)
            .eq("target_id", targetId)
            .eq("user_id", supabaseUser.id);
          setCounts((prev) => ({ ...prev, [userReaction!]: Math.max(0, prev[userReaction as keyof ReactionCounts] - 1) }));
        }
        // Insert new reaction
        await supabase.from("reactions").insert({
          target_type: targetType,
          target_id: targetId,
          user_id: supabaseUser.id,
          reaction_type: type,
        });
        setUserReaction(type);
        setCounts((prev) => ({ ...prev, [type]: prev[type as keyof ReactionCounts] + 1 }));
      }
    } catch (err: any) {
      toast({ title: "Reaction failed", description: err.message, variant: "destructive" });
      fetchReactions();
    }
    setLoading(false);
  }, [supabaseUser, userReaction, targetType, targetId, loading, fetchReactions, toast]);

  return { counts, userReaction, toggleReaction, loading };
};
