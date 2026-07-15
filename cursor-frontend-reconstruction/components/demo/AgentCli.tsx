"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { usePrefersReducedMotion } from "@/lib/demo/DemoPlayback";
import { getDelayForRole, isToolRole } from "@/lib/demo/playback";
import { useGT, useMessages } from "@/lib/gt-shim";
import type { DemoMessage, DemoScenario } from "@/lib/demo/types";

/**
 * Cursor CLI window body, deobfuscated from Turbopack module `270837`
 * (beautified `0572hgflw542..js`). This is the terminal agent the hero's
 * second window runs against the `startupAnalytics` scenario:
 *
 * - streams the transcript with `getDelayForRole` / `isToolRole` (`152831`);
 * - active tool steps render the alternating hexagon spinner (⬢/⬡ on an 80ms
 *   tick) with a scanning per-character highlight, thinking steps counting up
 *   a fake token total;
 * - code steps render as bordered `file +adds -dels` boxes;
 * - the follow-up input understands `/` commands: `/model` opens the model
 *   picker (arrow keys + enter), `/reset` replays the demo.
 *
 * `useMemoCache` scaffolding stripped to idiomatic hooks.
 */

export const LATEST_1P_MODEL = { id: "composer-2.5", label: "Composer 2.5" };

interface AgentCliProps {
	scenario: DemoScenario;
	streamInitialMessages?: boolean;
	title?: string;
	className?: string;
	embedded?: boolean;
	fontSize?: number;
	disableInteractions?: boolean;
}

interface SlashCommand {
	name: string;
	description: string;
}

interface CliModel {
	key: string;
	label: string;
	effort?: string;
}

export function AgentCli({
	scenario,
	streamInitialMessages = true,
	className,
	embedded = false,
	fontSize = 13,
	disableInteractions = false,
}: AgentCliProps) {
	const resolve = useMessages();
	const gt = useGT();
	const prefersReduced = usePrefersReducedMotion();
	const rootRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const topAnchorRef = useRef<HTMLDivElement>(null);
	const scanOffsetsRef = useRef<Map<string, number>>(new Map());
	const tokenTargetsRef = useRef<Map<string, number>>(new Map());
	const tokenCountsRef = useRef<Map<string, number>>(new Map());

	const pinnedUser = useMemo(() => scenario.messages.find((m) => m.role === "user"), [scenario.messages]);
	const streamable = useMemo(
		() => (pinnedUser ? scenario.messages.filter((m) => m.id !== pinnedUser.id) : scenario.messages),
		[pinnedUser, scenario.messages],
	);

	const [visible, setVisible] = useState<DemoMessage[]>(streamInitialMessages ? [] : streamable);
	const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
	const [isStreaming, setIsStreaming] = useState(false);
	const [input, setInput] = useState("");
	const [replayKey, setReplayKey] = useState(0);

	/* 80ms tick that drives the hex spinner + scanning highlight. */
	const [tick, setTick] = useState(0);
	const hasActiveTools = activeTools.size > 0;
	useEffect(() => {
		if (!hasActiveTools) return;
		const interval = window.setInterval(() => setTick((t) => t + 1), 80);
		return () => window.clearInterval(interval);
	}, [hasActiveTools]);
	const hexGlyph = hasActiveTools ? (Math.floor(tick / 3) % 2 === 0 ? "⬢" : "⬡") : "⬢";

	const commands = useMemo<SlashCommand[]>(
		() => [
			{ name: "model", description: gt("switch models") },
			{ name: "reset", description: gt("replay demo") },
		],
		[gt],
	);
	const models = useMemo<CliModel[]>(
		() => [
			{ key: "auto", label: "Auto" },
			{ key: LATEST_1P_MODEL.id, label: LATEST_1P_MODEL.label },
			{ key: "opus-4.8", label: "Opus 4.8" },
			{ key: "gpt-5.6-sol-high-fast", label: "GPT-5.6 Sol High Fast" },
			{ key: "gemini-3.1-pro", label: "Gemini 3.1 Pro" },
			{ key: "grok-4.5", label: "Grok 4.5" },
		],
		[],
	);
	const [commandIndex, setCommandIndex] = useState(0);
	const [modelPickerOpen, setModelPickerOpen] = useState(false);
	const [modelIndex, setModelIndex] = useState(0);
	const [currentModel, setCurrentModel] = useState(LATEST_1P_MODEL.label);

	/* The transcript is bottom-anchored: content is column-justify-end and the
	   scroll container pins to the top anchor while streaming. */
	const [anchorInView, setAnchorInView] = useState(true);
	useEffect(() => {
		const scroller = scrollRef.current;
		const anchor = topAnchorRef.current;
		if (!scroller || !anchor || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				setAnchorInView(!!(entry && entry.isIntersecting));
			},
			{ root: scroller, threshold: [0, 0.99] },
		);
		observer.observe(anchor);
		return () => observer.disconnect();
	}, []);

	useLayoutEffect(() => {
		if (isStreaming || !anchorInView) return;
		const scroller = scrollRef.current;
		if (!scroller) return;
		const frame = window.requestAnimationFrame(() => {
			scroller.scrollTop = 0;
		});
		return () => window.cancelAnimationFrame(frame);
	}, [visible.length, anchorInView, isStreaming]);

	useLayoutEffect(() => {
		if (!isStreaming) return;
		const scroller = scrollRef.current;
		if (!scroller) return;
		const frame = window.requestAnimationFrame(() => {
			scroller.scrollTop = scroller.scrollHeight;
		});
		return () => window.cancelAnimationFrame(frame);
	}, [visible.length, isStreaming]);

	/* In-view gating: streaming starts once the window scrolls into view. */
	const [hasStarted, setHasStarted] = useState(false);
	const [isInView, setIsInView] = useState(false);
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
		if (isInView && !hasStarted) setHasStarted(true);
	}, [isInView, hasStarted]);

	useEffect(() => {
		if (!streamInitialMessages || prefersReduced) {
			setVisible(streamable);
			setIsStreaming(false);
			return;
		}
		if (!hasStarted) {
			setVisible([]);
			setActiveTools(new Set());
			setIsStreaming(false);
			return;
		}
		let cancelled = false;
		setVisible([]);
		setActiveTools(new Set());
		setIsStreaming(true);
		(async () => {
			for (let index = 0; index < streamable.length && !cancelled; index++) {
				const message = streamable[index];
				setVisible((current) => [...current, message]);
				const tool = isToolRole(message.role);
				const delay = getDelayForRole(message.role);
				if (tool) {
					setActiveTools((current) => new Set(current).add(message.id));
					scanOffsetsRef.current.set(message.id, 0);
					if (message.role === "thinking") {
						tokenTargetsRef.current.set(message.id, 200 + Math.floor(201 * Math.random()));
						tokenCountsRef.current.set(message.id, 1);
					}
				}
				await new Promise((resolveTimer) => setTimeout(resolveTimer, delay));
				if (tool) {
					setActiveTools((current) => {
						const next = new Set(current);
						next.delete(message.id);
						return next;
					});
					scanOffsetsRef.current.delete(message.id);
					tokenTargetsRef.current.delete(message.id);
					tokenCountsRef.current.delete(message.id);
				}
			}
			if (!cancelled) setIsStreaming(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [streamInitialMessages, streamable, hasStarted, replayKey, prefersReduced]);

	/* Advance the scan offset and token counters on each tick. */
	useEffect(() => {
		if (activeTools.size === 0) return;
		activeTools.forEach((id) => {
			scanOffsetsRef.current.set(id, (scanOffsetsRef.current.get(id) ?? 0) + 1);
			const count = tokenCountsRef.current.get(id);
			const target = tokenTargetsRef.current.get(id);
			if (typeof count === "number" && typeof target === "number" && count < target) {
				const remaining = target - count;
				tokenCountsRef.current.set(id, count + (remaining > 50 ? 3 : remaining > 15 ? 2 : 1));
			}
		});
	}, [tick, activeTools]);

	function renderMessage(message: DemoMessage) {
		if (message.role === "code") {
			const parts = message.text.split(" ");
			const fileName = parts[0];
			const rest = parts.slice(1).join(" ");
			const added = rest.match(/\+(\d+)/);
			const removed = rest.match(/-(\d+)/);
			return (
				<div className="border-theme-border-02 bg-theme-bg-muted border px-3 py-2">
					<div className="flex items-center">
						<span className="type-product-base-mono">
							<span className="font-medium">{fileName}</span>
							{added ? <span className="ml-2 text-green-600">+{added[1]}</span> : null}
							{removed ? <span className="ml-1 text-red-600">-{removed[1]}</span> : null}
						</span>
					</div>
				</div>
			);
		}
		if (message.role === "thinking" || message.role === "search" || message.role === "read") {
			const isActive = activeTools.has(message.id);
			const words = (resolve(message.text) ?? "").split(" ");
			let label = words[0] ?? "";
			let rest = words.slice(1).join(" ") ? ` ${words.slice(1).join(" ")}` : "";
			if (isActive) {
				if (message.role === "read") label = gt("Reading");
				else if (message.role === "search") label = gt("Searching");
				else {
					label = gt("Thinking");
					const count = tokenCountsRef.current.get(message.id) ?? 1;
					rest = ` ${count} ${count === 1 ? "token" : "tokens"}`;
				}
			}
			const fullText = label + rest;
			const scanLength = label.length || 1;
			const offset = scanOffsetsRef.current.get(message.id) ?? 0;
			const scanA = isActive ? offset % scanLength : -1;
			const scanB = isActive ? (scanA + 1) % scanLength : -1;
			const labelLength = label.length;
			return (
				<div className="flex items-start gap-2">
					<span className={isActive ? "text-green-500" : "text-theme-text"}>{isActive ? hexGlyph : "⬢"}</span>
					<div className="text-theme-text min-w-0 flex-1">
						<div className="truncate whitespace-nowrap">
							{Array.from(fullText).map((char, index) => {
								const inLabel = index < labelLength;
								const classes = [
									isActive ? (inLabel ? "opacity-80" : "opacity-50") : inLabel ? "opacity-90" : "opacity-60",
									(index === scanA || index === scanB) && isActive ? "opacity-100 text-theme-text" : "",
								]
									.filter(Boolean)
									.join(" ");
								return (
									<span key={`c-${index}`} className={classes}>
										{char}
									</span>
								);
							})}
						</div>
					</div>
				</div>
			);
		}
		if (message.role === "assistant") {
			return (
				<div className="text-theme-text whitespace-pre-wrap">
					{(resolve(message.text) ?? "").split(/(\*\*[^*]+\*\*)/g).map((segment, index) =>
						segment.startsWith("**") && segment.endsWith("**") ? (
							<strong key={`b-${index}`} className="text-theme-text">
								{segment.slice(2, -2)}
							</strong>
						) : (
							<Fragment key={`t-${index}`}>{segment}</Fragment>
						),
					)}
				</div>
			);
		}
		return <div className="text-theme-text">{resolve(message.text)}</div>;
	}

	function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
		if (disableInteractions) return;
		const isSlash = input.startsWith("/");
		const query = input.slice(1).trim().toLowerCase();
		const matches = commands.filter((c) => c.name.toLowerCase().startsWith(query));
		if (modelPickerOpen) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				setModelIndex((modelIndex + (event.key === "ArrowDown" ? 1 : -1) + models.length) % models.length);
				return;
			}
			if (event.key === "Enter") {
				event.preventDefault();
				const model = models[modelIndex];
				if (model) {
					setCurrentModel(model.label.replace(/ \(current\)$/i, ""));
					setInput("");
					setModelPickerOpen(false);
					setCommandIndex(0);
				}
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				setModelPickerOpen(false);
				return;
			}
		}
		if (isSlash) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const total = matches.length || commands.length;
				setCommandIndex((commandIndex + (event.key === "ArrowDown" ? 1 : -1) + total) % total);
				return;
			}
			if (event.key === "Enter") {
				event.preventDefault();
				const modelArg = input.match(/^\/model\s+(.+)$/i);
				if (modelArg) {
					const label = modelArg[1].trim();
					if (label) {
						setCurrentModel(label.replace(/\s*\(current\)\s*$/i, ""));
						setInput("");
						setModelPickerOpen(false);
						setCommandIndex(0);
						return;
					}
				}
				const pool = matches.length ? matches : commands;
				const command = pool[commandIndex] ?? pool[0];
				if (!command) return;
				if (command.name === "model") {
					setModelPickerOpen(true);
					setModelIndex(0);
					setInput("/model ");
					return;
				}
				if (command.name === "reset") {
					setInput("");
					setModelPickerOpen(false);
					setCommandIndex(0);
					setReplayKey((k) => k + 1);
					return;
				}
			}
			if (event.key === "Escape") {
				setInput("");
				setModelPickerOpen(false);
				setCommandIndex(0);
				return;
			}
		}
		if (event.key === "Enter") event.preventDefault();
	}

	const showOverlay = input.startsWith("/") || modelPickerOpen;
	const commandQuery = input.slice(1).trim().toLowerCase();
	const filteredCommands = (() => {
		const matches = commands.filter((c) => c.name.toLowerCase().startsWith(commandQuery));
		return matches.length ? matches : commands;
	})();

	return (
		<div
			ref={rootRef}
			className={
				(embedded
					? "h-full min-h-0 w-full overflow-hidden"
					: "bg-theme-card-hex text-theme-text border-theme-border-02 h-[70vh] min-h-[480px] w-full overflow-hidden border") +
				(className ? ` ${className}` : "")
			}
		>
			<div className="bg-theme-product-editor text-theme-text flex h-full min-h-0 w-full flex-col" style={{ fontSize }}>
				<div
					ref={scrollRef}
					className={`min-h-0 flex-1 px-4 pt-0 pb-2 ${
						disableInteractions ? "overflow-y-hidden" : "thin-scrollbar overflow-y-auto overscroll-auto"
					}`}
					style={{
						scrollbarGutter: disableInteractions ? "auto" : "stable",
						paddingTop: "1em",
						pointerEvents: disableInteractions ? "none" : "auto",
					}}
				>
					<div className="type-product-base-mono flex min-h-full flex-col justify-end">
						<div ref={topAnchorRef} />
						<div className="text-theme-text">Cursor Agent</div>
						<div className="text-theme-text-sec mb-2">~/cursor/cursor-web</div>
						<div className="text-theme-text mb-2">{resolve(scenario.chatTitle)}</div>
						{pinnedUser ? (
							<div className="border-theme-border-02 bg-theme-bg-muted text-theme-text mb-4 border px-3 py-2">
								{resolve(pinnedUser.text)}
							</div>
						) : null}
						<div className="space-y-2">
							{visible.map((message) => (
								<div key={message.id} className="leading-relaxed">
									{renderMessage(message)}
								</div>
							))}
						</div>
						<div className="mt-3">
							<div className="border-theme-text flex items-center gap-2 border px-3 py-2">
								<span className="text-theme-text">→</span>
								<input
									type="text"
									placeholder={gt("Add a follow-up")}
									name="follow-up"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									value={input}
									disabled={disableInteractions}
									onChange={(event) => {
										if (disableInteractions) return;
										setInput(event.target.value);
										if (!event.target.value.startsWith("/")) {
											setModelPickerOpen(false);
											setCommandIndex(0);
										}
									}}
									onKeyDown={handleInputKeyDown}
									className={`flex-1 bg-transparent outline-none text-theme-text ${
										disableInteractions
											? "placeholder:text-theme-text cursor-not-allowed"
											: "placeholder:text-theme-text-sec"
									}`}
								/>
								{isStreaming ? <span className="text-theme-text-sec">ctrl+c to stop</span> : null}
							</div>
						</div>
						{showOverlay ? (
							<div className="w-full">
								<div className="bg-theme-bg-muted text-theme-text min-h-[36px] px-1 pt-3">
									{modelPickerOpen ? (
										<div>
											{models.map((model, index) => (
												<div
													key={model.key}
													className={
														index === modelIndex
															? "text-theme-text flex min-w-0 items-center gap-1 px-2"
															: "text-theme-text-ter flex min-w-0 items-center gap-1 px-2 opacity-40"
													}
												>
													<span
														className={
															index === modelIndex ? "text-theme-text w-4 flex-shrink-0" : "w-4 flex-shrink-0"
														}
													>
														{index === modelIndex ? "→" : ""}
													</span>
													<span
														className={
															index === modelIndex ? "text-theme-text min-w-0 truncate font-bold" : "min-w-0 truncate"
														}
													>
														/model {model.label}
														{model.effort ? ` ${model.effort}` : ""}
													</span>
												</div>
											))}
										</div>
									) : (
										<div>
											{filteredCommands.map((command, index) => (
												<div
													key={command.name}
													className={
														index === commandIndex
															? "text-theme-text flex items-center gap-0 px-2"
															: "text-theme-text-sec flex items-center gap-0 px-2"
													}
												>
													<span className="text-theme-text w-4">{index === commandIndex ? "→" : ""}</span>
													<span className="text-theme-text mr-3">/{command.name}</span>
													<span className="opacity-60"> {command.description}</span>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="text-theme-text-sec mt-3 min-h-[36px]">
								{currentModel}
								<br />/ for commands · @ for files
							</div>
						)}
						<div />
					</div>
				</div>
			</div>
		</div>
	);
}
