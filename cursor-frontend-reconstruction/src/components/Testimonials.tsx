/**
 * Testimonial wall. Quotes are abridged to short excerpts of the
 * public statements shown on cursor.com; avatars load from the same
 * public CDN the original page uses.
 */
const AVATAR_CDN = "https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/avatars";

const testimonials = [
	{
		quote: "It just spread like wildfire, all the best builders were using Cursor.",
		name: "Diana Hu",
		title: "General Partner, Y Combinator",
		avatar: `${AVATAR_CDN}/diana-hu-avatar.png`,
	},
	{
		quote: "My favorite enterprise AI service is Cursor.",
		name: "Jensen Huang",
		title: "President & CEO, NVIDIA",
		avatar: `${AVATAR_CDN}/avatar-circle-2d-white.png`,
	},
	{
		quote:
			"The best LLM applications have an autonomy slider: you control how much independence to give the AI.",
		name: "Andrej Karpathy",
		title: "CEO, Eureka Labs",
		avatar: `${AVATAR_CDN}/andrej-karpathy-avatar.png`,
	},
	{
		quote:
			"Cursor quickly grew from hundreds to thousands of extremely enthusiastic Stripe employees.",
		name: "Patrick Collison",
		title: "Co-Founder & CEO, Stripe",
		avatar: `${AVATAR_CDN}/patrick-collison-avatar.png`,
	},
	{
		quote: "The most useful AI tool that I currently pay for, hands down, is Cursor.",
		name: "shadcn",
		title: "Creator of shadcn/ui",
		avatar: `${AVATAR_CDN}/shadcn-avatar.png`,
	},
	{
		quote: "It's definitely becoming more fun to be a programmer.",
		name: "Greg Brockman",
		title: "President, OpenAI",
		avatar: `${AVATAR_CDN}/greg-brockman-avatar.jpg`,
	},
];

export function Testimonials() {
	return (
		<section className="border-y border-theme-border-015 bg-theme-card-01">
			<div className="container-site py-24 md:py-32">
				<h2 className="section-heading max-w-2xl">The new way to build software.</h2>
				<div className="grid gap-4 pt-14 md:grid-cols-2 lg:grid-cols-3">
					{testimonials.map((item) => (
						<figure
							key={item.name}
							className="flex flex-col justify-between rounded-2xl border border-theme-border-02 bg-theme-bg p-6"
						>
							<blockquote className="text-[17px] leading-relaxed">
								&ldquo;{item.quote}&rdquo;
							</blockquote>
							<figcaption className="flex items-center gap-3 pt-6">
								<img
									src={item.avatar}
									alt=""
									width={42}
									height={42}
									loading="lazy"
									className="h-[42px] w-[42px] rounded-full border border-theme-border-02 object-cover"
								/>
								<div>
									<p className="text-sm font-semibold">{item.name}</p>
									<p className="text-sm text-theme-text-sec">{item.title}</p>
								</div>
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}
