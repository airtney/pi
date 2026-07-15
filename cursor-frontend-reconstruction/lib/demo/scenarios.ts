import type { DemoScenario } from "@/lib/demo/types";

/**
 * `demoScenarios`, deobfuscated from Turbopack module `565182`
 * (beautified `0qiav2qssorxk.js`). This is the scenario catalogue that drives
 * the hero multi-window demo: each entry carries the chat transcript that the
 * agent chat (`919473`) streams, plus the metadata the agents sidebar
 * (`961327`) uses to build its "In Progress" / "Ready for Review" lists.
 *
 * i18n note: the original wraps display strings in `gt-next`'s `msg(...)`. This
 * reconstruction ships only en-US, so the raw template strings are stored
 * directly (matching `lib/gt-shim.ts`).
 *
 * File `content` bodies are faithful to the chunk; a few of the longest code
 * listings are trimmed to a representative excerpt since no scenario file body
 * is rendered inside the homepage hero (the sidebar reads only titles / diffs /
 * branches, and the hero browser pane renders its own preview). All
 * behaviour-affecting fields (ids, roles, messages, diffSummary,
 * showInAgentsSidebar, questions) are preserved verbatim.
 */

const websiteBuilder: DemoScenario = {
	id: "website-builder-demo",
	title: "Build Landing Page",
	repoName: "cursor-site",
	chatTitle: "Build Landing Page",
	showInAgentsSidebar: true,
	files: [
		{ kind: "browser", id: "browser-preview", name: "localhost:3000", url: "http://localhost:3000" },
		{
			id: "app/page.tsx",
			name: "app/page.tsx",
			language: "tsx",
			content: `import { CursorLogoSvg } from "@/components/CursorLogoSvg";

export default function Home() {
  return (
    <main className="font-serif min-h-screen flex flex-col px-6 py-8">
      <a href="https://cursor.com" aria-label="Cursor" className="mb-8">
        <CursorLogoSvg className="h-12 w-12 opacity-20" />
      </a>

      <div className="flex-1 max-w-[48ch] text-lg leading-relaxed">
        <p className="-indent-[0.1rem]">
          We're an applied research lab working on the future of
          programming. We are a group of researchers, engineers, and
          technologists inventing at the edge of what's useful and
          possible.
        </p>
        <p className="mt-4">We have much to learn, try, and build.</p>

        <a href="/careers" className="mt-4 inline-block underline">
          Join our team →
        </a>
      </div>
    </main>
  );
}`,
		},
		{
			id: "app/globals.css",
			name: "app/globals.css",
			language: "css",
			content: `:root {
  --font-serif: "EB Garamond", "Iowan Old Style", Georgia, serif;
  --color-bg: #f7f7f4;
  --color-text: #26251e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #14120b;
    --color-text: #edecec;
  }
}

body {
  font-family: var(--font-serif);
  background: var(--color-bg);
  color: var(--color-text);
}`,
		},
	],
	messages: [
		{
			id: "web1",
			role: "user",
			text: "make a landing page based on attached docs explaining what we do",
			attachments: [
				{ type: "file", name: "about-acme.md" },
				{ type: "file", name: "brand-guidelines.pdf" },
			],
		},
		{ id: "web2", role: "read", text: "Read about-acme.md" },
		{ id: "web3", role: "read", text: "Read brand-guidelines.pdf" },
		{ id: "web4", role: "thinking", text: "Thought 6s" },
		{
			id: "web5",
			role: "assistant",
			text: "I'll create a minimal, serif-based landing page that matches your brand voice.",
		},
		{ id: "web6", role: "code", text: "app/page.tsx +52 -0" },
		{ id: "web7", role: "code", text: "app/globals.css +18 -0" },
		{
			id: "web8",
			role: "assistant",
			text: "Done. Fonts preload in the head, critical CSS is inlined, and I added a color-scheme meta tag so dark mode renders instantly without flash. 280ms first paint.",
		},
	],
	openFileIds: ["browser-preview", "app/page.tsx"],
	activeFileId: "browser-preview",
	diffSummary: { added: 70, removed: 0 },
};

const cursorIDE: DemoScenario = {
	id: "cursor-ide-demo",
	title: "Autonomous Fleet Dispatch",
	repoName: "acme-labs",
	chatTitle: "Autonomous Fleet Dispatch",
	showInAgentsSidebar: false,
	files: [
		{
			id: "src/dispatch/builder.rs",
			name: "src/dispatch/builder.rs",
			language: "rust",
			content: "// Fluent builder for RideDispatcher with geofence validation (see chunk 565182 for the full listing).",
		},
	],
	messages: [
		{
			id: "m1",
			role: "user",
			text: "Implement a dispatcher pattern for ride matching with geofence validation, Result-based error handling, and fluent builder API",
		},
		{ id: "m2", role: "thinking", text: "Thought 12s" },
		{ id: "m3", role: "search", text: "Searched existing RideRequest and geo types in domain layer" },
		{ id: "m4", role: "read", text: "Read src/domain/ride.rs, src/geo/mod.rs" },
		{
			id: "m5",
			role: "assistant",
			text: "I'll implement an async dispatcher pattern using Rust's Result type with thiserror for ergonomic error handling and a fluent builder API. Let me examine the existing structure and implement the dispatcher:",
		},
		{ id: "m6", role: "code", text: "builder.rs +89 -12" },
		{
			id: "m7",
			role: "assistant",
			text: "Now let me add the haversine distance calculation and geofence validation to the geo module:",
		},
		{ id: "m8", role: "thinking", text: "Thought 6s" },
		{ id: "m9", role: "code", text: "mod.rs +24 -0" },
		{ id: "m10", role: "assistant", text: "Let me also create async tests with tokio to validate the dispatcher:" },
		{ id: "m11", role: "code", text: "dispatch_tests.rs +62 -0" },
		{
			id: "m12",
			role: "assistant",
			text: "Done! I've implemented a robust ride dispatcher using idiomatic Rust patterns:\n\n**Key Features:**\n\n• **thiserror**: Derive macro for ergonomic custom error types with Display\n• **async/await**: Tokio-powered async dispatch for non-blocking vehicle matching\n• **Builder Pattern**: Fluent API with Result returns for early validation\n• **#[must_use]**: Compiler warnings for unused Results prevent silent failures\n• **Haversine**: Accurate great-circle distance for geofence validation\n• **sqlx**: Compile-time checked SQL queries with PostGIS for spatial lookups\n\nThe dispatcher validates all geospatial constraints at each builder step, making it impossible to create invalid ride requests in your fleet system.",
		},
	],
	openFileIds: ["src/dispatch/builder.rs", "tests/dispatch_tests.rs", "src/dispatch/mod.rs"],
	activeFileId: "src/dispatch/builder.rs",
	diffSummary: undefined,
};

const startupAnalytics: DemoScenario = {
	id: "startup-analytics",
	title: "Workspace Feature Adoption Insights",
	repoName: "cursor-usage-research",
	chatTitle: "Analyze Tab vs Agent Usage Patterns",
	showInAgentsSidebar: true,
	files: [
		{
			id: "usage/summary.py",
			name: "usage/summary.py",
			language: "python",
			content: "# focus_share / switch_summary / rolling_focus_share over interaction events (pandas).",
		},
	],
	messages: [
		{
			id: "sa1",
			role: "user",
			text: "Help me understand how teams split their focus between the tab view and the agents panel across our workspaces.",
		},
		{ id: "sa2", role: "thinking", text: "Thought 7s" },
		{ id: "sa3", role: "read", text: "Reviewed workspace usage exports and historical engagement notes" },
		{
			id: "sa4",
			role: "assistant",
			text: "I'll build an analytics toolkit that highlights tab versus agent adoption and switching behavior:",
		},
		{ id: "sa5", role: "code", text: "summary.py +150 -0" },
		{
			id: "sa6",
			role: "assistant",
			text: "Next I'll normalize the interaction labels and add session tagging so product can filter specific cohorts:",
		},
		{ id: "sa7", role: "code", text: "segmentation.py +94 -0" },
		{
			id: "sa8",
			role: "assistant",
			text: "Time to stitch everything together with a report helper that combines the key metrics:",
		},
		{ id: "sa9", role: "code", text: "report.py +40 -0" },
		{
			id: "sa10",
			role: "assistant",
			text: "I'll add tests to lock in the behaviour using a representative sample from last week's export:",
		},
		{ id: "sa11", role: "code", text: "test_usage.py created +90 lines" },
		{
			id: "sa12",
			role: "assistant",
			text: "All set! We now track focus share, switching rates, and rolling engagement so PMs can compare tab-first and agent-first workflows in seconds.",
		},
	],
	openFileIds: ["usage/summary.py", "usage/report.py", "tests/test_usage.py"],
	activeFileId: "usage/summary.py",
	diffSummary: { added: 220, removed: 80 },
};

const nextjsRouter: DemoScenario = {
	id: "nextjs-router-demo",
	title: "Next.js App Router",
	repoName: "nextjs-app-router",
	chatTitle: "Next.js App Router Guide",
	showInAgentsSidebar: false,
	files: [
		{
			id: "app/blog/[slug]/page.tsx",
			name: "app/blog/[slug]/page.tsx",
			language: "tsx",
			content: "// Dynamic route with generateStaticParams (see chunk 565182 for the full listing).",
		},
	],
	messages: [
		{ id: "n1", role: "user", text: "How do I set up dynamic routes in Next.js App Router?" },
		{ id: "n2", role: "thinking", text: "Thought 4s" },
		{ id: "n3", role: "search", text: "Searched Next.js App Router dynamic routes documentation" },
		{
			id: "n4",
			role: "assistant",
			text: "I'll show you how to create dynamic routes in Next.js App Router. Dynamic routes use square brackets `[param]` in the file name:",
		},
		{ id: "n5", role: "code", text: "blog/[slug]/page.tsx +25 -0" },
		{
			id: "n6",
			role: "assistant",
			text: "Key features of dynamic routes:\n\n• **Parameters**: Access route params via `params` prop\n• **Static Generation**: Use `generateStaticParams` to pre-render pages\n• **Nested Routes**: Can be combined with layout files\n• **Catch-all**: Use `[...slug]` for multiple segments\n\nThe route `/blog/my-post` will match this pattern and `params.slug` will be `'my-post'`.",
		},
	],
	openFileIds: ["app/layout.tsx", "app/blog/[slug]/page.tsx"],
	activeFileId: "app/blog/[slug]/page.tsx",
	diffSummary: undefined,
};

const mlPython: DemoScenario = {
	id: "ml-research-python",
	title: "Run PyTorch MNIST experiments with AMP and results analysis",
	repoName: "ml-research-notebook",
	chatTitle: "PyTorch MNIST Experiments",
	showInAgentsSidebar: true,
	files: [
		{
			id: "notebooks/train_model.py",
			name: "notebooks/train_model.py",
			language: "python",
			content: "# MNIST trainer with AMP, cosine schedule, validation split and checkpointing.",
		},
	],
	messages: [
		{
			id: "p1",
			role: "user",
			text: "Add mixed precision training, learning rate scheduling, and proper validation. Also create an experiment config system so I can easily run different hyperparameter settings.",
		},
		{ id: "p2", role: "thinking", text: "Thought 10s" },
		{ id: "p3", role: "search", text: "Searched PyTorch mixed precision training best practices" },
		{ id: "p4", role: "read", text: "Read notebooks/train_model.py (current implementation)" },
		{
			id: "p5",
			role: "assistant",
			text: "I'll enhance your MNIST trainer with a complete experiment framework including mixed precision, validation splitting, and proper configuration management. Let me start by rewriting the training module:",
		},
		{ id: "p6", role: "code", text: "train_model.py +156 -34" },
		{
			id: "p7",
			role: "assistant",
			text: "Now let me update the evaluation module to save results and generate a detailed report:",
		},
		{ id: "p8", role: "code", text: "evaluation.py +24 -6" },
		{ id: "p9", role: "assistant", text: "Let me create a command-line runner script to make experiments easy to execute:" },
		{ id: "p10", role: "code", text: "run_experiment.py created +29 lines" },
		{
			id: "p11",
			role: "assistant",
			text: "Done, configurable MNIST experiment framework with AMP and reports.\n\n• **Training**: AMP, train/val split, cosine schedule, gradient clipping, checkpoints\n• **Experimentation**: YAML config, saved history, confusion matrix + classification report, CLI runner",
		},
	],
	openFileIds: ["notebooks/train_model.py", "notebooks/run_experiment.py", "experiments/config.yaml"],
	activeFileId: "notebooks/train_model.py",
	diffSummary: undefined,
};

const changeManagement: DemoScenario = {
	id: "change-management",
	title: "Change Management Release",
	repoName: "change-management",
	chatTitle: "Change Management Versioning",
	showInAgentsSidebar: false,
	files: [
		{
			id: "src/change/ChangeManagement.tsx",
			name: "src/change/ChangeManagement.tsx",
			language: "tsx",
			content: `const VERSION = "8.2.3"
const RELEASE_TAG = "release-8.2.3"

export function ChangeManagement() {
  const metadata = {
    version: VERSION,
    tag: RELEASE_TAG,
  }

  return (
  <main className="change-management">
    <header>
      <h1>What's New in Version {VERSION}</h1>
    </header>
  </main>
  )
}`,
		},
	],
	messages: [{ id: "cm1", role: "user", text: "Align the release metadata with VERSION and fix the UI typos." }],
	openFileIds: ["src/change/ChangeManagement.tsx"],
	activeFileId: "src/change/ChangeManagement.tsx",
};

const biotech: DemoScenario = {
	id: "biotech-sequence-protein",
	title: "Add affine gap alignment to my sequence alignment tools",
	repoName: "seq-analysis",
	chatTitle: "Bioinformatics Tools",
	showInAgentsSidebar: true,
	files: [
		{
			id: "bio/sequence_alignment.py",
			name: "bio/sequence_alignment.py",
			language: "python",
			content: "# Needleman-Wunsch + Gotoh affine gap alignment (see chunk 565182 for the full listing).",
		},
	],
	messages: [
		{
			id: "b1",
			role: "user",
			text: "Add affine gap alignment. We only have basic NW alignment but I need Gotoh's algorithm for better handling of indels. Also fix the FASTA parser.",
		},
		{ id: "b2", role: "thinking", text: "Thought 5s" },
		{ id: "b3", role: "read", text: "Read bio/sequence_alignment.py, bio/fasta.py, bio/translate.py" },
		{ id: "b4", role: "search", text: "Searched for 'gotoh algorithm implementation python'" },
		{
			id: "b5",
			role: "assistant",
			text: "I'll add Gotoh's affine gap algorithm to your alignment module and fix the FASTA parser. Let me start with the alignment code:",
		},
		{ id: "b6", role: "code", text: "bio/sequence_alignment.py +75 -0" },
		{ id: "b7", role: "assistant", text: "Good, I've added the complete Gotoh implementation with proper traceback. Now let me fix the FASTA parser:" },
		{ id: "b8", role: "code", text: "bio/fasta.py 21 lines changed" },
		{ id: "b9", role: "assistant", text: "Perfect! Now let me also add ORF finding capability to the translate module since that's often needed:" },
		{ id: "b10", role: "code", text: "bio/translate.py +39 -0" },
		{
			id: "b11",
			role: "assistant",
			text: "Great! I've added:\n\n1. **Gotoh's algorithm** with proper affine gap penalties (gap open: -10, extend: -1)\n2. **Fixed FASTA parser** that handles multi-line sequences and cleans up whitespace/numbers\n3. **ORF finder** that searches all three frames for start/stop codons\n4. **Reverse complement** function for searching both strands\n\nThe Gotoh implementation uses three matrices (M, X, Y) to track match/mismatch and gap states separately, which gives much better alignments for sequences with indels. Your existing `nw_align` function is unchanged.\n\nWant me to create a quick test to verify everything works?",
		},
	],
	openFileIds: ["bio/sequence_alignment.py", "test_alignment.py"],
	activeFileId: "bio/sequence_alignment.py",
	diffSummary: { added: 135, removed: 21 },
};

const cursorRules: DemoScenario = {
	id: "cursor-rules-demo",
	title: "Cursor Rules Configuration",
	repoName: "dashboard-app",
	chatTitle: "Set up Cursor Rules for Dashboard",
	showInAgentsSidebar: true,
	files: [
		{
			id: ".cursor/rules/next.mdc",
			name: ".cursor/rules/next.mdc",
			language: "markdown",
			content: `---
Description: Rules for the dashboard application
Globs: apps/dashboard/**
---

# Dashboard Application Rules

## Instructions
Follow Next.js App Router best practices
Use React Server Components by default
Implement type-safe server actions`,
		},
	],
	messages: [
		{
			id: "cr1",
			role: "user",
			text: "Set up Cursor Rules for our Next.js dashboard app to enforce consistent patterns across the team",
		},
		{ id: "cr2", role: "thinking", text: "Thought 5s" },
		{ id: "cr3", role: "search", text: "Searched Cursor Rules documentation and .mdc file format" },
		{ id: "cr4", role: "read", text: "Read .cursor/rules/*.mdc files" },
		{
			id: "cr5",
			role: "assistant",
			text: "I'll set up Cursor Rules for your dashboard to enforce consistent patterns. Let me create a rules file with all the necessary guidelines:",
		},
		{ id: "cr6", role: "code", text: ".cursor/rules/next.mdc created" },
		{
			id: "cr7",
			role: "assistant",
			text: "Perfect! I've created a comprehensive Cursor Rules file for your dashboard:\n\n**Dashboard Rules** (`.cursor/rules/next.mdc`)\n• Applies to all dashboard files via glob pattern\n• Enforces Next.js App Router best practices\n• Defines component structure and naming conventions\n• Includes instructions for UI components, state management, and performance\n\nCursor AI will now automatically follow these standards when working on your dashboard code!",
		},
	],
	openFileIds: [".cursor/rules/next.mdc"],
	activeFileId: ".cursor/rules/next.mdc",
	diffSummary: undefined,
};

const autoComplete: DemoScenario = {
	id: "cursor-ide-demo",
	title: "Build Ecommerce Dashboard",
	repoName: "ecommerce-dashboard",
	chatTitle: "Build Ecommerce Dashboard",
	showInAgentsSidebar: false,
	files: [
		{
			id: "components/Dashboard.tsx",
			name: "components/Dashboard.tsx",
			language: "tsx",
			content: "// Three-panel ecommerce dashboard (see chunk 565182 for the full listing).",
		},
	],
	messages: [
		{
			id: "m1",
			role: "user",
			text: "Build an ecommerce dashboard interface with order management, analytics, and customer support chat",
		},
		{ id: "m2", role: "thinking", text: "Thought 8s" },
		{ id: "m3", role: "search", text: "Searched React component patterns for dashboard interfaces" },
		{
			id: "m4",
			role: "read",
			text: "Read components/Dashboard.tsx, components/Navigation.tsx, components/ContentTabs.tsx",
		},
		{
			id: "m5",
			role: "assistant",
			text: "I'll create a three-panel ecommerce dashboard interface. Let me start with the main Dashboard component that manages orders and orchestrates the layout:",
		},
		{ id: "m6", role: "code", text: "Dashboard.tsx +28 -15" },
		{ id: "m7", role: "assistant", text: "Now I'll implement the SupportChat component with react-query for fetching messages:" },
		{ id: "m8", role: "thinking", text: "Thought 5s" },
		{ id: "m9", role: "search", text: "Searched react-query patterns for fetching messages" },
		{ id: "m10", role: "code", text: "SupportChat.tsx +48 -20" },
		{
			id: "m11",
			role: "assistant",
			text: "Perfect! I've created a functional ecommerce dashboard with:\n\n• **Navigation**: Analytics and Orders sections with emoji icons\n• **Content**: Dynamic revenue calculation and order count with loading states\n• **Support Chat**: Customer support with react-query for fetching messages\n\nThe dashboard uses react-query to fetch messages data and shows loading states. Try pressing `Cmd+K` to focus the chat input!",
		},
	],
	openFileIds: ["components/Dashboard.tsx", "components/SupportChat.tsx"],
	activeFileId: "components/Dashboard.tsx",
	diffSummary: undefined,
};

const pseudoCode: DemoScenario = {
	id: "tab-static-pseudocode",
	title: "Tab-Static: Pseudocode → Implementation",
	repoName: "phone-utils",
	chatTitle: "Format US phone numbers",
	showInAgentsSidebar: false,
	files: [
		{
			id: "src/utils/phoneNumberUtils.ts",
			name: "src/utils/phoneNumberUtils.ts",
			language: "typescript",
			content: `export function formatUSPhone(input: string): string {
  // format (000) 000-0000
  const digits = input.replace(/D/g, "");
  const core = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (core.length !== 10) return input.trim();
  const area = core.slice(0, 3);
  const prefix = core.slice(3, 6);
  const line = core.slice(6);
  return "(" + area + ") " + prefix + "-" + line;
}`,
		},
	],
	messages: [
		{
			id: "pc1",
			role: "user",
			text: "Turn my pseudocode into a robust phone formatter that preserves extensions.",
		},
	],
	openFileIds: ["src/utils/phoneNumberUtils.ts"],
	activeFileId: "src/utils/phoneNumberUtils.ts",
};

const bugbotPRComments: DemoScenario = {
	id: "bugbot-pr-comments",
	title: "Bugbot: PR Comments Fetching Bug",
	repoName: "cursor-sh-landing",
	chatTitle: "Fix PR Comments Fetching Issue",
	showInAgentsSidebar: false,
	files: [
		{
			id: "backend/server/src/bugbot/github/applyBugbotPRReview.ts",
			name: "backend/server/src/bugbot/github/applyBugbotPRReview.ts",
			language: "typescript",
			content: "// PR review comment fetching with a leading-slash avatar path fix.",
		},
	],
	messages: [
		{
			id: "bug1",
			role: "user",
			text: "Fix this bug...\n\nThe user avatar image `src` (`marketing-static/icon-192x192.png`) is missing a leading slash. This relative path can cause the image to fail loading when the component is used in different URL contexts, as it resolves relative to the current page instead of the site root.",
		},
		{ id: "bug2", role: "thinking", text: "Thought 6s" },
		{ id: "bug3", role: "search", text: "Searched PR comments fetching patterns and GitHub API pagination" },
		{
			id: "bug4",
			role: "assistant",
			text: "I can see the issue! The bug is in the PR comments fetching logic in `applyBugbotPRReview.ts`.",
		},
	],
	openFileIds: [
		"backend/server/src/bugbot/github/applyBugbotPRReview.ts",
		"apps/marketing/app/components/demo/Github/GitHubUI.tsx",
	],
	activeFileId: "backend/server/src/bugbot/github/applyBugbotPRReview.ts",
	diffSummary: { added: 2, removed: 2 },
};

const fileTree: DemoScenario = {
	id: "file-tree-demo",
	title: "Fintech Platform Rules",
	repoName: "EVERYSPHERE",
	chatTitle: "File Explorer",
	showInAgentsSidebar: false,
	files: [
		{
			id: ".cursor/rules/financial-security-standards.mdc",
			name: ".cursor/rules/financial-security-standards.mdc",
			language: "markdown",
			content: `---
description: Security and compliance standards for financial services development
globs:
  - src/payments/**/*
  - src/transactions/**/*
  - src/compliance/**/*
alwaysApply: true
---

Financial Data Handling
- Use Decimal.js or BigNumber.js for all monetary calculations
- Never store raw credit card numbers; use tokenization via Stripe/Adyen`,
		},
	],
	messages: [],
	openFileIds: [".cursor/rules/financial-security-standards.mdc"],
	activeFileId: ".cursor/rules/financial-security-standards.mdc",
	diffSummary: undefined,
};

const modelSelection: DemoScenario = {
	id: "model-selection-demo",
	title: "Model Selection Interface",
	repoName: "ai-chat-app",
	chatTitle: "",
	showInAgentsSidebar: false,
	files: [],
	messages: [],
	openFileIds: [],
	activeFileId: "",
	diffSummary: { added: 0, removed: 0 },
};

const powerfulCommands: DemoScenario = {
	id: "powerful-commands",
	title: "Powerful Commands",
	repoName: "customer-dashboard",
	chatTitle: "Bash Automation Scripts",
	showInAgentsSidebar: false,
	files: [
		{
			id: "scripts/simple-code-review.sh",
			name: "scripts/simple-code-review.sh",
			language: "text",
			content: `#!/bin/bash
# simple-code-review.sh - Basic code review script

echo "Starting code review..."

agent -p --force --output-format text \\
"Review the recent code changes and provide feedback"

echo "Code review complete!"`,
		},
	],
	messages: [],
	openFileIds: ["scripts/stream-progress.sh", "scripts/simple-code-review.sh"],
	activeFileId: "scripts/simple-code-review.sh",
	diffSummary: undefined,
};

const productPlanning: DemoScenario = {
	id: "product-planning-demo",
	title: "Plan Mission Control",
	repoName: "acme-saas",
	chatTitle: "Plan Mission Control",
	showInAgentsSidebar: true,
	defaultMode: "plan",
	questions: [
		{
			id: "trigger",
			prompt: "How should Mission Control be triggered?",
			options: [
				{ id: "gesture", label: "Gesture (swipe up with 3 fingers)" },
				{ id: "keyboard", label: "Keyboard shortcut (e.g., F3 or Cmd+F3)" },
				{ id: "both", label: "Both keyboard and button" },
			],
		},
		{
			id: "layout",
			prompt: "How should windows be arranged?",
			options: [
				{ id: "grid", label: "Even grid layout" },
				{ id: "cascade", label: "Cascading tiles" },
				{ id: "smart", label: "Smart layout based on window size" },
			],
		},
		{
			id: "animation",
			prompt: "Animation style preference?",
			options: [
				{ id: "smooth", label: "Smooth spring animations" },
				{ id: "snappy", label: "Snappy, instant transitions" },
				{ id: "reduced", label: "Respect reduced motion settings" },
			],
		},
	],
	files: [
		{
			kind: "plan",
			id: "feature-prd",
			name: "feature-prd.md",
			content: `# Mission Control Interface

A grid view of all open windows as scaled previews, allowing quick selection to bring any window to front.

## Trigger
Menu item in MenuBar.tsx (View > Mission Control), hotkey F3, or double-tap desktop.

## Tasks
- [ ] Add multiplayer mode to useAppStore.ts
- [ ] Create a new MissionControlView.tsx component
- [ ] Update AppManager.tsx to apply expose modes.`,
		},
	],
	messages: [
		{
			id: "plan1",
			role: "user",
			text: "let's build a mission control interface, similar to the expose-style window manager on macOS",
		},
		{ id: "plan2", role: "thinking", text: "Thought 4s" },
		{ id: "plan3", role: "read", text: "Read AppManager.tsx" },
		{ id: "plan4", role: "search", text: "Searched expose patterns" },
		{ id: "plan5", role: "code", text: "feature-prd.md +68" },
		{
			id: "plan6",
			role: "assistant",
			text: "Drafted implementation steps in `feature-prd.md`. A few quick questions before I start building:",
		},
	],
	openFileIds: ["feature-prd", "src/lib/collaboration/presence.ts"],
	activeFileId: "feature-prd",
	diffSummary: { added: 68, removed: 0 },
};

const desktopHandoff: DemoScenario = {
	id: "desktop-handoff-demo",
	title: "Review Plan",
	repoName: "acme-app",
	chatTitle: "Review Plan",
	showInAgentsSidebar: false,
	defaultMode: "build",
	questions: [],
	files: [],
	messages: [
		{
			id: "handoff1",
			role: "user",
			text: "Plan: add a persisted user-controlled theme (light/dark/system) with next-themes on top of our existing CSS variables.",
		},
		{ id: "handoff2", role: "thinking", text: "Thought 3s" },
		{ id: "handoff3", role: "read", text: "Read app/layout.tsx, styles/theme.css" },
		{
			id: "handoff4",
			role: "assistant",
			text: "I'll draft the plan: mount ThemeProvider, refactor the shell, and document the theme API. Ready to commit & push when you approve.",
		},
	],
	openFileIds: [],
	activeFileId: "",
	diffSummary: { added: 0, removed: 0 },
};

const terminal: DemoScenario = {
	id: "terminal-demo",
	title: "Build and Test Project",
	repoName: "react-dashboard",
	chatTitle: "Build & Run Tests",
	showInAgentsSidebar: false,
	files: [
		{
			id: "src/components/Dashboard.tsx",
			name: "src/components/Dashboard.tsx",
			language: "tsx",
			content: "// react-query metrics dashboard (see chunk 565182 for the full listing).",
		},
	],
	messages: [
		{ id: "t1", role: "user", text: "Build the project and make sure all tests pass" },
		{ id: "t2", role: "thinking", text: "Thought 3s" },
		{ id: "t3", role: "assistant", text: "I'll build the project and run the test suite to verify everything works." },
		{
			id: "t4",
			role: "terminal",
			text: `npm run build
vite v5.2.0 building for production...
✓ 42 modules transformed
dist/index.html       0.45 kB │ gzip: 0.29 kB
dist/assets/index.js  145.2 kB │ gzip: 46.8 kB
✓ built in 1.24s`,
		},
		{
			id: "t5",
			role: "terminal",
			text: `npm run test
 ✓ src/components/Dashboard.test.tsx (3 tests) 45ms
 ✓ src/api/metrics.test.ts (2 tests) 12ms
 ✓ src/utils/format.test.ts (4 tests) 8ms

 Test Files  3 passed (3)
      Tests  9 passed (9)
   Duration  892ms`,
		},
		{
			id: "t6",
			role: "assistant",
			text: "Build completed successfully and all 9 tests pass. The production bundle is 46.8 kB gzipped.",
		},
	],
	openFileIds: ["src/components/Dashboard.tsx"],
	activeFileId: "src/components/Dashboard.tsx",
	diffSummary: undefined,
};

const browserDebug: DemoScenario = {
	id: "browser-debug-demo",
	title: "Debug Checkout Page",
	repoName: "webshop-frontend",
	chatTitle: "Debug Checkout Issue",
	showInAgentsSidebar: false,
	files: [
		{ kind: "browser", id: "browser-checkout", name: "localhost:3000/checkout", url: "http://localhost:3000/checkout" },
		{
			id: "src/components/Checkout.tsx",
			name: "src/components/Checkout.tsx",
			language: "tsx",
			content: "// Checkout POST fix (see chunk 565182 for the full listing).",
		},
	],
	messages: [
		{
			id: "bd1",
			role: "user",
			text: "The checkout button isn't working. Clicking it does nothing. Can you check what's wrong?",
		},
		{ id: "bd2", role: "thinking", text: "Thought 4s" },
		{
			id: "bd3",
			role: "assistant",
			text: "I'll investigate the checkout issue by examining the browser state and looking at the console.",
		},
		{ id: "bd4", role: "browser", text: "Screenshot localhost:3000/checkout" },
		{ id: "bd5", role: "browser", text: "Navigate to localhost:3000/cart" },
		{ id: "bd6", role: "browser", text: "Screenshot localhost:3000/cart" },
		{ id: "bd7", role: "browser", text: "Inspect console errors" },
		{
			id: "bd8",
			role: "assistant",
			text: "Found the issue! The checkout API call is using GET instead of POST, and the cart items aren't being sent in the request body. The API is returning a 405 Method Not Allowed error.\n\nI'll fix the `handleSubmit` function to properly POST the cart data:",
		},
		{ id: "bd9", role: "code", text: "src/components/Checkout.tsx +5 -1" },
		{
			id: "bd10",
			role: "assistant",
			text: "The checkout should now work. The fix:\n\n• Changed from GET to POST request\n• Added proper `Content-Type` header\n• Included cart items in the request body\n\nTry clicking the checkout button again!",
		},
	],
	openFileIds: ["browser-checkout", "src/components/Checkout.tsx"],
	activeFileId: "browser-checkout",
	diffSummary: { added: 5, removed: 1 },
};

const tags: DemoScenario = {
	id: "tags-demo",
	title: "Tags Demo",
	repoName: "dashboard-app",
	chatTitle: "New Chat",
	showInAgentsSidebar: false,
	files: [
		{
			id: "src/components/Dropdown.tsx",
			name: "src/components/Dropdown.tsx",
			language: "typescript",
			content: `import React from 'react'

export function Dropdown() {
  return (
    <div className="dropdown">
      {/* TODO: implement dropdown */}
    </div>
  )
}`,
		},
	],
	messages: [{ id: "tags-user-1", role: "user", text: "Make @Dropdown.tsx look like 🌐 stripe.com/checkout" }],
	openFileIds: ["src/components/Dropdown.tsx"],
	activeFileId: "src/components/Dropdown.tsx",
};

const tabMultiline: DemoScenario = {
	id: "tab-multiline-demo",
	title: "app",
	repoName: "app",
	chatTitle: "app",
	showInAgentsSidebar: false,
	files: [
		{
			id: "CommandMenu.tsx",
			name: "CommandMenu.tsx",
			language: "tsx",
			content: `import { Command } from "cmdk";

export function CommandMenu() {
  return (
    <Command>
      <Command.Input placeholder="Search..." />
      <Command.List>
        <Command.Item>Settings</Command.Item>
        <Command.Item>Profile</Command.Item>
      </Command.List>
    </Command>
  );
}`,
		},
	],
	messages: [],
	openFileIds: ["CommandMenu.tsx", "App.tsx"],
	activeFileId: "CommandMenu.tsx",
};

const tabContext: DemoScenario = {
	id: "tab-context-demo",
	title: "stripe-billing",
	repoName: "stripe-billing",
	chatTitle: "stripe-billing",
	showInAgentsSidebar: false,
	files: [
		{
			id: "db/invoices.ts",
			name: "db/invoices.ts",
			language: "typescript",
			content: `import { prisma, type Invoice } from "@/lib/db";
import type { Stripe } from "stripe";

export const getInvoicesByCustomer = (customerId: string) =>
prisma.invoice.findMany({ where: { customerId } });`,
		},
	],
	messages: [],
	openFileIds: ["db/customers.ts", "db/invoices.ts"],
	activeFileId: "db/invoices.ts",
};

const tabProprietary: DemoScenario = {
	id: "tab-proprietary-demo",
	title: "schemas",
	repoName: "app",
	chatTitle: "schemas",
	showInAgentsSidebar: false,
	files: [
		{
			id: "lib/schemas.ts",
			name: "lib/schemas.ts",
			language: "typescript",
			content: `import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(["admin", "user", "guest"]),
  createdAt: z.date(),
});`,
		},
	],
	messages: [],
	openFileIds: ["lib/schemas.ts", "lib/types.ts"],
	activeFileId: "lib/schemas.ts",
};

/**
 * Insertion order matters: the agents sidebar (module `961327`) iterates
 * `Object.entries(demoScenarios)` and de-dupes by scenario `id`, so the first
 * occurrence of a shared `id` (e.g. `cursor-ide-demo`) wins.
 */
export const demoScenarios: Record<string, DemoScenario> = {
	websiteBuilder,
	cursorIDE,
	startupAnalytics,
	nextjsRouter,
	mlPython,
	changeManagement,
	biotech,
	cursorRules,
	autoComplete,
	pseudoCode,
	bugbotPRComments,
	fileTree,
	modelSelection,
	powerfulCommands,
	productPlanning,
	desktopHandoff,
	terminal,
	browserDebug,
	tags,
	tabMultiline,
	tabContext,
	tabProprietary,
};

export type DemoScenarioKey = keyof typeof demoScenarios;
