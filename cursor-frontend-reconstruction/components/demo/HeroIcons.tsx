import type { CSSProperties, ReactNode } from "react";

/**
 * Hero demo glyphs, deobfuscated from Turbopack chunks `0n2qf0eb4x497.js`
 * (Spinner `80800`, Globe `573772`, CaretRight `587888`, DotsThree `483363`,
 * and the small 14/16px SVGs `125467` / `449008` / `204786`) and
 * `0a573kobc1opg.js` (CaretLeft `680976`).
 *
 * The phosphor-style icons in the bundle share a base wrapper (module `94884`)
 * that swaps path sets by `weight`; the homepage only ever requests `regular`
 * and `duotone`, so those are the weights carried here.
 */

type IconWeight = "regular" | "duotone";

interface PhosphorProps {
	size?: number;
	weight?: IconWeight;
	className?: string;
	style?: CSSProperties;
}

function makePhosphorIcon(weights: Record<IconWeight, ReactNode>, displayName: string) {
	function PhosphorIcon({ size = 16, weight = "regular", className, style }: PhosphorProps) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 256 256"
				fill="currentColor"
				className={className}
				style={style}
			>
				{weights[weight]}
			</svg>
		);
	}
	PhosphorIcon.displayName = displayName;
	return PhosphorIcon;
}

/** `Spinner` (module `80800`) — in-progress agent rows in the sidebar. */
export const Spinner = makePhosphorIcon(
	{
		regular: (
			<path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm37.25,58.75a8,8,0,0,0,5.66-2.35l22.63-22.62a8,8,0,0,0-11.32-11.32L167.6,77.09a8,8,0,0,0,5.65,13.66ZM224,120H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z" />
		),
		duotone: (
			<>
				<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2" />
				<path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm37.25,58.75a8,8,0,0,0,5.66-2.35l22.63-22.62a8,8,0,0,0-11.32-11.32L167.6,77.09a8,8,0,0,0,5.65,13.66ZM224,120H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z" />
			</>
		),
	},
	"SpinnerIcon",
);

/** `Globe` (module `573772`) — the "browser" tool step in the agent chat. */
export const Globe = makePhosphorIcon(
	{
		regular: (
			<path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z" />
		),
		duotone: (
			<>
				<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2" />
				<path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z" />
			</>
		),
	},
	"GlobeIcon",
);

/** `CaretRight` (module `587888`) — question navigation, next. */
export const CaretRight = makePhosphorIcon(
	{
		regular: (
			<path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
		),
		duotone: (
			<path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
		),
	},
	"CaretRightIcon",
);

/** `CaretLeft` (module `680976`) — question navigation, previous. */
export const CaretLeft = makePhosphorIcon(
	{
		regular: (
			<path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
		),
		duotone: (
			<path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
		),
	},
	"CaretLeftIcon",
);

/** `DotsThree` (module `483363`) — the window title-bar settings button. */
export const DotsThree = makePhosphorIcon(
	{
		regular: (
			<path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z" />
		),
		duotone: (
			<path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z" />
		),
	},
	"DotsThreeIcon",
);

/** `MagnifyingGlass` (module `632045`) — the sidebar "Search Agents" field. */
export const MagnifyingGlass = makePhosphorIcon(
	{
		regular: (
			<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
		),
		duotone: (
			<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
		),
	},
	"MagnifyingGlassIcon",
);

/** Code-diff file glyph (module `449008`), a 14×14 outlined file. */
export function FileGlyph({ className }: { className?: string }) {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
			<path d="M4.14746 12.7578C3.03564 12.7578 2.48242 12.1992 2.48242 11.0767V2.92871C2.48242 1.81152 3.04102 1.24219 4.14746 1.24219H6.69873C7.30029 1.24219 7.63867 1.3335 8.04688 1.75244L11.0063 4.76562C11.436 5.20605 11.5166 5.50684 11.5166 6.19971V11.0767C11.5166 12.1938 10.9634 12.7578 9.85156 12.7578H4.14746ZM4.18506 11.8931H9.80859C10.3672 11.8931 10.6519 11.5977 10.6519 11.0605V6.2373H7.59033C6.91895 6.2373 6.58057 5.9043 6.58057 5.22754V2.10693H4.19043C3.63184 2.10693 3.34717 2.41309 3.34717 2.94482V11.0605C3.34717 11.5977 3.63184 11.8931 4.18506 11.8931ZM7.68701 5.42627H10.4854L7.3916 2.27344V5.12549C7.3916 5.34033 7.47217 5.42627 7.68701 5.42627Z" />
		</svg>
	);
}

/** Terminal prompt glyph (module `125467`), a 14×14 `>_`. */
export function TerminalGlyph({ className }: { className?: string }) {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
			<path d="M3 4.5L5.5 7L3 9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M7.5 9.5H11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
		</svg>
	);
}

/** Reset / rerun arc-arrow (module `204786`), a 16×16 glyph for the reset FAB. */
export function ResetGlyph({ className }: { className?: string }) {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
			<path d="M2.76758 8.14258C2.76758 5.24805 5.10547 2.91016 8 2.91016C8.29883 2.91016 8.58594 2.94531 8.84375 2.99219L7.42578 1.5918C7.32617 1.48633 7.26758 1.35156 7.26758 1.19922C7.26758 0.882812 7.51367 0.625 7.82422 0.625C7.98828 0.625 8.12891 0.683594 8.22852 0.794922L10.6309 3.23828C10.748 3.35547 10.8125 3.50781 10.8125 3.66016C10.8125 3.81836 10.7539 3.95898 10.6309 4.08203L8.22852 6.50781C8.12305 6.60742 7.99414 6.66602 7.82422 6.66602C7.51367 6.66602 7.26758 6.41992 7.26758 6.09766C7.26758 5.94531 7.32031 5.81641 7.43164 5.71094L9.01367 4.14062C8.7207 4.07617 8.375 4.05273 8 4.05273C5.74414 4.05273 3.91602 5.88086 3.91602 8.13672C3.91602 10.3926 5.74414 12.2207 8 12.2207C10.2559 12.2207 12.084 10.3926 12.084 8.13672C12.084 7.79102 12.3066 7.54492 12.6406 7.54492C12.9863 7.54492 13.2324 7.79102 13.2324 8.14258C13.2324 11.0312 10.8887 13.375 8 13.375C5.10547 13.375 2.76758 11.0312 2.76758 8.14258Z" />
		</svg>
	);
}
