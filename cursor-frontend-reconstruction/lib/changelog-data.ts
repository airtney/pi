import type { ChangelogEntry } from "@/components/ChangelogProvider";

/**
 * The four most recent release entries, mirrored from the `changelogData`
 * prop the server passes to `ChangelogProvider` in the captured RSC Flight
 * payload (_artifacts/index.html). On the live site this comes from the CMS.
 */
export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    id: "side-chat",
    title: "Side Chats and Conversation Search",
    slug: "side-chat",
    date: "2026-07-10T00:00:00.000Z",
    version: "3.11",
  },
  {
    id: "team-marketplace-updates",
    title: "MCPs and Organizations in Team Marketplaces",
    slug: "team-marketplace-updates",
    date: "2026-06-30T00:00:00.000Z",
    version: "3.10",
  },
  {
    id: "ios-mobile-app",
    title: "Cursor Mobile App for iOS",
    slug: "ios-mobile-app",
    date: "2026-06-29T00:00:00.000Z",
    version: "3.9",
  },
  {
    id: "customize",
    title: "Customize Cursor",
    slug: "customize",
    date: "2026-06-22T00:00:00.000Z",
    version: "3.9",
  },
];
