/**
 * Stylized mock of the Cursor desktop editor + CLI shown in the hero.
 * The original page renders a fully interactive demo; this is a static,
 * hand-written approximation of its look.
 */

function TrafficLights() {
	return (
		<div className="flex items-center gap-1.5">
			<span className="h-2.5 w-2.5 rounded-full bg-[#f45952]" />
			<span className="h-2.5 w-2.5 rounded-full bg-[#f5b52e]" />
			<span className="h-2.5 w-2.5 rounded-full bg-[#57b845]" />
		</div>
	);
}

function AgentSidebar() {
	const agents = [
		{ name: "Add realtime presence", status: "Running", tone: "text-theme-green" },
		{ name: "Fix flaky sync test", status: "Reviewing", tone: "text-theme-accent" },
		{ name: "Migrate settings page", status: "Done", tone: "text-theme-text-ter" },
	];
	return (
		<aside className="hidden w-52 shrink-0 flex-col border-r border-theme-border-02 bg-theme-card-01 p-3 md:flex">
			<div className="flex items-center justify-between pb-3">
				<span className="text-xs font-semibold text-theme-text-sec">In Progress</span>
				<span className="rounded-full bg-theme-card-03 px-1.5 text-[10px] font-semibold text-theme-text-sec">
					3
				</span>
			</div>
			<div className="flex flex-col gap-1.5">
				{agents.map((agent) => (
					<div
						key={agent.name}
						className="rounded-lg border border-theme-border-015 bg-theme-bg px-2.5 py-2"
					>
						<p className="truncate text-xs font-medium">{agent.name}</p>
						<p className={`pt-0.5 font-mono text-[10px] ${agent.tone}`}>{agent.status}</p>
					</div>
				))}
			</div>
			<div className="mt-auto rounded-lg bg-theme-card-02 px-2.5 py-2 text-[10px] text-theme-text-ter">
				Mission Control · F3
			</div>
		</aside>
	);
}

function EditorPane() {
	const lines: Array<{ n: number; parts: Array<{ t: string; c?: string }> }> = [
		{ n: 1, parts: [{ t: "import", c: "text-[#a626a4]" }, { t: " { useSyncedPresence } " }, { t: "from", c: "text-[#a626a4]" }, { t: " \"./presence\"", c: "text-theme-green" }] },
		{ n: 2, parts: [{ t: "" }] },
		{ n: 3, parts: [{ t: "export function", c: "text-[#a626a4]" }, { t: " PresenceAvatars", c: "text-[#4078f2]" }, { t: "() {" }] },
		{ n: 4, parts: [{ t: "  const", c: "text-[#a626a4]" }, { t: " peers = " }, { t: "useSyncedPresence", c: "text-[#4078f2]" }, { t: "()" }] },
		{ n: 5, parts: [{ t: "  return", c: "text-[#a626a4]" }, { t: " peers." }, { t: "map", c: "text-[#4078f2]" }, { t: "(renderAvatar)" }] },
		{ n: 6, parts: [{ t: "}" }] },
	];
	return (
		<div className="min-w-0 flex-1 bg-theme-bg">
			<div className="flex items-center gap-0.5 border-b border-theme-border-02 bg-theme-card px-2 pt-1.5">
				<div className="rounded-t-md border border-b-0 border-theme-border-02 bg-theme-bg px-3 py-1 font-mono text-[11px]">
					presence.ts
				</div>
				<div className="px-3 py-1 font-mono text-[11px] text-theme-text-ter">feature-prd.md</div>
			</div>
			<div className="overflow-hidden p-3 font-mono text-[11px] leading-[1.8]">
				{lines.map((line) => (
					<div key={line.n} className="flex gap-3 whitespace-pre">
						<span className="w-4 select-none text-right text-theme-text-ter">{line.n}</span>
						<span>
							{line.parts.map((part, i) => (
								<span key={i} className={part.c ?? ""}>
									{part.t}
								</span>
							))}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function AgentPanel() {
	return (
		<aside className="hidden w-64 shrink-0 flex-col border-l border-theme-border-02 bg-theme-card-01 p-3 lg:flex">
			<div className="flex items-center justify-between pb-2">
				<span className="text-xs font-semibold">Agent</span>
				<span className="rounded-full border border-theme-border-02 px-2 py-0.5 font-mono text-[10px] text-theme-text-sec">
					Composer 2.5
				</span>
			</div>
			<div className="flex flex-col gap-2 text-[11px]">
				<div className="rounded-lg bg-theme-card-03 px-2.5 py-2">
					Add realtime presence indicators to the collaboration panel.
				</div>
				<div className="rounded-lg border border-theme-border-015 bg-theme-bg px-2.5 py-2 text-theme-text-sec">
					<span className="font-mono text-[10px] text-theme-green">✓ Read</span> presence.ts
					<br />
					<span className="font-mono text-[10px] text-theme-green">✓ Edit</span> PresenceAvatars.tsx
					<br />
					<span className="font-mono text-[10px] text-theme-accent">▸ Run</span> npm test
				</div>
			</div>
			<div className="mt-auto rounded-lg border border-theme-border-02 bg-theme-bg px-2.5 py-2 text-[11px] text-theme-text-ter">
				Enter prompt text… (type @ for tools &amp; MCPs, / for skills)
			</div>
		</aside>
	);
}

function CliWindow() {
	return (
		<div className="absolute -bottom-6 right-4 hidden w-72 overflow-hidden rounded-xl border border-theme-border-02 bg-theme-dark-bg text-theme-dark-fg shadow-2xl shadow-black/20 sm:block md:right-10">
			<div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
				<TrafficLights />
				<span className="font-mono text-[10px] text-white/50">~/cursor/cursor-web</span>
			</div>
			<div className="p-3 font-mono text-[11px] leading-relaxed">
				<p className="text-white/50">Cursor CLI</p>
				<p>
					<span className="text-theme-accent">▌</span> Analyze tab vs agent usage patterns
				</p>
				<p className="pt-1 text-white/40">Working… reading 24 files</p>
			</div>
		</div>
	);
}

export function HeroDemo() {
	return (
		<div className="relative">
			<div className="overflow-hidden rounded-2xl border border-theme-border-02 bg-theme-card shadow-xl shadow-black/5">
				<div className="flex items-center justify-between border-b border-theme-border-02 px-4 py-2.5">
					<TrafficLights />
					<span className="font-mono text-[11px] text-theme-text-ter">Cursor Desktop</span>
					<span className="rounded-full bg-theme-fg px-2.5 py-1 text-[10px] font-medium text-theme-bg">
						Get Cursor
					</span>
				</div>
				<div className="flex min-h-[320px] md:min-h-[380px]">
					<AgentSidebar />
					<EditorPane />
					<AgentPanel />
				</div>
			</div>
			<CliWindow />
		</div>
	);
}
