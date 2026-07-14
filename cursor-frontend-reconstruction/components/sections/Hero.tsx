import { Actions } from "@/components/Button";
import { DemoWindow } from "@/components/DemoWindow";

const IN_PROGRESS = [
  { title: "Build Landing Page", status: "Reading docs" },
  { title: "Analyze Tab vs Agent Usage Patterns", status: "Fetching data" },
  { title: "Plan Mission Control", status: "Generating plan" },
];

const READY = [
  { title: "PyTorch MNIST Experiments", meta: "10m" },
  { title: "Set up Cursor Rules for Dashboard", meta: "30m" },
  { title: "Bioinformatics Tools", meta: "+135 -21" },
];

export function Hero() {
  return (
    <section className="section bg-theme-bg text-theme-text pt-[calc(var(--site-header-height)+var(--spacing-v2))]">
      <div className="container">
        <div className="max-w-3xl">
          <h1 className="type-2xl text-balance">
            Cursor is your coding agent for building ambitious software.
          </h1>
          <div className="mt-v1">
            <Actions
              alignment="left"
              mobileFullWidth
              cta={[
                { key: "download", downloadButton: true },
                {
                  key: "get-started",
                  link: { label: "Get started", href: "/login" },
                  icon: "arrow",
                  variant: "secondary",
                },
                {
                  key: "demo",
                  link: { label: "Request a demo", href: "/contact-sales?source=hero_request_demo" },
                  icon: "arrow",
                  variant: "tertiary",
                  hideOnMobile: true,
                },
              ]}
            />
          </div>
        </div>

        <div className="mt-12">
          <DemoWindow title="Cursor Desktop" className="mx-auto max-w-5xl">
            <div className="grid gap-px bg-theme-border-01 md:grid-cols-2">
              <div className="bg-theme-card p-6">
                <div className="mb-4 flex items-center justify-between type-sm text-theme-text-sec">
                  <span>In Progress</span>
                  <span className="rounded-full bg-theme-card-03 px-2 py-0.5 type-xs">3</span>
                </div>
                <ul className="stack gap-y-3">
                  {IN_PROGRESS.map((t) => (
                    <li key={t.title} className="rounded-lg border border-theme-border-01 p-3">
                      <p className="type-sm text-theme-text">{t.title}</p>
                      <p className="type-xs text-theme-text-tertiary">{t.status}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-theme-card p-6">
                <div className="mb-4 flex items-center justify-between type-sm text-theme-text-sec">
                  <span>Ready for Review</span>
                  <span className="rounded-full bg-theme-card-03 px-2 py-0.5 type-xs">3</span>
                </div>
                <ul className="stack gap-y-3">
                  {READY.map((t) => (
                    <li
                      key={t.title}
                      className="flex items-center justify-between rounded-lg border border-theme-border-01 p-3"
                    >
                      <p className="type-sm text-theme-text">{t.title}</p>
                      <span className="font-mono type-xs text-theme-text-tertiary">{t.meta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DemoWindow>
        </div>
      </div>
    </section>
  );
}
