import { formatRupiah } from "@/lib/format-rupiah";
import React from "react";

interface PaymentConfig {
  iconWrap?: string;
  icon: React.ReactNode;
  labelColor: string;
  label: string;
}

interface Props extends PaymentConfig {
  payment: number;
}

export const StatusPayment = ({ iconWrap, icon, labelColor, label, payment }: Props) => {
  return (
    <div className={` mx-3 px-3 py-2.5 rounded-xl flex items-center justify-between bg-gray-100 ring-1 ring-inset ring-black/5 transition-all duration-200 group-hover:shadow-sm`}>
      <div className="flex items-center gap-2.5">
        {/* Icon wrap */}
        <div className={`p-0.5 rounded-lg ${iconWrap} transition-transform duration-200 group-hover:scale-110`}>{icon}</div>
        <div>
          <p className="text-[12px] text-gray-600 font-semibold leading-none mb-0.5">Status Pembayaran</p>
          <h4 className={`font-bold text-sm ${labelColor}`}>{label}</h4>
        </div>
      </div>

      <div className="text-right">
        {/* <p className="font-bold text-gray-700 text-sm">{formatRupiah(data?.payment?.amount)}</p> */}
        <p className="font-bold text-gray-700 text-sm">{formatRupiah(payment)}</p>
      </div>
    </div>
  );
};
