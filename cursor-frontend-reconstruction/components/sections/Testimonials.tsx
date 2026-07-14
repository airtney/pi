import Image from "next/image";

/**
 * "The new way to build software." — a wall of customer testimonials.
 * Avatars are mirrored locally into /public/avatars from the cursor.com CDN.
 */
interface Quote {
  quote: string;
  name: string;
  role: string;
  org: string;
  avatar?: string;
}

const QUOTES: Quote[] = [
  {
    quote:
      "It was night and day from one batch to another, adoption went from single digits to over 80%. It just spread like wildfire, all the best builders were using Cursor.",
    name: "Diana Hu",
    role: "General Partner",
    org: "Y Combinator",
    avatar: "/avatars/diana-hu-avatar.png",
  },
  {
    quote:
      "The best LLM applications have an autonomy slider: you control how much independence to give the AI. In Cursor, you can do Tab completion, Cmd+K for targeted edits, or let it rip with the full agentic version.",
    name: "Andrej Karpathy",
    role: "CEO",
    org: "Eureka Labs",
    avatar: "/avatars/andrej-karpathy-avatar.png",
  },
  {
    quote:
      "Cursor quickly grew from hundreds to thousands of extremely enthusiastic Stripe employees. There are significant economic outcomes when making software creation more efficient.",
    name: "Patrick Collison",
    role: "Co-Founder & CEO",
    org: "Stripe",
    avatar: "/avatars/patrick-collison-avatar.png",
  },
  {
    quote:
      "The most useful AI tool that I currently pay for, hands down, is Cursor. It's fast, autocompletes when and where you need it to, and everything is well put together.",
    name: "shadcn",
    role: "Creator of shadcn/ui",
    org: "",
    avatar: "/avatars/shadcn-avatar.png",
  },
  {
    quote:
      "It's definitely becoming more fun to be a programmer. We are at the 1% of what's possible, and it's in interactive experiences like Cursor where models shine brightest.",
    name: "Greg Brockman",
    role: "President",
    org: "OpenAI",
    avatar: "/avatars/greg-brockman-avatar.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <h2 className="type-lg text-balance">The new way to build software.</h2>
        <div className="mt-10 columns-1 gap-6 md:columns-2 lg:columns-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="mb-6 break-inside-avoid rounded-xl border border-theme-border-01 bg-theme-card p-6"
            >
              <blockquote className="type-base text-theme-text">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {q.avatar && (
                  <Image
                    src={q.avatar}
                    alt={`${q.name} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div className="type-sm">
                  <div className="text-theme-text">{q.name}</div>
                  <div className="text-theme-text-tertiary">
                    {q.role}
                    {q.org ? `, ${q.org}` : ""}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
