"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/assets/placeholder.png";

type Props = Omit<ImageProps, "src"> & { src?: string | null };

/**
 * next/image wrapper that shows /assets/placeholder.png when the source is
 * empty or fails to load (404/broken). Use anywhere user/seed-supplied image
 * paths may be missing.
 */
export function ImageWithFallback({ src, alt, ...props }: Props) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}
