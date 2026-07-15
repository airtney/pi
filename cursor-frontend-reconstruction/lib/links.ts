/**
 * Link-shape helpers reconstructed from module 388537
 * (`hasValidLink` / `isExternalLink`). The CMS link object can point at a
 * plain href, a slug, a page/post reference, or a downloadable file.
 */

export interface SiteLink {
  linkType?: string;
  href?: string;
  slug?: string;
  page?: unknown;
  simplePage?: unknown;
  post?: unknown;
  file?: unknown;
  label?: string;
  openInNewTab?: boolean;
}

export function hasValidLink(link?: SiteLink | null): boolean {
  return (
    !!link &&
    link.linkType !== "none" &&
    !!(link.href || link.slug || link.page || link.simplePage || link.post || link.file)
  );
}

export function isExternalLink(link?: SiteLink | null): boolean {
  return (
    !!link &&
    (!!link.openInNewTab ||
      (link.linkType === "href" &&
        !!link.href &&
        (link.href.startsWith("http://") || link.href.startsWith("https://"))))
  );
}
