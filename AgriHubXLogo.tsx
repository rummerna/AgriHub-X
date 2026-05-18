/**
 * AgriHubXLogo — reusable SVG logo component
 * Usage:
 *   <AgriHubXLogo size="sm" />   — nav bar (36px icon + text)
 *   <AgriHubXLogo size="md" />   — footer / mid-size
 *   <AgriHubXLogo size="lg" />   — auth pages / hero
 *   <AgriHubXLogo iconOnly />    — just the mark (app icon, favicon preview)
 *   <AgriHubXLogo theme="light" /> — for light backgrounds
 */

interface Props {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  theme?: "dark" | "light";
  className?: string;
}

const ICON_SIZES = { sm: 36, md: 52, lg: 72 };
const TEXT_SIZES = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" };
const TAG_SIZES  = { sm: "hidden", md: "text-[8px]", lg: "text-[10px]" };

export default function AgriHubXLogo({
  size = "sm",
  iconOnly = false,
  theme = "dark",
  className = "",
}: Props) {
  const px = ICON_SIZES[size];
  const isLight = theme === "light";

  const green    = isLight ? "#16a34a" : "#22c55e";
  const greenMid = isLight ? "#22c55e" : "#4ade80";
  const greenDim = isLight ? "#14532d" : "#15803d";
  const veinCol  = isLight ? "#16a34a" : "#86efac";
  const plateFill= isLight ? "rgba(22,163,74,0.07)" : "#060e06";
  const hexStroke= isLight ? "rgba(22,163,74,0.55)" : "rgba(74,222,128,0.75)";
  const hexInner = isLight ? "rgba(22,163,74,0.12)" : "rgba(34,197,94,0.14)";
  const ringDash = isLight ? "rgba(22,163,74,0.28)" : "rgba(34,197,94,0.45)";
  const nodeCol  = isLight ? "#16a34a" : "#4ade80";
  const connLine = isLight ? "rgba(22,163,74,0.14)" : "rgba(34,197,94,0.14)";
  const rowLine  = isLight ? "rgba(22,163,74,0.18)" : "rgba(34,197,94,0.2)";
  const glowFill = isLight ? "rgba(22,163,74,0.0)" : "rgba(34,197,94,0.28)";
  const shineCol = isLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.32)";

  const uid = size + (isLight ? "L" : "D");

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <radialGradient id={`lg1-${uid}`} cx="38%" cy="33%" r="65%">
            <stop offset="0%"   stopColor={greenMid} />
            <stop offset="48%"  stopColor={green} />
            <stop offset="100%" stopColor={greenDim} />
          </radialGradient>
          <radialGradient id={`lg2-${uid}`} cx="34%" cy="28%" r="60%">
            <stop offset="0%"   stopColor={isLight ? "#86efac" : "#bbf7d0"} />
            <stop offset="100%" stopColor={green} />
          </radialGradient>
          <radialGradient id={`gc-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={green} stopOpacity={isLight ? "0.1" : "0.32"} />
            <stop offset="100%" stopColor={green} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`og-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="65%"  stopColor={green} stopOpacity="0" />
            <stop offset="100%" stopColor={green} stopOpacity={isLight ? "0.1" : "0.2"} />
          </radialGradient>
          <linearGradient id={`sg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={isLight ? "#86efac" : "#bbf7d0"} />
            <stop offset="100%" stopColor={greenDim} />
          </linearGradient>
          <linearGradient id={`rg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={greenMid} stopOpacity="0.9" />
            <stop offset="50%"  stopColor={green}    stopOpacity="0.45" />
            <stop offset="100%" stopColor={greenDim}  stopOpacity="0.8" />
          </linearGradient>
          <filter id={`gf-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`ng-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id={`hc-${uid}`}>
            <polygon points="50,8 87,27 87,73 50,92 13,73 13,27"/>
          </clipPath>
        </defs>

        {/* Outer ambient glow ring */}
        <circle cx="50" cy="50" r="50" fill={`url(#og-${uid})`}/>

        {/* Dashed orbital */}
        <circle cx="50" cy="50" r="46" fill="none"
          stroke={ringDash} strokeWidth="0.65" strokeDasharray="2.2 4"/>

        {/* Secondary ring */}
        <circle cx="50" cy="50" r="41.5" fill="none"
          stroke={hexInner} strokeWidth="0.45"/>

        {/* Hex plate */}
        <polygon points="50,10 83,28 83,72 50,90 17,72 17,28"
          fill={plateFill} stroke={`url(#rg-${uid})`} strokeWidth="1.3"/>

        {/* Hex inner glow fill */}
        <polygon points="50,10 83,28 83,72 50,90 17,72 17,28"
          fill={`url(#gc-${uid})`}/>

        {/* Inner hex frame */}
        <polygon points="50,19 74,32 74,68 50,81 26,68 26,32"
          fill="none" stroke={hexInner} strokeWidth="0.65"/>

        {/* Hex corner nodes */}
        {([
          [50,10],[83,28],[83,72],[50,90],[17,72],[17,28]
        ] as [number,number][]).map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="1.9"
            fill={nodeCol} opacity={i===0||i===3?"0.9":"0.65"}/>
        ))}

        {/* Crop row perspective lines at base */}
        <g clipPath={`url(#hc-${uid})`} opacity="1">
          {[17,27,37,50,63,73,83].map((bx,i) => (
            <line key={i} x1={bx} y1={84} x2="50" y2="58"
              stroke={rowLine} strokeWidth="0.65"/>
          ))}
        </g>

        {/* Leaf shadow */}
        <path
          d="M50 76C50 76 26 63 26 43C26 43 35 24 52 26C69 28 68 47 58 56C53 61 50 76 50 76Z"
          fill="#020802" transform="translate(2.5,3)" opacity="0.55"
          clipPath={`url(#hc-${uid})`}
        />

        {/* Main leaf body */}
        <g filter={`url(#gf-${uid})`}>
          <path
            d="M50 76C50 76 26 63 26 43C26 43 35 24 52 26C69 28 68 47 58 56C53 61 50 76 50 76Z"
            fill={`url(#lg1-${uid})`}
          />
        </g>

        {/* Leaf surface highlight */}
        <path
          d="M50 69C50 69 30 57 30 43C30 43 38 27 52 29C65 31 64 47 56 55C52 59 50 69 50 69Z"
          fill={`url(#lg2-${uid})`} opacity="0.42"
        />

        {/* Specular shine */}
        <path d="M44 32C47 27 55 28 59 32C57 30 51 29 47 31Z"
          fill={shineCol}/>
        <ellipse cx="47" cy="36" rx="3.5" ry="5.5"
          fill={shineCol} opacity="0.35" transform="rotate(-22 47 36)"/>

        {/* Primary midrib vein */}
        <path d="M50 74C49 74 47 56 38 41"
          stroke={`url(#sg-${uid})`} strokeWidth="1.65"
          strokeLinecap="round" opacity="0.88"/>

        {/* Secondary veins — left */}
        <path d="M48 61C44 57 38 55 35 52" stroke={veinCol} strokeWidth="0.85" strokeLinecap="round" opacity="0.52"/>
        <path d="M45 54C41 51 37 50 34 48" stroke={veinCol} strokeWidth="0.75" strokeLinecap="round" opacity="0.44"/>
        <path d="M43 47C40 45 37 45 35 44" stroke={veinCol} strokeWidth="0.68" strokeLinecap="round" opacity="0.38"/>
        <path d="M42 41C39 40 37 40 36 39" stroke={veinCol} strokeWidth="0.62" strokeLinecap="round" opacity="0.32"/>

        {/* Secondary veins — right */}
        <path d="M51 59C55 56 59 55 61 53" stroke={veinCol} strokeWidth="0.82" strokeLinecap="round" opacity="0.44"/>
        <path d="M50 52C54 50 57 50 59 49" stroke={veinCol} strokeWidth="0.72" strokeLinecap="round" opacity="0.38"/>
        <path d="M49 45C52 44 55 44 56 43" stroke={veinCol} strokeWidth="0.66" strokeLinecap="round" opacity="0.33"/>

        {/* Tertiary veins */}
        <path d="M44 58C43 56 42 55 41 55" stroke={green} strokeWidth="0.48" strokeLinecap="round" opacity="0.32"/>
        <path d="M42 51C41 50 40 50 39 50" stroke={green} strokeWidth="0.45" strokeLinecap="round" opacity="0.28"/>

        {/* Leaf tip edge detail */}
        <path d="M26 43C26 38 28 33 32 30"
          stroke={greenMid} strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.38"/>

        {/* Right bud (new growth) */}
        <path d="M58 45C61 41 65 40 67 42C65 44 62 45 58 45Z"
          fill={greenMid} opacity="0.72"/>
        <path d="M58 45C59.5 42 61 40 62 40"
          stroke={isLight?"#86efac":"#bbf7d0"} strokeWidth="0.68" strokeLinecap="round" opacity="0.6"/>

        {/* Left bud */}
        <path d="M36 46C33 42 29 42 28 44C30 45 34 46 36 46Z"
          fill={greenMid} opacity="0.52"/>

        {/* Stem */}
        <path d="M50 76C49.5 81 49 85 49 87"
          stroke={`url(#sg-${uid})`} strokeWidth="2.1" strokeLinecap="round"/>

        {/* Root tendrils */}
        <g clipPath={`url(#hc-${uid})`} opacity="0.38">
          <path d="M49 87C47 90 45 92 43 93" stroke={green} strokeWidth="0.72" strokeLinecap="round"/>
          <path d="M49 87C51 90 53 92 55 93" stroke={green} strokeWidth="0.72" strokeLinecap="round"/>
          <path d="M49 88C49 91 49 93 49 94" stroke={green} strokeWidth="0.82" strokeLinecap="round"/>
        </g>

        {/* Hub connection nodes — mid-hex sides */}
        <g filter={`url(#ng-${uid})`}>
          <circle cx="17" cy="50" r="2.6" fill={green} opacity="0.68"/>
          <circle cx="83" cy="50" r="2.6" fill={green} opacity="0.68"/>
          <circle cx="33.5" cy="19" r="2.1" fill={green} opacity="0.5"/>
          <circle cx="66.5" cy="19" r="2.1" fill={green} opacity="0.5"/>
          <circle cx="33.5" cy="81" r="2.1" fill={green} opacity="0.5"/>
          <circle cx="66.5" cy="81" r="2.1" fill={green} opacity="0.5"/>
        </g>

        {/* Hub connection lines */}
        <g stroke={connLine} strokeWidth="0.58">
          <line x1="17" y1="50" x2="38" y2="50"/>
          <line x1="83" y1="50" x2="62" y2="50"/>
          <line x1="33.5" y1="19" x2="43" y2="34"/>
          <line x1="66.5" y1="19" x2="57" y2="34"/>
        </g>

        {/* Hex top-face reflection */}
        <polygon
          points="50,10 83,28 75,28 50,17 25,28 17,28"
          fill="rgba(255,255,255,0.022)"
        />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col leading-none gap-0.5">
          <span className={`font-display font-bold tracking-wide ${TEXT_SIZES[size]} ${isLight ? "text-[#14532d]" : "text-foreground"}`}>
            <span className={isLight ? "text-[#14532d]" : "text-foreground"}>Agri</span>
            <span className={isLight ? "text-[#4d7c0f]" : "text-muted-foreground/60"}>Hub</span>
            <span style={{ color: green,
              textShadow: isLight ? "none" : `0 0 18px rgba(34,197,94,0.55)` }}>X</span>
          </span>
          {size !== "sm" && (
            <span className={`${TAG_SIZES[size]} font-medium tracking-widest uppercase`}
              style={{ color: isLight ? "rgba(22,163,74,0.55)" : "rgba(34,197,94,0.45)",
                letterSpacing: "0.38em" }}>
              East Africa · Agri Hub
            </span>
          )}
        </div>
      )}
    </div>
  );
}
