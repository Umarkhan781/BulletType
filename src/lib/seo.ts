export const SITE_URL = "https://bullettype.online";
export const SITE_NAME = "BulletType";

export const DEFAULT_DESCRIPTION =
  "Free online typing test and practice. Measure WPM, improve accuracy, and learn touch typing with guided lessons. No install needed.";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}`;
}
