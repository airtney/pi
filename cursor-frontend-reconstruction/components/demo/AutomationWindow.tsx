import { ChevronDown, FloatingWindow } from "@/components/demo/primitives";

/**
 * "Automate repetitive work" demo (artifact id demo-window-automation-config):
 * the automation editor with trigger, agent instructions (with the
 * /apply-report-format skill highlight), and tools. Ported from
 * _artifacts/index.html.
 */

function IconFontGlyph() {
	return (
		<span
			style={{
				fontFamily: "CursorIcons16",
				fontSize: 14,
				lineHeight: 1,
				display: "inline-block",
				width: 14,
				height: 14,
				textAlign: "center",
			}}
		/>
	);
}

function AddRowButton({ label }: { label: string }) {
	return (
		<button
			type="button"
			className="group/add-row relative flex w-full items-center gap-1.5 px-3 py-2 leading-[1.8] type-product-lg transition-colors cursor-pointer text-left text-theme-text-ter hover:text-theme-text opacity-60 hover:opacity-100"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-1 rounded-md transition-colors group-hover/add-row:bg-theme-card-hover-hex bg-transparent"
			/>
			<div className="relative z-[1] flex min-w-0 flex-1 items-center gap-1.5">
				<IconFontGlyph />
				{label}
			</div>
		</button>
	);
}

export function AutomationWindow() {
	return (
		<FloatingWindow
			id="demo-window-automation-config"
			title="Cursor"
			action="Build an automation"
			style={{
				left: "clamp(calc(var(--demo-pad) + 270px), 50%, calc(100% - var(--demo-pad) - 270px))",
				top: "clamp(calc(var(--demo-pad) + 210px), 50%, calc(100% - var(--demo-pad) - 210px))",
				width: 540,
				height: 420,
				zIndex: 10,
			}}
		>
			<div className="bg-theme-bg h-full w-full overflow-y-auto px-4 pt-4 pb-24">
				<div className="flex w-full flex-col gap-4 [&>*]:shrink-0">
					<div className="w-full">
						<p className="text-theme-text pl-2 text-[18px] leading-tight font-medium">Fix CI failures on main</p>
						<div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pl-2">
							<button
								type="button"
								role="switch"
								aria-checked="false"
								aria-label="Inactive"
								className="flex cursor-pointer items-center gap-2"
							>
								<span className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors bg-theme-border-02">
									<span className="inline-block size-3 rounded-full bg-white shadow-sm transition-transform translate-x-0.5" />
								</span>
								<span className="type-product-base text-theme-text-sec">Inactive</span>
							</button>
							<span aria-hidden="true" className="bg-theme-border-02 h-3.5 w-px shrink-0" />
							<div className="relative">
								<button
									type="button"
									className="type-product-base text-theme-text-sec hover:text-theme-text flex cursor-pointer items-center gap-1 transition-colors"
								>
									<span className="max-w-[140px] truncate">site</span>
									<ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
								</button>
							</div>
							<div className="relative">
								<button
									type="button"
									className="type-product-base text-theme-text-sec hover:text-theme-text flex cursor-pointer items-center gap-1 transition-colors"
								>
									<span className="max-w-[100px] truncate">main</span>
									<ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
								</button>
							</div>
						</div>
					</div>
					<div className="relative w-full bg-transparent">
						<div className="w-full">
							<p className="type-product-base text-theme-text-sec mb-1.5 pl-2">Triggers</p>
							<div className="relative w-full">
								<div className="border-theme-border-02 bg-theme-product-editor w-full overflow-hidden rounded-lg border">
									<AddRowButton label="Add trigger" />
								</div>
							</div>
						</div>
					</div>
					<div>
						<div className="relative w-full">
							<div className="w-full space-y-3 max-sm:space-y-2">
								<div>
									<p className="type-product-base text-theme-text-sec mb-1.5 pl-2">Agent Instructions</p>
									<div className="border-theme-border-02 bg-theme-product-editor relative w-full rounded-lg border">
										<div className="relative overflow-hidden px-3 pt-2.5 pb-6" style={{ height: 78 }}>
											<div
												aria-hidden="true"
												className="type-product-lg pointer-events-none absolute top-2.5 right-3 left-3 leading-normal"
												style={{ minHeight: "1.4em" }}
											>
												Your task is to fix CI failures on main. Avoid racing other agents. Root cause by
												checking logs. Report with{" "}
												<span
													className="rounded whitespace-nowrap"
													style={{
														fontSize: "inherit",
														lineHeight: "inherit",
														padding: "1px 5px 2px",
														backgroundColor: "rgba(201, 162, 39, 0.15)",
														color: "#C9A227",
													}}
												>
													/apply-report-format
												</span>
											</div>
										</div>
										<div className="flex items-center px-3 pb-2">
											<div className="relative">
												<button
													type="button"
													className="text-theme-text-sec type-product-sm hover:text-theme-text flex cursor-pointer items-center gap-0.5 rounded-md py-0.75 transition-colors"
												>
													<span>Composer 2.5</span>
													<ChevronDown />
												</button>
											</div>
										</div>
									</div>
								</div>
								<div>
									<p className="type-product-base text-theme-text-sec mb-1.5 pl-2">Tools</p>
									<div className="border-theme-border-02 bg-theme-product-editor w-full rounded-lg border">
										<div className="relative">
											<AddRowButton label="Add Tool or MCP" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</FloatingWindow>
	);
}
