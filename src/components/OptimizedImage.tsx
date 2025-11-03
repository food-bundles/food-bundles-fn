/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Image as ImageKitImage } from "@imagekit/next";
import NextImage from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  transformation?: Array<{ [key: string]: any }>;
  [key: string]: any;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  transformation,
  ...props
}: OptimizedImageProps) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  // If ImageKit is configured, use it
  if (urlEndpoint) {
    return (
      <ImageKitImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={className}
        priority={priority}
        transformation={transformation || [
          {
            quality: "80",
            format: "webp",
          },
        ]}
        {...props}
      />
    );
  }

  // Fallback to Next.js Image
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width || 0}
      height={height || 0}
      fill={fill}
      className={className}
      priority={priority}
      {...props}
    />
  );
}