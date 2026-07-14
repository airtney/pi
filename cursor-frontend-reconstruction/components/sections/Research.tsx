import Image from "next/image";
import Link from "next/link";

/**
 * "Cursor is an applied research team..." — mission statement over the team
 * photo, followed by a "Recent highlights" row of recent blog posts.
 */
const HIGHLIGHTS = [
  { date: "Mar 27, 2026", category: "Research", title: "A technical report on Composer 2", byline: "Sasha Rush · 3 min read", href: "/blog/composer-2-technical-report" },
  { date: "Jul 8, 2026", category: "Research", title: "Introducing Grok 4.5", byline: "Cursor Team · 3 min read", href: "/blog/grok-4-5" },
  { date: "Jun 29, 2026", category: "Product", title: "Build from anywhere with Cursor for iOS", byline: "Chris, Rikki & Kevin · 7 min read", href: "/blog/ios-mobile-app" },
  { date: "Jun 5, 2026", category: "Product", title: "Direct agents with visual prompts in Design Mode", byline: "Erik, Ian & Ryo · 6 min read", href: "/blog/design-mode" },
];

export function Research() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl border border-theme-border-01">
          <Image
            src="/misc/homepage-team-photo.jpg"
            alt="Cursor team"
            width={1920}
            height={1080}
            className="h-[360px] w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-8">
            <h2 className="type-md-lg max-w-2xl text-white">
              Cursor is an applied research team focused on building the future of software
              development.
            </h2>
            <Link href="/careers" className="mt-4 inline-flex type-base text-white/90">
              Join us <span aria-hidden="true">&nbsp;&#8594;</span>
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="type-md">Recent highlights</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <Link
                key={h.title}
                href={h.href}
                className="rounded-xl border border-theme-border-01 bg-theme-card p-5 transition-colors hover:border-theme-border-02"
              >
                <div className="type-xs text-theme-text-tertiary">
                  {h.date} &middot; {h.category}
                </div>
                <p className="mt-3 type-base text-theme-text">{h.title}</p>
                <p className="mt-3 type-xs text-theme-text-tertiary">{h.byline}</p>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="link-arrow mt-6 inline-flex type-base">
            View all blog posts <span aria-hidden="true">&nbsp;&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
