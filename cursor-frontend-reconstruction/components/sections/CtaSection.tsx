import { Actions } from "@/components/Button";

/**
 * Closing call-to-action: "Try Cursor now." with the same download + get
 * started buttons as the hero.
 */
export function CtaSection() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <div className="rounded-2xl border border-theme-border-01 bg-theme-card px-8 py-16 text-center">
          <h2 className="type-xl text-balance">Try Cursor now.</h2>
          <div className="mt-6 flex justify-center">
            <Actions
              alignment="center"
              mobileFullWidth
              cta={[
                { key: "download", downloadButton: true },
                {
                  key: "get-started",
                  link: { label: "Get started", href: "/login" },
                  icon: "arrow",
                  variant: "secondary",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
