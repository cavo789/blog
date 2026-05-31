export function formatPostDate(date, locale = 'en') {
  if (!date) return null;
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
