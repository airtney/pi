"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Changelog data source reconstructed from module 359689
 * (`ChangelogProvider` / `useChangelog`). The server passes the most recent
 * release entries down through React context; the "Changelog" section card
 * reads them via `useChangelog()`.
 */

export interface ChangelogEntry {
  id: string;
  title: string;
  slug: string;
  date: string;
  version?: string;
}

interface ChangelogContextValue {
  changelogData?: ChangelogEntry[];
}

const ChangelogContext = createContext<ChangelogContextValue | undefined>(undefined);

export function ChangelogProvider({
  children,
  changelogData,
}: {
  children: ReactNode;
  changelogData?: ChangelogEntry[];
}) {
  return (
    <ChangelogContext.Provider value={{ changelogData }}>{children}</ChangelogContext.Provider>
  );
}

export function useChangelog(): ChangelogContextValue {
  const context = useContext(ChangelogContext);
  if (context === undefined) {
    throw new Error("useChangelog must be used within a ChangelogProvider");
  }
  return context;
}
