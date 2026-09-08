"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PasswordlessAuth } from "@/features/auth/components/PasswordlessAuth";

interface Props {
  onClose: () => void;
  redirectTo: string;
}

export default function LoginModal({ onClose, redirectTo }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <PasswordlessAuth isModal onClose={onClose} redirectTo={redirectTo} />
    </div>,
    document.body
  );
}
