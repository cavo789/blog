export function formatPostDate(date: string | null | undefined, locale = "en"): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
