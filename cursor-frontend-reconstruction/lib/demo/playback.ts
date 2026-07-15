import type { DemoRole } from "@/lib/demo/types";

/**
 * Playback timing helpers, deobfuscated from Turbopack module `152831`
 * (`getDelayForRole` / `isToolRole`). These drive the per-message dwell time
 * while the hero agent chat streams (module `919473`): tool steps linger long
 * enough to read, plain assistant/user turns advance quickly.
 *
 * Verbatim mapping from the beautified chunk (`0a573kobc1opg.js`):
 *
 *   thinking | browser -> 600
 *   search             -> 500
 *   read               -> 400
 *   terminal           -> 800
 *   (default)          -> 150
 */
export function getDelayForRole(role: DemoRole): number {
	switch (role) {
		case "thinking":
		case "browser":
			return 600;
		case "search":
			return 500;
		case "read":
			return 400;
		case "terminal":
			return 800;
		default:
			return 150;
	}
}

/** True for roles rendered as an intermediate "tool" step (shows a shimmer). */
export function isToolRole(role: DemoRole): boolean {
	return (
		role === "thinking" ||
		role === "search" ||
		role === "read" ||
		role === "terminal" ||
		role === "browser"
	);
}
