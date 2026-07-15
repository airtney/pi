/**
 * Fade-in-on-load class treatment, reconstructed from the compiled module
 * 618689 (`getFadeClassName`). Applied by `components/FadeInImage.tsx` to
 * every image on the page (avatars, team photo, testimonial art): content is
 * kept at `opacity-0` and eased in over 220ms once loaded.
 */
export function getFadeClassName(className: string | undefined, isLoaded: boolean): string {
  return `${className ? `${className} ` : ""}transition-opacity duration-[220ms] ease-[var(--ease-out-spring)] will-change-[opacity] ${isLoaded ? "opacity-100" : "opacity-0"}`;
}
