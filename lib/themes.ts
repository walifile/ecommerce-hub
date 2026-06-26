/**
 * Storefront themes. The `id` maps to a `[data-theme="..."]` block in
 * app/globals.css. The admin panel picks one and it is applied site-wide
 * via the `data-theme` attribute on <html>.
 */
export type ThemeId = "midnight" | "ocean" | "violet" | "emerald" | "crimson";

export const DEFAULT_THEME: ThemeId = "midnight";

export type ThemeOption = {
  id: ThemeId;
  name: string;
  description: string;
  /** Preview swatches for the admin UI: [surface, brand, brand-2, brand-3]. */
  swatches: [string, string, string, string];
};

export const THEMES: ThemeOption[] = [
  {
    id: "midnight",
    name: "Midnight Orange",
    description: "Deep black with warm orange, violet and cyan accents.",
    swatches: ["#07070f", "#f97316", "#8b5cf6", "#06b6d4"],
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    description: "Inky navy with sky-blue, indigo and teal accents.",
    swatches: ["#060b12", "#0ea5e9", "#6366f1", "#14b8a6"],
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "Dark plum with violet, pink and cyan accents.",
    swatches: ["#0b0712", "#8b5cf6", "#ec4899", "#22d3ee"],
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    description: "Near-black green with emerald, lime and teal accents.",
    swatches: ["#05100b", "#10b981", "#84cc16", "#2dd4bf"],
  },
  {
    id: "crimson",
    name: "Crimson Ember",
    description: "Dark maroon with rose, amber and orange accents.",
    swatches: ["#100708", "#f43f5e", "#f59e0b", "#fb923c"],
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" && THEMES.some((theme) => theme.id === value)
  );
}

export function resolveTheme(value: unknown): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME;
}
