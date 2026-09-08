import React from "react";
import { ButtonProps } from "../../types";
import { cn } from "../../lib/utils";

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  onClick,
}) => {
  const baseStyles =
    "px-6 py-3 rounded-lg font-medium transition-all duration-200";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-green-600 text-white hover:bg-green-700",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-gray-400",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
