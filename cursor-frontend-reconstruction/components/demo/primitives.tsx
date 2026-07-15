import type { CSSProperties, ReactNode } from "react";

/**
 * Shared building blocks for the static product-demo windows, ported from the
 * SSR HTML in _artifacts/index.html (hero + feature section demos). Class
 * names match the artifact markup so the extracted theme CSS applies as-is.
 */

/**
 * Standard floating-window drop shadow used by every demo window.
 * `--window-shadow-inner` resolves to a bottom inset hairline in dark mode
 * (see globals.css) and to a no-op shadow in light mode, per the artifact.
 */
export const WINDOW_SHADOW =
	"0 28px 70px rgba(0, 0, 0, 0.14), 0 14px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--color-theme-border-02), var(--window-shadow-inner)";

export function WindowChrome({
	title,
	action,
	settings = false,
}: {
	title: string;
	action?: string;
	settings?: boolean;
}) {
	return (
		<div className="border-theme-border-02 relative flex h-7 items-center justify-between border-b px-2">
			<div className="flex items-center gap-1.5">
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-border-02" />
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-border-02" />
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-border-02" />
			</div>
			<div className="type-product-base pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center opacity-70">
				{title}
			</div>
			<div className="-mr-1 flex items-center">
				{action && (
					<button
						type="button"
						className="transition-opacity duration-200 type-product-base rounded px-2 py-1 text-theme-text-sec hover:bg-theme-bg-hover cursor-pointer opacity-0 group-hover:opacity-100"
					>
						{action}
					</button>
				)}
				{settings && (
					<button
						type="button"
						aria-label="Open settings"
						className="text-theme-text-sec hover:bg-theme-bg-hover inline-flex h-7 w-7 items-center justify-center rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
							<path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z" />
						</svg>
					</button>
				)}
			</div>
		</div>
	);
}

/** Absolutely-positioned demo window shell (`#demo-window-*` in the artifact). */
export function FloatingWindow({
	id,
	title,
	action,
	settings,
	style,
	children,
}: {
	id: string;
	title: string;
	action?: string;
	settings?: boolean;
	style: CSSProperties;
	children: ReactNode;
}) {
	return (
		<div
			aria-hidden="true"
			id={id}
			className="group absolute rounded-[10px] overflow-hidden flex flex-col bg-theme-product-chrome select-none"
			style={{
				transform: "translate(-50%, -50%) scale(1)",
				transformOrigin: "center center",
				boxShadow: WINDOW_SHADOW,
				minWidth: 420,
				minHeight: 260,
				maxHeight: "calc(100% - 2 * var(--demo-pad))",
				...style,
			}}
		>
			<WindowChrome title={title} action={action} settings={settings} />
			<div className="min-h-0 w-full flex-1 overflow-hidden" data-demo-desktop-content="true">
				<div className="h-full min-h-0 w-full">{children}</div>
			</div>
		</div>
	);
}

/* --- Small inline icons shared across the demos (paths from the artifact) --- */

export function ChevronDown({ className = "h-3 w-3 opacity-60" }: { className?: string }) {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path d="M7.00342 9.62646C6.86377 9.62646 6.74023 9.57275 6.63818 9.4707L2.48096 5.2168C2.38965 5.12012 2.33594 5.00195 2.33594 4.86768C2.33594 4.58838 2.54541 4.37354 2.82471 4.37354C2.96436 4.37354 3.08789 4.42725 3.17383 4.51318L7.00342 8.42334L10.8276 4.51318C10.9189 4.42725 11.0425 4.37354 11.1768 4.37354C11.4561 4.37354 11.6655 4.58838 11.6655 4.86768C11.6655 5.00195 11.6118 5.12012 11.5205 5.21143L7.36328 9.4707C7.27197 9.57275 7.1377 9.62646 7.00342 9.62646Z" />
		</svg>
	);
}

export function SendArrowUp() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
			<path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
		</svg>
	);
}

/** Infinity glyph shown next to "Agent" in composer mode pills. */
export function AgentModeIcon({ className }: { className?: string }) {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24.7969 11.3555"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path d="M0 5.67188C0 9.11719 2.13281 11.3438 5.30859 11.3438C6.98438 11.3438 8.41406 10.6406 9.9375 9.17578L12.2227 6.96094L14.5078 9.17578C16.0312 10.6406 17.4609 11.3438 19.1367 11.3438C22.3125 11.3438 24.4453 9.11719 24.4453 5.67188C24.4453 2.22656 22.3125 0 19.1367 0C17.4609 0 16.0312 0.703125 14.5078 2.16797L12.2227 4.38281L9.9375 2.16797C8.41406 0.703125 6.98438 0 5.30859 0C2.13281 0 0 2.22656 0 5.67188ZM1.91016 5.67188C1.91016 3.36328 3.28125 1.91016 5.30859 1.91016C6.44531 1.91016 7.45312 2.44922 8.60156 3.52734L10.8867 5.67188L8.60156 7.81641C7.45312 8.89453 6.44531 9.43359 5.30859 9.43359C3.28125 9.43359 1.91016 7.98047 1.91016 5.67188ZM13.5586 5.67188L15.8438 3.52734C16.9922 2.44922 18 1.91016 19.1367 1.91016C21.1641 1.91016 22.5352 3.36328 22.5352 5.67188C22.5352 7.98047 21.1641 9.43359 19.1367 9.43359C18 9.43359 16.9922 8.89453 15.8438 7.81641Z" />
		</svg>
	);
}

/** Bullet-list glyph shown next to "Plan" in the plan-mode composer pill. */
export function PlanModeIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 21.1172 18.6211" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
			<path d="M10.875 15.4453L19.9102 15.4453C20.3789 15.4453 20.7656 15.0703 20.7656 14.6016C20.7656 14.1328 20.3789 13.7578 19.9102 13.7578L10.875 13.7578C10.4062 13.7578 10.0312 14.1328 10.0312 14.6016C10.0312 15.0703 10.4062 15.4453 10.875 15.4453Z" />
			<path d="M4.01953 18.6211C6.19922 18.6211 8.01562 16.7812 8.01562 14.6016C8.01562 12.4102 6.19922 10.582 4.01953 10.582C1.81641 10.582 0 12.4102 0 14.6016C0 16.7812 1.82812 18.6211 4.01953 18.6211ZM4.01953 17.0977C2.66016 17.0977 1.52344 15.9492 1.52344 14.6016C1.52344 13.2539 2.67188 12.1055 4.01953 12.1055C5.35547 12.1055 6.49219 13.2539 6.49219 14.6016C6.49219 15.9492 5.35547 17.0977 4.01953 17.0977Z" />
			<path d="M10.875 4.89844L19.9102 4.89844C20.3789 4.89844 20.7656 4.52344 20.7656 4.05469C20.7656 3.58594 20.3789 3.21094 19.9102 3.21094L10.875 3.21094C10.4062 3.21094 10.0312 3.58594 10.0312 4.05469C10.0312 4.52344 10.4062 4.89844 10.875 4.89844Z" />
			<path d="M4.01953 8.0625C6.19922 8.0625 8.01562 6.22266 8.01562 4.04297C8.01562 1.85156 6.19922 0.0351562 4.01953 0.0351562C1.81641 0.0351562 0 1.85156 0 4.04297C0 6.22266 1.82812 8.0625 4.01953 8.0625ZM4.01953 6.53906C2.66016 6.53906 1.52344 5.39062 1.52344 4.04297C1.52344 2.69531 2.67188 1.54688 4.01953 1.54688C5.35547 1.54688 6.49219 2.69531 6.49219 4.04297C6.49219 5.39062 5.35547 6.53906 4.01953 6.53906Z" />
		</svg>
	);
}

/** Sun glyph for in-progress agent rows in the hero sidebar. */
export function SunIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 256 256"
			className={className}
		>
			<path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm37.25,58.75a8,8,0,0,0,5.66-2.35l22.63-22.62a8,8,0,0,0-11.32-11.32L167.6,77.09a8,8,0,0,0,5.65,13.66ZM224,120H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z" />
		</svg>
	);
}

/** Circled checkmark for ready-for-review agent rows in the hero sidebar. */
export function CheckCircleIcon({ className }: { className?: string }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path d="M8 13.9766C4.70117 13.9766 2.02344 11.2988 2.02344 8C2.02344 4.70117 4.70117 2.02344 8 2.02344C11.2988 2.02344 13.9766 4.70117 13.9766 8C13.9766 11.2988 11.2988 13.9766 8 13.9766ZM8 12.9805C10.7539 12.9805 12.9805 10.7539 12.9805 8C12.9805 5.24609 10.7539 3.01953 8 3.01953C5.24609 3.01953 3.01953 5.24609 3.01953 8C3.01953 10.7539 5.24609 12.9805 8 12.9805ZM7.35547 10.7832C7.16211 10.7832 7.00391 10.7012 6.85742 10.5078L5.42773 8.75C5.3457 8.63867 5.29297 8.51562 5.29297 8.38672C5.29297 8.12891 5.49219 7.92383 5.74414 7.92383C5.9082 7.92383 6.03711 7.9707 6.17773 8.1582L7.33203 9.65234L9.76367 5.75C9.875 5.58008 10.0215 5.48633 10.168 5.48633C10.4141 5.48633 10.6484 5.65625 10.6484 5.91992C10.6484 6.04883 10.5723 6.17773 10.5078 6.29492L7.83008 10.5078C7.71289 10.6895 7.54883 10.7832 7.35547 10.7832Z" />
		</svg>
	);
}

/** Tab close (x) icon in the editor tab strip. */
export function CloseIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className="text-theme-text-sec hover:text-theme-text"
		>
			<path d="M2.8802 11.1191C2.69221 10.9365 2.69758 10.6249 2.8802 10.4423L6.3177 6.99946L2.8802 3.56196C2.69758 3.37934 2.69758 3.07319 2.8802 2.8852C3.06281 2.69184 3.37971 2.69721 3.56232 2.8852L6.99982 6.3227L10.4373 2.8852C10.6199 2.69721 10.9315 2.69721 11.1195 2.8852C11.3074 3.06782 11.3021 3.37934 11.1195 3.56196L7.68195 6.99946L11.1195 10.4423C11.3021 10.6249 11.3021 10.9311 11.1195 11.1191C10.9368 11.3071 10.6199 11.3017 10.4373 11.1191L6.99982 7.68159L3.56232 11.1191C3.37971 11.3017 3.06818 11.3017 2.8802 11.1191Z" />
		</svg>
	);
}

/** Composer input box shared by the hero chat, plan chat, and web follow-up. */
export function ComposerBox({
	placeholder = "Plan, search, build anything...",
	mode,
	model,
}: {
	placeholder?: string;
	mode: "agent" | "plan";
	model: string;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-theme-border-02 focus-within:border-theme-primary focus-within:bg-theme-product-editor">
			<div>
				<form className="flex flex-col">
					<textarea
						name="message"
						placeholder={placeholder}
						className="text-theme-text type-product-base max-h-[200px] w-full resize-none bg-transparent px-2 pt-2 pb-1.5 outline-none"
						rows={1}
						spellCheck={false}
						autoCorrect="off"
						style={{ boxSizing: "border-box", fontSize: 13 }}
						readOnly
					/>
					<div className="px-2 py-2 pt-1">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{mode === "agent" ? (
									<button
										type="button"
										className="type-product-sm flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.75 bg-theme-card-03-hex text-theme-text-sec hover:text-theme-text"
									>
										<AgentModeIcon className="opacity-60" />
										<span>Agent</span>
										<ChevronDown />
									</button>
								) : (
									<button
										type="button"
										className="type-product-sm flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.75"
										style={{ backgroundColor: "rgba(192, 133, 50, 0.15)", color: "#C08532" }}
									>
										<PlanModeIcon />
										<span>Plan</span>
										<ChevronDown className="h-3 w-3" />
									</button>
								)}
								<button
									type="button"
									className="text-theme-text-sec hover:text-theme-text type-product-sm flex cursor-pointer items-center gap-0.5 rounded-md bg-transparent py-0.75"
								>
									<span>{model}</span>
									<ChevronDown />
								</button>
							</div>
							<button
								aria-label="Send message"
								type="submit"
								className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150 bg-theme-card-04-hex text-theme-text-sec"
								disabled
							>
								<SendArrowUp />
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
