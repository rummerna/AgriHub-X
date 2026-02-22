import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const CONFETTI_COUNT = 60;
const colors = [
  "hsl(122, 46%, 34%)", "hsl(36, 100%, 50%)", "hsl(0, 84%, 60%)",
  "hsl(200, 80%, 50%)", "hsl(280, 60%, 55%)", "hsl(50, 100%, 55%)",
];

const SignupCelebration = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              backgroundColor: colors[i % colors.length],
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Message */}
      <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
          Congratulations! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">You're fully signed up for AgriHubX</p>
      </div>
    </div>
  );
};

export default SignupCelebration;
