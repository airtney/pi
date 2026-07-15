"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AgentChat } from "@/components/demo/AgentChat";
import { AgentsSidebar } from "@/components/demo/AgentsSidebar";
import { CloseIcon } from "@/components/demo/primitives";
import { usePrefersReducedMotion } from "@/lib/demo/DemoPlayback";
import { demoScenarios } from "@/lib/demo/scenarios";
import { useGT, useMessages } from "@/lib/gt-shim";
import type { DemoDiffSummary, DemoFile, DemoMessage } from "@/lib/demo/types";

/**
 * Agent workbench (the "Cursor Desktop" window body), deobfuscated from
 * Turbopack module `39014` (beautified `0pndbgv1nwvs5.js`) in its hero
 * configuration: `layoutPreset="agent"`, `showEditor`, `hideTabsForBrowser`,
 * `showAgentsSidebarHeader={false}`, `mode={{ type: "agent",
 * streamInitialMessages: true }}` with scenario auto-cycling.
 *
 * Behaviour ported from the chunk:
 * - scenario state machine over `demoScenarios` with `autoCycleScenarioKeys`
 *   (one full pass, then it settles back on the first scenario);
 * - playback gated on the demo scrolling into view (IntersectionObserver);
 * - `prefers-reduced-motion` renders everything settled with every sidebar
 *   scenario marked ready;
 * - when a chat transcript finishes streaming, the scenario is promoted into
 *   the sidebar's "Ready for Review" list with its diff summary;
 * - sending a follow-up appends the canned "download Cursor" assistant reply.
 *
 * Scoping note: the bundle's editor module (`654011`) ships a full
 * shiki-highlighted diff editor; the hero only ever displays the browser
 * preview, the plan document, and plain code files, so this port renders
 * those three pane kinds without the highlighting pipeline.
 */

const DEFAULT_READY_KEYS = ["autoComplete", "nextjsRouter", "cursorRules", "biotech", "mlPython"];

interface ReadyMeta {
	completedAtOffset?: number;
	lastAssistant?: string;
	diffSummary?: DemoDiffSummary;
}

interface AgentWorkbenchProps {
	scenario?: string;
	autoCycleScenarioKeys?: string[];
	autoCycleIntervalMs?: number;
	autoCycleEnabled?: boolean;
	autoCycleResetKey?: number;
	onScenarioChange?: (key: string) => void;
	showAgentsSidebarHeader?: boolean;
	streamInitialMessages?: boolean;
	defaultMode?: "plan" | "build" | "agent";
	defaultModel?: string;
	embedded?: boolean;
}

const PUBLICATIONS: Array<[year: string, title: string]> = [
	["2026", "Secure codebase indexing"],
	["2026", "Semantic search"],
	["2025", "Reinforcement learning"],
	["2024", "Shadow workspaces"],
	["2024", "Multi-agent collaboration"],
	["2023", "Context-aware completions"],
	["2023", "Intelligent code navigation"],
	["2022", "Fast inference optimization"],
	["2022", "Language model fine-tuning"],
];

/** Acme Labs landing page rendered inside the in-editor browser preview. */
function AcmeLabsPreview() {
	return (
		<div
			className="cursor-preview relative flex h-full flex-col overflow-hidden px-6 py-8"
			style={{
				fontFamily:
					"var(--font-serif), Iowan Old Style, Palatino Linotype, URW Palladio L, P052, ui-serif, Georgia, Cambria, Times New Roman, Times, serif",
			}}
		>
			<header className="pointer-events-auto mb-8 flex items-center">
				<div>
					<span
						className="cursor-preview-brand"
						style={{
							fontWeight: 500,
							fontStyle: "italic",
							fontFeatureSettings: '"cswh" 1',
							fontSize: "1.2rem",
						}}
					>
						Acme Labs
					</span>
				</div>
			</header>
			<div className="max-w-[48ch] flex-1 text-[1.08rem] leading-[1.35]">
				<p style={{ textIndent: "-0.1rem" }}>
					Software creation is changing. We are a group of researchers, engineers, and technologists
					inventing at the edge of what&apos;s useful and possible.
				</p>
				<p className="mt-4">
					<span>We have much to learn, try, and build.</span>
				</p>
				<div className="mt-5 flex items-center gap-4">
					<button
						type="button"
						className="cursor-preview-cta pointer-events-auto px-3 py-1.5 transition-opacity hover:opacity-90"
					>
						See projects
					</button>
					<a
						href="https://cursor.com/careers"
						className="cursor-preview-link pointer-events-auto inline-block underline"
						style={{ textUnderlineOffset: "0.125em" }}
					>
						Join our team →
					</a>
				</div>
				<table className="pointer-events-auto mt-8 w-full" style={{ borderCollapse: "collapse" }}>
					<tbody>
						{PUBLICATIONS.map(([year, title]) => (
							<tr key={`${year}-${title}`} className="cursor-preview-table-row">
								<td className="py-2 pr-4 opacity-70">{year}</td>
								<td className="py-2 pr-4">{title}</td>
								<td className="py-2 opacity-70">Published</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function BrowserPane({ file }: { file: DemoFile }) {
	return (
		<div className="bg-theme-product-editor relative h-full w-full" role="tabpanel" id={`tabpanel-${file.id}`}>
			<div className="bg-theme-product-editor absolute inset-0 flex flex-col">
				<div className="bg-theme-card border-theme-border-02 flex h-8 items-center gap-1.5 border-b pr-3 pl-2">
					<div className="flex items-center gap-0.5">
						<button
							type="button"
							className="text-theme-text-sec hover:bg-theme-bg-hover flex h-7 w-7 items-center justify-center rounded"
							disabled
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
								<path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
							</svg>
						</button>
						<button
							type="button"
							className="text-theme-text-sec hover:bg-theme-bg-hover flex h-7 w-7 items-center justify-center rounded"
							disabled
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
								<path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
							</svg>
						</button>
						<button
							type="button"
							className="text-theme-text-sec hover:bg-theme-bg-hover flex h-7 w-7 items-center justify-center rounded"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
								<path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
							</svg>
						</button>
					</div>
					<div className="flex h-7 flex-1 items-center gap-2 border-0 bg-transparent px-2">
						<span className="text-theme-text type-product-base truncate">{file.url ?? "http://localhost:3000"}</span>
					</div>
					<button
						type="button"
						className="text-theme-text-sec hover:bg-theme-bg-hover flex h-7 w-7 items-center justify-center rounded"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							fill="currentColor"
							viewBox="0 0 256 256"
							className="-scale-x-100"
						>
							<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z" />
						</svg>
					</button>
				</div>
				<div className="relative flex-1 overflow-hidden">
					<div className="bg-theme-bg absolute inset-0 overflow-auto">
						<AcmeLabsPreview />
					</div>
				</div>
			</div>
		</div>
	);
}

/** Plan document pane (`feature-prd.md` in the productPlanning scenario). */
function PlanPane({ file }: { file: DemoFile }) {
	const lines = (file.content ?? "").split("\n");
	return (
		<div className="bg-theme-product-editor h-full w-full overflow-auto thin-scrollbar" role="tabpanel">
			<div className="mx-auto w-full max-w-[560px] px-6 py-5">
				{lines.map((line, index) => {
					const key = `plan-${index}`;
					if (line.startsWith("# ")) {
						return (
							<h2 key={key} className="text-theme-text mb-3 text-[16px] font-semibold">
								{line.slice(2)}
							</h2>
						);
					}
					if (line.startsWith("## ")) {
						return (
							<h3 key={key} className="text-theme-text mt-4 mb-1.5 text-[13px] font-semibold">
								{line.slice(3)}
							</h3>
						);
					}
					if (line.startsWith("- [ ] ")) {
						return (
							<div key={key} className="text-theme-text-sec flex items-start gap-2 py-0.5 text-[12.5px]">
								<span className="border-theme-border-02 mt-0.5 inline-block h-3 w-3 flex-shrink-0 rounded-sm border" />
								<span>{line.slice(6)}</span>
							</div>
						);
					}
					if (!line.trim()) return <div key={key} className="h-2" />;
					return (
						<p key={key} className="text-theme-text-sec py-0.5 text-[12.5px] leading-relaxed">
							{line}
						</p>
					);
				})}
			</div>
		</div>
	);
}

function CodePane({ file }: { file: DemoFile }) {
	return (
		<div className="bg-theme-product-editor h-full w-full overflow-auto thin-scrollbar" role="tabpanel">
			<pre className="type-product-base-mono text-theme-text-sec px-4 py-3 text-[12px] leading-[1.5] whitespace-pre">
				{file.content ?? ""}
			</pre>
		</div>
	);
}

export function AgentWorkbench({
	scenario,
	autoCycleScenarioKeys,
	autoCycleIntervalMs,
	autoCycleEnabled = true,
	autoCycleResetKey,
	onScenarioChange,
	showAgentsSidebarHeader = true,
	streamInitialMessages = false,
	defaultMode,
	defaultModel,
	embedded = false,
}: AgentWorkbenchProps) {
	const gt = useGT();
	const resolve = useMessages();
	const rootRef = useRef<HTMLDivElement>(null);
	const prefersReduced = usePrefersReducedMotion();

	const [isInView, setIsInView] = useState(false);
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
	const [chatKey, setChatKey] = useState(0);
	const [activeScenarioKey, setActiveScenarioKey] = useState(scenario ?? "websiteBuilder");
	const activeScenario = demoScenarios[activeScenarioKey] ?? demoScenarios.websiteBuilder;

	const selectScenario = useCallback(
		(key: string) => {
			if (!demoScenarios[key]) return;
			setActiveScenarioKey(key);
			setChatKey((k) => k + 1);
			onScenarioChange?.(key);
		},
		[onScenarioChange],
	);

	/* ---- auto-cycle: one pass through the keys, then settle (chunk `ey`/`ev`) ---- */

	const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const cycleCountRef = useRef(0);
	const resetKeyRef = useRef(autoCycleResetKey);

	useEffect(() => {
		if (autoCycleResetKey !== undefined && autoCycleResetKey !== resetKeyRef.current) {
			resetKeyRef.current = autoCycleResetKey;
			cycleCountRef.current = 0;
			if (cycleTimerRef.current) {
				clearTimeout(cycleTimerRef.current);
				cycleTimerRef.current = null;
			}
			if (autoCycleScenarioKeys?.length) selectScenario(autoCycleScenarioKeys[0]);
		}
	}, [autoCycleResetKey, autoCycleScenarioKeys, selectScenario]);

	useEffect(() => {
		if (!autoCycleScenarioKeys?.length) return;
		if (!autoCycleEnabled) {
			if (cycleTimerRef.current) {
				clearTimeout(cycleTimerRef.current);
				cycleTimerRef.current = null;
			}
			return;
		}
		if (cycleCountRef.current >= autoCycleScenarioKeys.length) return;
		if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
		cycleTimerRef.current = setTimeout(() => {
			cycleCountRef.current += 1;
			const next = autoCycleScenarioKeys[cycleCountRef.current % autoCycleScenarioKeys.length];
			if (next) selectScenario(next);
		}, autoCycleIntervalMs ?? 4500);
		return () => {
			if (cycleTimerRef.current) {
				clearTimeout(cycleTimerRef.current);
				cycleTimerRef.current = null;
			}
		};
	}, [autoCycleEnabled, autoCycleIntervalMs, autoCycleScenarioKeys, selectScenario, activeScenarioKey]);

	/* ---- in-view gating for the initial stream (chunk `Y`/`ee`) ---- */

	useEffect(() => {
		const el = rootRef.current;
		if (!el || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				setIsInView(!!(entry && (entry.isIntersecting || entry.intersectionRatio > 0)));
			},
			{ root: null, threshold: [0.15, 0.35] },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (isInView && !hasStartedPlayback) setHasStartedPlayback(true);
	}, [isInView, hasStartedPlayback]);

	/* ---- sidebar ready state (chunk `eU`/`eQ`) ---- */

	const sidebarScenarioKeys = useMemo(
		() => Object.keys(demoScenarios).filter((key) => demoScenarios[key].showInAgentsSidebar),
		[],
	);
	const initialReadyKeys = useMemo(
		() => (prefersReduced ? sidebarScenarioKeys : DEFAULT_READY_KEYS),
		[prefersReduced, sidebarScenarioKeys],
	);
	const initialReadyMeta = useMemo<Record<string, ReadyMeta>>(() => {
		if (prefersReduced) {
			const meta: Record<string, ReadyMeta> = {};
			sidebarScenarioKeys.forEach((key, index) => {
				const s = demoScenarios[key];
				meta[key] = {
					completedAtOffset: (index + 1) * 36e5,
					lastAssistant:
						resolve(s.messages.filter((m) => m.role === "assistant").pop()?.text || "")?.slice(0, 120) || "Completed",
					diffSummary: s.diffSummary,
				};
			});
			return meta;
		}
		return {
			autoComplete: {
				completedAtOffset: 36e5,
				lastAssistant: gt("Created Cursor IDE demo with file explorer and syntax highlighting"),
				diffSummary: { added: 245, removed: 0 },
			},
			nextjsRouter: {
				completedAtOffset: 72e5,
				lastAssistant: gt("Set up Next.js App Router with dynamic routes and layouts"),
				diffSummary: { added: 189, removed: 15 },
			},
			cursorRules: {
				completedAtOffset: 18e5,
				lastAssistant: demoScenarios.cursorRules.chatTitle,
				diffSummary: demoScenarios.cursorRules.diffSummary,
			},
			biotech: {
				completedAtOffset: 27e5,
				lastAssistant: demoScenarios.biotech.chatTitle,
				diffSummary: demoScenarios.biotech.diffSummary,
			},
			mlPython: {
				completedAtOffset: 6e5,
				lastAssistant: demoScenarios.mlPython.chatTitle,
				diffSummary: demoScenarios.mlPython.diffSummary,
			},
		};
	}, [prefersReduced, sidebarScenarioKeys, gt, resolve]);

	const [readyKeys, setReadyKeys] = useState<string[]>(initialReadyKeys);
	const [readyMeta, setReadyMeta] = useState<Record<string, ReadyMeta>>(initialReadyMeta);
	useEffect(() => {
		setReadyKeys(initialReadyKeys);
		setReadyMeta(initialReadyMeta);
	}, [initialReadyKeys, initialReadyMeta]);

	const markScenarioReady = useCallback(() => {
		const key = Object.keys(demoScenarios).find((k) => demoScenarios[k].id === activeScenario.id);
		if (!key) return;
		setReadyKeys((keys) => (keys.includes(key) ? keys : [...keys, key]));
		const lastAssistant =
			resolve([...activeScenario.messages].reverse().find((m) => m.role === "assistant")?.text || "")?.slice(0, 120) ||
			"";
		setReadyMeta((meta) => ({
			...meta,
			[key]: {
				completedAtOffset: 0,
				lastAssistant,
				// The chunk derives the diff from +/- lines in the scenario file
				// contents; this port carries the diff on the scenario directly.
				diffSummary: activeScenario.diffSummary,
			},
		}));
	}, [activeScenario, resolve]);

	/* ---- files, tabs, and messages (chunk `eS`/`eC`/`eA`/`eE`) ---- */

	const files = activeScenario.files;
	const openFiles = useMemo(
		() =>
			activeScenario.openFileIds
				.map((id) => files.find((f) => f.id === id))
				.filter((f): f is DemoFile => f !== undefined),
		[activeScenario.openFileIds, files],
	);
	const [activeFileId, setActiveFileId] = useState(activeScenario.activeFileId);
	const [extraMessages, setExtraMessages] = useState<DemoMessage[]>([]);
	useEffect(() => {
		setActiveFileId(activeScenario.activeFileId);
		setExtraMessages([]);
	}, [activeScenario]);

	const activeFile = files.find((f) => f.id === activeFileId) ?? openFiles[0];

	// `hideTabsForBrowser`: the websiteBuilder browser preview renders tabless.
	const showTabs = !(activeScenarioKey === "websiteBuilder" && activeFile?.kind === "browser");

	const openFile = (fileId: string) => {
		const file = files.find((f) => f.id === fileId || f.name === fileId);
		if (file) {
			setActiveFileId(file.id);
			return;
		}
		const base = fileId.split("/").pop() || fileId;
		const match = files.find((f) => (f.name ?? f.id).endsWith(`/${base}`) || (f.name ?? f.id) === base);
		if (match) setActiveFileId(match.id);
	};

	const handleSend = (text: string) => {
		markScenarioReady();
		setExtraMessages((current) => [
			...current,
			{ id: `u-${Math.random().toString(36).slice(2)}`, role: "user", text },
			{
				id: `a-${Math.random().toString(36).slice(2)}`,
				role: "assistant",
				text: gt("To try Cursor Agent, [download Cursor]({link}).", { link: "https://cursor.com/download" }),
			},
		]);
	};

	const alreadyReady = readyKeys.includes(activeScenarioKey);
	const streamNow = streamInitialMessages && hasStartedPlayback && !alreadyReady;
	// Until playback starts only the pinned user message is shown (chunk `tO`/`tz`).
	const pinnedOnly = streamInitialMessages && !hasStartedPlayback;
	const baseMessages = activeScenario.messages;
	const visibleMessages = useMemo(() => {
		const combined = [...baseMessages, ...extraMessages];
		if (!pinnedOnly) return combined;
		const pinned = combined.find((m) => m.role === "user");
		return pinned ? [pinned] : [];
	}, [baseMessages, extraMessages, pinnedOnly]);

	return (
		<div
			ref={rootRef}
			className={
				embedded
					? "h-full min-h-0 w-full overflow-hidden relative"
					: "bg-theme-product-chrome text-theme-text border-theme-border-02 h-[70vh] min-h-[480px] w-full overflow-hidden rounded-lg border relative"
			}
		>
			<div className="flex h-full w-full">
				<div className="border-theme-border-02 h-full max-w-[320px] min-w-[220px] border-r" style={{ flexGrow: 2, flexBasis: 0 }}>
					<AgentsSidebar
						currentAgentTitle={activeScenario.chatTitle || gt("New Agent")}
						readyKeys={readyKeys}
						readyMeta={readyMeta}
						showHeader={showAgentsSidebarHeader}
						onSelectScenario={selectScenario}
					/>
				</div>
				<div className="flex h-full w-full flex-row-reverse" style={{ flexGrow: 12.5, flexBasis: 0 }}>
					<div className="border-theme-border-02 min-w-0 overflow-hidden" style={{ flexGrow: 8, flexBasis: 0 }}>
						<div className="flex h-full w-full flex-col">
							{showTabs && openFiles.length > 0 && (
								<div className="bg-theme-card border-theme-border-02 flex h-8 flex-shrink-0 items-end gap-0 overflow-x-auto border-b px-0">
									{openFiles.map((file) => {
										const isActiveTab = file.id === activeFile?.id;
										return (
											<button
												key={file.id}
												type="button"
												onClick={() => setActiveFileId(file.id)}
												className={`type-product-base group/tab flex h-full items-center gap-1.5 border-r px-3 ${
													isActiveTab
														? "bg-theme-product-editor text-theme-text border-theme-border-02"
														: "text-theme-text-sec hover:text-theme-text border-theme-border-02"
												}`}
											>
												<span className="truncate">{file.name ?? file.id}</span>
												<span className="opacity-0 group-hover/tab:opacity-100">
													<CloseIcon />
												</span>
											</button>
										);
									})}
								</div>
							)}
							<div className="min-h-0 flex-1">
								{activeFile ? (
									activeFile.kind === "browser" ? (
										<BrowserPane file={activeFile} />
									) : activeFile.kind === "plan" ? (
										<PlanPane file={activeFile} />
									) : (
										<CodePane file={activeFile} />
									)
								) : (
									<div className="bg-theme-product-editor h-full w-full" />
								)}
							</div>
						</div>
					</div>
					<div className="border-theme-border-02 min-w-[340px] border-r" style={{ flexGrow: 2.5, flexBasis: 0 }}>
						<AgentChat
							key={`chat-${chatKey}-${activeScenarioKey}`}
							messages={visibleMessages}
							onSend={handleSend}
							streamInitialMessages={streamNow}
							title={activeScenario.chatTitle || gt("New Agent")}
							questions={activeScenario.questions}
							onInitialPlaybackDone={markScenarioReady}
							onOpenFile={openFile}
							onCodeMessageVisible={markScenarioReady}
							defaultMode={defaultMode ?? activeScenario.defaultMode}
							defaultModel={defaultModel}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
