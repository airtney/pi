/**
 * Shared types for the hero interactive demo, deobfuscated from the Turbopack
 * modules that drive cursor.com's homepage hero:
 *
 * - `565182` `demoScenarios` (scenario data / state machine source)
 * - `919473` agent chat (message roles + streaming)
 * - `152831` `getDelayForRole` / `isToolRole`
 *
 * These are plain (non-client) types so both server and client components can
 * share them.
 */

/** Message roles used by the agent chat and playback timing (`152831`). */
export type DemoRole =
	| "user"
	| "assistant"
	| "thinking"
	| "search"
	| "read"
	| "code"
	| "terminal"
	| "browser";

export interface DemoAttachment {
	type: string;
	name: string;
}

export interface DemoMessage {
	id: string;
	role: DemoRole;
	text: string;
	attachments?: DemoAttachment[];
}

export interface DemoFile {
	id: string;
	name?: string;
	language?: string;
	content?: string;
	/** Non-code panes: `browser` renders a URL preview, `plan` a plan doc. */
	kind?: "browser" | "plan";
	url?: string;
}

export interface DemoQuestionOption {
	id: string;
	label: string;
}

export interface DemoQuestion {
	id: string;
	prompt: string;
	options: DemoQuestionOption[];
	allowMultiple?: boolean;
}

export interface DemoDiffSummary {
	added: number;
	removed: number;
}

/** A single scenario entry from `demoScenarios` (module `565182`). */
export interface DemoScenario {
	id: string;
	title: string;
	repoName: string;
	chatTitle: string;
	showInAgentsSidebar?: boolean;
	defaultMode?: "plan" | "build" | "agent";
	questions?: DemoQuestion[];
	files: DemoFile[];
	messages: DemoMessage[];
	openFileIds: string[];
	activeFileId: string;
	diffSummary?: DemoDiffSummary;
}
