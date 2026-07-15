"use client";

import { Button } from "@/components/Button";
import type { CtaTracking } from "@/components/Button";
import { useGT } from "@/lib/gt-shim";
import {
  findBestDownloadOption,
  getDownloadUrl,
  useDownloadPlatform,
  usePlatformDetection,
} from "@/lib/platform";

/**
 * Reconstruction of module 136952 (ContextualDownloadButton).
 *
 * Detects the visitor's OS/architecture and renders a download CTA whose label
 * and href adapt to the platform (e.g. "Download for macOS"). A separate
 * mobile CTA points to the mobile agent. React Compiler `useMemoCache` blocks
 * have been reduced to plain derived values.
 */
export interface ContextualDownloadButtonProps {
  defaultLink?: string;
  variant?: string;
  size?: string;
  className?: string;
  mobileLabel?: string;
  mobileHref?: string;
  mobileTracking?: CtaTracking;
  tracking?: CtaTracking;
}

export function ContextualDownloadButton({
  defaultLink,
  className,
  mobileLabel,
  mobileHref,
}: ContextualDownloadButtonProps) {
  const t = useGT();
  const { latestVersion } = useDownloadPlatform();
  const { platform, arch, os, isArchDetected, isHydrated } = usePlatformDetection();

  const resolvedUrl = isHydrated ? getDownloadUrl(latestVersion, os, arch, platform) : null;

  // Best-effort version label (matches the original's `Version X for <label>`).
  if (latestVersion && isArchDetected && isHydrated && os) {
    const options =
      os === "macOS"
        ? latestVersion.macOS
        : os === "Windows"
          ? latestVersion.windows
          : latestVersion.linux;
    const best = findBestDownloadOption(options || [], arch, platform);
    const label = best?.label || os;
    t("Version {versionText}", { versionText: `${latestVersion.versionNumber} for ${label}` });
  }

  const desktopLabel = os ? t("Download for {os}", { os }) : t("Download for macOS");
  const desktopHref = resolvedUrl || defaultLink || "/download";
  const desktopLink = { label: desktopLabel, href: desktopHref, openInNewTab: false };

  const mobileCtaLabel = mobileLabel ?? t("Try mobile agent");
  const mobileCtaHref = mobileHref ?? "/agents";
  const mobileLink = { label: mobileCtaLabel, href: mobileCtaHref, openInNewTab: false };

  return (
    <div className={className || ""}>
      <div className="hidden items-center md:flex">
        <Button link={desktopLink} className="btn" icon="download" />
      </div>
      <div className="flex items-center md:hidden">
        <Button link={mobileLink} className="btn" icon="arrow" />
      </div>
    </div>
  );
}
