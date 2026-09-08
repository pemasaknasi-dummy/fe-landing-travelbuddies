"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const inv = searchParams?.get("inv");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api"}/bookings/${id}/invoice/pdf`;
      if (inv) {
        apiUrl += `?inv=${inv}`;
      }
      setPdfUrl(apiUrl);
    }
  }, [id, inv]);

  return (
    <div className="relative w-full h-screen bg-[#F1F5F9]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9] z-10">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      )}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          onLoad={() => setIsLoading(false)}
          className="w-full h-screen border-none m-0 p-0 block"
          title="Invoice PDF"
          style={{ width: '100vw', height: '100vh' }}
        />
      )}
    </div>
  );
}
