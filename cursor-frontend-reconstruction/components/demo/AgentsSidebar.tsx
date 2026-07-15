"use client";

import { useMemo, useRef } from "react";

import { CheckCircleIcon } from "@/components/demo/primitives";
import { MagnifyingGlass, Spinner } from "@/components/demo/HeroIcons";
import { demoScenarios } from "@/lib/demo/scenarios";
import { useGT, useMessages } from "@/lib/gt-shim";
import type { DemoDiffSummary } from "@/lib/demo/types";

/**
 * Agents sidebar, deobfuscated from Turbopack module `961327`
 * (beautified `0qiav2qssorxk.js`). It reads `demoScenarios` (module `565182`)
 * and builds the "In Progress" / "Ready for Review" / "Archived" lists exactly
 * as the homepage does:
 *
 * - only scenarios with `showInAgentsSidebar` appear (de-duped by scenario id);
 * - a scenario is "ready" if its key is in `readyKeys` or the built-in default
 *   ready set (`cursorRules`, `biotech`, `mlPython`);
 * - in-progress scenarios show a spinner and a generating branch label,
 *   ready ones show a check, a relative "when", and their diff + last message.
 */

interface ReadyMeta {
	completedAtOffset?: number;
	lastAssistant?: string;
	diffSummary?: DemoDiffSummary;
}

interface AgentsSidebarProps {
	currentAgentTitle?: string;
	onSelectScenario?: (scenarioKey: string) => void;
	readyKeys?: string[];
	readyMeta?: Record<string, ReadyMeta>;
	interactionsDisabled?: boolean;
	isMobile?: boolean;
	showHeader?: boolean;
}

interface SidebarItem {
	id: string;
	title: string;
	status: "ready" | "in_progress" | "archived";
	when?: string;
	branch?: string;
	diff?: DemoDiffSummary;
	scenarioKey: string;
	completedAtMs?: number;
}

/** Relative timestamp formatter from module `961327`. */
function formatRelative(completedAtMs: number | undefined, now: number): string | undefined {
	if (!completedAtMs) return undefined;
	const elapsed = Math.max(0, now - completedAtMs);
	const minutes = Math.floor(elapsed / 60000);
	const hours = Math.floor(elapsed / 3600000);
	const days = Math.floor(elapsed / 86400000);
	if (elapsed < 45000) return "Just Now";
	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	return `${days}d`;
}

const IN_PROGRESS_BRANCHES: Record<string, string> = {
	websiteBuilder: "Reading docs",
	startupAnalytics: "Fetching data",
	mlPython: "Overviewing scope",
	productPlanning: "Generating plan",
};

const DEFAULT_READY = new Set(["cursorRules", "biotech", "mlPython"]);

export function AgentsSidebar({
	currentAgentTitle = "New Agent",
	onSelectScenario,
	readyKeys,
	readyMeta,
	interactionsDisabled = false,
	isMobile = false,
	showHeader = true,
}: AgentsSidebarProps) {
	const gt = useGT();
	const resolve = useMessages();
	const nowRef = useRef(0);
	if (nowRef.current === 0) nowRef.current = Date.now();

	const items = useMemo<SidebarItem[]>(() => {
		const now = nowRef.current;
		const result: SidebarItem[] = [];
		const seen = new Set<string>();
		Object.entries(demoScenarios).forEach(([key, scenario]) => {
			if (!scenario.showInAgentsSidebar || seen.has(scenario.id)) return;
			seen.add(scenario.id);
			const isReady = (readyKeys?.includes(key) ?? false) || DEFAULT_READY.has(key);
			const meta =
				readyMeta?.[key] ||
				(isReady
					? { completedAtOffset: 0, lastAssistant: scenario.chatTitle, diffSummary: scenario.diffSummary }
					: undefined);
			const completedAtMs = isReady
				? typeof meta?.completedAtOffset === "number"
					? now - meta.completedAtOffset
					: now
				: undefined;
			const when = isReady ? formatRelative(completedAtMs, now) : undefined;
			result.push({
				id: String(key),
				title: scenario.chatTitle,
				status: isReady ? "ready" : "in_progress",
				when: isReady ? (when === "Just Now" ? "now" : when) : undefined,
				branch: isReady ? meta?.lastAssistant : IN_PROGRESS_BRANCHES[key] || gt("Generating"),
				diff: isReady ? meta?.diffSummary : undefined,
				scenarioKey: key,
				completedAtMs,
			});
		});
		return result;
	}, [readyKeys, readyMeta, gt]);

	const inProgress = useMemo(
		() =>
			items
				.filter((item) => item.status === "in_progress")
				.sort((a, b) => (a.id === "websiteBuilder" ? -1 : b.id === "websiteBuilder" ? 1 : 0)),
		[items],
	);
	const ready = useMemo(
		() =>
			items
				.filter((item) => item.status === "ready" && item.id !== "current")
				.sort((a, b) => (b.completedAtMs || 0) - (a.completedAtMs || 0)),
		[items],
	);
	const archived = useMemo(() => items.filter((item) => item.status === "archived"), [items]);

	function Row({ item, isActive, disabled }: { item: SidebarItem; isActive: boolean; disabled: boolean }) {
		const isReady = item.status === "ready";
		const isInProgress = item.status === "in_progress";
		const onClick = !disabled && item.scenarioKey && onSelectScenario ? () => onSelectScenario(item.scenarioKey) : undefined;
		return (
			<button
				type="button"
				className={`agent-sidebar__row type-product-base flex w-full items-start gap-2 border-0 px-3 py-2.5 text-left transition-colors ${
					disabled ? "cursor-default" : "cursor-pointer"
				}`}
				style={{
					backgroundColor: isActive ? "var(--color-theme-card-hover-hex)" : undefined,
					paddingLeft: "calc(0.75rem + 2px)",
					outline: "none",
				}}
				disabled={disabled}
				aria-disabled={disabled}
				tabIndex={-1}
				onMouseEnter={
					disabled
						? undefined
						: (event) => {
								if (!isActive) event.currentTarget.style.backgroundColor = "var(--color-theme-card-hover-hex)";
							}
				}
				onMouseLeave={
					disabled
						? undefined
						: (event) => {
								if (!isActive) event.currentTarget.style.backgroundColor = "";
							}
				}
				onClick={onClick}
			>
				<div
					className="flex h-4 w-4 items-center justify-center"
					style={{ willChange: "transform", transform: "translateZ(0)" }}
				>
					{isInProgress ? (
						<span className="inline-flex items-center justify-center" style={{ width: 16, height: 16, lineHeight: 0 }}>
							<Spinner
								size={16}
								className={
									isActive ? "text-[color:rgba(var(--theme-icon-rgb,242,242,242),0.9)]" : "text-theme-text-sec"
								}
							/>
						</span>
					) : isReady ? (
						<CheckCircleIcon className={isActive ? "" : "text-theme-text-sec"} />
					) : (
						<div
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: isActive ? "var(--color-theme-accent)" : "var(--color-theme-text-sec)" }}
						/>
					)}
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-px">
					<div className="flex items-start justify-between gap-2">
						<div className={`truncate ${!isActive ? (isMobile ? "text-theme-text" : "text-theme-text-sec") : ""}`}>
							{resolve(item.title)}
						</div>
						{item.when ? (
							<div className="type-product-sm shrink-0" style={{ color: "var(--color-theme-product-text-tertiary)" }}>
								{resolve(item.when)}
							</div>
						) : null}
					</div>
					{(item.branch || (item.diff && item.status === "ready")) && (
						<div
							className={`type-product-sm flex items-center ${isActive ? "text-theme-text-sec" : ""}`}
							style={isActive ? undefined : { color: "var(--color-theme-product-text-tertiary)" }}
						>
							<span className="flex min-w-0 items-center gap-1">
								{item.diff && item.status === "ready" ? (
									<span className="flex items-center gap-0.5 tabular-nums">
										<span className="text-theme-product-ansi-green">+{item.diff.added}</span>
										{item.diff.removed > 0 && (
											<span className="text-theme-product-ansi-red">-{item.diff.removed}</span>
										)}
									</span>
								) : null}
								{item.diff && item.status === "ready" && item.branch ? <span>·</span> : null}
								{item.branch ? <span className="min-w-0 flex-1 truncate">{resolve(item.branch)}</span> : null}
							</span>
						</div>
					)}
				</div>
			</button>
		);
	}

	function Section({ title, sectionItems }: { title: string; sectionItems: SidebarItem[] }) {
		if (sectionItems.length === 0) return null;
		return (
			<div className="py-1.25">
				<div className="type-product-sm-medium text-theme-text-sec px-3 py-1 uppercase">
					{resolve(title)} <span className="text-theme-text/50">{sectionItems.length}</span>
				</div>
				<div>
					{sectionItems.map((item) => (
						<Row
							key={item.id}
							item={item}
							isActive={item.title === currentAgentTitle}
							disabled={interactionsDisabled}
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<aside className="bg-theme-card text-theme-text h-full w-full">
			{showHeader && (
				<div className="space-y-2 px-3 py-2.5">
					<div
						className="flex items-center gap-2 rounded-md border px-2.5 py-2"
						style={{
							backgroundColor: "color-mix(in oklab, var(--color-theme-text) 3%, transparent)",
							borderColor: "color-mix(in oklab, var(--color-theme-text) 8%, transparent)",
						}}
					>
						<MagnifyingGlass size={14} className="text-theme-text-ter opacity-50" />
						<span className="type-product-sm text-theme-text-ter flex-1 opacity-50">{gt("Search Agents")}</span>
					</div>
					<button
						type="button"
						className="type-product-sm text-theme-text-ter flex w-full cursor-pointer items-center justify-center rounded-md border px-2.5 py-2 transition-colors"
						style={{ borderColor: "color-mix(in oklab, var(--color-theme-text) 12%, transparent)" }}
					>
						{gt("New Agent")}
					</button>
				</div>
			)}
			<div className="pl-0">
				<Section title={gt("In Progress")} sectionItems={inProgress} />
				<Section title={gt("Ready for Review")} sectionItems={ready} />
				<Section title={gt("Archived")} sectionItems={archived} />
			</div>
		</aside>
	);
}
