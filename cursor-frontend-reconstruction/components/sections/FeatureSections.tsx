import type { ReactNode } from "react";
import { SyntaxHighlightedShellCommand } from "@/components/Button";
import { AgentPlanWindow } from "@/components/demo/AgentPlanWindow";
import { AutomationWindow } from "@/components/demo/AutomationWindow";
import { SlackWindow, AgentCliWindow } from "@/components/demo/SlackCliWindows";
import { WebAgentsWindow } from "@/components/demo/WebAgentsWindow";

/**
 * The four homepage feature sections, ported from the SSR HTML in
 * _artifacts/index.html: a `card--large` with prose in one grid half and a
 * `media-border-container` product demo in the other.
 */

function FeatureCard({
	title,
	description,
	action,
	href,
	textSide,
	flushBottom = false,
	demo,
}: {
	title: string;
	description: string;
	action: ReactNode;
	href?: string;
	textSide: "left" | "right";
	flushBottom?: boolean;
	demo: ReactNode;
}) {
	const textCell =
		textSide === "left"
			? "col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center lg:col-start-1 lg:col-end-9 lg:pl-g0.25 lg:pr-g3"
			: "col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center lg:col-start-17 lg:col-end-25 lg:pr-g0.25 lg:pl-g3";
	const textCellSpacer =
		textSide === "left"
			? "col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center lg:col-start-1 lg:col-end-9 lg:pl-g0.25 lg:pr-g3"
			: "col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center lg:col-start-17 lg:col-end-25 lg:pr-g0.25 lg:pl-g3";
	const demoCellCols = textSide === "left" ? "lg:col-start-9 lg:col-end-25" : "lg:col-start-1 lg:col-end-17";
	const demoCellSpacer = `max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-1 lg:row-end-3 lg:items-center ${demoCellCols}`;
	const demoCell = `max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-2 lg:row-end-3 lg:items-center ${demoCellCols}`;

	const prose = (
		<div className={textSide === "left" ? "w-full max-w-prose lg:justify-self-start" : "w-full max-w-prose lg:justify-self-end"}>
			<div className="type-base">
				<h3 className="type-base md:type-md text-pretty">{title}</h3>
				<div className="type-base md:type-md text-theme-text-sec text-pretty">{description}</div>
			</div>
			{action}
		</div>
	);

	return (
		<section className="section bg-theme-bg text-theme-text section--flush-y">
			<div className={flushBottom ? "container" : "container mb-v4"}>
				<div className="grid grid-rows-[auto_1fr]">
					{href ? (
						<a
							className="card card--large card--feature grid-cursor col-span-full row-span-full gap-y-0 max-lg:grid-rows-subgrid"
							href={href}
						>
							<div className={textCell}>{prose}</div>
							<div className={demoCellSpacer} />
						</a>
					) : (
						<div className="card card--large grid-cursor col-span-full row-span-full gap-y-0 max-lg:grid-rows-subgrid">
							<div className={textCell}>{prose}</div>
							<div className={demoCellSpacer} />
						</div>
					)}
					<div className="grid-cursor p-g1.75 col-span-full row-span-full gap-y-0 max-lg:grid-rows-subgrid">
						<div className={textCellSpacer} />
						<div className={demoCell}>{demo}</div>
					</div>
				</div>
			</div>
		</section>
	);
}

/** Solid-color layered media background (light/dark theme variants). */
function LayeredMediaDemo({
	light,
	dark,
	children,
}: {
	light: string;
	dark: string;
	children: ReactNode;
}) {
	return (
		<div
			className="media-border-container relative grid grid-cols-1 grid-rows-1"
			style={{
				["--layered-media-bg-light" as string]: light,
				["--layered-media-bg-dark" as string]: dark,
			}}
		>
			<div className="media-light absolute inset-0 z-0" style={{ backgroundColor: light }} />
			<div className="media-dark absolute inset-0 z-0" style={{ backgroundColor: dark }} />
			<div className="z-20 col-span-full row-span-full">{children}</div>
		</div>
	);
}

/** Wallpaper-photo media background with floating demo windows. */
function WallpaperDemo({
	wallpaper,
	srText,
	children,
}: {
	wallpaper: string;
	srText: string;
	children: ReactNode;
}) {
	return (
		<div className="media-border-container relative grid grid-cols-1 grid-rows-1 bg-[image:var(--color-theme-card-03)]">
			<div className="relative z-1 col-span-full row-span-full overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					alt=""
					loading="lazy"
					decoding="async"
					className="absolute inset-0 object-cover scale-[1.1] transform wallpaper-brightness-dark"
					style={{ position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent" }}
					sizes="100vw"
					src={wallpaper}
				/>
			</div>
			<div className="z-20 col-span-full row-span-full">
				<div
					className="no-drag-img relative w-full overflow-hidden select-none border-theme-border-02 rounded-xs"
					style={{
						height: "min(780px, 70vh)",
						minHeight: 650,
						["--demo-pad" as string]: "32px",
					}}
				>
					<div className="absolute inset-0 z-0 overflow-hidden">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							alt=""
							loading="lazy"
							decoding="async"
							className="absolute inset-0 object-cover"
							style={{ position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent" }}
							sizes="100vw"
							src={wallpaper}
						/>
					</div>
					<div className="absolute top-0 right-0 bottom-0 left-0 z-10 h-full w-full max-[767px]:pointer-events-none max-[767px]:opacity-0">
						<div className="sr-only" aria-live="polite">
							{srText}
						</div>
						{children}
					</div>
					<div className="pointer-events-none absolute inset-0 z-20" />
				</div>
			</div>
		</div>
	);
}

export function AgentsFeature() {
	return (
		<FeatureCard
			title="Agents turn ideas into code"
			description="Accelerate development by handing off tasks to Cursor, while you focus on making decisions."
			href="/product"
			textSide="left"
			action={
				<div className="mt-v8/12">
					<span className="btn-tertiary">Learn about agentic development →</span>
				</div>
			}
			demo={
				<LayeredMediaDemo light="#D9D5CF" dark="#4A443B">
					<div
						className="no-drag-img relative w-full overflow-hidden select-none border-theme-border-02 rounded-xs bg-transparent"
						style={{ height: 680, minHeight: 680, ["--demo-pad" as string]: "32px" }}
					>
						<div className="absolute top-0 right-0 bottom-0 left-0 z-10 h-full w-full max-[767px]:pointer-events-none max-[767px]:opacity-0">
							<div className="sr-only" aria-live="polite">
								This element contains an interactive demo for sighted users. It&apos;s a demonstration of
								Cursor&apos;s IDE showing AI-powered coding assistance features. The interface is
								displayed over a subtle, solid brand background.
							</div>
							<AgentPlanWindow />
						</div>
						<div className="pointer-events-none absolute inset-0 z-20" />
					</div>
				</LayeredMediaDemo>
			}
		/>
	);
}

export function AutonomousFeature() {
	return (
		<FeatureCard
			title="Works autonomously, runs in parallel"
			description="Agents use their own computers to build, test, and demo features end to end for you to review."
			textSide="right"
			action={
				<div className="mt-v1">
					<div className="flex justify-start gap-x-g1 items-center">
						<a href="/docs/cloud-agent" className="btn-tertiary">
							Learn about cloud agents →
						</a>
					</div>
				</div>
			}
			demo={
				<LayeredMediaDemo light="#B6B9BE" dark="#3C3935">
					<div className="relative w-full overflow-hidden" style={{ height: 680, padding: 48 }}>
						<WebAgentsWindow />
					</div>
				</LayeredMediaDemo>
			}
		/>
	);
}

function InstallCommand() {
	return (
		<div
			className="inline-grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center rounded-sm transition-all duration-200 bg-theme-card-02-hex hover:bg-theme-card-03-hex"
			style={{ width: "100%", maxWidth: "100%", gap: 6, paddingInline: 10, paddingBlock: 9 }}
			tabIndex={0}
			role="button"
			aria-label="Copy command"
		>
			<code
				className="text-theme-text type-product-base-mono min-w-0 overflow-x-auto text-sm whitespace-nowrap"
				style={{
					fontSize: 13,
					scrollbarWidth: "none",
					maskImage: "linear-gradient(to right, black 0%, black 86%, transparent 100%)",
					WebkitMaskImage: "linear-gradient(to right, black 0%, black 86%, transparent 100%)",
				}}
			>
				<SyntaxHighlightedShellCommand command="curl https://cursor.com/install -fsS | bash" />
			</code>
			<div className="btn btn--sm pointer-events-none transition-all duration-150 opacity-100">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</svg>
			</div>
		</div>
	);
}

export function EveryToolFeature() {
	return (
		<FeatureCard
			title="In every tool, at every step"
			description="Cursor runs in your terminal, collaborates in Slack, and reviews PRs in GitHub."
			textSide="left"
			action={
				<div className="mt-v1">
					<div className="flex justify-start gap-x-g1 items-center">
						<InstallCommand />
					</div>
				</div>
			}
			demo={
				<WallpaperDemo
					wallpaper="/misc/everytool-wallpaper.jpg"
					srText="This element contains an interactive demo for sighted users showing multiple Cursor interfaces: the CLI with command-line assistance, Slack integration for team communication. The interface is displayed over a scenic painted landscape wallpaper, giving the demo an artistic backdrop."
				>
					<SlackWindow />
					<AgentCliWindow />
				</WallpaperDemo>
			}
		/>
	);
}

export function AutomateFeature() {
	return (
		<FeatureCard
			title="Automate repetitive work"
			description="Set up always-on agents that run on schedules or triggers to build, maintain, and fix your software."
			textSide="right"
			flushBottom
			action={
				<div className="mt-v1">
					<div className="flex justify-start gap-x-g1 items-center">
						<a className="btn-tertiary" href="/automations">
							Learn about Automations →
						</a>
					</div>
				</div>
			}
			demo={
				<WallpaperDemo
					wallpaper="/misc/automate-wallpaper.jpg"
					srText="This element contains an interactive demo for sighted users. It's a demonstration of Cursor's IDE showing AI-powered coding assistance features. The interface is displayed over a scenic painted landscape wallpaper, giving the demo an artistic backdrop."
				>
					<AutomationWindow />
				</WallpaperDemo>
			}
		/>
	);
}
