import React from "react";
import { CardProps } from "../../types";
import { cn } from "../../lib/utils";

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
