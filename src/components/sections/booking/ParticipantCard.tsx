"use client";
import { obfuscateKtp } from "@/lib/obfuscate-ktp";
import { ChevronDown, Pencil, CheckCircle } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export function ParticipantCard({ item, index, onEdit }: { item: any; index: number, onEdit?: () => void }) {
    const [isOpen, setIsOpen] = useState(index === 0); // Open PIC details by default
    const isPic = item.label === "pic" || index === 0;
    const pName = item.participant?.name?.trim() || "";
    const pPhone = item.participant?.phone?.trim() || "";
    const pKtp = item.participant?.noKtp?.trim() || "";
    const isNameIncomplete = !pName || pName.toLowerCase().startsWith("peserta");
    const isPhoneIncomplete = !pPhone || pPhone.toLowerCase().startsWith("empty-");
    const isKtpIncomplete = !pKtp || pKtp === "0000000000000000" || pKtp.toLowerCase().startsWith("ktp-agent") || pKtp.toLowerCase().startsWith("empty-");
    const isIncomplete = isNameIncomplete || isPhoneIncomplete || isKtpIncomplete;
    const isExpired = item.status === "EXPIRED";
    const statusBorderColor = isExpired ? "bg-rose-400" : (isIncomplete ? "bg-orange-400" : "bg-emerald-500");

    if (isIncomplete) {
        return (
            <div className={clsx("bg-white rounded-xl shadow-xs border border-slate-100 flex relative", isExpired && "opacity-60 bg-slate-50")}>
                {/* Dynamic status left border */}
                <div className={clsx("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl", statusBorderColor)} />
                <div className="p-4 pl-6 w-full flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                PESERTA {index + 1}{item.participant?.gender === "Male" ? "LAKI-LAKI" : item.participant?.gender === "Female" ? "PEREMPUAN" : ""}
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                                {!isNameIncomplete ? pName : <span className="text-slate-400 italic">Belum ada nama</span>}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 uppercase tracking-wider whitespace-nowrap">
                                BELUM DIISI
                            </span>
                            {item.status && (
                                <span className={clsx(
                                    "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap",
                                    item.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        item.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                                            "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                    {item.status === "CONFIRMED" ? "PAID" : item.status}
                                </span>
                            )}
                        </div>
                    </div>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="cursor-pointer w-full bg-[#0084FF] hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm border-0"
                        >
                            <Pencil className="w-4 h-4" /> Isi Data Peserta
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={clsx("bg-white rounded-xl shadow-xs border border-slate-100 flex relative", isExpired && "opacity-60 bg-slate-50")}>
            {/* Dynamic status left border */}
            <div className={clsx("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl", statusBorderColor)} />

            <div className="p-4 pl-6 w-full flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            PESERTA {index + 1} • {item.participant?.gender === "Male" ? "LAKI-LAKI" : item.participant?.gender === "Female" ? "PEREMPUAN" : "DEWASA (WNI)"}
                        </p>
                        <p className="text-base font-bold text-slate-900">{item.participant?.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3" /> LENGKAP
                        </span>
                        {item.status && (
                            <span className={clsx(
                                "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap",
                                item.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    item.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                                        "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                                {item.status === "CONFIRMED" ? "PAID" : item.status}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">KTP/ID:</span>
                        <span className="text-slate-700 font-medium">
                            {obfuscateKtp(item.participant?.noKtp)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">No HP:</span>
                        <span className="text-slate-700 font-medium">{item.participant?.phone || "-"}</span>
                    </div>
                </div>

                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="cursor-pointer w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Pencil className="w-4 h-4" /> Ubah Data
                    </button>
                )}
            </div>
        </div>
    );
}