import { CursorLogo } from "./CursorLogo";

const columns: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
	{
		title: "Product",
		links: [
			{ label: "Agents", href: "https://cursor.com/product" },
			{ label: "Teams", href: "https://cursor.com/business/teams" },
			{ label: "Enterprise", href: "https://cursor.com/enterprise" },
			{ label: "Pricing", href: "https://cursor.com/pricing" },
			{ label: "Code Review", href: "https://cursor.com/bugbot" },
			{ label: "Tab", href: "https://cursor.com/tab" },
			{ label: "CLI", href: "https://cursor.com/cli" },
			{ label: "Cloud Agents", href: "https://cursor.com/agents" },
			{ label: "Marketplace ↗", href: "https://cursor.com/marketplace" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Download", href: "https://cursor.com/download" },
			{ label: "Changelog", href: "https://cursor.com/changelog" },
			{ label: "Docs", href: "https://cursor.com/docs" },
			{ label: "Learn ↗", href: "https://cursor.com/learn" },
			{ label: "Forum ↗", href: "https://forum.cursor.com/" },
			{ label: "Workshops", href: "https://cursor.com/workshops" },
			{ label: "Status ↗", href: "https://status.cursor.com/" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "Careers", href: "https://cursor.com/careers" },
			{ label: "Blog", href: "https://cursor.com/blog" },
			{ label: "Community", href: "https://cursor.com/community" },
			{ label: "Students", href: "https://cursor.com/students" },
			{ label: "Brand", href: "https://cursor.com/brand" },
			{ label: "Future", href: "https://cursor.com/future" },
			{ label: "Anysphere ↗", href: "https://anysphere.inc/" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Terms of Service", href: "https://cursor.com/terms-of-service" },
			{ label: "Privacy Policy", href: "https://cursor.com/privacy" },
			{ label: "Data Use", href: "https://cursor.com/data-use" },
			{ label: "Security", href: "https://cursor.com/security" },
		],
	},
	{
		title: "Connect",
		links: [
			{ label: "X ↗", href: "https://x.com/cursor_ai" },
			{ label: "LinkedIn ↗", href: "https://www.linkedin.com/company/cursorai" },
			{ label: "YouTube ↗", href: "https://www.youtube.com/@cursor_ai" },
		],
	},
];

export function Footer() {
	return (
		<footer className="border-t border-theme-border-015 bg-theme-bg">
			<div className="container-site py-16 md:py-20">
				<div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
					<div className="col-span-2 sm:col-span-3 lg:col-span-1">
						<div className="flex items-center gap-2 font-semibold">
							<CursorLogo size={20} />
							Cursor
						</div>
					</div>
					{columns.map((column) => (
						<div key={column.title}>
							<h3 className="pb-3 text-sm font-semibold">{column.title}</h3>
							<ul className="flex flex-col gap-2">
								{column.links.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-sm text-theme-text-sec transition-colors hover:text-theme-text"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="flex flex-col gap-4 border-t border-theme-border-015 pt-8 text-sm text-theme-text-sec sm:flex-row sm:items-center sm:justify-between mt-14">
					<p>
						© 2026{" "}
						<a href="https://anysphere.inc" className="hover:text-theme-text">
							Anysphere, Inc.
						</a>
					</p>
					<div className="flex items-center gap-6">
						<a href="https://cursor.com/security" className="hover:text-theme-text">
							SOC 2 Certified
						</a>
						<span className="inline-flex items-center gap-1.5">
							<span aria-hidden="true">🌐</span> English <span className="text-xs">↓</span>
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
