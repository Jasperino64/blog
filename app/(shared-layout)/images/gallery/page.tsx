"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function ImageGalleryPage() {
  const images = useQuery(api.posts.getAllImages);

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

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <h1 className="text-4xl font-extrabold text-foreground mb-12 text-center tracking-tight">
        Image Gallery
      </h1>

      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
        {images.map((image) => {
          if (!image.imageUrl) return null;
          return (
            <Link
              key={image.postId}
              href={image.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative w-full">
                <Image
                  src={image.imageUrl}
                  alt={image.title}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
