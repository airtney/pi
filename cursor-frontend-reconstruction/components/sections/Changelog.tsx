import Link from "next/link";

/**
 * "Changelog" — the four most recent release cards, read from the SSR markup.
 */
const ENTRIES = [
  { version: "3.11", date: "Jul 10, 2026", title: "Side Chats and Conversation Search", href: "/changelog/side-chat" },
  { version: "3.10", date: "Jun 30, 2026", title: "MCPs and Organizations in Team Marketplaces", href: "/changelog/team-marketplace-updates" },
  { version: "3.9", date: "Jun 29, 2026", title: "Cursor Mobile App for iOS", href: "/changelog/ios-mobile-app" },
  { version: "3.9", date: "Jun 22, 2026", title: "Customize Cursor", href: "/changelog/customize" },
];

export function Changelog() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <div className="flex items-end justify-between">
          <h2 className="type-lg">Changelog</h2>
          <Link href="/changelog" className="link-arrow type-base">
            See what&apos;s new in Cursor <span aria-hidden="true">&#8594;</span>
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ENTRIES.map((e) => (
            <Link
              key={`${e.version}-${e.title}`}
              href={e.href}
              className="rounded-xl border border-theme-border-01 bg-theme-card p-5 transition-colors hover:border-theme-border-02"
            >
              <div className="flex items-center gap-2 type-xs text-theme-text-tertiary">
                <span className="font-mono">{e.version}</span>
                <span>&middot;</span>
                <span>{e.date}</span>
              </div>
              <p className="mt-3 type-base text-theme-text">{e.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
