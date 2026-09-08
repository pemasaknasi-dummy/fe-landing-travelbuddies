"use client";
import { useCompleteParticipants } from "@/features/bookings/hooks/useBooking";
import { XCircle, UserRound, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function CompleteParticipantModal({
    isOpen,
    bookingId,
    meetingPoints,
    incompleteParticipants,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number;
    meetingPoints: any[];
    incompleteParticipants: any[];
}) {
    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && incompleteParticipants.length > 0) {
            setParticipants(
                incompleteParticipants.map(p => ({
                    id: p.id,
                    name: p.participant?.name?.startsWith("Peserta") ? "" : (p.participant?.name || ""),
                    email: p.participant?.email || "",
                    phone: p.participant?.phone || "",
                    noKtp: (p.participant?.noKtp?.startsWith("0000000000000000") || p.participant?.noKtp?.startsWith("EMPTY-") || p.participant?.noKtp?.startsWith("ktp-agent-")) ? "" : (p.participant?.noKtp || ""),
                    gender: p.participant?.gender || "",
                    dateOfBirth: p.participant?.dateOfBirth ? p.participant.dateOfBirth.split('T')[0] : "",
                    meetingPointId: p.meetingPointId || "",
                }))
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);
    const mutation = useCompleteParticipants(bookingId);

    const handleChange = (index: number, field: string, value: string) => {
        const newParticipants = [...participants];
        newParticipants[index][field] = value;
        setParticipants(newParticipants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            if (!p.name || !p.name.trim()) {
                toast.error(`Nama lengkap peserta #${i + 1} wajib diisi`);
                return;
            }
            if (!p.phone || !p.phone.trim()) {
                toast.error(`Nomor WhatsApp peserta #${i + 1} wajib diisi`);
                return;
            }
            if (!p.noKtp || !p.noKtp.trim()) {
                toast.error(`Nomor KTP/KIA/Passport peserta #${i + 1} wajib diisi`);
                return;
            }
        }
        try {
            await mutation.mutateAsync({
                participants: participants,
            });
            toast.success("Data peserta berhasil dilengkapi");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Gagal melengkapi data peserta");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl text-slate-800">
                <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-sky-50/50">
                    <h2 className="text-lg sm:text-xl font-bold text-sky-950">
                        Lengkapi Data Peserta
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 hover:bg-sky-100 rounded-full transition-colors border-0 bg-transparent outline-none flex items-center justify-center"
                    >
                        <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <form
                        onSubmit={handleSubmit}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
                    >
                        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 text-sky-900 text-xs sm:text-sm">
                            <span className="font-bold">Informasi:</span> Lengkapi data peserta yang belum diisi. Data ini digunakan untuk asuransi dan keperluan trip.
                        </div>

                        {participants.map((p, index) => (
                            <div
                                key={p.id}
                                className="p-4 sm:p-5 border-2 border-slate-100 rounded-2xl space-y-4 relative bg-white hover:border-sky-200 transition-colors"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    {/* <h3 className="font-bold text-sky-600 flex items-center gap-2 text-sm sm:text-base">
                                        <UserRound className="w-4.5 h-4.5" /> Peserta #{index + 1}
                                    </h3> */}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-left">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            placeholder="Sesuai Identitas"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                            value={p.name}
                                            onChange={(e) =>
                                                handleChange(index, "name", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Nomor WhatsApp <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            placeholder="08xxxxxxxxxx"
                                            maxLength={13}
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                            value={p.phone}
                                            onChange={(e) =>
                                                handleChange(index, "phone", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Nomor KTP/KIA/Passport <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            placeholder="16 digit nomor KTP"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                            value={p.noKtp}
                                            maxLength={16}
                                            onChange={(e) =>
                                                handleChange(index, "noKtp", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Email <span className="text-gray-400 font-normal">(Opsional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="email@contoh.com"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                            value={p.email}
                                            onChange={(e) =>
                                                handleChange(index, "email", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Jenis Kelamin <span className="text-gray-400 font-normal">(Opsional)</span>
                                        </label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white text-sm"
                                            value={p.gender}
                                            onChange={(e) =>
                                                handleChange(index, "gender", e.target.value)
                                            }
                                        >
                                            <option value="" hidden>Pilih Jenis Kelamin</option>
                                            <option value="Male">Laki-laki</option>
                                            <option value="Female">Perempuan</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Tanggal Lahir <span className="text-gray-400 font-normal">(Opsional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                            value={p.dateOfBirth}
                                            onChange={(e) =>
                                                handleChange(index, "dateOfBirth", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">
                                            Meeting Point <span className="text-gray-400 font-normal">(Opsional)</span>
                                        </label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white text-sm"
                                            value={p.meetingPointId}
                                            onChange={(e) =>
                                                handleChange(index, "meetingPointId", e.target.value)
                                            }
                                        >
                                            <option value="" disabled>
                                                Pilih Meeting Point
                                            </option>
                                            {meetingPoints.map((mp: any) => (
                                                <option key={mp.id} value={mp.id}>
                                                    {mp.meetingPoint?.location} ({mp.time})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </form>
                </div>
                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0 shadow-xs">
                    <button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={onClose}
                        className={`cursor-pointer px-6 py-2.5 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm border-0 bg-transparent ${mutation.isPending ? "cursor-not-allowed" : ""}`}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || participants.some((p: any) => !p.name?.trim() || !p.phone?.trim() || !p.noKtp?.trim())}
                        className="cursor-pointer px-8 py-2.5 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 border-0"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" /> Memproses...
                            </>
                        ) : (
                            "Simpan Data Peserta"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
