import React from "react";
import { BadgeProps } from "../../types";
import { cn } from "../../lib/utils";

const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
