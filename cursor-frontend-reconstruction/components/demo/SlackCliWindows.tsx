import { FloatingWindow } from "@/components/demo/primitives";

/**
 * "In every tool, at every step" demos: the Slack channel window and the
 * cursor-agent CLI window floating over the painted-landscape wallpaper.
 * Ported from _artifacts/index.html (demo-window-slack +
 * demo-window-cursor-agent-cli).
 */

const CHANNEL_MEMBERS = [
	{ alt: "member-1", src: "/users/swhitmore.png" },
	{ alt: "member-2", src: "/users/eric.jpeg" },
	{ alt: "member-3", src: "/users/rikki.jpg" },
	{ alt: "member-4", src: "/users/ryo.png" },
];

function SlackMessage({
	avatar,
	author,
	time,
	app = false,
	grouped = false,
	children,
	actions,
}: {
	avatar?: { alt: string; src: string };
	author?: string;
	time?: string;
	app?: boolean;
	grouped?: boolean;
	children: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<div
			className={
				grouped
					? "group type-slack-base hover:bg-theme-bg-hover relative transition-colors px-4 pt-0.5 pb-1"
					: "group type-slack-base hover:bg-theme-bg-hover relative transition-colors px-4 pt-2 pb-1"
			}
		>
			<div className="flex items-start gap-3">
				<div className={grouped ? "relative flex-shrink-0 w-8 mt-0" : "relative flex-shrink-0 w-8 mt-1"}>
					{avatar && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							alt={avatar.alt}
							loading="lazy"
							width={32}
							height={32}
							decoding="async"
							className="h-8 w-8 rounded object-cover"
							style={{ color: "transparent" }}
							src={avatar.src}
						/>
					)}
				</div>
				<div className="min-w-0 flex-1">
					{author && (
						<div className="text-theme-text type-slack-base flex items-center gap-1.5">
							<span className="text-theme-text type-slack-base-semibold">{author}</span>
							{app && (
								<span
									className="text-theme-text-sec bg-theme-border-02 rounded-sm px-1 py-0.5 font-semibold leading-tight"
									style={{ fontSize: 10 }}
								>
									APP
								</span>
							)}
							<span className="text-theme-text-tertiary type-slack-sm">{time}</span>
						</div>
					)}
					<div>
						<div className="w-full">
							<div className="w-full">
								<div className="text-theme-text type-slack-base" style={{ fontSize: 14 }}>
									<div className="min-h-[1.5em]">{children}</div>
								</div>
							</div>
						</div>
						{actions}
					</div>
				</div>
			</div>
		</div>
	);
}

export function SlackWindow() {
	return (
		<FloatingWindow
			id="demo-window-slack"
			title="Slack"
			action="Get Cursor for Slack"
			style={{
				left: "clamp(calc(var(--demo-pad) + 270px), 42%, calc(100% - var(--demo-pad) - 270px))",
				top: "clamp(calc(var(--demo-pad) + 170px), 30%, calc(100% - var(--demo-pad) - 170px))",
				width: 540,
				height: 340,
				zIndex: 10,
			}}
		>
			<div
				className="slack-ui-demo flex flex-col overflow-hidden bg-theme-card-hex rounded-xl"
				style={{
					height: "100%",
					["--color-theme-accent" as string]: "#34785c",
					["--color-slack-link" as string]: "#2d629e",
				}}
			>
				<div className="border-theme-border-02 bg-theme-card-hex type-slack-base flex items-center justify-between border-b px-4 py-2">
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<button
							type="button"
							className="flex min-w-0 flex-1 items-center gap-2 rounded transition-colors hover:bg-theme-bg-hover px-0 py-1"
							aria-label="Channel info for feature-realtime-sync"
						>
							<div className="min-w-0 flex-1 gap-1 text-left">
								<div className="flex items-center gap-2">
									<h2 className="text-theme-text-pri type-slack-lg-semibold truncate">#feature-realtime-sync</h2>
								</div>
								<div className="text-theme-text-sec type-slack-sm flex items-center gap-2">
									<span className="flex-shrink-0">8 members</span>
								</div>
							</div>
						</button>
					</div>
					<div className="flex items-center">
						<div className="border-theme-border-02 type-product-base flex items-center rounded-md border px-1 py-1 -gap-0.5">
							{CHANNEL_MEMBERS.map((member) => (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									key={member.alt}
									alt={member.alt}
									loading="lazy"
									width={24}
									height={24}
									decoding="async"
									className="border-theme-card-hex -ml-2 rounded-full border object-cover first:ml-0 h-6 w-6"
									style={{ color: "transparent" }}
									src={member.src}
								/>
							))}
						</div>
					</div>
				</div>
				<div className="flex-1 bg-theme-card-hex overflow-hidden flex flex-col justify-center">
					<div className="pb-2">
						<SlackMessage avatar={{ alt: "swhitmore avatar", src: "/users/swhitmore.png" }} author="swhitmore" time="5m">
							i wanna be able to go to cursor.com/changelog#1.0 to see 1.0 changelog
						</SlackMessage>
						<SlackMessage avatar={{ alt: "eric avatar", src: "/users/eric.jpeg" }} author="eric" time="4m">
							checks out
						</SlackMessage>
						<SlackMessage grouped>
							<span className="font-semibold">@cursor</span> can you take a stab?
						</SlackMessage>
						<SlackMessage
							avatar={{ alt: "Cursor avatar", src: "/users/cursor-app.png" }}
							author="Cursor"
							app
							time="2m"
							actions={
								<div className="mt-3 flex flex-wrap gap-2">
									<a className="type-slack-sm-semibold rounded px-2.5 py-1.5 transition-colors border bg-theme-accent border-theme-accent text-white hover:bg-theme-accent/90 pointer-events-none">
										View PR
									</a>
									<a className="type-slack-sm-semibold rounded px-2.5 py-1.5 transition-colors border bg-theme-bg-01 border-theme-border-02 text-theme-text-pri hover:bg-theme-bg-hover pointer-events-none">
										Open in Cursor
									</a>
									<a className="type-slack-sm-semibold rounded px-2.5 py-1.5 transition-colors border bg-theme-bg-01 border-theme-border-02 text-theme-text-pri hover:bg-theme-bg-hover pointer-events-none">
										Open in Web
									</a>
								</div>
							}
						>
							I added direct linking for changelog entries and updated the Node.js version constraints
							across the project for better maintainability.
						</SlackMessage>
					</div>
				</div>
			</div>
		</FloatingWindow>
	);
}

export function AgentCliWindow() {
	return (
		<FloatingWindow
			id="demo-window-cursor-agent-cli"
			title="cursor-agent"
			action="Get CLI"
			style={{
				left: "clamp(calc(var(--demo-pad) + 330px), 60%, calc(100% - var(--demo-pad) - 290px))",
				top: "clamp(calc(var(--demo-pad) + 210px), 66%, calc(100% - var(--demo-pad) - 210px))",
				width: 580,
				height: 420,
				zIndex: 15,
			}}
		>
			<div className="bg-theme-product-chrome text-theme-text h-full min-h-0 w-full overflow-hidden relative">
				<div className="flex w-full h-full">
					<div className="flex min-h-0 min-w-0 flex-1 flex-col">
						<div className="flex h-full min-h-0 flex-1 flex-col">
							<div className="flex min-h-0 min-w-0" style={{ height: "100%" }}>
								<div className="flex min-h-0 min-w-0 flex-col" style={{ width: "100%" }}>
									<div className="min-h-0 flex-1 bg-theme-product-editor">
										<div className="h-full w-full">
											<div className="font-berkeley-mono flex h-full w-full flex-col overflow-hidden bg-theme-bg-muted text-[12px] text-theme-text-sec">
												<div className="flex-1 flex flex-col px-4 pt-4 pb-2 overflow-hidden justify-end">
													<div className="space-y-2.5">
														<div className="space-y-0.5 pb-1">
															<div>
																<span className="text-theme-text-ter">&gt; </span>
																<span className="text-theme-text-sec">agent</span>
															</div>
															<div className="text-theme-text-ter">Cursor Agent</div>
															<div className="text-theme-text-ter opacity-60">~/anysphere/research · main</div>
														</div>
														<div className="space-y-2" />
													</div>
												</div>
												<div className="flex-shrink-0 bg-theme-bg-muted px-4 pb-4 pt-2 space-y-2">
													<div
														className="border px-3 py-2 transition-colors duration-200"
														style={{ borderColor: "var(--color-theme-border-02)" }}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-1.5">
																<span style={{ color: "var(--color-theme-text-ter)" }}>→</span>
																<span className="text-theme-text-ter">Plan, search, build anything</span>
															</div>
														</div>
													</div>
													<div className="text-theme-text-ter flex items-center gap-1">
														<span className="text-theme-text-sec">GPT-5.6 Sol Extra High Fast</span>
													</div>
													<div className="text-theme-text-ter">
														<span className="text-theme-text-sec">/</span> commands{" "}
														<span className="opacity-50">·</span> <span className="text-theme-text-sec">@</span>{" "}
														files <span className="opacity-50">·</span>{" "}
														<span className="text-theme-text-sec">!</span> shell
													</div>
												</div>
											</div>
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
