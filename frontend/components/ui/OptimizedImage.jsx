"use client";

import Image from "next/image";

const CLOUDINARY_HOST = /res\.cloudinary\.com/i;

/**
 * Uses next/image for Cloudinary URLs (see next.config images.remotePatterns).
 * Falls back to <img> for other hosts (e.g. local dev placeholders).
 */
export default function OptimizedImage({
  src,
  alt = "",
  className = "",
  width,
  height,
  fill,
  sizes,
  priority,
}) {
  if (!src) return null;

  const isCloudinary = typeof src === "string" && CLOUDINARY_HOST.test(src);

  if (isCloudinary && fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes || "(max-width: 768px) 50vw, 25vw"}
        priority={priority}
      />
    );
  }

  if (isCloudinary && width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
}
