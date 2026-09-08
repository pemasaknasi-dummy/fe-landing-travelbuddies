"use client";
import { Dispatch, SetStateAction } from "react";
import { ArrowRight, FileText, X } from "lucide-react";
import dayjs from "dayjs";

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
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-sky-500" /> Riwayat Invoice
                    </h3>
                    <button
                        onClick={() => setIsInvoiceHistoryModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 border-0 bg-transparent cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {allInvoices.map((inv: any, index: number) => {
                        const isLatest = index === 0;
                        return (
                            <button
                                key={inv.id}
                                onClick={() => {
                                    window.open(`${window.location.origin}/booking/${id}/invoice?inv=${inv.invoiceNumber}`, "_blank");
                                    setIsInvoiceHistoryModalOpen(false);
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0 cursor-pointer text-left"
                            >
                                <div>
                                    <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        {inv.invoiceNumber}
                                        {isLatest && <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-semibold">TERBARU</span>}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 font-mono">
                                        {dayjs(inv.createdAt).format("D MMM YYYY, HH:mm")} WIB
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}