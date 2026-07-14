const BLOB_CDN = "https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets";

const models = [
	{ name: "Composer 2.5", selected: true },
	{ name: "GPT-5.6", selected: false },
	{ name: "Sol", selected: false },
	{ name: "Opus 4.8", selected: false },
	{ name: "Gemini 3.1 Pro", selected: false },
	{ name: "Grok 4.5", selected: false },
];

function ModelPickerVisual() {
	return (
		<div className="card-surface flex min-h-56 flex-col justify-center gap-2 p-6">
			<p className="pb-2 font-mono text-[11px] uppercase tracking-wider text-theme-text-ter">
				Model menu
			</p>
			{models.map((model) => (
				<div
					key={model.name}
					className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
						model.selected
							? "bg-theme-fg font-medium text-theme-bg"
							: "bg-theme-bg text-theme-text-sec"
					}`}
				>
					{model.name}
					{model.selected ? <span className="font-mono text-xs">✓</span> : null}
				</div>
			))}
		</div>
	);
}

export function Frontier() {
	return (
		<section className="container-site py-24 md:py-32">
			<h2 className="section-heading max-w-xl">Stay on the frontier</h2>

			<div className="grid gap-4 pt-14 lg:grid-cols-2">
				<article className="card-surface flex flex-col gap-6 p-6 md:p-8">
					<ModelPickerVisual />
					<div>
						<h3 className="text-2xl font-semibold tracking-tight">
							Use the best model for every task
						</h3>
						<p className="pt-3 leading-relaxed text-theme-text-sec">
							Choose between every cutting-edge model from OpenAI, Anthropic, Gemini, SpaceXAI, and
							Cursor.
						</p>
						<p className="pt-4">
							<a href="https://cursor.com/docs/models" className="link-arrow">
								Explore models ↗
							</a>
						</p>
					</div>
				</article>

				<article className="card-surface flex flex-col gap-6 p-6 md:p-8">
					<div className="min-h-56 overflow-hidden rounded-xl border border-theme-border-02">
						<img
							src={`${BLOB_CDN}/misc/asset-fd9b3b4cd7d670f9f7d8.png`}
							alt="Visualization of a codebase graph"
							loading="lazy"
							className="h-full w-full object-cover"
						/>
					</div>
					<div>
						<h3 className="text-2xl font-semibold tracking-tight">
							Complete codebase understanding
						</h3>
						<p className="pt-3 leading-relaxed text-theme-text-sec">
							Cursor learns how your codebase works, no matter the scale or complexity.
						</p>
						<p className="pt-4">
							<a href="https://cursor.com/docs/context/semantic-search" className="link-arrow">
								Learn about codebase indexing ↗
							</a>
						</p>
					</div>
				</article>

				<article className="card-surface flex flex-col gap-6 p-6 md:p-8 lg:col-span-2 lg:flex-row lg:items-center">
					<div className="min-h-56 overflow-hidden rounded-xl border border-theme-border-02 lg:order-2 lg:w-1/2">
						<img
							src={`${BLOB_CDN}/homepage/homepage-team-photo.jpg`}
							alt="Engineering team collaborating"
							loading="lazy"
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="lg:w-1/2 lg:pr-8">
						<h3 className="text-2xl font-semibold tracking-tight">Develop enduring software</h3>
						<p className="max-w-md pt-3 leading-relaxed text-theme-text-sec">
							Trusted by over half of the Fortune 500 to accelerate development, securely and at
							scale.
						</p>
						<p className="pt-4">
							<a href="https://cursor.com/enterprise" className="link-arrow">
								Explore enterprise →
							</a>
						</p>
					</div>
				</article>
			</div>
		</section>
	);
}
