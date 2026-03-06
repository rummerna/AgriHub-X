import { ThumbsUp, ThumbsDown, Heart, Lightbulb, MessageCircle } from "lucide-react";
import { useReactions } from "@/hooks/useReactions";

interface PostReactionsProps {
  postId: string;
  commentCount: number;
}

const PostReactions = ({ postId, commentCount }: PostReactionsProps) => {
  const { counts, userReaction, toggleReaction, loading } = useReactions("post", postId);

  const buttons = [
    { type: "upvote", icon: ThumbsUp, count: counts.upvote, hoverColor: "hover:text-primary" },
    { type: "downvote", icon: ThumbsDown, count: counts.downvote, hoverColor: "hover:text-destructive" },
    { type: "love", icon: Heart, count: counts.love, hoverColor: "hover:text-red-500" },
    { type: "insightful", icon: Lightbulb, count: counts.insightful, hoverColor: "hover:text-yellow-500" },
  ];

  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      {buttons.map(({ type, icon: Icon, count, hoverColor }) => (
        <button
          key={type}
          onClick={() => toggleReaction(type)}
          disabled={loading}
          className={`flex items-center gap-1 transition-colors ${hoverColor} ${
            userReaction === type ? (type === "upvote" ? "text-primary" : type === "downvote" ? "text-destructive" : type === "love" ? "text-red-500" : "text-yellow-500") : ""
          }`}
        >
          <Icon className={`w-4 h-4 ${userReaction === type && type === "love" ? "fill-current" : ""}`} />
          {count > 0 && count}
        </button>
      ))}
      <button className="flex items-center gap-1 hover:text-primary transition-colors">
        <MessageCircle className="w-4 h-4" /> {commentCount > 0 && commentCount}
      </button>
    </div>
  );
};

export default PostReactions;
