interface PaymentConfig {
  icon: React.ReactNode;
  iconWrap?: string;
  bg?: string;
  dot?: string;
  label: string;
  labelColor?: string;
}

interface StatusConfig {
  badge: string;
  dot?: string;
  label: string;
}

interface BadgeStatusTripProps {
  status?: string;
  paymentConfig: PaymentConfig;
  statusConfig: StatusConfig | null;
  minutes?: number;
  seconds?: number;
  isExpired?: boolean;
  details?: {
    id?: number;
    orderId?: string;
    amount: number;
    status: string;
    method?: string;
    methodLabel?: string;
    createdAt: string;
    xenditInvoiceUrl?: string;
  }[];
}

export default function BadgeStatusTrip({ status, paymentConfig, statusConfig, minutes = 0, seconds = 0, isExpired = false, details }: BadgeStatusTripProps) {
  const isPaymentStatus = status === "PENDING" || status === "EXPIRED" || status === "PARTIAL";
  const isPending = status?.toUpperCase() === "PENDING" || status?.toUpperCase() === "PARTIAL";

  const pendingAndHaveXenditURL = details?.find((p) => p?.status === "PENDING" && p?.xenditInvoiceUrl)

  if (!isPaymentStatus && !statusConfig) {
    return null;
  }

  return (
    <div
      className={`
        absolute top-3 left-3
        flex items-center gap-1.5
        px-3 py-1.5 rounded-full
        ${isPaymentStatus ? paymentConfig?.bg : statusConfig?.badge}
      `}
    >
      <span
        className={`
          size-1.5 rounded-full
          ${isPaymentStatus ? paymentConfig.dot : statusConfig?.dot}
        `}
      />

      <span className="text-[11px] font-bold tracking-wide leading-none">{isPaymentStatus ? paymentConfig.label : statusConfig?.label}</span>

      {isPending && !isExpired && !!pendingAndHaveXenditURL && (
        <span className="text-[11px] font-bold tracking-wide leading-none">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
