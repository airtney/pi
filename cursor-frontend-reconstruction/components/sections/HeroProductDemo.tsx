/**
 * Static reconstruction of cursor.com hero product demo (from SSR HTML in
 * _artifacts/index.html). The live site hydrates interactive React state
 * machines; this reproduces layout, copy, and product chrome visually.
 */
import Image from "next/image";

function WindowChrome({ title }: { title: string }) {
	return (
		<div className="flex h-7 shrink-0 items-center justify-between border-b border-theme-border-02 px-2">
			<div className="flex items-center gap-1.5">
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-border-02" />
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-border-02" />
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-border-02" />
			</div>
			<div className="type-product-base pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center opacity-70">
				{title}
			</div>
			<div className="w-16" />
		</div>
	);
}

function AgentRow({ title, status, active = false }: { title: string; status: string; active?: boolean }) {
	return (
		<div
			className="flex w-full items-start gap-2 px-3 py-2.5 text-left type-product-base"
			style={{ backgroundColor: active ? "var(--color-theme-card-hover-hex)" : undefined }}
		>
			<div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-theme-border-02" />
			<div className="min-w-0 flex-1">
				<div className="truncate">{title}</div>
				<div className="type-product-sm text-theme-text-sec">{status}</div>
			</div>
		</div>
	);
}

export function HeroProductDemo() {
	return (
		<div className="media-border-container relative grid grid-cols-1 grid-rows-1 bg-theme-card-03">
			<div className="relative z-[1] col-span-full row-span-full min-h-[420px] overflow-hidden md:min-h-[520px]">
				<Image
					src="/misc/hero-wallpaper.jpg"
					alt=""
					fill
					priority
					className="hero-wallpaper wallpaper-brightness-dark object-cover"
					sizes="100vw"
				/>
			</div>
			<div className="relative z-20 col-span-full row-span-full">
				<div
					className="relative w-full select-none overflow-hidden rounded-xs border border-theme-border-02"
					style={{ height: "min(780px, 70vh)", minHeight: 720 }}
				>
					{/* Cursor Desktop — centered, from demo-window-cursor-ide */}
					<div
						className="absolute flex flex-col overflow-hidden rounded-[10px] bg-theme-product-chrome shadow-[0_28px_70px_rgba(0,0,0,0.14)]"
						style={{
							left: "50%",
							top: "50%",
							width: "min(1080px, calc(100% - 48px))",
							height: "min(620px, calc(100% - 48px))",
							transform: "translate(-50%, -50%)",
							zIndex: 10,
						}}
					>
						<WindowChrome title="Cursor Desktop" />
						<div className="flex min-h-0 flex-1 overflow-hidden">
							{/* Sidebar */}
							<aside className="hidden w-[220px] shrink-0 border-r border-theme-border-02 bg-theme-card md:block lg:w-[260px]">
								<div className="type-product-sm-medium px-3 py-2 uppercase text-theme-text-sec">
									In Progress <span className="text-theme-text/50">3</span>
								</div>
								<AgentRow title="Build Landing Page" status="Reading docs" active />
								<AgentRow title="Analyze Tab vs Agent Usage Patterns" status="Fetching data" />
								<AgentRow title="Plan Mission Control" status="Generating plan" />
								<div className="type-product-sm-medium mt-4 px-3 py-2 uppercase text-theme-text-sec">
									Ready for Review <span className="text-theme-text/50">3</span>
								</div>
								<AgentRow title="PyTorch MNIST Experiments" status="10m" />
								<AgentRow title="Set up Cursor Rules for Dashboard" status="30m" />
								<AgentRow title="Bioinformatics Tools" status="+135 -21" />
							</aside>
							{/* Chat */}
							<div className="flex min-w-0 flex-1 flex-col bg-theme-product-editor">
								<div className="flex-1 space-y-4 p-4 type-product-base">
									<div className="rounded-lg bg-theme-card px-4 py-3 text-theme-text">
										make a landing page based on attached docs explaining what we do
									</div>
									<div className="rounded-lg border border-theme-border-02 bg-theme-card px-4 py-3 text-theme-text-sec">
										<div className="type-product-sm mb-2 uppercase text-theme-text-tertiary">Plan</div>
										<ol className="list-inside list-decimal space-y-1">
											<li>Read attached product docs</li>
											<li>Scaffold landing page sections</li>
											<li>Wire download CTA and hero demo</li>
										</ol>
									</div>
								</div>
								<div className="border-t border-theme-border-02 px-4 py-3">
									<div className="rounded-lg border border-theme-border-02 bg-theme-card px-3 py-2 text-theme-text-tertiary type-product-base">
										Plan, search, build anything...
									</div>
									<div className="mt-2 flex items-center justify-between type-product-sm text-theme-text-tertiary">
										<span>Agent · Composer 2.5</span>
									</div>
								</div>
							</div>
							{/* Browser preview */}
							<div className="hidden w-[280px] shrink-0 flex-col border-l border-theme-border-02 bg-theme-card lg:flex xl:w-[320px]">
								<div className="border-b border-theme-border-02 px-3 py-2 type-product-sm text-theme-text-tertiary">
									http://localhost:3000
								</div>
								<div className="flex flex-1 flex-col p-4">
									<div className="type-product-base-medium italic">Acme Labs</div>
									<p className="mt-3 type-product-sm leading-relaxed text-theme-text-sec">
										Software creation is changing. We are a group of researchers, engineers, and
										technologists inventing at the edge of what&apos;s useful and possible.
									</p>
									<button type="button" className="btn btn--secondary mt-4 w-fit text-sm">
										See projects
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Cursor CLI overlay */}
					<div
						className="absolute hidden flex-col overflow-hidden rounded-[10px] bg-theme-product-chrome shadow-xl md:flex"
						style={{
							left: "8%",
							top: "58%",
							width: 420,
							height: 280,
							zIndex: 20,
						}}
					>
						<WindowChrome title="Cursor CLI" />
						<div className="flex-1 space-y-2 bg-theme-product-editor p-3 font-mono text-[11px] leading-relaxed text-theme-text-sec">
							<div className="text-theme-text">~/cursor/cursor-web</div>
							<div className="text-theme-accent">Analyze Tab vs Agent Usage Patterns</div>
							<div className="text-theme-text-tertiary">
								Help me understand how teams split their focus between the tab view and the agents
								panel across our workspaces.
							</div>
							<div className="mt-auto border-t border-theme-border-02 pt-2 text-theme-text-tertiary">
								follow-up · / commands · @ files
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
