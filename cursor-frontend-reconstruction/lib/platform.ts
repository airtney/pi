"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Platform + architecture detection, reconstructed from the compiled modules
 *   733812  detectArchitecture / detectPlatform / findBestDownloadOption / getOSName
 *   942982  usePlatformDetection
 *   229207  getDownloadUrl
 * React Compiler `useMemoCache` scaffolding has been stripped back to plain hooks.
 */

export type Platform = "darwin" | "win32" | "linux-rpm" | "linux-deb" | "linux";
export type Arch = "x64" | "arm64";
export type OSName = "macOS" | "Windows" | "Linux";

export interface DownloadOption {
  label: string;
  downloadUrl: string;
  linkType?: string;
}

export interface DownloadVersion {
  versionNumber: string;
  macOS?: DownloadOption[];
  windows?: DownloadOption[];
  linux?: DownloadOption[];
}

export function detectPlatform(): Platform | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  const plat = navigator.platform.toLowerCase();
  const combined = `${ua} ${plat}`;

  if (ua.indexOf("mac") !== -1) return "darwin";
  if (ua.indexOf("windows") !== -1) return "win32";
  if (ua.indexOf("linux") !== -1) {
    const rpm = [/centos/i, /redhat/i, /rhel/i, /fedora/i, /scientific/i, /rocky/i, /alma/i, /opensuse/i, /suse/i, /mageia/i, /mandriva/i, /mandrake/i];
    if (rpm.some((re) => re.test(combined))) return "linux-rpm";
    const deb = [/ubuntu/i, /debian/i, /mint/i, /elementary/i, /pop!_os/i, /zorin/i, /kali/i, /parrot/i];
    if (deb.some((re) => re.test(combined))) return "linux-deb";
    return "linux";
  }
  return null;
}

export async function detectArchitecture(): Promise<Arch> {
  const uaData = (navigator as Navigator & {
    userAgentData?: {
      getHighEntropyValues: (hints: string[]) => Promise<{ architecture: string; platform: string }>;
    };
  }).userAgentData;

  if (uaData) {
    try {
      const values = await uaData.getHighEntropyValues(["architecture", "bitness", "platform"]);
      if (values.architecture === "arm") return "arm64";
      if (values.architecture === "x86") return "x64";
    } catch (err) {
      console.warn("Failed to get high entropy values:", err);
    }
  }
  const combined = `${navigator.userAgent} ${navigator.platform}`;
  return [/arm64/i, /aarch64/i, /armv8l/i, /armv8a/i, /armv8/i, /armv9/i].some((re) => re.test(combined))
    ? "arm64"
    : "x64";
}

export function getOSName(platform: Platform | null): OSName | null {
  switch (platform) {
    case "darwin":
      return "macOS";
    case "win32":
      return "Windows";
    case "linux-rpm":
    case "linux-deb":
    case "linux":
      return "Linux";
    default:
      return null;
  }
}

export function findBestDownloadOption(
  options: DownloadOption[],
  arch: Arch = "x64",
  platform?: Platform | null,
): DownloadOption | null {
  if (!options || options.length === 0) return null;
  const matches = (label: string, needles: string[]) => {
    const l = label.toLowerCase();
    return needles.some((n) => l.includes(n));
  };

  if (platform === "darwin") {
    if (arch === "arm64") {
      const armMatch = options.find((o) => matches(o.label, ["arm64", "aarch64", "apple silicon", "arm"]));
      if (armMatch) return armMatch;
    }
    const universal = options.find((o) => matches(o.label, ["universal"]));
    if (universal) return universal;
    if (arch === "x64") {
      const intel = options.find((o) => matches(o.label, ["x64", "intel"]));
      if (intel) return intel;
    }
  }

  if (platform === "win32") {
    const winMatch = options.find((o) => {
      const l = o.label.toLowerCase();
      const isUser = l.includes("user");
      const archMatch = arch === "arm64" ? l.includes("arm64") || l.includes("arm") : l.includes("x64");
      return isUser && archMatch;
    });
    if (winMatch) return winMatch;
  }

  if (platform === "linux-rpm" || platform === "linux-deb" || platform === "linux") {
    const kind = platform === "linux-rpm" ? "rpm" : "deb";
    const linuxMatch = options.find(
      (o) =>
        o.label.toLowerCase().includes(kind) &&
        (o.label.toLowerCase().includes(arch) ||
          o.label.toLowerCase().includes(arch === "arm64" ? "arm" : "x64")),
    );
    if (linuxMatch) return linuxMatch;
  }

  const fuzzy = options.find((o) =>
    matches(o.label, [arch, arch === "arm64" ? "arm" : "x64", ...(arch === "arm64" ? ["aarch64", "apple silicon"] : ["intel"])]),
  );
  if (fuzzy) return fuzzy;

  const universal = options.find((o) => o.label.toLowerCase().includes("universal"));
  return universal || options[0] || null;
}

export function getDownloadUrl(
  version: DownloadVersion | null | undefined,
  os: OSName | null,
  arch: Arch = "x64",
  platform?: Platform | null,
): string | null {
  if (!version || !os) return null;
  let option: DownloadOption | null = null;
  switch (os) {
    case "macOS":
      option = findBestDownloadOption(version.macOS || [], arch, platform);
      break;
    case "Windows":
      option = findBestDownloadOption(version.windows || [], arch, platform);
      break;
    case "Linux":
      option = findBestDownloadOption(version.linux || [], arch, platform);
      break;
    default:
      return null;
  }
  return option?.downloadUrl || null;
}

export interface PlatformDetection {
  platform: Platform | null;
  arch: Arch;
  os: OSName | null;
  isHydrated: boolean;
  isArchDetected: boolean;
}

export function usePlatformDetection(): PlatformDetection {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [arch, setArch] = useState<Arch>("x64");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isArchDetected, setIsArchDetected] = useState(false);
  const archStarted = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
    setPlatform(detectPlatform());
  }, []);

  useEffect(() => {
    if (isHydrated && !archStarted.current) {
      archStarted.current = true;
      detectArchitecture()
        .then((detected) => {
          setArch(detected);
          setIsArchDetected(true);
        })
        .catch((err) => {
          console.warn("Architecture detection failed:", err);
          setIsArchDetected(true);
        });
    }
  }, [isHydrated]);

  return { platform, arch, os: getOSName(platform), isHydrated, isArchDetected };
}

/**
 * Stand-in for module 183558 `useDownloadPlatform`. The live site fetches the
 * latest release manifest; here we expose a static version so the download
 * button renders a real, working `/download` link during SSR and hydration.
 */
export interface DownloadPlatformState {
  latestVersion: DownloadVersion | null;
}

export function useDownloadPlatform(): DownloadPlatformState {
  return {
    latestVersion: {
      versionNumber: "1.0",
      macOS: [{ label: "Universal", downloadUrl: "https://cursor.com/download" }],
      windows: [{ label: "User Setup (x64)", downloadUrl: "https://cursor.com/download" }],
      linux: [{ label: "AppImage (x64)", downloadUrl: "https://cursor.com/download" }],
    },
  };
}
