/**
 * Converts a string into a URL-friendly slug.
 *
 * This function:
 * - Converts the string to lowercase
 * - Normalizes accented characters (e.g., accented e to plain e)
 * - Removes diacritics and special characters
 * - Replaces spaces with hyphens
 * - Collapses multiple hyphens into one
 * - Trims leading and trailing hyphens
 *
 * @param text - The input string to convert.
 * @returns The slugified version of the input.
 */
export function createSlug(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camelCase to kebab-case
    .toLowerCase()
    .normalize("NFD") // Decomposes accented characters
    .replace(/[\u0300-\u036f]/g, "") // Removes diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Removes special characters
    .replace(/\s+/g, "-") // Replaces spaces with hyphens
    .replace(/-+/g, "-") // Collapses multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trims leading/trailing hyphens
}
