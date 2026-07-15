import Image from "next/image";

/**
 * Monochrome (currentColor) logo files render black when loaded via <img>, so
 * they get the artifact's `logo-dark-invert` filter in dark mode. Ramp ships
 * pre-colored light/dark variants toggled with `media-light` / `media-dark`,
 * exactly like the artifact's paired logo SVGs.
 */
const LOGOS = [
	{ name: "Stripe", src: "/logos/stripe.svg" },
	{ name: "OpenAI", src: "/logos/openai.svg" },
	{ name: "Linear", src: "/logos/linear.svg" },
	{ name: "Vercel", src: "/logos/vercel.svg" },
	{ name: "Ramp", src: "/logos/ramp-light.svg", darkSrc: "/logos/ramp.svg" },
	{ name: "Shopify", src: "/logos/shopify.svg" },
	{ name: "Perplexity", src: "/logos/perplexity.svg" },
	{ name: "Samsung", src: "/logos/samsung.svg" },
] as const;

const LOGO_SIZE_CLASSES = "h-8 w-auto object-contain sm:h-9 md:h-10";

export function LogoGarden() {
	return (
		<section className="section bg-theme-bg text-theme-text">
			<div className="container">
				<h2 className="type-sm text-center text-theme-text-tertiary">
					Trusted every day by teams that build world-class software
				</h2>
				<div className="logo-garden-responsive-8 mt-8">
					{LOGOS.map((logo) => (
						<div key={logo.name} className="flex items-center justify-center text-theme-text-mid">
							{"darkSrc" in logo ? (
								<>
									<Image
										src={logo.src}
										alt={logo.name}
										width={130}
										height={40}
										className={`${LOGO_SIZE_CLASSES} media-light`}
									/>
									<Image
										src={logo.darkSrc}
										alt={logo.name}
										width={130}
										height={40}
										className={`${LOGO_SIZE_CLASSES} media-dark`}
									/>
								</>
							) : (
								<Image
									src={logo.src}
									alt={logo.name}
									width={130}
									height={40}
									className={`${LOGO_SIZE_CLASSES} logo-dark-invert`}
								/>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
