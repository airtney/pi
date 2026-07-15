"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
	AgentModeIcon,
	ChevronDown,
	PlanModeIcon,
	SendArrowUp,
} from "@/components/demo/primitives";
import { CaretLeft, CaretRight, FileGlyph, Globe, TerminalGlyph } from "@/components/demo/HeroIcons";
import { usePrefersReducedMotion } from "@/lib/demo/DemoPlayback";
import { getDelayForRole, isToolRole } from "@/lib/demo/playback";
import { useGT, useMessages } from "@/lib/gt-shim";
import type { DemoMessage, DemoQuestion } from "@/lib/demo/types";

/**
 * Agent chat, deobfuscated from Turbopack module `919473`
 * (beautified `0a573kobc1opg.js`). This is the streaming transcript that drives
 * the hero's real playback: initial messages are revealed one at a time, tool
 * steps (`thinking` / `search` / `read` / `terminal` / `browser`) linger for a
 * role-specific delay (`152831`) while showing a shimmer, then resolve; once the
 * transcript finishes the composer fades in.
 *
 * The React-Compiler `useMemoCache` scaffolding from the bundle is stripped
 * back to idiomatic hooks, and framer-motion enter animations are replaced with
 * a CSS keyframe (`.demo-msg-enter`, see product-theme.css).
 */

interface AgentChatProps {
	messages: DemoMessage[];
	onSend?: (value: string) => void;
	placeholder?: string;
	streamInitialMessages?: boolean;
	title?: string;
	onOpenFile?: (fileId: string) => void;
	onCodeMessageVisible?: (fileId: string) => void;
	onInitialPlaybackDone?: () => void;
	textSizePx?: number;
	textOnly?: boolean;
	typographyClassName?: string;
	defaultMode?: "plan" | "build" | "agent";
	defaultModel?: string;
	questions?: DemoQuestion[];
}

/* ---- inline markdown rendering (module `919473` helpers `x` / `v`) ---- */

function renderInline(text: string, keyBase: string): ReactNode {
	return text.split(/(`[^`]+`)/g).map((segment, index) => {
		const key = `${keyBase}-${index}`;
		if (segment.startsWith("`") && segment.endsWith("`") && segment.length > 1) {
			return (
				<code
					key={key}
					className="bg-theme-card-04-hex type-product-base-mono text-theme-text rounded-2xs px-0.5"
				>
					{segment.slice(1, -1)}
				</code>
			);
		}
		const bolded = segment.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => {
			if (part.startsWith("**") && part.endsWith("**")) {
				return (
					<span key={`${key}-b-${partIndex}`} className="font-semibold">
						{part.slice(2, -2)}
					</span>
				);
			}
			return part;
		});
		return <Fragment key={key}>{bolded}</Fragment>;
	});
}

function renderMarkdown(text: string): ReactNode[] {
	const lines = text.split("\n");
	return lines
		.map((line, index) => {
			if (!line.trim()) {
				const prevBullet = /^(\s*)(•|\*|-)\s+/.test(lines[index - 1] || "");
				const nextBullet = /^(\s*)(•|\*|-)\s+/.test(lines[index + 1] || "");
				return prevBullet || nextBullet ? null : <br key={`br-${index}`} />;
			}
			const bullet = line.match(/^(\s*)(•|\*|-)\s+(.*)$/);
			if (bullet) {
				const [, indent, , content] = bullet;
				const depth = Math.floor(indent.length / 2);
				const following = lines.slice(index + 1).find((l) => (l || "").trim());
				const isLast = !following || !/^(\s*)(•|\*|-)\s+/.test(following);
				return (
					<div
						key={`line-${index}`}
						className={`flex items-start gap-1 py-1 ${isLast ? "pb-2" : ""}`}
						style={{ paddingLeft: `${16 * depth}px` }}
					>
						<span className="text-theme-text-sec">•</span>
						<div className="flex-1">{renderInline(content, `line-${index}`)}</div>
					</div>
				);
			}
			return (
				<div key={`line-${index}`} className="min-h-[1.5em]">
					{renderInline(line, `line-${index}`)}
				</div>
			);
		})
		.filter(Boolean) as ReactNode[];
}

/* ---- plan questions panel (module `919473` sub-component `h`) ---- */

function PlanQuestions({
	questions,
	onComplete,
	onSkip,
}: {
	questions: DemoQuestion[];
	onComplete: (answers: Record<string, string[]>) => void;
	onSkip: () => void;
}) {
	const resolve = useMessages();
	const [index, setIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string[]>>({});
	const question = questions[index];
	if (!question) return null;

	const numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];
	const selected = answers[question.id] || [];

	const toggle = (questionId: string, optionId: string, allowMultiple?: boolean) => {
		setAnswers((prev) => {
			const current = prev[questionId] || [];
			if (allowMultiple) {
				return current.includes(optionId)
					? { ...prev, [questionId]: current.filter((id) => id !== optionId) }
					: { ...prev, [questionId]: [...current, optionId] };
			}
			return { ...prev, [questionId]: [optionId] };
		});
	};

	const goPrev = () => index > 0 && setIndex(index - 1);
	const goNext = () => index < questions.length - 1 && setIndex(index + 1);
	const advance = () => (index < questions.length - 1 ? setIndex(index + 1) : onComplete(answers));

	const isFirst = index === 0;
	const isLast = index === questions.length - 1;

	return (
		<div className="grid w-full">
			<div className="bg-theme-product-editor border-theme-border-02 rounded-lg border">
				<div className="flex items-center justify-between pt-1.5 pr-1.5 pb-0 pl-1">
					<div className="text-theme-text-sec type-product-sm flex items-center px-1">
						<span>{resolve("Questions")}</span>
					</div>
					<div className="flex items-center gap-0.5">
						<button
							type="button"
							onClick={goPrev}
							disabled={isFirst}
							className="text-theme-text-sec hover:text-theme-text cursor-pointer p-0.5 disabled:cursor-default disabled:opacity-30"
						>
							<CaretLeft size={14} />
						</button>
						<button
							type="button"
							onClick={goNext}
							disabled={isLast}
							className="text-theme-text-sec hover:text-theme-text cursor-pointer p-0.5 disabled:cursor-default disabled:opacity-30"
						>
							<CaretRight size={14} />
						</button>
					</div>
				</div>
				<div className="pt-1 pr-2 pb-2 pl-2">
					<div className="text-theme-text type-product-base mb-2 font-medium">{resolve(question.prompt)}</div>
					<div className="space-y-0.5">
						{question.options.map((option, optionIndex) => {
							const label = numbers[optionIndex] || String(optionIndex + 1);
							const isSelected = selected.includes(option.id);
							return (
								<button
									key={option.id}
									type="button"
									onClick={() => toggle(question.id, option.id, question.allowMultiple)}
									className={`flex w-full cursor-pointer items-center gap-2 rounded py-1 pr-1.5 pl-0 text-left transition-colors ${
										isSelected
											? "text-theme-text"
											: "text-theme-text-sec hover:bg-theme-bg-hover hover:text-theme-text"
									}`}
									style={isSelected ? { backgroundColor: "var(--color-theme-bg-hover)" } : undefined}
								>
									<span
										className={`type-product-sm flex h-[1.125rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded border text-[11px] ${
											isSelected ? "border-transparent text-white" : "border-theme-border-02"
										}`}
										style={isSelected ? { backgroundColor: "#C08532" } : undefined}
									>
										{label}
									</span>
									<span className="type-product-base">{resolve(option.label)}</span>
								</button>
							);
						})}
					</div>
					<div className="mt-1.5 flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={onSkip}
							className="text-theme-text-sec hover:text-theme-text type-product-base flex cursor-pointer items-center rounded px-1.5 py-0.5 text-xs"
						>
							{resolve("Skip")}
						</button>
						<button
							type="button"
							onClick={advance}
							className="type-product-base-medium flex cursor-pointer items-center rounded px-1.5 py-0.5 text-xs text-white hover:brightness-110"
							style={{ backgroundColor: "#C08532" }}
						>
							{isLast ? resolve("Build") : resolve("Continue")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ---- composer (module `651466`, streaming-aware variant) ---- */

function AgentComposer({
	placeholder,
	mode,
	model,
	onSend,
}: {
	placeholder: string;
	mode: "plan" | "agent";
	model: string;
	onSend?: (value: string) => void;
}) {
	const [value, setValue] = useState("");
	const submit = () => {
		const trimmed = value.trim();
		if (!trimmed) return;
		onSend?.(trimmed);
		setValue("");
	};
	return (
		<form
			className="flex flex-col"
			onSubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<textarea
				name="message"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						submit();
					}
				}}
				placeholder={placeholder}
				className="text-theme-text type-product-base max-h-[200px] w-full resize-none bg-transparent px-2 pt-2 pb-1.5 outline-none"
				rows={1}
				spellCheck={false}
				autoCorrect="off"
				style={{ boxSizing: "border-box", fontSize: 13 }}
			/>
			<div className="px-2 py-2 pt-1">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{mode === "agent" ? (
							<span className="type-product-sm bg-theme-card-03-hex text-theme-text-sec flex items-center gap-1 rounded-full px-2 py-0.75">
								<AgentModeIcon className="opacity-60" />
								<span>Agent</span>
								<ChevronDown />
							</span>
						) : (
							<span
								className="type-product-sm flex items-center gap-1 rounded-full px-2 py-0.75"
								style={{ backgroundColor: "rgba(192, 133, 50, 0.15)", color: "#C08532" }}
							>
								<PlanModeIcon />
								<span>Plan</span>
								<ChevronDown className="h-3 w-3" />
							</span>
						)}
						<span className="text-theme-text-sec type-product-sm flex items-center gap-0.5 rounded-md bg-transparent py-0.75">
							<span>{model}</span>
							<ChevronDown />
						</span>
					</div>
					<button
						aria-label="Send message"
						type="submit"
						className="bg-theme-card-04-hex text-theme-text-sec flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150"
					>
						<SendArrowUp />
					</button>
				</div>
			</div>
		</form>
	);
}

/* ---- single message renderer (module `919473` map body) ---- */

function ChatMessage({
	message,
	isNew,
	activeTools,
	typographyClassName,
	textSizePx,
	onOpenFile,
}: {
	message: DemoMessage;
	isNew: boolean;
	activeTools: Set<string>;
	typographyClassName: string;
	textSizePx: number;
	onOpenFile?: (fileId: string) => void;
}) {
	const gt = useGT();
	const resolve = useMessages();
	const role = message.role;

	let body: ReactNode = null;

	if (role === "code") {
		const parts = message.text.split(" ");
		const fileName = parts[0];
		const rest = parts.slice(1).join(" ");
		const added = rest.match(/\+(\d+)/);
		const removed = rest.match(/-(\d+)/);
		body = (
			<div className="flex items-center gap-1.5" title={gt("Open {fileName}", { fileName })}>
				<FileGlyph className="text-theme-text-sec" />
				<span className={`text-theme-text ${typographyClassName}`}>
					<span className="font-medium">{fileName}</span>
					{added && <span className="text-theme-product-ansi-green ml-1.5">+{added[1]}</span>}
					{removed && <span className="text-theme-product-ansi-red ml-0.5">-{removed[1]}</span>}
				</span>
			</div>
		);
	} else if (role === "terminal") {
		const lines = message.text.split("\n");
		const command = lines[0];
		const output = lines.slice(1).join("\n");
		const isError = output.toLowerCase().includes("error") || output.toLowerCase().includes("failed");
		const isSuccess =
			output.toLowerCase().includes("passed") || output.toLowerCase().includes("success") || output.includes("✓");
		body = (
			<div className="space-y-1">
				<div className="flex items-center gap-1.5">
					<TerminalGlyph className="text-theme-text-sec flex-shrink-0" />
					<span className="type-product-base-mono text-theme-text font-medium">{command}</span>
				</div>
				{output && (
					<pre
						className={`type-product-base-mono ml-5 whitespace-pre-wrap text-xs ${
							isError
								? "text-theme-product-ansi-red"
								: isSuccess
									? "text-theme-product-ansi-green"
									: "text-theme-text-sec"
						}`}
					>
						{output}
					</pre>
				)}
			</div>
		);
	} else if (role === "browser") {
		body = (
			<div className="flex items-center gap-1.5">
				<Globe size={14} className="text-theme-text-sec flex-shrink-0" weight="duotone" />
				<span className={`text-theme-text-sec ${typographyClassName} text-xs`}>{message.text}</span>
			</div>
		);
	} else {
		const isTool = role === "thinking" || role === "search" || role === "read";
		const isShimmering = activeTools.has(message.id);
		const parts = message.text.split(" ");
		let label = parts[0];
		const rest = parts.slice(1).join(" ");
		if (isTool && isShimmering) {
			if (role === "thinking") label = gt("Planning");
			else if (role === "search") label = gt("Searching");
			else if (role === "read") label = gt("Reading");
		}
		body = (
			<div
				className={`${typographyClassName} ${
					isTool
						? "text-theme-text-sec flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap"
						: role === "assistant"
							? "text-theme-text"
							: "text-theme-text break-words whitespace-pre-wrap"
				}`}
				style={{ fontSize: isTool ? "12px" : `${textSizePx}px` }}
			>
				{isTool ? (
					isShimmering ? (
						<span
							className="shimmer"
							style={
								{
									"--shimmer-color": "var(--color-theme-text-sec)",
									"--shimmer-intensity": "80%",
								} as React.CSSProperties
							}
						>
							{role === "thinking"
								? gt("Planning next moves")
								: role === "search"
									? gt("Searching {rest}", { rest })
									: gt("Reading {rest}", { rest })}
						</span>
					) : (
						<div className="flex items-baseline gap-1 overflow-hidden">
							<span className="text-theme-text-sec flex-shrink-0">{label}</span>
							{rest && <span className="text-theme-text-sec min-w-0 truncate opacity-60">{rest}</span>}
						</div>
					)
				) : role === "assistant" ? (
					renderMarkdown(resolve(message.text) ?? "")
				) : role === "user" && message.attachments && message.attachments.length > 0 ? (
					<div className="space-y-2">
						<div className="flex flex-wrap gap-1.5">
							{message.attachments.map((attachment) => (
								<div
									key={attachment.name}
									className="bg-theme-product-chrome border-theme-border-02 flex items-center gap-1.5 rounded-md border px-2 py-1"
								>
									<FileGlyph className="text-theme-text-ter" />
									<span className="text-theme-text-sec text-xs">{attachment.name}</span>
								</div>
							))}
						</div>
						<div>{resolve(message.text)}</div>
					</div>
				) : (
					resolve(message.text)
				)}
			</div>
		);
	}

	const containerClass =
		role === "user"
			? "bg-theme-product-editor border-theme-border-02 mb-2 ml-auto w-full border px-2 py-2"
			: role === "code"
				? "bg-theme-product-editor border-theme-border-02 mt-1 mb-1 cursor-pointer rounded border p-2"
				: role === "terminal"
					? "bg-theme-product-editor border-theme-border-02 mt-1 mb-1 rounded border p-2"
					: role === "browser" || role === "thinking" || role === "search" || role === "read"
						? "w-full px-1 py-1"
						: "w-full px-1 py-2";

	return (
		<div className={`w-full ${isNew ? "demo-msg-enter" : ""}`}>
			<div
				className={`rounded-lg ${containerClass}`}
				onClick={() => {
					if (role !== "code") return;
					onOpenFile?.(message.text.split(" ")[0]);
				}}
				onMouseEnter={(event) => {
					if (role === "code") event.currentTarget.style.backgroundColor = "var(--color-theme-card-hover-hex)";
				}}
				onMouseLeave={(event) => {
					if (role === "code") event.currentTarget.style.backgroundColor = "";
				}}
			>
				{body}
			</div>
		</div>
	);
}

export function AgentChat({
	messages,
	onSend,
	placeholder,
	streamInitialMessages = false,
	title = "New Agent",
	onOpenFile,
	onCodeMessageVisible,
	onInitialPlaybackDone,
	textSizePx = 13,
	textOnly = false,
	typographyClassName = "type-product-base",
	defaultMode,
	defaultModel = "Composer 2.5",
	questions,
}: AgentChatProps) {
	const gt = useGT();
	const resolve = useMessages();
	const prefersReduced = usePrefersReducedMotion();
	const resolvedTitle = resolve(title) ?? "";

	const scrollRef = useRef<HTMLDivElement>(null);
	const pinnedUser = useMemo(() => messages.find((message) => message.role === "user"), [messages]);
	const streamable = useMemo(
		() => (pinnedUser ? messages.filter((message) => message.id !== pinnedUser.id) : messages),
		[messages, pinnedUser],
	);
	const streamKey = useMemo(() => streamable.map((message) => `${message.id}:${message.role}`).join("|"), [streamable]);

	const [visible, setVisible] = useState<DemoMessage[]>(streamInitialMessages && !prefersReduced ? [] : streamable);
	const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
	const [composerVisible, setComposerVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [playbackDone, setPlaybackDone] = useState(false);

	const completedToolsRef = useRef<Set<string>>(new Set());
	const streamingRef = useRef(false);
	const doneRef = useRef(!streamInitialMessages);
	const seenRef = useRef<Set<string>>(new Set());
	const previousStreamableRef = useRef<DemoMessage[]>(streamable);
	const codeSeenRef = useRef(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [visible.length]);

	useEffect(() => {
		if (!streamInitialMessages || prefersReduced) {
			seenRef.current = new Set(messages.map((message) => message.id));
		}
	}, [prefersReduced, streamInitialMessages, messages]);

	useEffect(() => {
		if (!streamInitialMessages || prefersReduced) {
			setVisible(streamable);
			doneRef.current = true;
			streamingRef.current = false;
			setPlaybackDone(true);
			if (mounted) {
				const timer = setTimeout(() => setComposerVisible(true), 600);
				previousStreamableRef.current = streamable;
				return () => clearTimeout(timer);
			}
			previousStreamableRef.current = streamable;
			return;
		}

		const previous = previousStreamableRef.current;
		const isSuperset =
			previous.length > 0 &&
			streamable.length >= previous.length &&
			previous.every((message, index) => message.id === streamable[index]?.id);
		if (doneRef.current && isSuperset) {
			setVisible(streamable);
			previousStreamableRef.current = streamable;
			return;
		}

		setVisible([]);
		completedToolsRef.current = new Set();
		setActiveTools(new Set());
		streamingRef.current = true;
		doneRef.current = false;
		setComposerVisible(false);
		setPlaybackDone(false);

		let cancelled = false;
		(async () => {
			for (let index = 0; index < streamable.length && !cancelled; index++) {
				const message = streamable[index];
				setVisible((current) => [...current, message]);
				if (!codeSeenRef.current && message.role === "code") {
					codeSeenRef.current = true;
					onCodeMessageVisible?.(message.text.split(" ")[0]);
				}
				const tool = isToolRole(message.role);
				const delay = getDelayForRole(message.role);
				if (tool) setActiveTools((current) => new Set(current).add(message.id));
				await new Promise((resolveTimer) => setTimeout(resolveTimer, delay));
				if (tool) {
					setActiveTools((current) => {
						const next = new Set(current);
						next.delete(message.id);
						return next;
					});
					completedToolsRef.current.add(message.id);
				}
			}
			if (!cancelled) {
				doneRef.current = true;
				streamingRef.current = false;
				setPlaybackDone(true);
				setTimeout(() => setComposerVisible(true), 800);
				try {
					onInitialPlaybackDone?.();
				} catch {
					/* noop */
				}
			}
		})();

		previousStreamableRef.current = streamable;
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [streamInitialMessages, streamKey, prefersReduced, mounted]);

	useEffect(() => {
		for (const message of visible) seenRef.current.add(message.id);
	}, [visible]);

	const handleSend = (value: string) => {
		streamingRef.current = false;
		doneRef.current = true;
		setVisible(streamable);
		setActiveTools(new Set());
		seenRef.current = new Set(messages.map((message) => message.id));
		onSend?.(value);
	};

	if (textOnly) {
		return (
			<div className="w-full">
				{visible.map((message) => (
					<div key={message.id} className="w-full">
						{message.role === "assistant" ? (
							<div className={`text-theme-text ${typographyClassName}`} style={{ fontSize: `${textSizePx}px` }}>
								{renderMarkdown(resolve(message.text) ?? "")}
							</div>
						) : (
							<div
								className={`text-theme-text ${typographyClassName} break-words whitespace-pre-wrap`}
								style={{ fontSize: `${textSizePx}px` }}
							>
								{resolve(message.text)}
							</div>
						)}
					</div>
				))}
			</div>
		);
	}

	const hasQuestions = !!questions && questions.length > 0;
	const composerMode: "plan" | "agent" = defaultMode === "plan" ? "plan" : "agent";

	return (
		<div className="bg-theme-product-chrome flex h-full w-full flex-col">
			<div className="text-theme-text type-product-base-medium flex h-8 items-center px-3 pt-2">
				<div className="mx-auto w-full max-w-[580px]">{resolvedTitle}</div>
			</div>
			<div ref={scrollRef} className="thin-scrollbar flex-1 overflow-auto overscroll-y-auto px-3 pt-0">
				<div className="mx-auto w-full max-w-[580px]">
					{" "}
					{pinnedUser ? (
						<div className="sticky top-0 z-10">
							<div className="bg-theme-product-chrome">
								<div
									className="bg-theme-product-editor border-theme-border-02 text-theme-text type-product-base ml-auto w-full rounded-lg border px-2 py-1.5 break-words whitespace-pre-wrap"
									style={{ fontSize: `${textSizePx}px` }}
								>
									{resolve(pinnedUser.text)}
								</div>
							</div>
							<div className="from-theme-product-chrome pointer-events-none h-2 bg-gradient-to-b to-transparent" />
						</div>
					) : null}
					{visible.map((message) => (
						<ChatMessage
							key={message.id}
							message={message}
							isNew={!seenRef.current.has(message.id)}
							activeTools={activeTools}
							typographyClassName={typographyClassName}
							textSizePx={textSizePx}
							onOpenFile={onOpenFile}
						/>
					))}
					<div className="from-theme-product-chrome pointer-events-none sticky bottom-0 z-20 h-2 bg-gradient-to-t to-transparent" />
				</div>
			</div>
			{hasQuestions && mounted && playbackDone && composerVisible && (
				<div className="relative z-10 mt-2 mb-2 px-3">
					<div className="mx-auto w-full max-w-[580px]">
						<PlanQuestions
							questions={questions}
							onComplete={() => setComposerVisible(true)}
							onSkip={() => setComposerVisible(true)}
						/>
					</div>
				</div>
			)}
			<div className="bg-theme-product-chrome relative z-20 p-3 pt-0">
				<div className="mx-auto w-full max-w-[580px]">
					<div
						className={`overflow-hidden rounded-lg border ${
							hasQuestions && composerVisible
								? "bg-theme-product-editor border-theme-border-02"
								: "border-theme-border-02 focus-within:border-theme-primary focus-within:bg-theme-product-editor"
						}`}
					>
						<AgentComposer
							mode={composerMode}
							model={defaultModel}
							placeholder={
								hasQuestions && composerVisible ? gt("Add follow-up...") : (placeholder ?? gt("Plan, search, build anything..."))
							}
							onSend={handleSend}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
