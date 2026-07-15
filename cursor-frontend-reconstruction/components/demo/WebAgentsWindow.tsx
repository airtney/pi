import { AgentModeIcon, ChevronDown, SendArrowUp } from "@/components/demo/primitives";

/**
 * "Works autonomously, runs in parallel" demo: the cursor.com/agent web app in
 * a Safari-style browser window with an agents sidebar, a finished run, and a
 * screen-recording preview. Ported from _artifacts/index.html.
 */

function CursorIconSpan({ className, style }: { className?: string; style?: React.CSSProperties }) {
	return (
		<span
			className={className}
			style={{
				fontFamily: "CursorIcons16",
				fontSize: 14,
				lineHeight: 1,
				display: "inline-block",
				width: 14,
				height: 14,
				textAlign: "center",
				...style,
			}}
		/>
	);
}

interface SidebarAgent {
	name: string;
	state: "active" | "running" | "queued" | "done";
}

const THIS_WEEK: SidebarAgent[] = [
	{ name: "Acme Research Dashboard", state: "active" },
	{ name: "Live Telemetry Pipeline", state: "running" },
	{ name: "Zero-Downtime Deploys", state: "queued" },
];

const THIS_MONTH: SidebarAgent[] = [
	{ name: "Binary Protocol Parser", state: "done" },
	{ name: "Edge Cache Invalidation", state: "active" },
	{ name: "Auth Token Rotation", state: "queued" },
];

function SidebarAgentRow({ agent }: { agent: SidebarAgent }) {
	const rowClass =
		agent.state === "active"
			? "group/agent mx-1.5 mb-0.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 transition-colors bg-theme-card-hover-hex"
			: "group/agent mx-1.5 mb-0.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-theme-card-hover-hex/60";
	return (
		<div className={rowClass} role="button" tabIndex={0}>
			{agent.state === "active" ? (
				<div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
					<div className="h-[6px] w-[6px] rounded-full bg-theme-text opacity-15 transition-all group-hover/agent:bg-[#3b82f6] group-hover/agent:opacity-100" />
				</div>
			) : agent.state === "running" ? (
				<CursorIconSpan
					className="shrink-0 text-theme-text-sec"
					style={{
						mask: "conic-gradient(from 0deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 30%, black 100%)",
						WebkitMask: "conic-gradient(from 0deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 30%, black 100%)",
					}}
				/>
			) : agent.state === "done" ? (
				<CursorIconSpan className="shrink-0 text-theme-text-ter opacity-20 transition-all group-hover/agent:text-theme-product-ansi-green group-hover/agent:opacity-100" />
			) : (
				<CursorIconSpan className="shrink-0 text-theme-text-ter opacity-20 transition-all group-hover/agent:text-theme-primary group-hover/agent:opacity-100" />
			)}
			<span
				className={
					agent.state === "active"
						? "type-product-base min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-colors text-theme-text"
						: "type-product-base min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-colors text-theme-text-ter group-hover/agent:text-theme-text"
				}
				style={{
					maskImage: "linear-gradient(to right, black 80%, transparent 100%)",
					WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)",
				}}
			>
				{agent.name}
			</span>
		</div>
	);
}

function WebSidebar() {
	return (
		<div className="flex h-full w-[204px] shrink-0 flex-col border-r border-theme-border-02 bg-theme-product-chrome">
			<div className="flex items-center justify-between px-3 py-2.5">
				<svg
					className="h-5 w-5 text-theme-text"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 20 22"
					fill="none"
				>
					<g fill="currentColor">
						<path d="M19.162 5.452 10.698.565a.88.88 0 0 0-.879 0L1.356 5.452a.74.74 0 0 0-.37.64v9.853a.74.74 0 0 0 .37.64l8.464 4.887a.879.879 0 0 0 .879 0l8.464-4.886a.74.74 0 0 0 .37-.64V6.091a.74.74 0 0 0-.37-.64Zm-.531 1.035L10.46 20.639c-.055.095-.201.056-.201-.055v-9.266a.52.52 0 0 0-.26-.45L1.975 6.237c-.096-.056-.057-.202.054-.202h16.34c.233 0 .378.252.262.453Z" />
					</g>
				</svg>
			</div>
			<div className="flex-1 overflow-auto pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<div className="type-product-sm px-3 pb-1 font-medium text-theme-text-ter opacity-50">This Week</div>
				{THIS_WEEK.map((agent) => (
					<SidebarAgentRow key={agent.name} agent={agent} />
				))}
				<div className="type-product-sm px-3 pb-1 pt-3 font-medium text-theme-text-ter opacity-50">This Month</div>
				{THIS_MONTH.map((agent) => (
					<SidebarAgentRow key={agent.name} agent={agent} />
				))}
			</div>
		</div>
	);
}

const SKELETON_ROW_WIDTHS = [50, 38, 46, 42, 54, 48, 44, 52, 40, 50, 36, 48, 42, 56, 44];

/** Miniature Acme Labs page skeleton inside the screen-recording thumbnail. */
function RecordingPreview() {
	return (
		<div className="mt-3 mb-3 pl-2" style={{ width: "60%", maxWidth: "none" }}>
			<div
				className="group/rec relative min-w-0 flex-1 cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-transparent transition-all duration-200 hover:border-theme-border-02"
				role="button"
				tabIndex={0}
			>
				<div className="absolute inset-0 bg-theme-card-02-hex opacity-50 transition-opacity duration-200 group-hover/rec:opacity-100" />
				<div className="relative flex aspect-[16/9]">
					<div className="absolute inset-0 overflow-hidden rounded-[3px]">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/misc/cursor-wallpaper.png"
							alt=""
							className="absolute inset-0 h-full w-full object-cover"
							draggable={false}
						/>
						<div className="absolute inset-0 bg-black/[0.08]" />
						<div
							className="absolute overflow-hidden bg-theme-product-chrome"
							style={{
								top: "8%",
								left: "8%",
								right: "8%",
								bottom: "10%",
								borderRadius: 3,
								boxShadow: "0 8px 30px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(0,0,0,0.15)",
							}}
						>
							<div
								className="flex h-[10px] items-center gap-[2px] px-[4px]"
								style={{ borderBottom: "0.5px solid color-mix(in srgb, var(--color-theme-fg) 8%, transparent)" }}
							>
								{[0, 1, 2].map((i) => (
									<div
										key={i}
										className="h-[3.5px] w-[3.5px] rounded-full"
										style={{ backgroundColor: "var(--color-theme-fg)", opacity: 0.15 }}
									/>
								))}
							</div>
							<div className="flex h-[calc(100%-10px)]">
								<div
									className="flex w-[24%] shrink-0 flex-col p-[4px] pt-[5px]"
									style={{ borderRight: "0.5px solid color-mix(in srgb, var(--color-theme-fg) 8%, transparent)" }}
								>
									<div className="flex flex-col gap-[3px]">
										{[0, 1, 2, 3].map((i) => (
											<div
												key={i}
												className="flex items-center gap-[3px] rounded-[2px] px-[2px] py-[2.5px]"
												style={{
													backgroundColor:
														i === 0
															? "color-mix(in srgb, var(--color-theme-fg) 8%, transparent)"
															: "transparent",
												}}
											>
												<div
													className="h-[5px] w-[5px] shrink-0 rounded-[1.5px]"
													style={{ backgroundColor: "var(--color-theme-fg)", opacity: i === 0 ? 0.35 : 0.14 }}
												/>
												<div
													className="h-[2px] w-[65%] rounded-sm"
													style={{ backgroundColor: "var(--color-theme-fg)", opacity: i === 0 ? 0.25 : 0.1 }}
												/>
											</div>
										))}
									</div>
									<div className="flex-1" />
								</div>
								<div className="relative min-w-0 flex-1 bg-theme-bg">
									<div className="h-full overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--color-theme-fg) 3%, transparent)" }}>
										<div
											className="bg-theme-bg px-[7px] pt-[6px] pb-0"
											style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
										>
											<div className="mb-[5px] flex flex-col gap-[2.5px]">
												<div className="h-[2.5px] w-[96%] rounded-sm" style={{ backgroundColor: "var(--color-theme-fg)", opacity: 0.1 }} />
												<div className="h-[2.5px] w-[80%] rounded-sm" style={{ backgroundColor: "var(--color-theme-fg)", opacity: 0.1 }} />
											</div>
											<div className="mb-[4px] h-[0.5px]" style={{ backgroundColor: "var(--color-theme-fg)", opacity: 0.06 }} />
											<div className="flex flex-col gap-[3.5px]">
												{SKELETON_ROW_WIDTHS.map((width, i) => (
													<div
														key={i}
														className="flex items-center gap-[3px] pb-[3px]"
														style={{
															borderBottom:
																"0.5px solid color-mix(in srgb, var(--color-theme-fg) 6%, transparent)",
														}}
													>
														<div className="h-[2.5px] w-[10px] shrink-0 rounded-sm" style={{ backgroundColor: "var(--color-theme-fg)", opacity: 0.08 }} />
														<div className="h-[2.5px] rounded-sm" style={{ width: `${width}%`, backgroundColor: "var(--color-theme-fg)", opacity: 0.1 }} />
														<div className="flex-1" />
														<div className="h-[2.5px] w-[14px] shrink-0 rounded-sm" style={{ backgroundColor: "var(--color-theme-fg)", opacity: 0.06 }} />
													</div>
												))}
											</div>
											<div
												className="-mx-[7px] mt-[8px] px-[7px] py-[5px]"
												style={{ backgroundColor: "color-mix(in srgb, var(--color-theme-fg) 3%, transparent)" }}
											>
												<div className="mb-[4px] text-[6px] font-medium italic leading-none text-theme-text opacity-40">
													Acme Labs
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="absolute inset-0 z-30 flex items-center justify-center">
						<div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 transition-all duration-150 group-hover/rec:scale-110">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								fill="currentColor"
								viewBox="0 0 256 256"
								className="text-white -ml-px"
							>
								<path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FollowUpComposer() {
	return (
		<div className="bg-theme-product-chrome relative z-[80] p-4 pt-0">
			<div className="border-theme-border-02 bg-theme-product-editor rounded-[var(--radius-lg)] border">
				<div className="text-theme-text-sec type-product-base w-full bg-transparent px-2 pt-2 pb-1.5 text-[13px]">
					Add a follow up...
				</div>
				<div className="px-2 py-2 pt-1">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="relative">
								<button
									type="button"
									className="type-product-sm flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.75 transition-colors bg-theme-card-03-hex text-theme-text-sec hover:text-theme-text"
								>
									<span className="opacity-60">
										<AgentModeIcon />
									</span>
									<span>Agent</span>
									<ChevronDown />
								</button>
							</div>
							<div className="relative">
								<button
									type="button"
									className="text-theme-text-sec type-product-sm flex cursor-pointer items-center gap-0.5 rounded-md bg-transparent py-0.75 transition-colors hover:text-theme-text"
								>
									<span>Opus 4.8</span>
									<ChevronDown />
								</button>
							</div>
						</div>
						<button
							type="button"
							aria-label="Send message"
							className="bg-theme-card-04-hex text-theme-text-sec flex h-5 w-5 items-center justify-center rounded-full"
						>
							<SendArrowUp />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function WebAgentsWindow() {
	return (
		<div
			className="h-full mx-auto"
			style={{
				width: "100%",
				maxWidth: 740,
				boxShadow: "0 22px 70px 4px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.15)",
				borderRadius: 10,
			}}
		>
			<div
				className="flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-theme-product-chrome"
				style={{
					boxShadow:
						"0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15), 0 0 0 0.5px var(--color-theme-border-02)",
				}}
			>
				{/* Safari-style chrome with centered URL pill */}
				<div
					className="relative flex shrink-0 items-center gap-3 border-b border-theme-border-02 px-3"
					style={{
						height: 44,
						fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					}}
				>
					<div className="media-light absolute inset-0 bg-theme-card-02-hex" />
					<div className="media-dark absolute inset-0 bg-theme-product-editor" />
					<div className="relative flex shrink-0 items-center gap-1.5">
						{[0, 1, 2].map((i) => (
							<div key={i} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-theme-fg-20)" }} />
						))}
					</div>
					<div className="relative flex min-w-0 flex-1 justify-center">
						<div
							className="flex min-w-0 items-center justify-between rounded-md border border-theme-border-02 bg-theme-card-02-hex max-w-[320px] flex-1 gap-2.5 px-2.5 py-1"
							style={{ borderColor: "color-mix(in srgb, var(--color-theme-border-02) 60%, transparent)" }}
						>
							<span
								className="shrink-0 text-theme-text-ter opacity-40"
								style={{ fontFamily: "CursorIcons16", fontSize: 12, lineHeight: 1, display: "inline-block", width: 12, height: 12, textAlign: "center" }}
							/>
							<span className="min-w-0 flex-1 truncate text-center text-[11px] text-theme-text-ter opacity-60">
								cursor.com/agent
							</span>
							<span
								className="shrink-0 text-theme-text-ter opacity-40"
								style={{ fontFamily: "CursorIcons16", fontSize: 12, lineHeight: 1, display: "inline-block", width: 12, height: 12, textAlign: "center" }}
							/>
						</div>
					</div>
					<div className="relative w-12 shrink-0" />
				</div>
				<div className="min-h-0 flex-1 overflow-hidden">
					<div className="flex h-full overflow-hidden">
						<WebSidebar />
						<div className="min-w-0 flex-1">
							<div className="flex h-full flex-col bg-theme-product-chrome">
								<div className="flex items-center gap-2 px-4 py-2.5">
									<span className="type-product-base font-medium text-theme-text">Acme Research Dashboard</span>
								</div>
								<div className="relative min-h-0 flex-1">
									<div className="h-full overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
										<div className="sticky top-0 z-10 px-4 pt-0">
											<div className="bg-theme-product-chrome">
												<div className="rounded-[var(--radius-lg)] border border-theme-border-02 bg-theme-card-02-hex px-2 py-2.5">
													<div className="type-product-lg text-theme-text text-[13px]">
														let&apos;s build a dashboard to make our research findings interactive
													</div>
												</div>
											</div>
											<div className="from-theme-product-chrome pointer-events-none h-2 bg-gradient-to-b to-transparent" />
										</div>
										<div className="px-4 pt-2 pb-3">
											<div className="space-y-1.5 pl-2">
												<div className="type-product-base text-theme-text-sec leading-snug text-[12px]">
													<span className="flex-shrink-0">Explored</span>{" "}
													<span className="opacity-60">12 files, 4 searches</span>
												</div>
												<div className="type-product-lg pt-0.5 leading-snug text-theme-text text-[13px]">
													On it. I&apos;ll build the dashboard using your theme config, wire up the research
													data, and add interactive charts with public access controls.
												</div>
												<div className="type-product-base pt-0.5 text-theme-text-sec leading-snug text-[12px]">
													Worked for 14m 22s
												</div>
												<div className="type-product-base text-theme-text-sec leading-snug text-[12px]">
													<span className="flex-shrink-0">Processed</span>{" "}
													<span className="opacity-60">screen recording</span>
												</div>
												<div className="type-product-lg pt-0.5 leading-snug text-theme-text text-[13px]">
													Done! Here&apos;s a walkthrough of the dashboard.
												</div>
											</div>
											<RecordingPreview />
											<div className="type-product-lg mb-1.5 pl-2 font-medium text-theme-text text-[13px]">Summary</div>
											<div className="type-product-lg pl-2 leading-snug text-theme-text text-[13px]">
												Built the interactive dashboard with realtime charts, data from Snowflake, and shadcn
												components. Deployed to staging via Vercel.
											</div>
										</div>
										<div className="from-theme-product-chrome pointer-events-none sticky bottom-0 z-20 h-2 bg-gradient-to-t to-transparent" />
									</div>
								</div>
								<FollowUpComposer />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
