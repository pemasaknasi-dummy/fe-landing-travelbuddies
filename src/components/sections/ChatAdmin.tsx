"use client";

import Image from "next/image";
import { useParams, usePathname } from "next/navigation";

interface Props {
  waUrl: string;
}

export const ChatAdmin = ({ waUrl }: Props) => {
  const params = useParams();
  const pathname = usePathname();

  if (pathname.startsWith("/booking/")) return null;

  if (params?.slug) return null;
  return (
    <a href={waUrl} target="_blank" className="fixed z-40 bottom-12 right-2 md:right-7 flex items-center gap-x-3 px-3 md:px-3 py-1 rounded-lg bg-green-500 font-semibold text-center hover:bg-green-700 transition-colors shadow-lg text-white">
      <i>
        <Image src={"/images/social-media/whatsapp.png"} alt="social-media" height={30} width={30} />
      </i>
      Chat Admin
    </a>
  );
};
