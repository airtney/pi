const entries = [
	{
		version: "3.11",
		date: "Jul 10, 2026",
		title: "Side Chats and Conversation Search",
		href: "https://cursor.com/changelog/side-chat",
	},
	{
		version: "3.10",
		date: "Jun 30, 2026",
		title: "MCPs and Organizations in Team Marketplaces",
		href: "https://cursor.com/changelog/team-marketplace-updates",
	},
	{
		version: "3.9",
		date: "Jun 29, 2026",
		title: "Cursor Mobile App for iOS",
		href: "https://cursor.com/changelog/ios-mobile-app",
	},
	{
		version: "3.9",
		date: "Jun 22, 2026",
		title: "Customize Cursor",
		href: "https://cursor.com/changelog/customize",
	},
];

export function Changelog() {
	return (
		<section className="border-y border-theme-border-015 bg-theme-card-01">
			<div className="container-site grid gap-10 py-24 md:py-32 lg:grid-cols-[1fr_2fr]">
				<div>
					<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Changelog</h2>
					<p className="pt-4">
						<a href="https://cursor.com/changelog" className="link-arrow">
							See what&rsquo;s new in Cursor →
						</a>
					</p>
				</div>
				<ul className="divide-y divide-theme-border-02 border-y border-theme-border-02">
					{entries.map((entry) => (
						<li key={entry.href}>
							<a
								href={entry.href}
								className="group flex items-baseline gap-4 py-4 transition-colors hover:text-theme-accent md:gap-6"
							>
								<span className="w-10 shrink-0 font-mono text-sm text-theme-text-ter">
									{entry.version}
								</span>
								<span className="w-28 shrink-0 font-mono text-sm text-theme-text-ter">
									{entry.date}
								</span>
								<span className="min-w-0 flex-1 truncate text-lg font-medium">{entry.title}</span>
								<span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
