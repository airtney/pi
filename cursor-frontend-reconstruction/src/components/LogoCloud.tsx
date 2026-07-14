/**
 * "Trusted by" strip. The original page renders each company's SVG
 * wordmark; this reconstruction uses plain styled text instead of the
 * trademarked logo assets.
 */
const companies = [
	"Stripe",
	"OpenAI",
	"Linear",
	"Datadog",
	"NVIDIA",
	"Figma",
	"Ramp",
	"Adobe",
];

export function LogoCloud() {
	return (
		<section className="border-y border-theme-border-015 bg-theme-card-01">
			<div className="container-site py-14 md:py-16">
				<h2 className="text-center font-mono text-xs uppercase tracking-[0.15em] text-theme-text-ter">
					Trusted every day by teams that build world-class software
				</h2>
				<ul className="grid grid-cols-2 items-center gap-x-6 gap-y-8 pt-10 sm:grid-cols-4 lg:grid-cols-8">
					{companies.map((name) => (
						<li
							key={name}
							aria-label={name}
							className="text-center text-lg font-semibold tracking-tight text-theme-text-mid"
						>
							{name}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
