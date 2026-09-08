import React from "react";
import Image from "next/image";
import Link from "next/link";

const CommunitySection: React.FC = () => {
  return (
    <section className="max-w-[1024px] 2xl:max-w-[1440px] relative p-5 text-white md:py-34 overflow-hidden mx-auto md:rounded-xl">
      <Image
        src={"/images/familyCommunityGateway/bg-familyCommunityGateway.png"}
        alt="family-community-gateway"
        fill
        className="absolute object-cover"
      />
      <div className="grid md:grid-cols-2 md:px-5 w-[60%] md:w-full items-center">
        {/* TEXT */}
        <div className="max-w-[1024px] 2xl:max-w-[1440px]  md:mx-auto z-1">
          <h2 className="md:text-3xl font-bold mb-4">Family & Community Getaway</h2>
          <p className="text-sm md:text-lg mb-6 text-white/90">
            Cocok untuk grup, perusahaan, keluarga besar, dan komunitas yang ingin menciptakan momen tak terlupakan.
          </p>
          <Link
            href={"/family-community"}
            className="text-xs py-2 px-3 md:text-lg md:py-3 md:px-5  rounded-md font-semibold cursor-pointer bg-blue-500 hover:outline-none hover:ring-2 hover:text-blue-500 hover:ring-blue-500 hover:bg-white transition-all duration-300"
          >
            Pelajari Selengkapnya
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
