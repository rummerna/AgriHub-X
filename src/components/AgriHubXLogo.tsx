import Logo, { LogoMark } from "@/components/brand/Logo";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { mark: number; wordmark: number }> = {
  sm: { mark: 28, wordmark: 15 },
  md: { mark: 40, wordmark: 18 },
  lg: { mark: 64, wordmark: 30 },
};

interface AgriHubXLogoProps {
  size?: Size;
  /** hide the AGRIHUBX wordmark and render the mark only */
  markOnly?: boolean;
  tagline?: string;
  className?: string;
}

const AgriHubXLogo = ({ size = "md", markOnly = false, tagline, className }: AgriHubXLogoProps) => {
  const { mark, wordmark } = SIZES[size];
  if (markOnly) return <LogoMark size={mark} className={className} />;
  return <Logo size={mark} wordmarkSize={wordmark} tagline={tagline} className={className} />;
};

export default AgriHubXLogo;
