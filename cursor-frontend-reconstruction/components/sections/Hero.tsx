import { Actions } from "@/components/Button";
import { HeroProductDemo } from "@/components/sections/HeroProductDemo";

export function Hero() {
	return (
		<section className="section bg-theme-bg text-theme-text">
			<div className="container">
				<div className="mb-v2.5 max-w-prose text-left">
					<h1 className="type-md-lg text-balance mb-v1">
						Cursor is your coding agent for building ambitious software.
					</h1>
					<div className="flex items-center justify-start gap-x-g1">
						<Actions
							alignment="left"
							mobileFullWidth
							cta={[
								{ key: "download", downloadButton: true },
								{
									key: "get-started",
									link: { label: "Get started", href: "/login" },
									icon: "arrow",
									variant: "secondary",
									hideOnDesktop: true,
								},
								{
									key: "demo",
									link: {
										label: "Request a demo",
										href: "/contact-sales?source=hero_request_demo",
									},
									icon: "arrow",
									variant: "secondary",
									hideOnMobile: true,
								},
							]}
						/>
					</div>
				</div>

				<HeroProductDemo />
			</div>
		</section>
	);
}
