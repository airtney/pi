"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/gt-shim";

/**
 * Testimonial wall reconstructed from module 693744
 * (`StaggeredShuffleTestimonials`). React Compiler `useMemoCache` scaffolding
 * removed. Despite the name, the shipped module renders a static six-card
 * grid: `initialIndices` picks which testimonials show (defaulting to the
 * first six) and cards past the third are hidden below `md`.
 */

export interface Testimonial {
  quote: string;
  name: string;
  jobTitle?: string;
  company?: string;
  avatar?: { src: string; alt?: string };
}

function TestimonialCard({
  testimonial,
  showAvatar = true,
  showAttribution = true,
}: {
  testimonial: Testimonial;
  showAvatar?: boolean;
  showAttribution?: boolean;
}) {
  const messages = useMessages();
  const resolve = (value: string) => (typeof value === "string" ? messages(value) : value);
  const { quote, name, jobTitle, company, avatar } = testimonial;

  return (
    <div className="card relative flex h-full min-h-[180px] w-full shrink-0 flex-col">
      <figure className="flex h-full flex-col">
        <blockquote className="grow overflow-hidden">
          <p className="type-base line-clamp-4 whitespace-pre-wrap md:line-clamp-5">
            &ldquo;{resolve(quote)}&rdquo;
          </p>
        </blockquote>
        <div className="mt-v2 flex items-center space-x-(--grid-gap)">
          {showAvatar && avatar?.src && (
            <div className="avatar-border-container h-[2.5rem] w-[2.5rem] shrink-0">
              <Image
                src={avatar.src}
                alt={avatar.alt || ""}
                width={42}
                height={42}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <figcaption>
            {showAttribution && (
              <div className="type-sm">
                {resolve(name)}{" "}
                <span
                  className={cn("type-sm text-theme-text-sec", {
                    block: showAvatar && avatar,
                  })}
                >
                  {jobTitle && resolve(jobTitle)}
                  {jobTitle && company && ", "}
                  {company && resolve(company)}
                </span>
              </div>
            )}
          </figcaption>
        </div>
      </figure>
    </div>
  );
}

export function StaggeredShuffleTestimonials({
  testimonials,
  showAvatar = true,
  showAttribution = true,
  initialIndices,
}: {
  testimonials: Testimonial[];
  showAvatar?: boolean;
  showAttribution?: boolean;
  initialIndices?: number[];
}) {
  const indices =
    initialIndices && initialIndices.length >= 6
      ? initialIndices.slice(0, 6)
      : testimonials.slice(0, 6).map((_, index) => index);

  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-g1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {indices.map((testimonialIndex, position) => (
          <div key={testimonialIndex} className={cn({ "hidden md:block": position >= 3 })}>
            <TestimonialCard
              testimonial={testimonials[testimonialIndex]}
              showAvatar={showAvatar}
              showAttribution={showAttribution}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
