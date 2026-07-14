import type { ReactNode } from "react";

function FeatureBlock({
	title,
	description,
	link,
	visual,
	reverse = false,
}: {
	title: string;
	description: string;
	link?: { label: string; href: string };
	visual: ReactNode;
	reverse?: boolean;
}) {
	return (
		<div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
			<div className={reverse ? "lg:order-2" : ""}>
				<h3 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
					{title}
				</h3>
				<p className="max-w-md pt-4 text-lg leading-relaxed text-theme-text-sec">{description}</p>
				{link ? (
					<p className="pt-5">
						<a href={link.href} className="link-arrow">
							{link.label}
						</a>
					</p>
				) : null}
			</div>
			<div className={reverse ? "lg:order-1" : ""}>{visual}</div>
		</div>
	);
}

function AgentChatVisual() {
	return (
		<div className="card-surface overflow-hidden">
			<div className="border-b border-theme-border-02 px-4 py-2.5 font-mono text-[11px] text-theme-text-ter">
				Agent · Composer 2.5
			</div>
			<div className="flex flex-col gap-3 p-4 text-sm">
				<div className="self-end rounded-xl rounded-br-sm bg-theme-card-03 px-3.5 py-2.5">
					Build a settings page with usage-based billing toggles
				</div>
				<div className="rounded-xl rounded-bl-sm border border-theme-border-015 bg-theme-bg px-3.5 py-2.5 text-theme-text-sec">
					<p className="pb-1.5 font-mono text-[10px] uppercase tracking-wider text-theme-text-ter">
						Plan
					</p>
					<ol className="list-inside list-decimal space-y-1 text-[13px]">
						<li>Scaffold /settings route and layout</li>
						<li>Add BillingToggles with plan limits</li>
						<li>Wire to usage API, write tests</li>
					</ol>
				</div>
				<div className="flex items-center gap-2 font-mono text-[11px] text-theme-green">
					<span>✓</span> 3 files changed · tests passing
				</div>
			</div>
		</div>
	);
}

function ParallelAgentsVisual() {
	const rows = [
		{ name: "cursor/add-billing-toggles", status: "Demo ready", tone: "bg-theme-green" },
		{ name: "cursor/fix-oauth-refresh", status: "Testing", tone: "bg-theme-accent" },
		{ name: "cursor/refactor-webhooks", status: "Building", tone: "bg-theme-accent" },
		{ name: "cursor/update-docs", status: "Queued", tone: "bg-theme-border-025" },
	];
	return (
		<div className="card-surface overflow-hidden">
			<div className="flex items-center justify-between border-b border-theme-border-02 px-4 py-2.5">
				<span className="font-mono text-[11px] text-theme-text-ter">Cloud Agents</span>
				<span className="font-mono text-[11px] text-theme-text-ter">4 running</span>
			</div>
			<ul className="divide-y divide-theme-border-015">
				{rows.map((row) => (
					<li key={row.name} className="flex items-center justify-between px-4 py-3">
						<span className="truncate font-mono text-xs">{row.name}</span>
						<span className="flex shrink-0 items-center gap-2 text-xs text-theme-text-sec">
							<span className={`h-1.5 w-1.5 rounded-full ${row.tone}`} />
							{row.status}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function EverywhereVisual() {
	return (
		<div className="grid gap-3">
			<div className="card-surface overflow-hidden">
				<div className="border-b border-theme-border-02 px-4 py-2 font-mono text-[11px] text-theme-text-ter">
					Terminal
				</div>
				<div className="overflow-x-auto whitespace-nowrap p-4 font-mono text-[13px]">
					<span className="text-theme-text-ter">$ </span>
					curl https://cursor.com/install -fsS | bash
				</div>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="card-surface p-4">
					<p className="font-mono text-[11px] text-theme-text-ter">Slack</p>
					<p className="pt-2 text-sm">
						<span className="font-semibold">@Cursor</span> fix the failing deploy on main
					</p>
				</div>
				<div className="card-surface p-4">
					<p className="font-mono text-[11px] text-theme-text-ter">GitHub</p>
					<p className="pt-2 text-sm">
						<span className="font-semibold">cursor[bot]</span> reviewed 12 files ·{" "}
						<span className="text-theme-green">2 suggestions</span>
					</p>
				</div>
			</div>
		</div>
	);
}

function AutomationsVisual() {
	const rows = [
		{ name: "Nightly dependency triage", trigger: "Every day · 02:00" },
		{ name: "Fix failing CI on main", trigger: "On pipeline failure" },
		{ name: "Summarize new issues", trigger: "On issue opened" },
	];
	return (
		<div className="card-surface overflow-hidden">
			<div className="border-b border-theme-border-02 px-4 py-2.5 font-mono text-[11px] text-theme-text-ter">
				Automations
			</div>
			<ul className="divide-y divide-theme-border-015">
				{rows.map((row) => (
					<li key={row.name} className="flex items-center justify-between gap-3 px-4 py-3.5">
						<span className="text-sm font-medium">{row.name}</span>
						<span className="shrink-0 rounded-full bg-theme-card-03 px-2.5 py-1 font-mono text-[10px] text-theme-text-sec">
							{row.trigger}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

export function FeatureSections() {
	return (
		<section className="container-site flex flex-col gap-24 py-24 md:gap-32 md:py-32">
			<FeatureBlock
				title="Agents turn ideas into code"
				description="Accelerate development by handing off tasks to Cursor, while you focus on making decisions."
				link={{ label: "Learn about agentic development →", href: "https://cursor.com/product" }}
				visual={<AgentChatVisual />}
			/>
			<FeatureBlock
				title="Works autonomously, runs in parallel"
				description="Agents use their own computers to build, test, and demo features end to end for you to review."
				link={{ label: "Learn about cloud agents →", href: "https://cursor.com/docs/cloud-agent" }}
				visual={<ParallelAgentsVisual />}
				reverse
			/>
			<FeatureBlock
				title="In every tool, at every step"
				description="Cursor runs in your terminal, collaborates in Slack, and reviews PRs in GitHub."
				visual={<EverywhereVisual />}
			/>
			<FeatureBlock
				title="Automate repetitive work"
				description="Set up always-on agents that run on schedules or triggers to build, maintain, and fix your software."
				link={{ label: "Learn about Automations →", href: "https://cursor.com/automations" }}
				visual={<AutomationsVisual />}
				reverse
			/>
		</section>
	);
}
