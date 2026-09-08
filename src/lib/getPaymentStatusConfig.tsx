import { AlertCircle, CircleCheck, Timer, XCircle } from "lucide-react";
import { ReactNode } from "react";

export interface PaymentStatusConfig {
  icon: ReactNode;
  iconWrap: string;
  bg: string;
  dot: string;
  label: string;
  labelColor: string;
}

const DEFAULT_PAYMENT_STATUS: PaymentStatusConfig = {
  icon: <AlertCircle size={28} className="text-gray-400" />,
  iconWrap: "bg-gray-100 ring-1 ring-gray-200",
  bg: "bg-gray-100 text-gray-600 ring-1 ring-gray-300",
  dot: "bg-gray-400",
  label: "Unknown",
  labelColor: "text-gray-500",
};

const PAYMENT_STATUS_CONFIG: Record<string, PaymentStatusConfig> = {
  SUCCESS: {
    icon: (
      <div className="relative">
        <CircleCheck size={26} fill="#34C759" stroke="#bbf7d0" />
        <span
          className="absolute inset-0 rounded-full"
          style={{ animationDuration: "2s" }}
        />
      </div>
    ),
    iconWrap: "bg-green-50 ring-1 ring-emerald-200",
    bg: "bg-green-100 text-green-600 ring-1 ring-green-600",
    dot: "bg-green-400",
    label: "Lunas",
    labelColor: "text-emerald-600",
  },

  PAID: {
    icon: (
      <div className="relative">
        <CircleCheck size={26} fill="#34C759" stroke="#bbf7d0" />
        <span
          className="absolute inset-0 rounded-full"
          style={{ animationDuration: "2s" }}
        />
      </div>
    ),
    iconWrap: "bg-green-50 ring-1 ring-emerald-200",
    bg: "bg-green-100 text-green-600 ring-1 ring-green-600",
    dot: "bg-green-400",
    label: "Lunas",
    labelColor: "text-emerald-600",
  },

  PENDING: {
    icon: <Timer size={26} className="text-blue-500" />,
    iconWrap: "bg-blue-100 ring-1 ring-blue-200",
    bg: "bg-blue-100 text-blue-600 ring-1 ring-blue-600",
    dot: "bg-blue-400",
    label: "Menunggu Pembayaran",
    labelColor: "text-blue-600",
  },

  FAILED: {
    icon: <XCircle size={28} className="text-rose-500" strokeWidth={2} />,
    iconWrap: "bg-rose-100 ring-1 ring-rose-200",
    bg: "bg-red-100 text-red-600 ring-1 ring-red-600",
    dot: "bg-red-400",
    label: "Expired",
    labelColor: "text-rose-600",
  },

  EXPIRED: {
    icon: <XCircle size={28} className="text-rose-500" strokeWidth={2} />,
    iconWrap: "bg-rose-100 ring-1 ring-rose-200",
    bg: "bg-red-100 text-red-600 ring-1 ring-red-600",
    dot: "bg-red-400",
    label: "Expired",
    labelColor: "text-rose-600",
  },
  PARTIAL: {
    icon: <Timer size={26} className="text-amber-500" />,
    iconWrap: "bg-amber-100 ring-1 ring-amber-200",
    bg: "bg-amber-100 text-amber-600 ring-1 ring-amber-600",
    dot: "bg-amber-400",
    label: "Partial",
    labelColor: "text-amber-600",
  },
};

export function getPaymentStatusConfig(status?: string): PaymentStatusConfig {
  if (!status) return DEFAULT_PAYMENT_STATUS;

  return PAYMENT_STATUS_CONFIG[status.toUpperCase()] ?? DEFAULT_PAYMENT_STATUS;
}