"use client";

import React, { useState } from "react";
import Image from "next/image";
import { koperasi, pemerintahan, pendidikan } from "../../data/partner";

const PartnersSection: React.FC = () => {
  const [partnerActive, setPartnerActive] = useState<string>("koperasi");

  return (
    <section className="container max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5">
      <div className="flex flex-col gap-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Perjalanan Seru Bersama Perusahaan Hebat</h2>
        <p className=" text-gray-600">
          Bergabung dengan ratusan brand dan merencanakan kebersamaan perusahaan yang menyenangkan dan menciptakan pengalaman tak terlupakan.
        </p>
      </div>

      {/* BUTTON */}
      <div className="my-5 flex items-center justify-between w-[90%]">
        {/* PEMERINTAHAN */}
        <button
          onClick={() => setPartnerActive("pemerintahan")}
          className={`border-b-2 ${
            partnerActive === "pemerintahan" ? "border-blue-500 text-blue-500" : "border-slate-300 text-slate-500"
          }  w-1/3 pb-2 cursor-pointer`}
        >
          Pemerintahan
          <span className="px-3 py-1 rounded-3xl bg-blue-200 text-blue-500 text-xs font-semibold ml-2">{pemerintahan.length}</span>
        </button>

        {/* KOPERASI */}
        <button
          onClick={() => setPartnerActive("koperasi")}
          className={`border-b-2 ${
            partnerActive === "koperasi" ? "border-blue-500 text-blue-500" : "border-slate-300 text-slate-500"
          }  w-1/3 pb-2 cursor-pointer`}
        >
          Koperasi / Perusahaan Swasta
          <span className="px-3 py-1 rounded-3xl bg-blue-200 text-blue-500 text-xs font-semibold ml-2">{koperasi.length}</span>
        </button>

        {/* PENDIDIKAN */}
        <button
          onClick={() => setPartnerActive("pendidikan")}
          className={`border-b-2 ${
            partnerActive === "pendidikan" ? "border-blue-500 text-blue-500" : "border-slate-300 text-slate-500"
          }  w-1/3 pb-2 cursor-pointer`}
        >
          Pendidikan
          <span className="px-3 py-1 rounded-3xl bg-blue-200 text-blue-500 text-xs font-semibold ml-2">{pendidikan.length}</span>
        </button>
      </div>

      {/* LOGO PARTNER */}
      <div className="">
        <div className="grid grid-cols-5 gap-y-5">
          {partnerActive === "pemerintahan" &&
            pemerintahan.map((i, idx) => <Image key={idx} alt={i} src={`/images/partner/pemerintahan/${i}.png`} width={88} height={53} />)}

          {partnerActive === "koperasi" &&
            koperasi.map((i, idx) => <Image key={idx} alt={i} src={`/images/partner/koperasi/${i}.png`} width={88} height={53} />)}

          {partnerActive === "pendidikan" &&
            pendidikan.map((i, idx) => <Image key={idx} alt={i} src={`/images/partner/pendidikan/${i}.png`} width={88} height={53} />)}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
