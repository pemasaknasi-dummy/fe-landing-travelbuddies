import { ReactNode } from "react";
import Link from "next/link";
import Button from "../../ui/Button";
import { Compass, MapPin, Plane } from "lucide-react";

interface ErrorPageLayoutProps {
  errorCode?: string;
  headline: string;
  message: ReactNode;
  primaryCta: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  illustration: ReactNode;
}

const ErrorPageLayout = ({ errorCode, headline, message, primaryCta, secondaryCta, illustration }: ErrorPageLayoutProps) => {
  return (
    <div className="relative max-w-[1024px] 2xl:max-w-[1440px] mx-auto flex flex-col items-center justify-center px-4 py-12 bg-[image:var(--gradient-ocean)]">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Plane className="absolute top-[15%] left-[10%] w-8 h-8 text-primary/10 animate-float" />
        <MapPin className="absolute top-[25%] right-[15%] w-6 h-6 text-primary/15 animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto text-center">
        {/* Illustration */}
        <div className="mb-8 flex justify-center">{illustration}</div>

        {/* Error Code Badge */}
        {errorCode && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            Error {errorCode}
          </div>
        )}

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{headline}</h1>

        {/* Message */}
        <div className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md mx-auto">{message}</div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {primaryCta.href ? (
            <Link href={primaryCta.href}>
              <Button className="min-w-[180px] shadow-brand cursor-pointer">{primaryCta.label}</Button>
            </Link>
          ) : (
            <Button className="min-w-[180px] shadow-brand cursor-pointer" onClick={primaryCta.onClick}>
              {primaryCta.label}
            </Button>
          )}

          {secondaryCta && (
            <Link href={secondaryCta.href}>
              <Button variant="outline" className="min-w-[180px] cursor-pointer">
                {secondaryCta.label}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Brand Footer */}
      <div className="mt-20 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity text-blue-500 ">
          <Compass className="w-5 h-5" />
          <span className="font-bold">TravelBuddies</span>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPageLayout;
