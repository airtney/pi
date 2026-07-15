"use client";

import { useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

import { AgentCli } from "@/components/demo/AgentCli";
import { AgentWorkbench } from "@/components/demo/AgentWorkbench";
import { HeroDemoDesktop } from "@/components/demo/HeroDemoDesktop";
import { demoScenarios } from "@/lib/demo/scenarios";

/**
 * Hero interactive product demo, deobfuscated from the `HomeHeroSection`
 * composition in Turbopack module `677869` (beautified `0572hgflw542..js`,
 * helper `H`). Replaces the previous static SSR-HTML port with the real
 * client behaviour:
 *
 * - a `HeroDemoDesktop` (`36135`) with two draggable/resizable windows:
 *   "Cursor Desktop" (1080x620 at 50%,50%) running the agent workbench
 *   (`39014`) and "Cursor CLI" (480x360 pinned bottom-right) running the
 *   terminal agent (`270837`) on the `startupAnalytics` scenario;
 * - the workbench auto-cycles websiteBuilder -> productPlanning ->
 *   startupAnalytics every 4.5s until the visitor interacts (any trusted
 *   pointer-down or key-down inside the demo pauses cycling); the reset FAB
 *   restores the layout and restarts the cycle.
 */

const AUTO_CYCLE_KEYS = ["websiteBuilder", "productPlanning", "startupAnalytics"];

export function HeroProductDemo() {
	const [userInteracted, setUserInteracted] = useState(false);
	const [cycleResetKey, setCycleResetKey] = useState(0);

	const markInteracted = (event: ReactPointerEvent | ReactKeyboardEvent) => {
		if (event.isTrusted && !userInteracted) setUserInteracted(true);
	};

	const handleReset = () => {
		setUserInteracted(false);
		setCycleResetKey((key) => key + 1);
	};

	return (
		<div className="media-border-container relative grid grid-cols-1 grid-rows-1 bg-[image:var(--color-theme-card-03)]">
			<div className="relative z-1 col-span-full row-span-full overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					alt=""
					decoding="async"
					className="absolute inset-0 object-cover wallpaper-brightness-dark"
					style={{
						position: "absolute",
						height: "100%",
						width: "100%",
						inset: 0,
						color: "transparent",
					}}
					sizes="100vw"
					src="/misc/hero-wallpaper.jpg"
				/>
			</div>
			<div className="z-20 col-span-full row-span-full">
				<div className="relative" onPointerDownCapture={markInteracted} onKeyDownCapture={markInteracted}>
					<HeroDemoDesktop
						minHeight={720}
						innerPaddingPx={32}
						mobileInnerPaddingPx={16}
						allowMobileInteractions
						externalLayoutAdjusted={userInteracted}
						onReset={handleReset}
						windows={[
							{
								id: "cursor-ide",
								title: "Cursor Desktop",
								menuEventName: "demo-desktop-hero:settings",
								x: 50,
								y: 50,
								zIndex: 10,
								widthPx: 1080,
								heightPx: 620,
								ctaHref: "/download",
								ctaLabel: "Get Cursor",
								content: (
									<AgentWorkbench
										scenario="websiteBuilder"
										autoCycleScenarioKeys={AUTO_CYCLE_KEYS}
										autoCycleIntervalMs={4500}
										autoCycleEnabled={!userInteracted}
										autoCycleResetKey={cycleResetKey}
										showAgentsSidebarHeader={false}
										streamInitialMessages
										embedded
									/>
								),
							},
							{
								id: "cursor-agent-cli",
								title: "Cursor CLI",
								x: 100,
								y: 100,
								zIndex: 15,
								widthPx: 480,
								heightPx: 360,
								mobileXOffset: 40,
								ctaHref: "/download",
								ctaLabel: "Get CLI",
								content: <AgentCli scenario={demoScenarios.startupAnalytics} embedded streamInitialMessages />,
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
