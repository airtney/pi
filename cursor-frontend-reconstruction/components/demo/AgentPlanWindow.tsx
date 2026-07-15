import { CloseIcon, ComposerBox, FloatingWindow } from "@/components/demo/primitives";

/**
 * "Agents turn ideas into code" demo (artifact id demo-window-agent-react-hooks):
 * Cursor IDE with a feature-prd.md plan document and the "Plan Mission Control"
 * chat pane. Ported from _artifacts/index.html.
 */

function EditorTabStrip() {
	return (
		<div
			className="text-theme-text/90 bg-theme-card no-scrollbar flex h-8 items-center gap-0 overflow-x-auto overflow-y-hidden text-sm"
			role="tablist"
		>
			<div
				className="group/tab border-theme-border-02 flex h-full cursor-pointer items-center gap-2 border-r bg-theme-product-editor text-theme-text after:bg-theme-product-editor relative pb-px after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px pr-2 pl-3"
				role="tab"
				aria-selected="true"
				id="tab-feature-prd"
				tabIndex={-1}
			>
				<button
					type="button"
					className="type-product-base flex h-full cursor-pointer items-center gap-1.5 truncate"
					title="feature-prd.md"
					tabIndex={-1}
				>
					feature-prd.md
				</button>
				<button
					type="button"
					className="text-theme-text-sec hover:text-theme-text ml-1 flex h-full cursor-pointer items-center opacity-100"
					tabIndex={-1}
					aria-label="Close feature-prd.md"
					title="Close tab"
				>
					<CloseIcon />
				</button>
			</div>
			<div
				className="group/tab border-theme-border-02 flex h-full cursor-pointer items-center gap-2 border-r bg-theme-product-chrome hover:bg-theme-card-hover-hex/40 border-b pr-2 pl-3"
				role="tab"
				aria-selected="false"
				id="tab-presence"
				tabIndex={-1}
			>
				<button
					type="button"
					className="type-product-base flex h-full cursor-pointer items-center gap-1.5 truncate text-theme-product-text-sec"
					title="src/lib/collaboration/presence.ts"
					tabIndex={-1}
				>
					presence.ts
				</button>
				<button
					type="button"
					className="text-theme-text-sec hover:text-theme-text ml-1 flex h-full cursor-pointer items-center opacity-0 group-hover/tab:opacity-100 focus:opacity-100"
					tabIndex={-1}
					aria-label="Close src/lib/collaboration/presence.ts"
					title="Close tab"
				>
					<CloseIcon />
				</button>
			</div>
			<div className="border-theme-border-02 h-full flex-1 border-b" />
		</div>
	);
}

const PRD_TASKS = [
	"Add multiplayer mode to useAppStore.ts",
	"Create a new MissionControlView.tsx component",
	"Update AppManager.tsx to apply expose modes.",
];

function PrdDocument() {
	return (
		<div className="bg-theme-product-editor relative h-full w-full" role="tabpanel" id="tabpanel-feature-prd">
			<div className="bg-theme-product-editor absolute inset-0 flex flex-col">
				<div className="bg-theme-product-editor relative z-10 flex-shrink-0 transition-[border-color] duration-150 border-b border-transparent">
					<div className="type-product-base flex h-8 items-center justify-between pr-2 pl-3">
						<div className="text-theme-text-sec flex items-center gap-0.5 text-xs">
							<span className="text-theme-text-sec">Plans</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="10"
								height="10"
								fill="currentColor"
								viewBox="0 0 256 256"
								className="text-theme-text-sec"
							>
								<path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
							</svg>
							<span className="text-theme-text">feature-prd.md</span>
						</div>
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								className="text-theme-text-sec hover:bg-theme-bg-hover flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs"
							>
								<span>Composer 2.5</span>
								<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
									<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
								</svg>
							</button>
							<button
								type="button"
								className="rounded px-2 py-0.5 text-xs font-medium text-white hover:brightness-110"
								style={{ backgroundColor: "#C08532" }}
							>
								Build
							</button>
						</div>
					</div>
				</div>
				<div className="flex-1 overflow-auto">
					<div
						className="type-product-base mx-auto max-w-2xl pt-5 pb-6"
						style={{ fontSize: 13, lineHeight: 1.55, paddingLeft: 64, paddingRight: 64 }}
					>
						<h2 className="text-theme-text mt-0 mb-1 text-[20px] font-bold">Mission Control Interface</h2>
						<div className="h-1" />
						<p className="text-theme-text my-0.5">
							A grid view of all open windows as scaled previews, allowing quick selection to bring any
							window to front.
						</p>
						<div className="h-1" />
						<h2 className="text-theme-text mt-2 mb-0.5 text-[14px] font-semibold">Trigger</h2>
						<p className="text-theme-text my-0.5">
							Menu item in MenuBar.tsx (View &gt; Mission Control), hotkey F3, or double-tap desktop.
						</p>
						<div className="h-1" />
						<h2 className="text-theme-text mt-2 mb-0.5 text-[14px] font-semibold">View Behavior</h2>
						<p className="text-theme-text my-0.5">
							Overlay existing windows into a grid of live previews with spring-based layout animations
							and shared element transitions.
						</p>
						<div className="h-1" />
						<div className="mt-4">
							<div className="text-theme-text-sec mb-2 text-[13px]">
								<span>3 Tasks</span>
							</div>
							<div className="border-theme-border-02 mb-3 h-0.5 w-full overflow-hidden rounded-full border-b" />
							<div className="space-y-2">
								{PRD_TASKS.map((task) => (
									<div key={task} className="flex items-center gap-2">
										<div className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-theme-text/20 border" />
										<span className="text-theme-text">{task}</span>
									</div>
								))}
								<div className="flex items-center gap-2 opacity-40">
									<div className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-theme-text/20 border" />
									<span className="text-theme-text-ter">Add a task, ⌘K to generate...</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PlanChatPane() {
	return (
		<div className="bg-theme-product-chrome flex h-full w-full flex-col">
			<div className="text-theme-text type-product-base-medium flex h-8 items-center px-3 pt-2">
				<div className="mx-auto w-full max-w-[580px]">Plan Mission Control</div>
			</div>
			<div className="thin-scrollbar flex-1 overflow-auto overscroll-y-auto px-3 pt-0">
				<div className="mx-auto w-full max-w-[580px]">
					<div className="sticky top-0 z-10">
						<div className="bg-theme-product-chrome">
							<div
								className="bg-theme-product-editor border-theme-border-02 text-theme-text type-product-base ml-auto w-full rounded-lg border px-2 py-1.5 break-words whitespace-pre-wrap"
								style={{ fontSize: 13 }}
							>
								let&apos;s build a mission control interface, similar to the expose-style window manager
								on macOS
							</div>
						</div>
						<div className="from-theme-product-chrome pointer-events-none h-2 bg-gradient-to-b to-transparent" />
					</div>
					<div className="from-theme-product-chrome pointer-events-none sticky bottom-0 z-20 h-2 bg-gradient-to-t to-transparent" />
				</div>
			</div>
			<div className="bg-theme-product-chrome relative z-20 p-3 pt-0">
				<div className="mx-auto w-full max-w-[580px]">
					<ComposerBox mode="plan" model="Composer 2.5" />
				</div>
			</div>
		</div>
	);
}

export function AgentPlanWindow() {
	return (
		<FloatingWindow
			id="demo-window-agent-react-hooks"
			title="Cursor"
			action="Get Cursor"
			style={{
				left: "clamp(calc(var(--demo-pad) + 460px), 50%, calc(100% - var(--demo-pad) - 460px))",
				top: "clamp(calc(var(--demo-pad) + 300px), 50%, calc(100% - var(--demo-pad) - 300px))",
				width: 920,
				height: 600,
				zIndex: 10,
			}}
		>
			<div className="h-full min-h-0 w-full overflow-hidden relative">
				<div className="flex h-full w-full">
					<div className="flex h-full w-full flex-row-reverse" style={{ flexGrow: 12.5, flexBasis: 0 }}>
						<div className="border-theme-border-02 min-w-0 overflow-hidden" style={{ flexGrow: 8, flexBasis: 0 }}>
							<div className="flex h-full w-full flex-col">
								<EditorTabStrip />
								<PrdDocument />
							</div>
						</div>
						<div className="border-theme-border-02 min-w-[340px] border-r" style={{ flexGrow: 2.5, flexBasis: 0 }}>
							<PlanChatPane />
						</div>
					</div>
				</div>
			</div>
		</FloatingWindow>
	);
}