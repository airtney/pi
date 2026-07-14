const BLOB_CDN = "https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets";

const posts = [
	{
		date: "Mar 27, 2026",
		category: "Research",
		title: "A technical report on Composer 2",
		byline: "Sasha Rush",
		href: "https://cursor.com/blog/composer-2-technical-report",
		image: `${BLOB_CDN}/misc/asset-85923e7fafe00c9c0d1f.jpg`,
	},
	{
		date: "Jul 8, 2026",
		category: "Research",
		title: "Introducing Grok 4.5",
		byline: "Cursor Team · 3 min read",
		href: "https://cursor.com/blog/grok-4-5",
		image: `${BLOB_CDN}/misc/asset-cc24ca462279ca23250c.jpg`,
	},
	{
		date: "Jun 29, 2026",
		category: "Product",
		title: "Build from anywhere with Cursor for iOS",
		byline: "Cursor Team",
		href: "https://cursor.com/blog/ios-mobile-app",
		image: `${BLOB_CDN}/misc/asset-b7d40eac35d910f3448b.png`,
	},
	{
		date: "Jun 5, 2026",
		category: "Product",
		title: "Direct agents with visual prompts in Design Mode",
		byline: "Erik, Ian & Ryo · 6 min read",
		href: "https://cursor.com/blog/design-mode",
		image: `${BLOB_CDN}/misc/asset-3cb319c263fd5a76115b.png`,
	},
];

export function Highlights() {
	return (
		<section className="container-site py-24 md:py-32">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Recent highlights</h2>
				<a href="https://cursor.com/blog" className="link-arrow">
					View all blog posts →
				</a>
			</div>
			<div className="grid gap-4 pt-12 sm:grid-cols-2 lg:grid-cols-4">
				{posts.map((post) => (
					<a key={post.href} href={post.href} className="group">
						<article>
							<div className="aspect-[4/3] overflow-hidden rounded-2xl border border-theme-border-02 bg-theme-card">
								<img
									src={post.image}
									alt=""
									loading="lazy"
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
								/>
							</div>
							<p className="pt-4 font-mono text-xs text-theme-text-ter">
								{post.date} · {post.category}
							</p>
							<h3 className="pt-1.5 text-lg font-semibold leading-snug tracking-tight group-hover:underline group-hover:underline-offset-4">
								{post.title}
							</h3>
							<p className="pt-1.5 text-sm text-theme-text-sec">{post.byline}</p>
						</article>
					</a>
				))}
			</div>
		</section>
	);
}
