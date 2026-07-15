/**
 * Date formatter reconstructed from module 756464: renders a `<time>` element
 * with the ISO string as `dateTime` and a "Jul 10, 2026"-style label. The
 * original delegates to gt-next's `<DateTime>`; since this reconstruction
 * ships en-US only, `Intl.DateTimeFormat` is used directly with the same
 * options (short month, UTC so the label matches the source date).
 */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
};

export function FormattedDate({
  dateString,
  className,
}: {
  dateString?: string;
  className?: string;
}) {
  if (!dateString) return null;
  const formatted = new Intl.DateTimeFormat("en-US", DATE_FORMAT_OPTIONS).format(
    new Date(dateString),
  );
  return (
    <time dateTime={dateString} className={className}>
      {formatted}
    </time>
  );
}
