import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { DemoWindow } from "@/components/DemoWindow";
import { SyntaxHighlightedShellCommand } from "@/components/Button";

export function AgentsFeature() {
  return (
    <FeatureShowcase
      title="Agents turn ideas into code"
      description="Accelerate development by handing off tasks to Cursor, while you focus on making decisions."
      linkLabel="Learn about agentic development"
      linkHref="/product"
    >
      <DemoWindow title="Mission Control Interface" className="mx-auto max-w-4xl">
        <div className="grid gap-px bg-theme-border-01 md:grid-cols-3">
          <div className="bg-theme-card p-5 md:col-span-2">
            <p className="type-sm text-theme-text-sec">
              A grid view of all open windows as scaled previews, allowing quick selection to bring
              any window to front.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-md border border-theme-border-01 bg-theme-card-02"
                />
              ))}
            </div>
          </div>
          <div className="bg-theme-card p-5">
            <p className="type-xs uppercase tracking-wide text-theme-text-tertiary">Tasks</p>
            <ul className="mt-3 stack gap-y-2 type-sm text-theme-text">
              <li>Add multiplayer mode to useAppStore.ts</li>
              <li>Create a new MissionControlView.tsx component</li>
              <li>Update AppManager.tsx to apply expose modes</li>
            </ul>
            <p className="mt-4 type-xs text-theme-text-tertiary">Composer 2.5</p>
          </div>
        </div>
      </DemoWindow>
    </FeatureShowcase>
  );
}

export function AutonomousFeature() {
  const tasks = [
    { name: "Acme Research Dashboard", group: "This Week" },
    { name: "Live Telemetry Pipeline", group: "This Week" },
    { name: "Zero-Downtime Deploys", group: "This Week" },
    { name: "Binary Protocol Parser", group: "This Month" },
    { name: "Edge Cache Invalidation", group: "This Month" },
    { name: "Auth Token Rotation", group: "This Month" },
  ];
  return (
    <FeatureShowcase
      title="Works autonomously, runs in parallel"
      description="Agents use their own computers to build, test, and demo features end to end for you to review."
      linkLabel="Learn about cloud agents"
      linkHref="/docs/cloud-agent"
    >
      <DemoWindow title="cursor.com/agent" className="mx-auto max-w-4xl">
        <div className="grid gap-px bg-theme-border-01 md:grid-cols-2">
          <div className="bg-theme-card p-5">
            <ul className="stack gap-y-2">
              {tasks.map((t) => (
                <li
                  key={t.name}
                  className="flex items-center justify-between rounded-md border border-theme-border-01 px-3 py-2 type-sm"
                >
                  <span className="text-theme-text">{t.name}</span>
                  <span className="type-xs text-theme-text-tertiary">{t.group}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-theme-card p-5">
            <p className="type-sm text-theme-text">
              let&apos;s build a dashboard to make our research findings interactive
            </p>
            <p className="mt-3 type-xs text-theme-text-tertiary">Explored 12 files, 4 searches</p>
            <p className="mt-3 type-sm text-theme-text-sec">
              On it. I&apos;ll build the dashboard using your theme config, wire up the research
              data, and add interactive charts with public access controls.
            </p>
            <p className="mt-3 type-xs text-theme-text-tertiary">Worked for 14m 22s · Opus 4.8</p>
          </div>
        </div>
      </DemoWindow>
    </FeatureShowcase>
  );
}

export function EveryToolFeature() {
  return (
    <FeatureShowcase
      title="In every tool, at every step"
      description="Cursor runs in your terminal, collaborates in Slack, and reviews PRs in GitHub."
      linkLabel="Explore the CLI"
      linkHref="/cli"
    >
      <DemoWindow title="cursor-agent" className="mx-auto max-w-4xl">
        <div className="p-6 font-mono type-sm text-theme-text">
          <div className="flex items-center gap-2">
            <span className="text-theme-text-tertiary">&gt;</span>
            <SyntaxHighlightedShellCommand command="curl https://cursor.com/install -fsS | bash" />
          </div>
          <div className="mt-4 rounded-md border border-theme-border-01 bg-theme-card-02 p-4">
            <p className="type-xs text-theme-text-tertiary">#feature-realtime-sync · Slack</p>
            <p className="mt-2 text-theme-text">
              <span className="text-theme-product-syntax-function">@cursor</span> can you take a
              stab?
            </p>
            <p className="mt-2 text-theme-text-sec">
              I added direct linking for changelog entries and updated the Node.js version
              constraints across the project.
            </p>
          </div>
        </div>
      </DemoWindow>
    </FeatureShowcase>
  );
}

export function AutomateFeature() {
  return (
    <FeatureShowcase
      title="Automate repetitive work"
      description="Set up always-on agents that run on schedules or triggers to build, maintain, and fix your software."
      linkLabel="Learn about Automations"
      linkHref="/automations"
    >
      <DemoWindow title="Automations" className="mx-auto max-w-4xl">
        <div className="grid gap-px bg-theme-border-01 md:grid-cols-3">
          <div className="bg-theme-card p-5">
            <p className="type-xs uppercase tracking-wide text-theme-text-tertiary">Triggers</p>
            <ul className="mt-3 stack gap-y-2 type-sm text-theme-text">
              <li className="rounded-md border border-theme-border-01 px-3 py-2">Fix CI failures on main</li>
              <li className="rounded-md border border-theme-border-01 px-3 py-2 text-theme-text-tertiary">
                + Add trigger
              </li>
            </ul>
          </div>
          <div className="bg-theme-card p-5 md:col-span-2">
            <p className="type-xs uppercase tracking-wide text-theme-text-tertiary">
              Agent Instructions
            </p>
            <p className="mt-3 type-sm text-theme-text-sec">
              Your task is to fix CI failures on main. Avoid racing other agents. Root cause by
              checking logs. Report with{" "}
              <span className="font-mono text-theme-product-syntax-keyword">
                /apply-report-format
              </span>
              .
            </p>
            <p className="mt-4 type-xs text-theme-text-tertiary">Composer 2.5</p>
          </div>
        </div>
      </DemoWindow>
    </FeatureShowcase>
  );
}
