"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Demo playback context, deobfuscated from Turbopack module `417038`
 * (`DemoPlaybackProvider` / `useDemoPlayback`).
 *
 * Original (beautified `0a573kobc1opg.js`):
 *
 *   let i = createContext({ isPlaying: !0 }),
 *       s = i.Provider;
 *   e.s(["DemoPlaybackProvider", 0, s,
 *        "useDemoPlayback", 0, () => useContext(i)]);
 *
 * The live site wraps each section demo's children in this provider (module
 * `446295`, the feature media container) and flips `isPlaying` based on
 * hover / in-view state. The hero uses it to gate the agent chat's
 * initial-message streaming until the demo scrolls into view.
 */

export interface DemoPlaybackValue {
	isPlaying: boolean;
}

const DemoPlaybackContext = createContext<DemoPlaybackValue>({ isPlaying: true });

export const DemoPlaybackProvider = DemoPlaybackContext.Provider;

export function useDemoPlayback(): DemoPlaybackValue {
	return useContext(DemoPlaybackContext);
}

/**
 * `usePrefersReducedMotion`, deobfuscated from module `928402`. When the user
 * asks for reduced motion the chat renders every message immediately instead
 * of streaming.
 */
export function usePrefersReducedMotion(): boolean {
	const [prefersReduced, setPrefersReduced] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setPrefersReduced(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return prefersReduced;
}
