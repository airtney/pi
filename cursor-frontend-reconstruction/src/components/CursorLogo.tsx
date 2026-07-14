/**
 * Simplified approximation of the Cursor isometric-cube logo mark.
 * Not the original asset; drawn from scratch for this reconstruction.
 */
export function CursorLogo({ size = 22 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<path d="M12 1.5 22 7.25v11.5L12 24 2 18.75V7.25L12 1.5Z" fill="currentColor" opacity="0.12" />
			<path d="M12 1.5 22 7.25 12 13 2 7.25 12 1.5Z" fill="currentColor" opacity="0.85" />
			<path d="M12 13v11l10-5.25V7.25L12 13Z" fill="currentColor" opacity="0.55" />
			<path d="M12 13v11L2 18.75V7.25L12 13Z" fill="currentColor" opacity="0.3" />
		</svg>
	);
}
