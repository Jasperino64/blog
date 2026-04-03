"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageGalleryPage() {
  const images = useQuery(api.images.getAllImages);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [apiCarousel, setApiCarousel] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    document.title = "Image Gallery";
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  useEffect(() => {
    if (!apiCarousel) return;

    setTotalSlides(apiCarousel.scrollSnapList().length);
    setCurrentSlide(apiCarousel.selectedScrollSnap() + 1);

    apiCarousel.on("select", () => {
      setCurrentSlide(apiCarousel.selectedScrollSnap() + 1);
    });
  }, [apiCarousel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft" && apiCarousel) {
        apiCarousel.scrollPrev();
      } else if (e.key === "ArrowRight" && apiCarousel) {
        apiCarousel.scrollNext();
      }
    };

    if (selectedIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, closeLightbox, apiCarousel]);

  if (images === undefined) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-foreground mb-12 text-center">
          Image Gallery
        </h1>
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className="w-full aspect-square rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (images === null || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-4xl font-extrabold text-foreground">
          No Images Found
        </h1>
        <p className="text-muted-foreground text-lg">
          Create some posts with images to populate the gallery!
        </p>
        <Link
          href="/blog"
          className="text-primary hover:underline underline-offset-4"
        >
          Go to Blog
        </Link>
      </div>
    );
  }

  const validImages = images.filter((img) => img.url);

  return (
    <>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
        <h1 className="text-4xl font-extrabold text-foreground mb-12 text-center tracking-tight">
          Image Gallery
        </h1>

        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {validImages.map((image, index) => {
            return (
              <div
                key={image._id}
                onClick={() => setSelectedIndex(index)}
                className="block break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mb-4 cursor-pointer"
              >
                <div className="relative w-full">
                  <Image
                    src={image.url!}
                    alt={`Gallery Image ${image._id}`}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Carousel Overlay */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in">
          <div className="absolute top-4 left-4 z-[60] text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium tabular-nums tracking-widest backdrop-blur-md transition-colors">
            {currentSlide} / {totalSlides}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-[60] text-white hover:bg-white/20 hover:text-white rounded-full bg-black/40"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
            <span className="sr-only">Close</span>
          </Button>

          <Carousel
            setApi={setApiCarousel}
            opts={{
              startIndex: selectedIndex,
              loop: true,
            }}
            className="w-full max-w-4xl px-12 md:px-20 focus:outline-none"
          >
            <CarouselContent>
              {validImages.map((image) => (
                <CarouselItem
                  key={image._id}
                  className="flex items-center justify-center h-[80vh] md:h-[90vh]"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url!}
                      alt={`Gallery Image ${image._id}`}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm select-none"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 md:-left-12 border-0 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
            <CarouselNext className="right-4 md:-right-12 border-0 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
          </Carousel>
        </div>
      )}
    </>
  );
}
