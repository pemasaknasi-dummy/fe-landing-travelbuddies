import React, { useState } from "react";
import {
  X,
  Building2,
  Wallet,
  Smartphone,
  ChevronRight,
  Check,
  Hourglass,
  CreditCard,
  Ban,
} from "lucide-react";
import Image from "next/image";

interface SubOption {
  id: string;
  name: string;
  image: string;
}

interface Options {
  id: string;
  image: string;
  name: string;
}

interface MethodPayment {
  id: string;
  options?: Options[];
  banks?: Options[];
}

interface SelectedBank {
  id: string;
  name: string;
  image: string;
  methodId: string;
}

type PaymentMethod = {
  id: string;
  label: string;
  image: string;
};

interface Props {
  onClose: () => void;
  onSelectPayment: (paymentData: PaymentMethod) => void;
  amount?: number;
}

export const PaymentMethodModal = ({ onClose, onSelectPayment, amount }: Props) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<SelectedBank | null>(null);

  const paymentMethods = [
    {
      id: "va",
      name: "Virtual Account",
      icon: Building2,
      color: "blue",
      banks: [
        { id: "bca", name: "BCA", image: "/images/payment-method/bca.png" },
        {
          id: "mandiri",
          name: "Mandiri",
          image: "/images/payment-method/mandiri.png",
        },
        { id: "bni", name: "BNI", image: "/images/payment-method/bni.png" },
        { id: "bri", name: "BRI", image: "/images/payment-method/bri.png" },
        {
          id: "sahabat_sampoerna",
          name: "Sahabat Sampoerna",
          image: "/images/payment-method/sampoerna.png",
        },
        {
          id: "permata",
          name: "Permata",
          image: "/images/payment-method/permata.png",
        },
        {
          id: "cimb",
          name: "CIMB Niaga",
          image: "/images/payment-method/cimb-niaga.png",
        },
      ],
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      icon: Wallet,
      color: "purple",
      options: [
        { id: "ovo", name: "OVO", image: "/images/payment-method/ovo.png" },
        {
          id: "astraPay",
          name: "AstraPay",
          image: "/images/payment-method/astra-pay.png",
        },
      ],
    },
    {
      id: "paylater",
      name: "Paylater",
      icon: Hourglass,
      color: "amber",
      options: [
        {
          id: "akulaku",
          name: "Akulaku",
          image: "/images/payment-method/akulaku.png",
        },
      ],
    },
    {
      id: "qris",
      name: "QRIS",
      image: "/images/payment-method/qris.png",
      icon: Smartphone,
      color: "emerald",
      description: "Scan & bayar dengan semua e-wallet",
    },
    {
      id: "credit_card",
      name: "Kartu Kredit / Debit",
      image: "/images/payment-method/visa.png",
      icon: CreditCard,
      color: "indigo",
      description: "Visa, Mastercard, JCB, AMEX",
    },
  ];

  const handleMethodClick = (method: MethodPayment) => {
    if (method.banks || method.options) {
      setSelectedMethod(selectedMethod === method.id ? null : method.id);
    } else {
      handleConfirm(method.id, null);
    }
  };

  const handleSubOptionClick = (methodId: string, subOption: SubOption) => {
    setSelectedBank({ methodId, ...subOption });
  };

  const handleConfirm = (methodId: string, subOption: SubOption | null) => {
    const method = paymentMethods.find((m) => m.id === methodId);

    if (!method) return;

    if (subOption) {
      onSelectPayment({
        id: subOption.id,
        label: subOption.name,
        image: subOption.image,
      });
    } else {
      // @ts-ignore
      if (!method.name || !method.image) return;

      onSelectPayment({
        id: method.id,
        // @ts-ignore
        label: method.name,
        // @ts-ignore
        image: method.image,
      });
    }

    onClose();
  };

  const getColorClasses = (color?: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      purple: "bg-purple-50 text-purple-600",
      emerald: "bg-emerald-50 text-emerald-600",
      amber: "bg-amber-50 text-amber-600",
      indigo: "bg-indigo-50 text-indigo-600",
    } as const;

    return colors[color as keyof typeof colors] ?? colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Pilih Metode Pembayaran
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Pilih cara bayar yang paling nyaman untuk Anda
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isExpanded = selectedMethod === method.id;
              const hasSubOptions = method.banks || method.options;
              const isDisabled = method.id.toLowerCase() === 'qris' && (amount || 0) > 10000000;

              return (
                <div
                  key={method.id}
                  className={`border border-gray-200 rounded-xl overflow-hidden transition-all ${isDisabled ? "opacity-70 bg-gray-50/50 grayscale-[50%]" : ""}`}
                >
                  <button
                    onClick={() => !isDisabled && handleMethodClick(method)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-4 flex items-center gap-4 transition-colors ${isDisabled ? "cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}
                  >
                    {method.image ? (
                      <Image
                        src={method.image}
                        alt={method.id}
                        width={45}
                        height={45}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-xl ${getColorClasses(method.color)} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${isDisabled ? "text-gray-400" : "text-gray-900"}`}>
                        {method.name}
                      </p>
                      {isDisabled ? (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold tracking-wide uppercase rounded">
                          Maks Transaksi Rp 10 Juta
                        </span>
                      ) : method.description ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {method.description}
                        </p>
                      ) : null}
                    </div>
                    {isDisabled ? (
                      <Ban className="w-5 h-5 text-gray-300" />
                    ) : hasSubOptions ? (
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    ) : null}
                  </button>

                  {isExpanded && method.banks && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
                        {method.banks.map((bank) => (
                          <button
                            key={bank.id}
                            onClick={() =>
                              handleSubOptionClick(method.id, bank)
                            }
                            className={`px-3 py-2.5 rounded-lg border-2 transition-all text-left cursor-pointer ${selectedBank?.id === bank.id && selectedBank?.methodId === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={bank.image}
                                alt={bank.id}
                                width={42}
                                height={42}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {bank.name}
                              </span>
                              {selectedBank?.id === bank.id &&
                                selectedBank?.methodId === method.id && (
                                  <Check className="w-4 h-4 text-blue-600 ml-auto" />
                                )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && method.options && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
                        {method.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleSubOptionClick(method.id, option)
                            }
                            className={`px-3 py-2.5 rounded-lg border-2 transition-all text-left cursor-pointer ${selectedBank?.id === option.id && selectedBank?.methodId === method.id ? ` ${getColorClasses(method.color)}` : "border-gray-200 bg-white hover:border-gray-300"}`}
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.image}
                                alt={option.id}
                                width={42}
                                height={42}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {option.name}
                              </span>
                              {selectedBank?.id === option.id &&
                                selectedBank?.methodId === method.id && (
                                  <Check
                                    className={`w-4 h-4 ${getColorClasses(method.color)} ml-auto`}
                                  />
                                )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              if (selectedBank) {
                handleConfirm(selectedBank.methodId, selectedBank);
              }
            }}
            disabled={!selectedBank}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${selectedBank ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {selectedBank
              ? "Konfirmasi Pembayaran"
              : "Pilih Metode Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
};
