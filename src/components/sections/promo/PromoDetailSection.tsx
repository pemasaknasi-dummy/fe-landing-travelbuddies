import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface PromoDetailSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function PromoDetailSection({ title, icon, children, defaultOpen = true, className = "" }: PromoDetailSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`section-card ${className}`.trim()}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-300/20 flex items-center justify-center text-primary">{icon}</div>}
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>

        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "mt-4 max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}
