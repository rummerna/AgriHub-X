import { useId } from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** The AgriHubX "crop X" mark — two tapered crop stalks crossing with leaves and roots. */
export const LogoMark = ({ size = 40, className = "" }: LogoMarkProps) => {
  const uid = useId().replace(/:/g, "");
  const a1 = `${uid}-a1`;
  const a2 = `${uid}-a2`;
  const cg = `${uid}-cg`;
  const gf = `${uid}-gf`;
  const ng = `${uid}-ng`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AgriHubX logo"
    >
      <defs>
        <linearGradient id={a1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary-glow, var(--primary)))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <linearGradient id={a2} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary-glow, var(--primary)))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <radialGradient id={cg} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <filter id={gf} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={ng} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* orbit ring */}
      <circle
        cx="55"
        cy="55"
        r="50"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeOpacity="0.22"
        strokeWidth="0.8"
        strokeDasharray="3 5"
      />
      <circle cx="55" cy="55" r="20" fill={`url(#${cg})`} />

      {/* crossing stalks */}
      <path d="M20 18 Q37 36 55 55 Q73 74 90 92" stroke={`url(#${a1})`} strokeWidth="4.2" strokeLinecap="round" fill="none" />
      <path d="M90 18 Q73 36 55 55 Q37 74 20 92" stroke={`url(#${a2})`} strokeWidth="4.2" strokeLinecap="round" fill="none" />

      {/* leaves */}
      <g filter={`url(#${gf})`}>
        <path d="M32 28 C24 20 14 22 12 30 C20 28 28 30 32 28Z" fill={`url(#${a1})`} opacity="0.82" />
        <path d="M78 28 C86 18 98 22 98 30 C90 26 82 26 78 28Z" fill={`url(#${a2})`} opacity="0.82" />
        <path d="M44 42 C36 32 24 36 24 46 C32 40 40 40 44 42Z" fill={`url(#${a1})`} opacity="0.66" />
        <path d="M66 42 C74 32 88 36 86 46 C78 40 70 40 66 42Z" fill={`url(#${a2})`} opacity="0.66" />
        <path d="M68 70 C58 60 46 64 46 74 C54 68 64 68 68 70Z" fill="hsl(var(--primary))" opacity="0.62" />
        <path d="M42 70 C52 60 64 64 64 74 C56 68 46 68 42 70Z" fill="hsl(var(--primary))" opacity="0.62" />
      </g>

      {/* roots */}
      <g stroke="hsl(var(--primary))" strokeLinecap="round" opacity="0.5">
        <path d="M90 92 C92 96 94 100 92 104" strokeWidth="1.3" />
        <path d="M90 92 C94 94 98 95 100 93" strokeWidth="1" />
        <path d="M20 92 C18 96 16 100 18 104" strokeWidth="1.3" />
        <path d="M20 92 C16 94 12 95 10 93" strokeWidth="1" />
      </g>

      {/* core node */}
      <circle cx="55" cy="55" r="5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1" />
      <g filter={`url(#${ng})`}>
        <circle cx="55" cy="55" r="2.5" fill="hsl(var(--primary))" />
      </g>

      {/* tip nodes */}
      <g filter={`url(#${ng})`} opacity="0.65">
        <circle cx="20" cy="18" r="2" fill="hsl(var(--primary))" />
        <circle cx="90" cy="18" r="2" fill="hsl(var(--primary))" />
        <circle cx="20" cy="92" r="2" fill="hsl(var(--primary))" />
        <circle cx="90" cy="92" r="2" fill="hsl(var(--primary))" />
      </g>
    </svg>
  );
};

interface LogoProps {
  size?: number;
  /** show the AGRIHUBX wordmark next to the mark */
  wordmark?: boolean;
  /** show the tagline rule + line under the wordmark */
  tagline?: string;
  className?: string;
  /** font-size of the wordmark in px */
  wordmarkSize?: number;
}

const Logo = ({
  size = 36,
  wordmark = true,
  tagline,
  className = "",
  wordmarkSize = 20,
}: LogoProps) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    {wordmark && (
      <div className="flex flex-col">
        <div
          className="font-logo font-light leading-none tracking-[0.18em] whitespace-nowrap"
          style={{ fontSize: wordmarkSize }}
        >
          <span className="text-foreground">AGRI</span>
          <span className="text-muted-foreground font-extralight">HUB</span>
          <span className="text-primary font-medium" style={{ fontSize: "1.15em" }}>
            X
          </span>
        </div>
        {tagline && (
          <>
            <div className="h-px w-full my-1 bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
            <span className="font-tagline font-extralight text-[7.5px] uppercase tracking-[0.42em] text-primary/60">
              {tagline}
            </span>
          </>
        )}
      </div>
    )}
  </div>
);

export default Logo;
