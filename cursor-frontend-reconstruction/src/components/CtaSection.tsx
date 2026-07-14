export function CtaSection() {
	return (
		<section className="border-t border-theme-border-015 bg-theme-card-01">
			<div className="container-site py-24 text-center md:py-32">
				<h2 className="section-heading mx-auto">Try Cursor now.</h2>
				<div className="flex flex-wrap items-center justify-center gap-3 pt-8">
					<a href="https://cursor.com/download" className="btn-primary">
						Download for macOS <span aria-hidden="true">⤓</span>
					</a>
					<a href="https://cursor.com/login" className="btn-secondary">
						Get started <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</section>
	);
}
