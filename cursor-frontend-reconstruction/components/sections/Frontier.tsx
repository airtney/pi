import Link from "next/link";

/**
 * "Stay on the frontier" — three stacked sub-features: model choice, codebase
 * understanding, and enterprise scale. Copy is taken from the SSR markup.
 */
interface SubFeature {
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  external?: boolean;
  demo: React.ReactNode;
}

const MODELS = ["Composer 2.5", "GPT-5.6 Sol", "Opus 4.8", "Gemini 3.1 Pro", "Grok 4.5"];

const SUBFEATURES: SubFeature[] = [
  {
    title: "Use the best model for every task",
    description:
      "Choose between every cutting-edge model from OpenAI, Anthropic, Gemini, xAI, and Cursor.",
    linkLabel: "Explore models",
    linkHref: "/docs/models",
    external: true,
    demo: (
      <ul className="stack gap-y-2">
        {MODELS.map((m, i) => (
          <li
            key={m}
            className={`flex items-center justify-between rounded-md border border-theme-border-01 px-3 py-2 type-sm ${
              i === 0 ? "bg-theme-card-03 text-theme-text" : "text-theme-text-sec"
            }`}
          >
            <span>{m}</span>
            {i === 0 && <span aria-hidden="true">&#10003;</span>}
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Complete codebase understanding",
    description: "Cursor learns how your codebase works, no matter the scale or complexity.",
    linkLabel: "Learn about codebase indexing",
    linkHref: "/docs/context/semantic-search",
    external: true,
    demo: (
      <div className="rounded-md border border-theme-border-01 bg-theme-card-02 p-4 font-mono type-sm">
        <p className="text-theme-text-sec">Where are these menu label colors defined?</p>
        <p className="mt-2 text-theme-product-syntax-function">
          src/components/MenuBar.tsx:42
        </p>
      </div>
    ),
  },
  {
    title: "Develop enduring software",
    description:
      "Trusted by over half of the Fortune 500 to accelerate development, securely and at scale.",
    linkLabel: "Explore enterprise",
    linkHref: "/enterprise",
    demo: (
      <div className="rounded-md border border-theme-border-01 bg-theme-card-02 p-6 text-center">
        <p className="type-2xl text-theme-text">50%+</p>
        <p className="type-sm text-theme-text-tertiary">of the Fortune 500</p>
      </div>
    ),
  },
];

export function Frontier() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <h2 className="type-lg text-balance">Stay on the frontier</h2>
        <div className="mt-10 stack gap-y-10">
          {SUBFEATURES.map((f) => (
            <div
              key={f.title}
              className="grid items-center gap-8 rounded-xl border border-theme-border-01 bg-theme-card p-6 md:grid-cols-2"
            >
              <div>
                <h3 className="type-md-lg text-theme-text">{f.title}</h3>
                <p className="mt-3 type-base text-theme-text-sec">{f.description}</p>
                {f.external ? (
                  <a
                    href={f.linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-arrow mt-4 inline-flex type-base"
                  >
                    {f.linkLabel} <span aria-hidden="true">&nbsp;&#8599;</span>
                  </a>
                ) : (
                  <Link href={f.linkHref} className="link-arrow mt-4 inline-flex type-base">
                    {f.linkLabel} <span aria-hidden="true">&nbsp;&#8594;</span>
                  </Link>
                )}
              </div>
              <div>{f.demo}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
