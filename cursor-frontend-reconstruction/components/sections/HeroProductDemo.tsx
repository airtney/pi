import { CheckCircleIcon, ComposerBox, FloatingWindow, SunIcon } from "@/components/demo/primitives";

/**
 * Hero product demo, ported from the SSR HTML in _artifacts/index.html
 * (demo-window-cursor-ide + demo-window-cursor-agent-cli over the hero
 * wallpaper). The live site hydrates draggable/resizable interactive windows;
 * this is the same DOM rendered statically.
 */

interface AgentRow {
	title: string;
	status: string;
	icon: "sun" | "check";
	time?: string;
	diff?: { added: number; removed: number };
	active?: boolean;
	dimTitle?: boolean;
}

const IN_PROGRESS: AgentRow[] = [
	{ title: "Build Landing Page", status: "Reading docs", icon: "sun", active: true },
	{ title: "Analyze Tab vs Agent Usage Patterns", status: "Fetching data", icon: "sun", dimTitle: true },
	{ title: "Plan Mission Control", status: "Generating plan", icon: "sun", dimTitle: true },
];

const READY_FOR_REVIEW: AgentRow[] = [
	{ title: "PyTorch MNIST Experiments", status: "PyTorch MNIST Experiments", icon: "check", time: "10m", dimTitle: true },
	{ title: "Set up Cursor Rules for Dashboard", status: "Set up Cursor Rules for Dashboard", icon: "check", time: "30m", dimTitle: true },
	{ title: "Bioinformatics Tools", status: "Bioinformatics Tools", icon: "check", time: "45m", diff: { added: 135, removed: 21 }, dimTitle: true },
];

function SidebarRow({ row }: { row: AgentRow }) {
	return (
		<button
			type="button"
			className="agent-sidebar__row type-product-base flex w-full items-start gap-2 border-0 px-3 py-2.5 text-left transition-colors cursor-pointer"
			style={{
				backgroundColor: row.active ? "var(--color-theme-card-hover-hex)" : undefined,
				paddingLeft: "calc(0.75rem + 2px)",
				outline: "none",
			}}
			aria-disabled="false"
			tabIndex={-1}
		>
			<div
				className="flex h-4 w-4 items-center justify-center"
				style={{ willChange: "transform", transform: "translateZ(0)" }}
			>
				{row.icon === "sun" ? (
					<span
						className="inline-flex items-center justify-center"
						style={{ width: 16, height: 16, lineHeight: 0 }}
					>
						<SunIcon
							className={
								row.active
									? "text-[color:rgba(var(--theme-icon-rgb,242,242,242),0.9)]"
									: "text-theme-text-sec"
							}
						/>
					</span>
				) : (
					<CheckCircleIcon className="text-theme-text-sec" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-px">
				<div className="flex items-start justify-between gap-2">
					<div className={row.dimTitle ? "truncate text-theme-text-sec" : "truncate"}>{row.title}</div>
					{row.time && (
						<div
							className="type-product-sm shrink-0"
							style={{ color: "var(--color-theme-product-text-tertiary)" }}
						>
							{row.time}
						</div>
					)}
				</div>
				<div
					className={
						row.active
							? "type-product-sm flex items-center text-theme-text-sec"
							: "type-product-sm flex items-center"
					}
					style={row.active ? undefined : { color: "var(--color-theme-product-text-tertiary)" }}
				>
					<span className="flex min-w-0 items-center gap-1">
						{row.diff && (
							<>
								<span className="flex items-center gap-0.5 tabular-nums">
									<span className="text-theme-product-ansi-green">+{row.diff.added}</span>
									<span className="text-theme-product-ansi-red">-{row.diff.removed}</span>
								</span>
								<span>·</span>
							</>
						)}
						<span className="min-w-0 flex-1 truncate">{row.status}</span>
					</span>
				</div>
			</div>
		</button>
	);
}

function AgentSidebar() {
	return (
		<aside className="bg-theme-card text-theme-text h-full w-full">
			<div className="pl-0">
				<div className="py-1.25">
					<div className="type-product-sm-medium text-theme-text-sec px-3 py-1 uppercase">
						In Progress <span className="text-theme-text/50">3</span>
					</div>
					<div>
						{IN_PROGRESS.map((row) => (
							<SidebarRow key={row.title} row={row} />
						))}
					</div>
				</div>
				<div className="py-1.25">
					<div className="type-product-sm-medium text-theme-text-sec px-3 py-1 uppercase">
						Ready for Review <span className="text-theme-text/50">3</span>
					</div>
					<div>
						{READY_FOR_REVIEW.map((row) => (
							<SidebarRow key={row.title} row={row} />
						))}
					</div>
				</div>
			</div>
		</aside>
	);
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

function BrowserPreviewPane() {
	return (
		<div className="bg-theme-product-editor relative h-full w-full" role="tabpanel" id="tabpanel-browser-preview">
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
						<span className="text-theme-text type-product-base truncate">http://localhost:3000</span>
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

function ChatPane() {
	return (
		<div className="bg-theme-product-chrome flex h-full w-full flex-col">
			<div className="text-theme-text type-product-base-medium flex h-8 items-center px-3 pt-2">
				<div className="mx-auto w-full max-w-[580px]">Build Landing Page</div>
			</div>
			<div className="thin-scrollbar flex-1 overflow-auto overscroll-y-auto px-3 pt-0">
				<div className="mx-auto w-full max-w-[580px]">
					<div className="sticky top-0 z-10">
						<div className="bg-theme-product-chrome">
							<div
								className="bg-theme-product-editor border-theme-border-02 text-theme-text type-product-base ml-auto w-full rounded-lg border px-2 py-1.5 break-words whitespace-pre-wrap"
								style={{ fontSize: 13 }}
							>
								make a landing page based on attached docs explaining what we do
							</div>
						</div>
						<div className="from-theme-product-chrome pointer-events-none h-2 bg-gradient-to-b to-transparent" />
					</div>
					<div className="from-theme-product-chrome pointer-events-none sticky bottom-0 z-20 h-2 bg-gradient-to-t to-transparent" />
				</div>
			</div>
			<div className="bg-theme-product-chrome relative z-20 p-3 pt-0">
				<div className="mx-auto w-full max-w-[580px]">
					<ComposerBox mode="agent" model="Composer 2.5" />
				</div>
			</div>
		</div>
	);
}

function CursorCliContent() {
	return (
		<div className="h-full min-h-0 w-full overflow-hidden">
			<div className="bg-theme-product-editor text-theme-text flex h-full min-h-0 w-full flex-col" style={{ fontSize: 13 }}>
				<div
					className="min-h-0 flex-1 px-4 pt-0 pb-2 thin-scrollbar overflow-y-auto overscroll-auto"
					style={{ scrollbarGutter: "stable", paddingTop: "1em" }}
				>
					<div className="type-product-base-mono flex min-h-full flex-col justify-end">
						<div />
						<div className="text-theme-text">Cursor Agent</div>
						<div className="text-theme-text-sec mb-2">~/cursor/cursor-web</div>
						<div className="text-theme-text mb-2">Analyze Tab vs Agent Usage Patterns</div>
						<div className="border-theme-border-02 bg-theme-bg-muted text-theme-text mb-4 border px-3 py-2">
							Help me understand how teams split their focus between the tab view and the agents panel
							across our workspaces.
						</div>
						<div className="space-y-2" />
						<div className="mt-3">
							<div className="border-theme-text flex items-center gap-2 border px-3 py-2">
								<span className="text-theme-text">→</span>
								<input
									type="text"
									placeholder="Add a follow-up"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									className="flex-1 bg-transparent outline-none text-theme-text placeholder:text-theme-text-sec"
									name="follow-up"
									readOnly
									value=""
								/>
							</div>
						</div>
						<div className="text-theme-text-sec mt-3 min-h-[36px]">
							Composer 2.5
							<br />/ for commands · @ for files
						</div>
						<div />
					</div>
				</div>
			</div>
		</div>
	);
}

export function HeroProductDemo() {
	return (
		<div className="media-border-container relative grid grid-cols-1 grid-rows-1 bg-[image:var(--color-theme-card-03)]">
			<div className="relative z-1 col-span-full row-span-full overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					alt=""
					decoding="async"
					className="absolute inset-0 object-cover wallpaper-brightness-dark"
					style={{
						position: "absolute",
						height: "100%",
						width: "100%",
						inset: 0,
						color: "transparent",
					}}
					sizes="100vw"
					src="/misc/hero-wallpaper.jpg"
				/>
			</div>
			<div className="z-20 col-span-full row-span-full">
				<div className="relative">
					<div
						className="no-drag-img relative w-full overflow-hidden select-none border-theme-border-02 rounded-xs"
						style={{ height: "min(780px, 70vh)", minHeight: 720, ["--demo-pad" as string]: "32px" }}
					>
						<div className="absolute top-0 right-0 bottom-0 left-0 z-10 h-full w-full">
							<div className="sr-only" aria-live="polite">
								This element contains an interactive demo for sighted users showing multiple Cursor
								interfaces: Cursor Desktop interface, Cursor CLI interface. The interface is displayed
								over a subtle, solid brand background.
							</div>
							<FloatingWindow
								id="demo-window-cursor-ide"
								title="Cursor Desktop"
								action="Get Cursor"
								settings
								style={{
									left: "clamp(calc(var(--demo-pad) + 540px), 50%, calc(100% - var(--demo-pad) - 540px))",
									top: "clamp(calc(var(--demo-pad) + 310px), 50%, calc(100% - var(--demo-pad) - 310px))",
									width: 1080,
									height: 620,
									zIndex: 10,
								}}
							>
								<div className="h-full min-h-0 w-full overflow-hidden relative">
									<div className="flex h-full w-full">
										<div
											className="border-theme-border-02 h-full max-w-[320px] min-w-[220px] border-r"
											style={{ flexGrow: 2, flexBasis: 0 }}
										>
											<AgentSidebar />
										</div>
										<div className="flex h-full w-full flex-row-reverse" style={{ flexGrow: 12.5, flexBasis: 0 }}>
											<div className="border-theme-border-02 min-w-0 overflow-hidden" style={{ flexGrow: 8, flexBasis: 0 }}>
												<div className="flex h-full w-full flex-col">
													<BrowserPreviewPane />
												</div>
											</div>
											<div className="border-theme-border-02 min-w-[340px] border-r" style={{ flexGrow: 2.5, flexBasis: 0 }}>
												<ChatPane />
											</div>
										</div>
									</div>
								</div>
							</FloatingWindow>
							<FloatingWindow
								id="demo-window-cursor-agent-cli"
								title="Cursor CLI"
								action="Get CLI"
								style={{
									left: "clamp(calc(var(--demo-pad) + 280px), 100%, calc(100% - var(--demo-pad) - 240px))",
									top: "clamp(calc(var(--demo-pad) + 180px), 100%, calc(100% - var(--demo-pad) - 180px))",
									width: 480,
									height: 360,
									zIndex: 15,
								}}
							>
								<CursorCliContent />
							</FloatingWindow>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}