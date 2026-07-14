import type { Config } from "tailwindcss";

/**
 * Design tokens extracted from cursor.com CSS chunks (light theme).
 * See README.md for the mapping between original CSS variables and
 * the names used here.
 */
const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				theme: {
					// --color-theme-bg
					bg: "#f7f7f4",
					// --color-theme-fg
					fg: "#26251e",
					"fg-02": "#3b3a33",
					// --color-theme-card-hex and friends
					card: "#f2f1ed",
					"card-01": "#f0efeb",
					"card-02": "#ebeae5",
					"card-03": "#e6e5e0",
					"card-04": "#e1e0db",
					"card-warm": "#f3ede6",
					// --color-theme-accent
					accent: "#f54e00",
					// --color-theme-text-*
					text: "#26251e",
					"text-mid": "rgba(38, 37, 30, 0.5)",
					"text-sec": "rgba(38, 37, 30, 0.6)",
					"text-ter": "rgba(38, 37, 30, 0.4)",
					// --color-theme-border-*
					"border-01": "rgba(38, 37, 30, 0.024)",
					"border-015": "rgba(38, 37, 30, 0.05)",
					"border-02": "rgba(38, 37, 30, 0.1)",
					"border-025": "rgba(38, 37, 30, 0.2)",
					"border-03": "rgba(38, 37, 30, 0.6)",
					// --color-theme-product-ansi-*
					green: "#1f8a65",
					red: "#cf2d56",
					// dark theme values (footer / dark cards)
					"dark-bg": "#14120b",
					"dark-fg": "#edecec",
					"dark-card": "#1b1913",
					"dark-card-02": "#201e18",
					"dark-card-03": "#26241e",
				},
			},
			fontFamily: {
				sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: [
					"var(--font-mono)",
					"ui-monospace",
					"SFMono-Regular",
					"Menlo",
					"Monaco",
					"Consolas",
					"monospace",
				],
			},
			maxWidth: {
				site: "1200px",
			},
			height: {
				// --site-header-height
				header: "52px",
			},
			letterSpacing: {
				// --tracking-base
				base: "0.005em",
			},
		},
	},
	plugins: [],
};

export default config;
