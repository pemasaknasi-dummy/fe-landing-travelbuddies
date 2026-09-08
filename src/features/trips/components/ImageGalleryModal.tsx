"use client";

import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThumbnailGallery } from "./ThumbnailGallery";

interface ImageGalleryModalProps {
  images: {
    name: string;
    images: string[];
  }[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ImageGalleryModal = ({ images, isOpen, onClose, initialIndex = 0 }: ImageGalleryModalProps) => {
  // Flatten all images for the carousel
  const allImages = images.flatMap((album) =>
    album.images.map((image) => ({
      url: image,
      albumName: album.name,
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgSrc, setImgSrc] = useState(allImages[currentIndex]?.url || "/images/empty-state.png");

  useEffect(() => {
    setImgSrc(allImages[currentIndex]?.url || "/images/empty-state.png");
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentIndex(initialIndex);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  // In ImageGalleryModal.tsx, update the navigation functions:

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 cursor-pointer">
        <X size={32} />
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 right-16 flex gap-2 z-10">
        <button onClick={() => setIsZoomed(false)} className={`text-white p-2 ${!isZoomed ? "opacity-50" : "hover:text-gray-300 cursor-pointer"}`}>
          <ZoomOut size={24} />
        </button>
        <button onClick={() => setIsZoomed(true)} className={`text-white p-2  ${isZoomed ? "opacity-50" : "hover:text-gray-300 cursor-pointer"}`}>
          <ZoomIn size={24} />
        </button>
      </div>

      {/* Main image */}
      <div className="relative w-full h-[80vh] flex items-center justify-center">
        <button onClick={goToPrevious} className="absolute left-4 text-white hover:bg-black/30 p-2 rounded-full z-10 cursor-pointer">
          <ChevronLeft size={32} />
        </button>

        <div className={`relative w-full h-full ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`} onClick={toggleZoom}>
          <Image
            src={imgSrc}
            onError={() => {
              if (imgSrc !== "/images/empty-state.png") {
                setImgSrc("/images/empty-state.png");
              }
            }}
            alt={`Gallery image ${currentIndex + 1}`}
            fill
            className={`object-contain transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
            priority
          />
          {/* Album name */}
          <div
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${
              isZoomed
                ? "bottom-4 scale-95 bg-black/60 text-sm px-4 py-1.5 rounded-full backdrop-blur-sm"
                : "bottom-0 scale-100 w-full bg-black text-lg py-2 text-center"
            } text-white font-medium`}
          >
            {allImages[currentIndex]?.albumName}
          </div>
        </div>

        <button onClick={goToNext} className="absolute right-4 text-white hover:bg-black/30 p-2 rounded-full z-10 cursor-pointer">
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto py-2 max-w-full">
        {images.map((album, albumIndex) => (
          <div key={album.name} className="flex flex-col items-center">
            {/* <div className="text-white text-sm mb-1">{album.name}</div> */}
            <div className="flex gap-2">
              {album.images.map((img, imgIndex) => {
                const flatIndex = images.slice(0, albumIndex).reduce((acc, curr) => acc + curr.images.length, 0) + imgIndex;

                return (
                  <button
                    key={imgIndex}
                    onClick={() => setCurrentIndex(flatIndex)}
                    className={`cursor-pointer flex-shrink-0 w-16 h-16 relative rounded overflow-hidden ${
                      currentIndex === flatIndex ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <ThumbnailGallery src={img} alt={`${album.name} ${imgIndex + 1}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Image counter */}
      {/* <div className="text-white mt-2">
        {currentIndex + 1} / {images.length}
      </div> */}
    </div>
  );
};
