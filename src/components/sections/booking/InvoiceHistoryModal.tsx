"use client";
import { Dispatch, SetStateAction } from "react";
import { ArrowRight, FileText, X, CheckCircle2, Clock, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { formatRupiah } from "@/lib/format-rupiah";

interface InvoiceHisoryModalProps {
    setIsInvoiceHistoryModalOpen: Dispatch<SetStateAction<boolean>>;
    allInvoices: any[];
    id: number;
}

export function InvoiceHistoryModal({
    setIsInvoiceHistoryModalOpen,
    allInvoices,
    id
}: InvoiceHisoryModalProps) {
    const getInvoiceInfo = (inv: any) => {
        const orderId = inv.payment?.orderId || inv.invoiceNumber || "";
        const paymentType = inv.payment?.rawResponse?.metadata?.paymentType;
        const isDp = orderId.endsWith("-DP") || paymentType === "DOWN_PAYMENT";
        const isRepayment = orderId.endsWith("-FINAL") || paymentType === "FINAL";
        const isAddParticipant = orderId.startsWith("TB-ADD-");
        const isAdditional = orderId.startsWith("TB-ADDL-");
        const status = String(inv.payment?.status || "PAID").toUpperCase();
        const amount = inv.payment?.grossAmount || inv.payment?.amount || 0;

        let label = "Invoice Pembayaran";
        let badgeColor = "bg-slate-100 text-slate-700";

        if (isDp) {
            label = "Invoice DP (Down Payment 50%)";
            badgeColor = "bg-sky-50 text-sky-700 border-sky-200";
        } else if (isRepayment) {
            label = "Invoice Pelunasan";
            badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
        } else if (isAddParticipant) {
            label = "Invoice Tambah Peserta";
            badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
        } else if (isAdditional) {
            label = "Invoice Layanan Tambahan";
            badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        }

        return { label, badgeColor, status, amount };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-sky-50/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                Riwayat Invoice
                            </h3>
                            <p className="text-xs text-slate-500">
                                Pilih invoice yang ingin Anda lihat atau unduh
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsInvoiceHistoryModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-sky-100/60 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-5 max-h-[65vh] overflow-y-auto space-y-3">
                    {allInvoices.map((inv: any, index: number) => {
                        const isLatest = index === 0;
                        const info = getInvoiceInfo(inv);

                        return (
                            <button
                                key={inv.id || index}
                                onClick={() => {
                                    window.open(`${window.location.origin}/booking/${id}/invoice?inv=${inv.invoiceNumber}`, "_blank");
                                    setIsInvoiceHistoryModalOpen(false);
                                }}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-sky-50/30 rounded-2xl transition-all border-2 border-slate-100 hover:border-sky-300 cursor-pointer text-left group shadow-xs"
                            >
                                <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${info.badgeColor}`}>
                                            {info.label}
                                        </span>
                                        {isLatest && (
                                            <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-md font-bold">
                                                TERBARU
                                            </span>
                                        )}
                                        {info.status === "PAID" || info.status === "SETTLED" ? (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> LUNAS
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {info.status}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-800 text-sm font-mono truncate">
                                            {inv.invoiceNumber}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                            {dayjs(inv.createdAt).format("D MMMM YYYY, HH:mm")} WIB
                                        </p>
                                    </div>

                                    {info.amount > 0 && (
                                        <p className="text-xs font-black text-slate-900 pt-0.5">
                                            {formatRupiah(info.amount)}
                                        </p>
                                    )}
                                </div>

                                <div className="size-8 rounded-xl bg-slate-50 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}