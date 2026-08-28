/**
 * Converts a "#rrggbb" hex color to an "rgba(r, g, b, alpha)" string, so an accent color (a
 * series' hand-picked color, or a post's auto-extracted banner color) can be turned into a
 * translucent wash/glow via CSS custom properties.
 *
 * @param hex - A 6-digit hex color, e.g. "#38bdf8".
 * @param alpha - Opacity between 0 and 1.
 * @returns The "rgba(...)" string, or null if `hex` isn't a plain 6-digit hex — callers fall
 *   back to no wash rather than risk rendering "rgba(NaN, NaN, NaN, …)".
 */
export function hexToRgba(hex: string | null | undefined, alpha: number): string | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!match) return null;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
