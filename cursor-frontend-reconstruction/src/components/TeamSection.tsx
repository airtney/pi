const BLOB_CDN = "https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets";

export function TeamSection() {
	return (
		<section className="container-site py-24 md:py-32">
			<div className="grid items-center gap-10 lg:grid-cols-2">
				<div>
					<h3 className="section-heading">
						Cursor is an applied research team focused on building the future of software
						development.
					</h3>
					<p className="pt-6 text-lg text-theme-text-sec">
						We have much to learn, try, and build.
					</p>
					<p className="pt-5">
						<a href="https://cursor.com/careers" className="link-arrow text-lg">
							Join us →
						</a>
					</p>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<img
						src={`${BLOB_CDN}/homepage/homepage-team-photo-1.jpg`}
						alt="Cursor team at work"
						loading="lazy"
						className="col-span-2 aspect-video w-full rounded-2xl border border-theme-border-02 object-cover"
					/>
					<img
						src={`${BLOB_CDN}/internal-brand/internal-brand-023-3291bb4c.jpg`}
						alt="Cursor office"
						loading="lazy"
						className="aspect-square w-full rounded-2xl border border-theme-border-02 object-cover"
					/>
					<img
						src={`${BLOB_CDN}/homepage/homepage-team-photo.jpg`}
						alt="Cursor team discussion"
						loading="lazy"
						className="aspect-square w-full rounded-2xl border border-theme-border-02 object-cover"
					/>
				</div>
			</div>
		</section>
	);
}
