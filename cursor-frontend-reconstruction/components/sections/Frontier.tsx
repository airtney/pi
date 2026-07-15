import type { ReactNode } from "react";
import { isExternalLink, type SiteLink } from "@/lib/links";
import { FeatureMediaContainer } from "@/components/FeatureMediaContainer";
import { Link } from "@/components/Link";
import { SectionHeadline } from "@/components/SectionHeadline";
import { PromptCard } from "@/components/demo/PromptCard";
import { ToolCallsDemo } from "@/components/demo/ToolCallsDemo";

/**
 * "Stay on the frontier" — three demo cards on an xl 3-column grid, rebuilt
 * from the section's RSC Flight payload in _artifacts/index.html:
 *
 * 1. model choice   — PromptCard (module 316688) over a card-03 background;
 * 2. codebase       — ToolCallsDemo (module 760872) over the light/dark
 *                     frontier-codebase screenshots;
 * 3. enterprise     — the homepage-team-photo-1 image card.
 *
 * Copy, links, and card markup mirror the payload verbatim, including the
 * upstream `className="undefined h-full"` card wrapper (the original
 * interpolates an undefined `className` prop into the template literal).
 */

interface FrontierCard {
  title: string;
  description: string;
  link: SiteLink;
  media: ReactNode;
}

const CARDS: FrontierCard[] = [
  {
    title: "Use the best model for every task",
    description:
      "Choose between every cutting-edge model from OpenAI, Anthropic, Gemini, SpaceXAI, and Cursor.",
    link: {
      href: "/docs/models",
      label: "Explore models",
      linkType: "href",
      openInNewTab: true,
    },
    media: (
      <FeatureMediaContainer
        mediaBgColor="card-03-hex"
        mediaType="reactComponent"
        allowOverflow
        maxHeightMobile="420px"
      >
        <PromptCard />
      </FeatureMediaContainer>
    ),
  },
  {
    title: "Complete codebase understanding",
    description: "Cursor learns how your codebase works, no matter the scale or complexity.",
    link: {
      href: "/docs/context/semantic-search",
      label: "Learn about codebase indexing",
      linkType: "href",
      openInNewTab: true,
    },
    media: (
      <FeatureMediaContainer
        mediaType="reactComponent"
        mediaBg={{
          src: "/misc/frontier-codebase-light.png",
          darkSrc: "/misc/frontier-codebase-dark.png",
        }}
        maxHeightMobile="420px"
      >
        <ToolCallsDemo aspectRatio={{ base: "4/3", md: "1/1" }} />
      </FeatureMediaContainer>
    ),
  },
  {
    title: "Develop enduring software",
    description:
      "Trusted by over half of the Fortune 500 to accelerate development, securely and at scale.",
    link: { linkType: "page", slug: "enterprise", label: "Explore enterprise" },
    media: (
      <FeatureMediaContainer
        mediaType="image"
        media={{ src: "/misc/homepage-team-photo-1.jpg" }}
        maxHeightMobile="420px"
      />
    ),
  },
];

export function Frontier() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <SectionHeadline
          title="Stay on the frontier"
          titleClassName="type-md"
          textSize="md"
          alignment="left"
          semanticLevel="h2"
        />
        <div className="grid gap-g1 grid-cols-1 xl:grid-cols-3 items-stretch">
          {CARDS.map((card, index) => (
            <div key={`card-${index}`} className="undefined h-full">
              <div className="card flex h-full grow-1 flex-col">
                <div className="type-base max-w-prose flex grow flex-col">
                  <div>
                    <h3>{card.title}</h3>
                    <div className="text-theme-text-sec text-pretty">{card.description}</div>
                  </div>
                  <div className="mt-auto pt-v8/12">
                    <Link
                      href={card.link.href ?? (card.link.slug ? `/${card.link.slug}` : "#")}
                      openInNewTab={card.link.openInNewTab}
                      className="btn-tertiary"
                    >
                      {card.link.label}
                      {isExternalLink(card.link) ? " ↗" : " →"}
                    </Link>
                  </div>
                </div>
                <figure className="pt-g1.75">{card.media}</figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
