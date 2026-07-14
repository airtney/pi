/**
 * "Trusted every day..." logo garden. The live site inlines each customer's
 * brand SVG (class `logo-garden-responsive-8`). To avoid embedding third-party
 * trademark artwork, this reconstruction reproduces the same section layout and
 * the customer names (as read from the SVG `aria-label`s) in a muted wordmark
 * row; the eight-logo responsive grid and spacing are preserved.
 */
const COMPANIES = [
  "Stripe",
  "OpenAI",
  "Linear",
  "Vercel",
  "Ramp",
  "Shopify",
  "Perplexity",
  "Samsung",
];

export function LogoGarden() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <h2 className="type-sm text-center text-theme-text-tertiary">
          Trusted every day by teams that build world-class software
        </h2>
		<div className="logo-garden-responsive-8 mt-8">
          {COMPANIES.map((name) => (
            <span
              key={name}
              className="type-md-lg font-semibold tracking-tight text-theme-text-mid opacity-80"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
