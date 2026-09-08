import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/images/empty-state.png";

type Props = {
  src?: string;
  alt: string;
};

export function ThumbnailGallery({ src, alt }: Props) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="64px"
      className="object-cover"
      onError={() => {
        if (imgSrc !== FALLBACK_IMAGE) {
          setImgSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}
