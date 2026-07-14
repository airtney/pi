import { HeroDemo } from "./HeroDemo";

export function Hero() {
	return (
		<section className="pt-[52px]">
			<div className="container-site pb-16 pt-14 md:pb-24 md:pt-20">
				<h1 className="mx-auto max-w-3xl text-balance text-center text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
					Cursor is your coding agent for building ambitious software.
				</h1>
				<div className="flex flex-wrap items-center justify-center gap-3 pt-8">
					<a href="https://cursor.com/download" className="btn-primary">
						Download for macOS <span aria-hidden="true">⤓</span>
					</a>
					<a href="https://cursor.com/contact-sales" className="btn-secondary">
						Request a demo <span aria-hidden="true">→</span>
					</a>
				</div>
				<div className="pt-14 md:pt-20">
					<HeroDemo />
				</div>
			</div>
		</section>
	);
}
