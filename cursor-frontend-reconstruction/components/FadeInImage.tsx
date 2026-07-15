"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { useState } from "react";
import type { SyntheticEvent } from "react";
import { getFadeClassName } from "@/lib/fade";

/**
 * `next/image` wrapper that fades the image in once it has loaded,
 * reconstructed from the compiled module 121585 (`FadeInImage`). next/image
 * fires `onLoad` even for images that finished loading before hydration, so
 * cached images fade in as well.
 */
export function FadeInImage({ className, onLoad, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  return <Image {...props} className={getFadeClassName(className, isLoaded)} onLoad={handleLoad} />;
}
