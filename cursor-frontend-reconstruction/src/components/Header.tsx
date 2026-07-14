"use client";

import Link from "next/link";
import { useState } from "react";
import { CursorLogo } from "./CursorLogo";

const productLinks = [
	{ label: "Agents", href: "https://cursor.com/product" },
	{ label: "Cloud", href: "https://cursor.com/cloud" },
	{ label: "CLI", href: "https://cursor.com/cli" },
	{ label: "Mobile", href: "https://cursor.com/mobile" },
	{ label: "Automations", href: "https://cursor.com/automate" },
	{ label: "Review", href: "https://cursor.com/bugbot" },
	{ label: "Tab", href: "https://cursor.com/tab" },
	{ label: "Marketplace ↗", href: "https://cursor.com/marketplace" },
];

const resourceLinks = [
	{ label: "Changelog", href: "https://cursor.com/changelog" },
	{ label: "Blog", href: "https://cursor.com/blog" },
	{ label: "Docs", href: "https://cursor.com/docs" },
	{ label: "Community", href: "https://cursor.com/community" },
	{ label: "Help ↗", href: "https://cursor.com/help" },
	{ label: "Workshops", href: "https://cursor.com/workshops" },
	{ label: "Forum ↗", href: "https://forum.cursor.com/" },
	{ label: "Careers", href: "https://cursor.com/careers" },
];

function Dropdown({
	label,
	items,
}: {
	label: string;
	items: { label: string; href: string }[];
}) {
	return (
		<div className="group relative">
			<button
				type="button"
				className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-theme-text-sec transition-colors hover:text-theme-text"
			>
				{label}
				<span className="text-[10px] opacity-60">↓</span>
			</button>
			<div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
				<div className="min-w-44 rounded-xl border border-theme-border-02 bg-theme-bg p-1.5 shadow-lg shadow-black/5">
					{items.map((item) => (
						<a
							key={item.label}
							href={item.href}
							className="block rounded-lg px-3 py-1.5 text-sm text-theme-text-sec transition-colors hover:bg-theme-card-02 hover:text-theme-text"
						>
							{item.label}
						</a>
					))}
				</div>
			</div>
		</div>
	);
}

export function Header() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-theme-border-015 bg-theme-bg/80 backdrop-blur-md">
			<nav className="container-site flex h-header items-center justify-between">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						aria-label="Homepage"
						className="flex items-center gap-2 font-semibold tracking-tight"
					>
						<CursorLogo />
						<span className="text-[17px]">Cursor</span>
					</Link>
					<div className="hidden items-center gap-1 lg:flex">
						<Dropdown label="Product" items={productLinks} />
						<a
							href="https://cursor.com/enterprise"
							className="rounded-full px-3 py-1.5 text-sm text-theme-text-sec transition-colors hover:text-theme-text"
						>
							Enterprise
						</a>
						<a
							href="https://cursor.com/pricing"
							className="rounded-full px-3 py-1.5 text-sm text-theme-text-sec transition-colors hover:text-theme-text"
						>
							Pricing
						</a>
						<Dropdown label="Resources" items={resourceLinks} />
					</div>
				</div>

				<div className="hidden items-center gap-2 lg:flex">
					<a
						href="https://cursor.com/dashboard"
						className="rounded-full px-3 py-1.5 text-sm text-theme-text-sec transition-colors hover:text-theme-text"
					>
						Sign in
					</a>
					<a
						href="https://cursor.com/contact-sales"
						className="rounded-full border border-theme-border-025 px-4 py-1.5 text-sm font-medium transition-colors hover:border-theme-border-03"
					>
						Contact sales
					</a>
					<a
						href="https://cursor.com/download"
						className="rounded-full bg-theme-fg px-4 py-1.5 text-sm font-medium text-theme-bg transition-colors hover:bg-theme-fg-02"
					>
						Download
					</a>
				</div>

				<button
					type="button"
					aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
					className="flex h-9 w-9 items-center justify-center rounded-full text-xl lg:hidden"
					onClick={() => setMobileOpen((open) => !open)}
				>
					{mobileOpen ? "✕" : "☰"}
				</button>
			</nav>

			{mobileOpen ? (
				<div className="border-t border-theme-border-015 bg-theme-bg px-5 pb-6 pt-3 lg:hidden">
					<div className="grid gap-4">
						<div>
							<p className="pb-1 font-mono text-xs uppercase tracking-wider text-theme-text-ter">
								Product
							</p>
							{productLinks.map((item) => (
								<a key={item.label} href={item.href} className="block py-1.5 text-sm">
									{item.label}
								</a>
							))}
						</div>
						<div>
							<p className="pb-1 font-mono text-xs uppercase tracking-wider text-theme-text-ter">
								Resources
							</p>
							{resourceLinks.map((item) => (
								<a key={item.label} href={item.href} className="block py-1.5 text-sm">
									{item.label}
								</a>
							))}
						</div>
						<div className="flex flex-wrap gap-2 pt-2">
							<a href="https://cursor.com/dashboard" className="btn-secondary text-sm">
								Sign in
							</a>
							<a href="https://cursor.com/download" className="btn-primary text-sm">
								Download
							</a>
						</div>
					</div>
				</div>
			) : null}
		</header>
	);
}
