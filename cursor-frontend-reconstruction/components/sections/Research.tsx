import Image from "next/image";
import { CardScroller, CardScrollerItem } from "@/components/CardScroller";
import { FeatureStoryCard } from "@/components/FeatureStoryCard";
import { FormattedDate } from "@/components/FormattedDate";
import { Link } from "@/components/Link";

/**
 * Research block, rebuilt from the two server-rendered sections in the RSC
 * Flight payload:
 *
 * - the "Cursor is an applied research team…" mission statement is a
 *   `FeatureStoryCard` (module 503342) with a "Join us" tertiary CTA and the
 *   team photo on the media side;
 * - "Recent highlights" is a card-scroller row of blog-post cards (author
 *   avatar stack, date · category, read time) mirroring the SSR markup.
 *   Avatars are mirrored into /public/avatars from the cursor.com CDN; the
 *   "Cursor Team" entry uses the light/dark avatar-circle pair.
 */

interface HighlightAuthor {
  name: string;
  avatar: string;
  darkAvatar?: string;
}

interface Highlight {
  slug: string;
  date: string;
  category: string;
  title: string;
  authors: HighlightAuthor[];
  authorLabel: string;
  readTime: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    slug: "composer-2-technical-report",
    date: "2026-03-27T12:00:00.000Z",
    category: "Research",
    title: "A technical report on Composer 2",
    authors: [{ name: "Sasha Rush", avatar: "/avatars/sasha-rush.jpeg" }],
    authorLabel: "Sasha Rush",
    readTime: "3 min read",
  },
  {
    slug: "grok-4-5",
    date: "2026-07-08T00:00:00.000Z",
    category: "Research",
    title: "Introducing Grok 4.5",
    authors: [
      {
        name: "Cursor Team",
        avatar: "/avatars/avatar-circle-2d-dark.png",
        darkAvatar: "/avatars/avatar-circle-2d-white.png",
      },
    ],
    authorLabel: "Cursor Team",
    readTime: "3 min read",
  },
  {
    slug: "ios-mobile-app",
    date: "2026-06-29T12:00:00.000Z",
    category: "Product",
    title: "Build from anywhere with Cursor for iOS",
    authors: [
      { name: "Chris", avatar: "/avatars/chris-avatar.jpg" },
      { name: "Rikki", avatar: "/avatars/rikki.jpg" },
      { name: "Kevin", avatar: "/avatars/kevin-niparko.png" },
    ],
    authorLabel: "Chris, Rikki & Kevin",
    readTime: "7 min read",
  },
  {
    slug: "design-mode",
    date: "2026-06-05T00:00:00.000Z",
    category: "Product",
    title: "Direct agents with visual prompts in Design Mode",
    authors: [
      { name: "Erik", avatar: "/avatars/erik-nilsson-v2.png" },
      { name: "Ian", avatar: "/avatars/ian-huang-v3.jpeg" },
      { name: "Ryo", avatar: "/avatars/ryo-lu.png" },
    ],
    authorLabel: "Erik, Ian & Ryo",
    readTime: "6 min read",
  },
];

function AuthorAvatar({ author, index }: { author: HighlightAuthor; index: number }) {
  return (
    <div
      className="first:ml-0 relative rounded-full"
      style={{
        ...(index > 0 && { boxShadow: "0 0 0 2px var(--color-theme-card-02-hex)" }),
        zIndex: index + 1,
      }}
    >
      <div className="avatar-border-container bg-theme-card-03-hex relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
        <Image
          src={author.avatar}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className={
            author.darkAvatar ? "h-full w-full object-cover media-light" : "h-full w-full object-cover"
          }
        />
        {author.darkAvatar && (
          <Image
            src={author.darkAvatar}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="media-dark absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <article className="flex h-full grow-1 flex-col">
      <Link
        href={`/blog/${highlight.slug}`}
        className="card card--text grow-1 grid-cursor-v1 grid-cols-[1fr_auto] @container"
      >
        <div className="flex flex-col @sm:col-start-1 @sm:col-end-2">
          <div className="type-base text-theme-text-mid flex shrink-0 flex-wrap items-center gap-x-v2/12 gap-y-v1/12">
            <FormattedDate className="type-base" dateString={highlight.date} />
            <span aria-hidden="true">·</span>
            <span>{highlight.category}</span>
          </div>
          <div className="grow-1">
            <p className="type-base text-theme-text text-pretty">{highlight.title}</p>
          </div>
          <div className="mt-v8/12 flex flex-wrap items-center gap-x-v4/12 gap-y-v3/12">
            <div className="flex -space-x-v3/12">
              {highlight.authors.map((author, index) => (
                <AuthorAvatar key={`${author.name}-${index}`} author={author} index={index} />
              ))}
            </div>
            <div className="type-base text-theme-text-mid min-w-0">
              <span>{highlight.authorLabel}</span>
              <span className="whitespace-nowrap">
                <span aria-hidden="true"> · </span>
                <span>{highlight.readTime}</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function Research() {
  return (
    <>
      <FeatureStoryCard
        title="Cursor is an applied research team focused on building the future of software development."
        cta={[
          {
            key: "join-us",
            link: { linkType: "href", href: "/careers", label: "Join us" },
            variant: "tertiary",
            icon: "arrow",
          },
        ]}
        ctaSpacingClassName="mt-v8/12"
        mediaSide="right"
        mediaType="image"
        media={{ src: "/misc/homepage-team-photo.jpg" }}
        mediaImageClassName="aspect-[16/9] object-cover md:aspect-[8/5]"
        semanticLevel="h2"
        spacing="none"
      />
      <section className="section bg-theme-bg text-theme-text">
        <div className="container">
          <h2 className="type-md text-theme-text mb-v1">Recent highlights</h2>
          <CardScroller>
            {HIGHLIGHTS.map((highlight, index) => (
              <CardScrollerItem key={highlight.slug} index={index}>
                <HighlightCard highlight={highlight} />
              </CardScrollerItem>
            ))}
          </CardScroller>
          <Link href="/blog" className="btn-text mt-v9/12 inline-flex">
            View all blog posts →
          </Link>
        </div>
      </section>
    </>
  );
}
