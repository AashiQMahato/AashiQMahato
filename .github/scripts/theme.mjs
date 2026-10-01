// Design tokens shared by build-assets.mjs and metrics.mjs.
//
// Colours are Apple's system palette, which ships a separately tuned value for
// light and dark rather than one hex inverted. SVGs rendered through <img> can't
// load web fonts, so type falls back through the platform system stacks: SF on
// Apple devices, Segoe UI on Windows, Roboto/Helvetica elsewhere.

export const THEMES = {
  dark: {
    name: "dark",
    canvas: "#000000",
    surface: "#1C1C1E",
    surface2: "#2C2C2E",
    hairline: "rgba(255,255,255,0.10)",
    highlight: "rgba(255,255,255,0.16)", // light catching the top edge of a material
    label: "#F5F5F7",
    secondary: "#A1A1A6",
    tertiary: "#6E6E73",
    fill: "rgba(120,120,128,0.24)",
    blue: "#0A84FF",
    indigo: "#5E5CE6",
    purple: "#BF5AF2",
    pink: "#FF375F",
    orange: "#FF9F0A",
    green: "#30D158",
    teal: "#64D2FF",
    shadow: 0.55,
  },
  light: {
    name: "light",
    canvas: "#FFFFFF",
    surface: "#F5F5F7",
    surface2: "#FFFFFF",
    hairline: "rgba(0,0,0,0.08)",
    highlight: "rgba(255,255,255,0.9)",
    label: "#1D1D1F",
    secondary: "#6E6E73",
    tertiary: "#86868B",
    fill: "rgba(120,120,128,0.12)",
    blue: "#0071E3",
    indigo: "#5856D6",
    purple: "#AF52DE",
    pink: "#FF2D55",
    orange: "#FF9500",
    green: "#28A745",
    teal: "#0095D9",
    shadow: 0.10,
  },
};

export const SANS =
  "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI Variable Display','Segoe UI',Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif";
export const MONO =
  "'SF Mono',ui-monospace,SFMono-Regular,Menlo,'Cascadia Code',Consolas,'Liberation Mono',monospace";

// Entrance motion: one ease-out settle, never a loop. Matches a critically
// damped spring (no overshoot) closely enough for a non-interactive image.
export const EASE = "cubic-bezier(.22,1,.36,1)";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const REDUCED_MOTION = `@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}`;

/** Wraps content in a standalone, accessible SVG document. */
export function svg({ w, h, title, desc, body, style = "", defs = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>${defs}</defs>
<style>
text{font-family:${SANS}}
.mono{font-family:${MONO}}
${style}
${REDUCED_MOTION}
</style>
${body}
</svg>
`;
}

/**
 * A material panel: rounded surface, hairline border and a brighter top edge.
 * Bigger surfaces read as thicker, so the drop shadow scales with height.
 */
export function panel(t, { x = 0, y = 0, w, h, r = 22, id = "p", fill }) {
  const blur = Math.min(18, 6 + h / 30);
  return {
    defs: `<filter id="${id}Sh" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="${(blur / 3).toFixed(1)}" stdDeviation="${(blur / 2).toFixed(1)}" flood-color="#000" flood-opacity="${t.shadow}"/></filter>
<linearGradient id="${id}Edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.highlight}"/><stop offset=".18" stop-color="${t.hairline}"/><stop offset="1" stop-color="${t.hairline}"/></linearGradient>`,
    body: `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill ?? t.surface}" filter="url(#${id}Sh)"/>
<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="url(#${id}Edge)"/>`,
  };
}
