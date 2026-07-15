import { Actions } from "@/components/Button";

/**
 * Closing call-to-action: "Try Cursor now." with the same download + get
 * started buttons as the hero.
 */
export function CtaSection() {
  return (
    <section className="section bg-theme-bg text-theme-text section--headline">
      <div className="container">
        <div className="text-center mx-auto max-w-prose-medium-wide">
          <h2 className="type-xl sm:type-2xl text-balance mx-auto mb-v1">Try Cursor now.</h2>
          <div className="flex justify-center gap-x-g1 items-center">
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
