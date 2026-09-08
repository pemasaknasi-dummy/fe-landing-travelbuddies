"use client";

import AppPromotion from "@/components/sections/AppPromotion";
import { useTerms } from "@/features/terms/hooks/useTerms";
import Skeleton from "react-loading-skeleton";

export default function TermsCondition() {
  const { data: termsData, isLoading, error } = useTerms();

  if (isLoading) {
    return (
      <main>
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto mb-30 px-5 xl:px-0 min-h-[60vh]">
          <div className="space-y-8 p-4">
            <Skeleton height={24} width="70%" />
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="70%" className="mt-4" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="70%" className="mt-4" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" /> 
            <Skeleton height={18} width="70%" className="mt-4" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" /> 
            <Skeleton height={18} width="70%" className="mt-4" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" />  
            <Skeleton height={18} width="100%" /> 
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto mb-30 px-5 xl:px-0 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Gagal memuat syarat dan ketentuan.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </main>
    );
  }

  const terms = termsData?.items?.[0];

  if (!terms) {
    return (
      <main>
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto mb-30 px-5 xl:px-0 min-h-[60vh] flex items-center justify-center">
          <p className="text-gray-600">Tidak ada syarat dan ketentuan yang tersedia.</p>
        </div>
      </main>
    );
  }

  // Replace &nbsp; with regular spaces for proper text wrapping
  const sanitizedContent = terms.content.replace(/&nbsp;/g, ' ');

  return (
    <main>
      <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto mb-30 px-5 xl:px-0">
        <h1 className="font-bold text-3xl mt-5">{terms.title}</h1>
        
        {/* Render HTML content from backend */}
        <div 
          className="html-content prose prose-lg max-w-full mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>

      <div className="my-10">
        <AppPromotion />
      </div>
    </main>
  );
}
