import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// cursor.com uses the proprietary "CursorGothic" (sans) and "Berkeley Mono"
// (mono) typefaces. Inter and JetBrains Mono are the closest freely
// available approximations; see README.md for details.
const fontSans = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const fontMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Cursor: AI coding agent (educational reconstruction)",
	description:
		"Educational reconstruction of the cursor.com homepage. Built to make you extraordinarily productive, Cursor is the best AI coding agent.",
	icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
			<body className="font-sans">{children}</body>
		</html>
	);
}
