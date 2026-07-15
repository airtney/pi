"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";

import { DotsThree, ResetGlyph } from "@/components/demo/HeroIcons";

/**
 * Multi-window demo desktop, deobfuscated from Turbopack module `36135`
 * (beautified `0n2qf0eb4x497.js`, "hero demo container"). This is the window
 * manager the homepage hero mounts: absolutely-positioned windows that can be
 * dragged by their title bar, resized from all eight edges/corners, raised on
 * pointer-down, clamped to the padded desktop, and reset via the floating
 * reset button (or by double-clicking a title bar).
 *
 * Ported 1:1 where the hero exercises the behaviour; the React-Compiler
 * `useMemoCache` scaffolding is stripped and the framer-motion entrance
 * animation (`animateEntrance`, unused by the hero) is dropped, so the reset
 * FAB fades with a CSS transition instead of `AnimatePresence`.
 */

export interface DemoWindowConfig {
	id: string;
	title: string;
	/** Center position as percentage of the desktop. */
	x?: number;
	y?: number;
	widthPx?: number;
	heightPx?: number;
	minWidthPx?: number;
	zIndex?: number;
	scale?: number;
	mobileXOffset?: number;
	hideOnMobile?: boolean;
	ctaHref?: string;
	ctaLabel?: ReactNode;
	menuEventName?: string;
	content: ReactNode;
}

interface WindowState {
	id: string;
	title: string;
	xPercent: number;
	yPercent: number;
	originalXPercent: number;
	originalYPercent: number;
	widthPx: number;
	heightPx: number;
	baseWidthPx: number;
	baseHeightPx: number;
	scale: number;
	zIndex: number;
	content: ReactNode;
	menuEventName?: string;
	ctaHref?: string;
	ctaLabel?: ReactNode;
	hideOnMobile: boolean;
	mobileXOffset: number;
	minWidthPx: number;
	isWidthFlexible: boolean;
	isHeightFlexible: boolean;
}

interface HeroDemoDesktopProps {
	className?: string;
	height?: number | string;
	minHeight?: number | string;
	windows: DemoWindowConfig[];
	disableInteractions?: boolean;
	disableResizing?: boolean;
	innerPaddingPx?: number;
	mobileInnerPaddingPx?: number;
	externalLayoutAdjusted?: boolean;
	onReset?: () => void;
	mobileBreakpoint?: number;
	allowMobileInteractions?: boolean;
}

const KNOWN_TITLES = ["Cursor", "cursor-agent", "Agent", "Slack", "GitHub Pull Request"];

/** Screen-reader description of the visible windows (helper `h` in the chunk). */
function ScreenReaderSummary({ windows }: { windows: WindowState[] }) {
	const titles = [...new Set(windows.map((w) => w.title).filter(Boolean))];
	const backdrop = "The interface is displayed over a subtle, solid brand background.";
	if (titles.length === 0) {
		return (
			<div className="sr-only" aria-live="polite">
				Interactive demo with multiple windows showing Cursor&apos;s AI-powered features. {backdrop}
			</div>
		);
	}
	if (titles.length === 1) {
		return (
			<div className="sr-only" aria-live="polite">
				{`This element contains an interactive demo for sighted users. It's a demonstration of ${titles[0]}. ${backdrop}`}
			</div>
		);
	}
	const parts: string[] = [];
	if (titles.includes("Cursor")) parts.push("the IDE with AI-powered coding assistance");
	if (titles.includes("cursor-agent")) parts.push("the CLI with command-line assistance");
	if (titles.includes("Agent")) parts.push("the Agent interface for managing AI agent runs");
	if (titles.includes("Slack")) parts.push("Slack integration for team communication");
	if (titles.includes("GitHub Pull Request")) parts.push("GitHub integration for code review and debugging");
	parts.push(...titles.filter((t) => !KNOWN_TITLES.includes(t)).map((t) => `${t} interface`));
	return (
		<div className="sr-only" aria-live="polite">
			{`This element contains an interactive demo for sighted users showing multiple Cursor interfaces: ${parts.join(", ")}. ${backdrop}`}
		</div>
	);
}

function toWindowStates(windows: DemoWindowConfig[]): WindowState[] {
	return windows.map((w, index) => {
		const hasWidth = Number.isFinite(Number(w.widthPx));
		const hasHeight = Number.isFinite(Number(w.heightPx));
		const minWidth = typeof w.minWidthPx === "number" ? w.minWidthPx : 420;
		const x = typeof w.x === "number" ? w.x : 50;
		const y = typeof w.y === "number" ? w.y : 50;
		return {
			id: w.id,
			title: w.title,
			xPercent: x,
			yPercent: y,
			originalXPercent: x,
			originalYPercent: y,
			widthPx: Math.max(hasWidth ? Number(w.widthPx) : 1024, minWidth),
			heightPx: hasHeight ? Number(w.heightPx) : 560,
			baseWidthPx: Math.max(hasWidth ? Number(w.widthPx) : 1024, minWidth),
			baseHeightPx: hasHeight ? Number(w.heightPx) : 560,
			scale: typeof w.scale === "number" ? w.scale : 1,
			zIndex: typeof w.zIndex === "number" ? w.zIndex : 10 + index,
			content: w.content,
			menuEventName: w.menuEventName,
			ctaHref: w.ctaHref,
			ctaLabel: w.ctaLabel,
			hideOnMobile: !!w.hideOnMobile,
			mobileXOffset: typeof w.mobileXOffset === "number" ? w.mobileXOffset : 0,
			minWidthPx: minWidth,
			isWidthFlexible: !hasWidth,
			isHeightFlexible: !hasHeight,
		};
	});
}

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const RESIZE_HANDLES: Array<{ edge: ResizeEdge; className: string }> = [
	{ edge: "n", className: "absolute inset-x-2 top-0 h-2 cursor-ns-resize" },
	{ edge: "s", className: "absolute inset-x-2 bottom-0 h-2 cursor-ns-resize" },
	{ edge: "e", className: "absolute inset-y-2 right-0 w-1 cursor-ew-resize" },
	{ edge: "w", className: "absolute inset-y-2 left-0 w-1 cursor-ew-resize" },
	{ edge: "nw", className: "absolute top-0 left-0 h-2.5 w-2.5 cursor-nwse-resize" },
	{ edge: "ne", className: "absolute top-0 right-0 h-2.5 w-2.5 cursor-nesw-resize" },
	{ edge: "sw", className: "absolute bottom-0 left-0 h-2.5 w-2.5 cursor-nesw-resize" },
	{ edge: "se", className: "absolute right-0 bottom-0 h-2.5 w-2.5 cursor-nwse-resize" },
];

export function HeroDemoDesktop({
	className,
	height = "min(780px, 70vh)",
	minHeight,
	windows,
	disableInteractions = false,
	disableResizing = false,
	innerPaddingPx = 32,
	mobileInnerPaddingPx,
	externalLayoutAdjusted = false,
	onReset,
	mobileBreakpoint = 768,
	allowMobileInteractions = false,
}: HeroDemoDesktopProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [layoutAdjusted, setLayoutAdjusted] = useState(false);
	const [resetCount, setResetCount] = useState(0);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	const windowIdsKey = windows.map((w) => w.id).join("|");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const initialStates = useMemo(() => toWindowStates(windows), [windowIdsKey]);
	const [states, setStates] = useState<WindowState[]>(initialStates);

	useLayoutEffect(() => {
		setStates(initialStates);
	}, [initialStates]);

	// Refresh content/labels in place when the parent re-renders window configs
	// without changing the id set (auto-cycling scenarios swap `content`).
	useEffect(() => {
		if (!windows.length) return;
		const byId = new Map(windows.map((w) => [w.id, w]));
		setStates((current) =>
			current.map((state) => {
				const next = byId.get(state.id);
				return next
					? {
							...state,
							title: next.title ?? state.title,
							content: next.content,
							menuEventName: next.menuEventName,
							ctaHref: next.ctaHref,
							ctaLabel: next.ctaLabel,
							hideOnMobile: !!next.hideOnMobile,
							mobileXOffset: typeof next.mobileXOffset === "number" ? next.mobileXOffset : state.mobileXOffset,
						}
					: state;
			}),
		);
	}, [windows]);

	const [activeId, setActiveId] = useState<string | null>(null);
	useEffect(() => {
		if (states.length === 0) return;
		const top = states.reduce((a, b) => (b.zIndex > a.zIndex ? b : a), states[0]);
		if (top.id !== activeId) setActiveId(top.id);
	}, [states, activeId]);

	const nextZIndexRef = useRef(100);
	function raiseWindow(id: string) {
		setStates((current) => current.map((w) => (w.id === id ? { ...w, zIndex: nextZIndexRef.current++ } : w)));
		setActiveId(id);
	}

	function resetLayout() {
		setStates(initialStates);
		setLayoutAdjusted(false);
		setResetCount((count) => count + 1);
		try {
			window.dispatchEvent(new CustomEvent("cursor-demo-reset"));
		} catch {
			/* noop */
		}
		onReset?.();
	}

	/* ---- container measuring + responsive clamping (chunk layout effects) ---- */

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const measure = () => {
			const rect = el.getBoundingClientRect();
			setContainerSize({ width: rect.width, height: rect.height });
		};
		measure();
		const observer = new ResizeObserver(() => measure());
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const previousWidthRef = useRef<number | null>(null);
	const [mobileReady, setMobileReady] = useState(false);
	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const pad = Math.max(0, innerPaddingPx);
		const width = rect.width;
		const heightPx = rect.height;
		const availableWidth = Math.max(0, width - 2 * pad);
		const availableHeight = Math.max(0, heightPx - 2 * pad);
		const wasMobile = previousWidthRef.current !== null && previousWidthRef.current < mobileBreakpoint;
		const isMobile = width < mobileBreakpoint;
		const leavingMobile = wasMobile && !isMobile;
		previousWidthRef.current = width;
		if (isMobile && !mobileReady) setMobileReady(true);
		setStates((current) =>
			current.map((w) => {
				let widthNext = w.widthPx;
				let heightNext = w.heightPx;
				if (w.isWidthFlexible) {
					widthNext = Math.max(w.minWidthPx, Math.min(w.baseWidthPx, availableWidth));
				} else {
					widthNext = Math.max(widthNext, w.minWidthPx);
				}
				heightNext = w.isHeightFlexible
					? Math.min(w.baseHeightPx, availableHeight)
					: Math.min(heightNext, availableHeight);
				heightNext = Math.max(260, heightNext);
				let centerX = leavingMobile ? (w.originalXPercent / 100) * width : (w.xPercent / 100) * width;
				let centerY = leavingMobile ? (w.originalYPercent / 100) * heightPx : (w.yPercent / 100) * heightPx;
				const scale = w.scale ?? 1;
				const scaledWidth = widthNext * scale;
				const scaledHeight = heightNext * scale;
				centerX =
					scaledWidth + 2 * pad <= width
						? Math.max(pad + scaledWidth / 2, Math.min(width - pad - scaledWidth / 2, centerX))
						: pad + scaledWidth / 2;
				if (isMobile && w.mobileXOffset !== 0) centerX += w.mobileXOffset;
				centerY = Math.max(pad + scaledHeight / 2, Math.min(heightPx - pad - scaledHeight / 2, centerY));
				return {
					...w,
					widthPx: widthNext,
					heightPx: heightNext,
					xPercent: (centerX / width) * 100,
					yPercent: (centerY / heightPx) * 100,
				};
			}),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [containerSize.width, containerSize.height, innerPaddingPx, layoutAdjusted, mobileReady]);

	/* ---- dragging (chunk `eo` + inline pointer-move handler) ---- */

	const dragRef = useRef<{ id: string; pointerId: number; dxCenter: number; dyCenter: number } | null>(null);

	function startDrag(event: ReactPointerEvent, id: string, windowEl: HTMLElement) {
		const container = containerRef.current;
		if (!container) return;
		if (container.getBoundingClientRect().width < mobileBreakpoint && !allowMobileInteractions) return;
		raiseWindow(id);
		setLayoutAdjusted(true);
		const rect = windowEl.getBoundingClientRect();
		dragRef.current = {
			id,
			pointerId: event.pointerId,
			dxCenter: event.clientX - (rect.left + rect.width / 2),
			dyCenter: event.clientY - (rect.top + rect.height / 2),
		};
		(event.target as Element).setPointerCapture?.(event.pointerId);
	}

	function handleDragMove(event: ReactPointerEvent) {
		const drag = dragRef.current;
		if (!drag || event.pointerId !== drag.pointerId) return;
		const container = containerRef.current;
		const windowEl = document.getElementById(`demo-window-${drag.id}`);
		if (!container || !windowEl) return;
		const bounds = container.getBoundingClientRect();
		const rect = windowEl.getBoundingClientRect();
		const pad = Math.max(0, innerPaddingPx);
		const minX = bounds.left + pad;
		const minY = bounds.top + pad;
		const maxY = bounds.bottom - pad;
		const rawX = event.clientX - drag.dxCenter;
		const rawY = event.clientY - drag.dyCenter;
		let centerX = rawX;
		let centerY = rawY;
		const isMobile = bounds.width < mobileBreakpoint;
		if (isMobile) {
			centerX =
				rect.width + 2 * (minX - bounds.left) <= bounds.width ? bounds.left + bounds.width / 2 : minX + rect.width / 2;
			centerY = Math.max(minY + rect.height / 2, Math.min(maxY - rect.height / 2, rawY));
		} else {
			centerY = Math.max(bounds.top + rect.height / 2, Math.min(bounds.bottom - rect.height / 2, rawY));
		}
		const xPercent = ((centerX - bounds.left) / bounds.width) * 100;
		const yPercent = ((centerY - bounds.top) / bounds.height) * 100;
		const rawXPercent = ((rawX - bounds.left) / bounds.width) * 100;
		const rawYPercent = ((rawY - bounds.top) / bounds.height) * 100;
		setStates((current) =>
			current.map((w) =>
				w.id === drag.id
					? {
							...w,
							xPercent,
							yPercent,
							...(isMobile ? {} : { originalXPercent: rawXPercent, originalYPercent: rawYPercent }),
						}
					: w,
			),
		);
	}

	/* ---- resizing (chunk `ec` + inline pointer-move handler) ---- */

	const resizeRef = useRef<{
		id: string;
		pointerId: number;
		edge: ResizeEdge;
		startWidth: number;
		startHeight: number;
		startClientX: number;
		startClientY: number;
		startTopLeftX: number;
		startTopLeftY: number;
		scaleAtStart: number;
	} | null>(null);

	function startResize(event: ReactPointerEvent, id: string, windowEl: HTMLElement, edge: ResizeEdge) {
		const container = containerRef.current;
		if (!container) return;
		if (container.getBoundingClientRect().width < mobileBreakpoint && !allowMobileInteractions) return;
		raiseWindow(id);
		setLayoutAdjusted(true);
		const bounds = container.getBoundingClientRect();
		const rect = windowEl.getBoundingClientRect();
		const scale = states.find((w) => w.id === id)?.scale ?? 1;
		resizeRef.current = {
			id,
			pointerId: event.pointerId,
			edge,
			startWidth: rect.width,
			startHeight: rect.height,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startTopLeftX: rect.left - bounds.left,
			startTopLeftY: rect.top - bounds.top,
			scaleAtStart: scale,
		};
		(event.target as Element).setPointerCapture?.(event.pointerId);
	}

	function handleResizeMove(event: ReactPointerEvent) {
		const resize = resizeRef.current;
		if (!resize || event.pointerId !== resize.pointerId) return;
		const container = containerRef.current;
		if (!container) return;
		const {
			id,
			edge,
			startWidth,
			startHeight,
			startClientX,
			startClientY,
			startTopLeftX,
			startTopLeftY,
			scaleAtStart,
		} = resize;
		const target = states.find((w) => w.id === id);
		const minWidth = target ? target.minWidthPx : 420;
		const widthFlexible = !!target && target.isWidthFlexible;
		const heightFlexible = !!target && target.isHeightFlexible;
		const scale = scaleAtStart || (target ? (target.scale ?? 1) : 1);
		const bounds = container.getBoundingClientRect();
		const pad = Math.max(0, innerPaddingPx);
		const maxRight = Math.max(pad, bounds.width - pad);
		const maxBottom = Math.max(pad, bounds.height - pad);
		const dx = event.clientX - startClientX;
		const dy = event.clientY - startClientY;
		const isMobile = bounds.width < mobileBreakpoint;
		const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
		const maxWidth = Math.max(0, maxRight - pad);
		const maxHeight = Math.max(0, maxBottom - pad);
		const minScaledWidth = Math.min(minWidth * scale, maxWidth);
		const minScaledHeight = Math.min(260 * scale, maxHeight);
		const west = edge.includes("w");
		const east = edge.includes("e");
		const north = edge.includes("n");
		const south = edge.includes("s");
		let left = startTopLeftX;
		let right = startTopLeftX + startWidth;
		let top = startTopLeftY;
		let bottom = startTopLeftY + startHeight;
		if (west) left = startTopLeftX + dx;
		if (east) right = startTopLeftX + startWidth + dx;
		if (north) top = startTopLeftY + dy;
		if (south) bottom = startTopLeftY + startHeight + dy;
		let width = right - left;
		let heightPx = bottom - top;
		if (west && !east) {
			width = clamp(startWidth - dx, minScaledWidth, maxWidth);
			left = clamp(left, pad, maxRight - width);
			right = left + width;
		} else if (east && !west) {
			width = clamp(startWidth + dx, minScaledWidth, maxWidth);
			right = clamp(right, pad + width, maxRight);
			left = right - width;
		} else {
			width = clamp(width, minScaledWidth, maxWidth);
			const center = clamp((left + right) / 2, pad + width / 2, maxRight - width / 2);
			left = center - width / 2;
			right = center + width / 2;
		}
		if (north && !south) {
			heightPx = clamp(startHeight - dy, minScaledHeight, maxHeight);
			top = clamp(top, pad, maxBottom - heightPx);
			bottom = top + heightPx;
		} else if (south && !north) {
			heightPx = clamp(startHeight + dy, minScaledHeight, maxHeight);
			bottom = clamp(bottom, pad + heightPx, maxBottom);
			top = bottom - heightPx;
		} else {
			heightPx = clamp(heightPx, minScaledHeight, maxHeight);
			const center = clamp((top + bottom) / 2, pad + heightPx / 2, maxBottom - heightPx / 2);
			top = center - heightPx / 2;
			bottom = center + heightPx / 2;
		}
		width = Math.max(0, right - left);
		heightPx = Math.max(0, bottom - top);
		const xPercent = ((left + width / 2) / bounds.width) * 100;
		const yPercent = ((top + heightPx / 2) / bounds.height) * 100;
		const unscaledWidth = width / Math.max(scale, Number.EPSILON);
		const unscaledHeight = heightPx / Math.max(scale, Number.EPSILON);
		setStates((current) =>
			current.map((w) =>
				w.id === id
					? {
							...w,
							widthPx: unscaledWidth,
							heightPx: unscaledHeight,
							baseWidthPx: widthFlexible ? unscaledWidth : w.baseWidthPx,
							baseHeightPx: heightFlexible ? unscaledHeight : w.baseHeightPx,
							xPercent,
							yPercent,
							...(isMobile ? {} : { originalXPercent: xPercent, originalYPercent: yPercent }),
						}
					: w,
			),
		);
	}

	const hiddenOnMobile = !allowMobileInteractions && containerSize.width > 0 && containerSize.width < mobileBreakpoint;

	return (
		<div
			ref={containerRef}
			onPointerMove={
				disableInteractions
					? undefined
					: (event) => {
							if (dragRef.current) handleDragMove(event);
							else if (resizeRef.current && !disableResizing) handleResizeMove(event);
						}
			}
			onPointerUp={
				disableInteractions
					? undefined
					: (event) => {
							if (dragRef.current && event.pointerId === dragRef.current.pointerId) dragRef.current = null;
							if (resizeRef.current && event.pointerId === resizeRef.current.pointerId) resizeRef.current = null;
						}
			}
			className={`no-drag-img relative w-full overflow-hidden select-none border-theme-border-02 rounded-xs ${className ?? ""}`}
			style={{
				height: typeof height === "number" ? `${height}px` : height,
				...(minHeight !== undefined ? { minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight } : {}),
				["--demo-pad" as string]: `${Math.max(0, innerPaddingPx)}px`,
			}}
		>
			{typeof mobileInnerPaddingPx === "number" && mobileInnerPaddingPx !== innerPaddingPx && (
				<style>{`@media (max-width:${mobileBreakpoint - 1}px){.hero-demo-desktop-pad{--demo-pad:${Math.max(0, mobileInnerPaddingPx)}px}}`}</style>
			)}
			<div
				className={`hero-demo-desktop-pad absolute top-0 right-0 bottom-0 left-0 z-10 h-full w-full ${
					!allowMobileInteractions ? "max-[767px]:pointer-events-none max-[767px]:opacity-0" : ""
				}`}
				aria-hidden={(hiddenOnMobile && !mobileReady) || undefined}
			>
				<ScreenReaderSummary windows={states} />
				{states.map((w) => {
					const scale = w.scale ?? 1;
					const isActive = activeId === w.id;
					const isMobile = containerSize.width > 0 && containerSize.width < mobileBreakpoint;
					const halfWidth = (w.widthPx * scale) / 2;
					const halfHeight = (w.heightPx * scale) / 2;
					return (
						<div
							key={w.id}
							aria-hidden="true"
							id={`demo-window-${w.id}`}
							className={`group absolute rounded-[10px] overflow-hidden ${
								w.hideOnMobile ? "hidden lg:flex lg:flex-col" : "flex flex-col"
							} bg-theme-product-chrome select-none`}
							style={{
								left: `clamp(calc(var(--demo-pad) + ${halfWidth + w.mobileXOffset}px), ${w.xPercent}%, calc(100% - var(--demo-pad) - ${halfWidth}px))`,
								top: `clamp(calc(var(--demo-pad) + ${halfHeight}px), ${w.yPercent}%, calc(100% - var(--demo-pad) - ${halfHeight}px))`,
								width: `${w.widthPx}px`,
								maxWidth: w.isWidthFlexible ? "calc(100% - 2 * var(--demo-pad))" : undefined,
								minWidth: `${w.minWidthPx}px`,
								height: `${w.heightPx}px`,
								maxHeight: "calc(100% - 2 * var(--demo-pad))",
								minHeight: "260px",
								transform: `translate(-50%, -50%) scale(${scale})`,
								transformOrigin: "center center",
								zIndex: w.zIndex,
								boxShadow:
									"0 28px 70px rgba(0, 0, 0, 0.14), 0 14px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--color-theme-border-02)",
							}}
							onPointerDown={() => {
								if (!disableInteractions) raiseWindow(w.id);
							}}
						>
							<div
								className={`border-theme-border-02 relative flex h-7 items-center justify-between border-b px-2 ${
									isMobile ? "cursor-default" : ""
								}`}
								onPointerDown={(event) => {
									if (disableInteractions) return;
									const el = document.getElementById(`demo-window-${w.id}`);
									if (el) startDrag(event, w.id, el);
								}}
								onDoubleClick={(event) => {
									if (disableInteractions) return;
									event.stopPropagation();
									resetLayout();
								}}
							>
								<div className="flex items-center gap-1.5">
									{[0, 1, 2].map((dot) => (
										<span
											key={dot}
											className={`inline-block h-2.5 w-2.5 rounded-full ${isActive ? "" : "bg-theme-border-02"}`}
											style={isActive ? { backgroundColor: "var(--color-theme-fg-20)" } : undefined}
										/>
									))}
								</div>
								{w.title && (
									<div className="type-product-base pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center opacity-70">
										{w.title}
									</div>
								)}
								<div className="-mr-1 flex items-center">
									{w.ctaHref && w.ctaLabel && !isMobile ? (
										<button
											type="button"
											className="transition-opacity duration-200 type-product-base rounded px-2 py-1 text-theme-text-sec hover:bg-theme-bg-hover cursor-pointer opacity-0 group-hover:opacity-100"
											disabled={disableInteractions}
											onClick={(event) => {
												event.stopPropagation();
												if (!w.ctaHref) return;
												if (w.ctaHref.startsWith("http")) {
													window.open(w.ctaHref, "_blank", "noopener,noreferrer");
												} else {
													window.location.href = w.ctaHref;
												}
											}}
										>
											{w.ctaLabel}
										</button>
									) : null}
									{w.menuEventName ? (
										<button
											type="button"
											aria-label="Open settings"
											className={`text-theme-text-sec hover:bg-theme-bg-hover inline-flex h-7 w-7 items-center justify-center rounded transition-opacity duration-200 ${
												isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
											} ${disableInteractions ? "pointer-events-none" : ""}`}
											onClick={(event) => {
												event.stopPropagation();
												if (disableInteractions) {
													event.preventDefault();
													return;
												}
												try {
													window.dispatchEvent(new CustomEvent(w.menuEventName!));
												} catch {
													/* noop */
												}
											}}
										>
											<DotsThree size={18} />
										</button>
									) : null}
								</div>
							</div>
							<div
								className={`min-h-0 w-full flex-1 overflow-hidden ${disableInteractions ? "pointer-events-none" : ""}`}
								data-demo-desktop-content
							>
								<div className="h-full min-h-0 w-full" key={`${resetCount}-${w.id}`}>
									{w.content}
								</div>
							</div>
							{!disableInteractions && !disableResizing && (
								<>
									{RESIZE_HANDLES.map(({ edge, className: handleClass }) => (
										<div
											key={edge}
											className={handleClass}
											data-resize-handle
											onPointerDown={(event) => {
												const el = document.getElementById(`demo-window-${w.id}`);
												if (el) startResize(event, w.id, el, edge);
											}}
										/>
									))}
								</>
							)}
						</div>
					);
				})}
			</div>
			<div className="pointer-events-none absolute inset-0 z-20">
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						resetLayout();
					}}
					className={`pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm border-theme-border-01 bg-theme-card-hex text-theme-text-sec hover:bg-theme-bg-hover transition-opacity duration-150 ${
						(layoutAdjusted || externalLayoutAdjusted) && !disableInteractions
							? "opacity-100"
							: "pointer-events-none opacity-0"
					}`}
					aria-label="Reset layout"
					title="Reset"
					style={{ position: "absolute", right: "var(--demo-pad)", bottom: "var(--demo-pad)" }}
				>
					<ResetGlyph className="text-theme-text-sec" />
				</button>
			</div>
		</div>
	);
}
