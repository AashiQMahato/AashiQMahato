// Builds every hand-designed SVG in /assets (everything except /assets/metrics
// and the snake, which the workflows regenerate).
//
//   node .github/scripts/build-assets.mjs
//
// Edit the copy in CONTENT below and re-run; each asset is written once per theme.

import { mkdirSync, writeFileSync } from "node:fs";
import { THEMES, EASE, esc, svg, panel } from "./theme.mjs";
import { ICONS } from "./icons.mjs";

const OUT = new URL("../../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });
const write = (name, data) => writeFileSync(new URL(name, OUT), data);

const CONTENT = {
  name: "Aashiq Kumar Mahato",
  role: "Full-Stack Developer · Electronics Engineer",
  lede: ["Bridging hardware and software.", "I build AI-powered web apps, end to end."],
  status: "Open to opportunities",
  place: "Kathmandu, Nepal",
};

// Rough advance width for system sans at a given size; only used to size
// capsules, so it errs a little wide.
const textW = (s, size, weight = 600) => s.length * size * (weight >= 600 ? 0.58 : 0.54);

function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max) { lines.push(line); line = word; }
    else line = (line + " " + word).trim();
  }
  return [...lines, line];
}

// One-shot staggered entrance shared by most assets.
const RISE = `.rise{animation:rise .9s ${EASE} both}@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`;
const delay = (s) => `style="animation-delay:${s.toFixed(2)}s"`;

// ── Hero ─────────────────────────────────────────────────────────────────────
function hero(t) {
  const W = 1000, H = 400;
  const dark = t.name === "dark";
  const bg = dark ? "#000" : "#F5F5F7";
  return svg({
    w: W, h: H,
    title: CONTENT.name,
    desc: `${CONTENT.name}. ${CONTENT.role}. ${CONTENT.lede.join(" ")} ${CONTENT.status}, based in ${CONTENT.place}.`,
    defs: `
<clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
<linearGradient id="ai" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${t.orange}"/><stop offset=".33" stop-color="${t.pink}"/>
  <stop offset=".66" stop-color="${t.purple}"/><stop offset="1" stop-color="${t.blue}"/>
</linearGradient>
<linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${t.highlight}"/><stop offset=".25" stop-color="${t.hairline}"/>
</linearGradient>`,
    style: `${RISE}
.name{font-size:66px;font-weight:700;letter-spacing:-2.2px;fill:${t.label}}
.role{font-size:15px;font-weight:600;letter-spacing:.2px}
.lede{font-size:23px;font-weight:500;letter-spacing:-.3px;fill:${t.secondary}}
.meta{font-size:14px;font-weight:600;letter-spacing:-.1px}
.halo{transform-origin:72px 323px;animation:halo 2.4s ease-out infinite}
@keyframes halo{0%{transform:scale(1);opacity:.55}80%,100%{transform:scale(2.6);opacity:0}}
.drift{animation:drift 1.6s ${EASE} both}@keyframes drift{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}`,
    body: `
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g class="drift" filter="url(#glow)" opacity="${dark ? 0.85 : 0.55}">
    <ellipse cx="600" cy="420" rx="200" ry="90" fill="${t.orange}"/>
    <ellipse cx="760" cy="400" rx="220" ry="110" fill="${t.pink}"/>
    <ellipse cx="900" cy="330" rx="200" ry="120" fill="${t.purple}"/>
    <ellipse cx="1000" cy="230" rx="160" ry="120" fill="${t.blue}"/>
  </g>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" fill="none" stroke="url(#edge)"/>
<text class="role rise" ${delay(0.05)} x="60" y="98" fill="url(#ai)">${esc(CONTENT.role)}</text>
<text class="name rise" ${delay(0.15)} x="56" y="170">${esc(CONTENT.name)}</text>
${CONTENT.lede.map((l, i) => `<text class="lede rise" ${delay(0.27 + i * 0.08)} x="60" y="${222 + i * 32}">${esc(l)}</text>`).join("\n")}
<g class="rise" ${delay(0.5)}>
  <rect x="54" y="305" width="${textW(CONTENT.status, 14) + 56}" height="36" rx="18" fill="${t.green}" fill-opacity="${dark ? 0.16 : 0.12}"/>
  <circle class="halo" cx="72" cy="323" r="4.5" fill="${t.green}"/>
  <circle cx="72" cy="323" r="4.5" fill="${t.green}"/>
  <text class="meta" x="86" y="328" fill="${dark ? t.green : "#1E7B34"}">${esc(CONTENT.status)}</text>
  <g transform="translate(${textW(CONTENT.status, 14) + 128} 313)" fill="none" stroke="${t.secondary}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 19s6-5.3 6-10A6 6 0 0 0 1 9c0 4.7 6 10 6 10z"/><circle cx="7" cy="9" r="2.2"/>
  </g>
  <text class="meta" x="${textW(CONTENT.status, 14) + 150}" y="328" fill="${t.secondary}">${esc(CONTENT.place)}</text>
</g>`,
  });
}

// ── Section headers (one file, legible on both GitHub themes) ────────────────
const HEADERS = {
  about: ["About", "The short version."],
  stack: ["Tech stack", "Tools I reach for."],
  projects: ["Featured projects", "Things I've shipped."],
  analytics: ["GitHub analytics", "Refreshed daily by GitHub Actions."],
  education: ["Education", "Where I learned."],
  connect: ["Connect", "Hiring, or building something interesting? Say hello."],
};
function header(title, caption) {
  return svg({
    w: 1000, h: 92,
    title, desc: caption,
    defs: `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${textW(title, 32, 700) + 40}" y2="0">
<stop offset="0" stop-color="#2E8BFF"/><stop offset=".55" stop-color="#7D5CF0"/><stop offset="1" stop-color="#E0457B"/></linearGradient>
<linearGradient id="rule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E8E93" stop-opacity=".45"/><stop offset="1" stop-color="#8E8E93" stop-opacity="0"/></linearGradient>`,
    style: `${RISE}`,
    body: `<g class="rise">
<text x="2" y="46" fill="url(#g)" style="font-size:32px;font-weight:700;letter-spacing:-.8px">${esc(title)}</text>
<text x="3" y="74" fill="#8E8E93" style="font-size:16px;font-weight:500;letter-spacing:-.1px">${esc(caption)}</text>
</g>
<rect x="2" y="90" width="996" height="1" fill="url(#rule)"/>`,
  });
}

// ── About: a macOS Terminal window ───────────────────────────────────────────
const SESSION = [
  ["cmd", "whoami"],
  ["out", "Aashiq Kumar Mahato — Full-Stack Developer"],
  ["cmd", "cat about.txt"],
  ["out", "B.E. Electronics, Communication & Information Engineering"],
  ["out", "Kathmandu, Nepal · recent graduate, open to work"],
  ["cmd", "now --status"],
  ["item", "Building AI-powered web apps"],
  ["item", "Exploring advanced React patterns & system design"],
  ["item", "Open to collaborating on innovative projects"],
  ["cmd", "strengths --list"],
  ["out", "Clean, performant code · hardware + software"],
  ["out", "User-centric design thinking · creative problem solving"],
];
function about(t) {
  const W = 1000, LH = 25, top = 92;
  const H = top + SESSION.length * LH + 60;
  const p = panel(t, { x: 12, y: 8, w: W - 24, h: H - 28, r: 14, id: "win", fill: t.name === "dark" ? "#1E1E1E" : "#FFFFFF" });
  const lines = SESSION.map(([kind, text], i) => {
    const y = top + i * LH;
    const d = delay(0.15 + i * 0.07);
    if (kind === "cmd")
      return `<text class="mono rise" ${d} x="44" y="${y}"><tspan fill="${t.green}">➜</tspan><tspan fill="${t.teal}" dx="10">~</tspan><tspan fill="${t.label}" dx="10" font-weight="600">${esc(text)}</tspan></text>`;
    if (kind === "item")
      return `<text class="mono rise" ${d} x="70" y="${y}"><tspan fill="${t.purple}">•</tspan><tspan fill="${t.secondary}" dx="10">${esc(text)}</tspan></text>`;
    return `<text class="mono rise" ${d} x="70" y="${y}" fill="${t.secondary}">${esc(text)}</text>`;
  }).join("\n");
  const cy = top + SESSION.length * LH;
  return svg({
    w: W, h: H,
    title: "About",
    desc: SESSION.map(([k, s]) => (k === "cmd" ? `$ ${s}:` : s)).join(" "),
    defs: p.defs + `<clipPath id="bar"><rect x="12" y="8" width="${W - 24}" height="44" rx="14"/><rect x="12" y="30" width="${W - 24}" height="22"/></clipPath>`,
    style: `${RISE} .mono{font-size:15px}
.cur{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`,
    body: `${p.body}
<rect x="12.5" y="8.5" width="${W - 25}" height="44" fill="${t.name === "dark" ? "#2A2A2C" : "#F2F2F4"}" clip-path="url(#bar)"/>
<rect x="12.5" y="52" width="${W - 25}" height="1" fill="${t.hairline}"/>
<circle cx="38" cy="30" r="6.5" fill="#FF5F57"/><circle cx="60" cy="30" r="6.5" fill="#FEBC2E"/><circle cx="82" cy="30" r="6.5" fill="#28C840"/>
<text x="${W / 2}" y="35" text-anchor="middle" fill="${t.secondary}" style="font-size:13px;font-weight:600">aashiq — about — zsh</text>
${lines}
<g class="rise" ${delay(0.15 + SESSION.length * 0.07)}>
<text class="mono" x="44" y="${cy}"><tspan fill="${t.green}">➜</tspan><tspan fill="${t.teal}" dx="10">~</tspan></text>
<rect class="cur" x="76" y="${cy - 14}" width="9" height="18" rx="1.5" fill="${t.blue}"/>
</g>`,
  });
}

// ── Tech stack: app-icon tiles ───────────────────────────────────────────────
// [name, dark-theme colour, light-theme colour]; null means "use the label colour".
const STACK = [
  ["Frontend", [
    ["React", "#61DAFB", "#149ECA"], ["Next.js", null, null], ["TypeScript", "#4A9AE8", "#3178C6"],
    ["JavaScript", "#F7DF1E", "#C9A400"], ["Tailwind CSS", "#38BDF8", "#0891B2"], ["HTML5", "#F06529", "#E34F26"],
    ["CSS", "#A970FF", "#663399"], ["Framer", null, null], ["Figma", "#FF7262", "#F24E1E"],
    ["Vercel", null, null], ["npm", "#E8484F", "#CB3837"],
  ]],
  ["Backend & data", [
    ["Node.js", "#7CC36A", "#5FA04E"], ["Express", null, null], ["Python", "#5A9FD4", "#3776AB"],
    ["MongoDB", "#5FC24F", "#47A248"], ["PostgreSQL", "#6B8EF2", "#336791"],
  ]],
  ["AI, hardware & tools", [
    ["OpenAI", null, null], ["TensorFlow", "#FF8F1F", "#E8710A"], ["Arduino", "#00B4BD", "#00878F"],
    ["Git", "#F4664A", "#F05032"], ["GitHub", null, null],
  ]],
];
function stack(t) {
  const W = 1000, PAD = 46, TILE = 60, GAP = (W - PAD * 2 - TILE * 11) / 10;
  const col = (i) => PAD + i * (TILE + GAP);
  const rows = [
    { y: 76, groups: [[0, 0]] },             // [group index, starting column]
    { y: 222, groups: [[1, 0], [2, 6]] },
  ];
  const H = 360;
  const p = panel(t, { x: 12, y: 8, w: W - 24, h: H - 28, r: 26, id: "st" });
  let body = p.body, n = 0;
  for (const row of rows) for (const [g, start] of row.groups) {
    const [label, items] = STACK[g];
    body += `\n<text x="${col(start)}" y="${row.y - 18}" fill="${t.secondary}" style="font-size:13px;font-weight:600;letter-spacing:.2px">${esc(label)}</text>`;
    items.forEach(([name, dc, lc], i) => {
      const x = col(start + i), y = row.y;
      const c = (t.name === "dark" ? dc : lc) ?? t.label;
      const tileFill = t.name === "dark" ? "#2C2C2E" : "#FFFFFF";
      body += `
<g class="pop" style="animation-delay:${(0.08 + n++ * 0.03).toFixed(2)}s;transform-origin:${x + TILE / 2}px ${y + TILE / 2}px">
  <rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="15" fill="${tileFill}"/>
  <rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="15" fill="${c}" fill-opacity="${t.name === "dark" ? 0.10 : 0.06}" stroke="${t.hairline}"/>
  <path transform="translate(${x + 16} ${y + 16}) scale(1.1667)" fill="${c}" d="${ICONS[name]}"/>
  <text x="${x + TILE / 2}" y="${y + TILE + 22}" text-anchor="middle" fill="${t.secondary}" style="font-size:12px;font-weight:500">${esc(name)}</text>
</g>`;
    });
  }
  return svg({
    w: W, h: H,
    title: "Tech stack",
    desc: STACK.map(([l, items]) => `${l}: ${items.map((i) => i[0]).join(", ")}.`).join(" "),
    defs: p.defs,
    style: `.pop{animation:pop .7s ${EASE} both}@keyframes pop{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}`,
    body,
  });
}

// ── Project cards ────────────────────────────────────────────────────────────
// Glyphs are 24-unit stroke drawings in the spirit of SF Symbols.
const GLYPHS = {
  face: "M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16M8.5 9v1.5M15.5 9v1.5M12 9v4.5h-1M8.8 16.2c1.8 1.4 4.6 1.4 6.4 0",
  cloud: "M7.5 19h9.5a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.9 1.2A3.4 3.4 0 0 0 7.5 19zM5 6.5l1 1M10.5 3.5V5M3 11.5h1.5",
  window: "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM3 9h18M6.5 6.5h.01M9 6.5h.01M7 13h6M7 16h4",
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4",
};
const CARDS = {
  attendance: {
    glyph: "face", grad: ["blue", "indigo"], kicker: "AI · Computer vision",
    title: "Automated Attendance System",
    desc: "Facial-recognition attendance with real-time tracking. YOLOv8 + FaceNet, email alerts and a live analytics dashboard.",
    tags: ["React", "Node.js", "MongoDB", "Python"],
  },
  weather: {
    glyph: "cloud", grad: ["teal", "blue"], kicker: "AI · Dashboard",
    title: "AI Weather Dashboard",
    desc: "OpenAI-powered weather insights with GPS location, a 10-day forecast with charts and a glassmorphism UI.",
    tags: ["Next.js", "OpenAI", "Tailwind", "REST API"],
  },
  portfolio: {
    glyph: "window", grad: ["pink", "orange"], kicker: "Web · Portfolio",
    title: "Personal Portfolio",
    desc: "Responsive, performance-optimised portfolio with smooth Framer Motion animations.",
    tags: ["React", "CSS3", "Framer Motion"],
  },
  docs: {
    glyph: "doc", grad: ["purple", "indigo"], kicker: "Web · Dashboard",
    title: "Document Management App",
    desc: "Authenticated dashboard for creating documents from typed templates, with dynamic, schema-validated forms.",
    tags: ["React", "TypeScript", "TanStack Query", "Tailwind"],
  },
};
function card(t, key) {
  const c = CARDS[key];
  const W = 480, H = 300;
  const p = panel(t, { x: 10, y: 6, w: W - 20, h: H - 20, r: 24, id: "c" });
  let tx = 38;
  const tags = c.tags.map((tag) => {
    const w = textW(tag, 12, 500) + 22;
    const s = `<rect x="${tx}" y="236" width="${w}" height="26" rx="13" fill="${t.fill}"/><text x="${tx + w / 2}" y="253.5" text-anchor="middle" fill="${t.secondary}" style="font-size:12px;font-weight:500">${esc(tag)}</text>`;
    tx += w + 8;
    return s;
  }).join("");
  return svg({
    w: W, h: H,
    title: c.title,
    desc: `${c.kicker}. ${c.desc} Built with ${c.tags.join(", ")}.`,
    defs: p.defs + `<linearGradient id="ig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t[c.grad[0]]}"/><stop offset="1" stop-color="${t[c.grad[1]]}"/></linearGradient>
<linearGradient id="ish" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    style: RISE,
    body: `${p.body}
<g class="rise">
  <rect x="38" y="34" width="54" height="54" rx="13.5" fill="url(#ig)"/>
  <rect x="38" y="34" width="54" height="54" rx="13.5" fill="url(#ish)"/>
  <path transform="translate(50 46) scale(1.25)" d="${GLYPHS[c.glyph]}" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="424" cy="52" r="16" fill="${t.fill}"/>
  <path d="M419 57l10-10M421 47h8v8" fill="none" stroke="${t.blue}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g class="rise" ${delay(0.1)}>
  <text x="38" y="122" fill="${t[c.grad[0]]}" style="font-size:12px;font-weight:600;letter-spacing:.3px">${esc(c.kicker.toUpperCase())}</text>
  <text x="37" y="150" fill="${t.label}" style="font-size:23px;font-weight:700;letter-spacing:-.5px">${esc(c.title)}</text>
  ${wrap(c.desc, 52).map((l, i) => `<text x="38" y="${180 + i * 21}" fill="${t.secondary}" style="font-size:14.5px;letter-spacing:-.1px">${esc(l)}</text>`).join("\n  ")}
</g>
<g class="rise" ${delay(0.2)}>${tags}</g>`,
  });
}

// ── Capsule link buttons ─────────────────────────────────────────────────────
const BUTTONS = {
  portfolio: { label: "Portfolio", primary: true, icon: `<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>` },
  linkedin: { label: "LinkedIn", icon: `<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.5v.01M11.5 17v-6.5M11.5 13.5a2.5 2.5 0 0 1 5 0V17"/>` },
  email: { label: "Email", icon: `<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>` },
  github: { label: "GitHub", fillIcon: ICONS.GitHub },
  instagram: { label: "Instagram", icon: `<rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4"/><path d="M17.3 6.7v.01"/>` },
};
function button(t, key) {
  const b = BUTTONS[key];
  const H = 44, w = Math.round(textW(b.label, 15) + 74);
  const fg = b.primary ? "#FFFFFF" : t.label;
  const bg = b.primary ? t.blue : t.name === "dark" ? "#2C2C2E" : "#E8E8ED";
  const icon = b.fillIcon
    ? `<path transform="translate(24 13) scale(.75)" fill="${fg}" d="${b.fillIcon}"/>`
    : `<g transform="translate(24 13) scale(.75)" fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.icon}</g>`;
  return svg({
    w, h: H, title: b.label, desc: `${b.label} link`,
    body: `<rect width="${w}" height="${H}" rx="${H / 2}" fill="${bg}"/>
${icon}
<text x="50" y="27.5" fill="${fg}" style="font-size:15px;font-weight:600;letter-spacing:-.2px">${esc(b.label)}</text>`,
  });
}

// ── Footer ───────────────────────────────────────────────────────────────────
function footer(t) {
  const W = 1000, H = 190;
  return svg({
    w: W, h: H,
    title: "Let's build something good.",
    desc: `Open to opportunities and collaborations. Designed and built in ${CONTENT.place}.`,
    defs: `<filter id="glow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="40"/></filter>
<linearGradient id="ai" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.orange}"/><stop offset=".33" stop-color="${t.pink}"/><stop offset=".66" stop-color="${t.purple}"/><stop offset="1" stop-color="${t.blue}"/></linearGradient>`,
    style: RISE,
    body: `<ellipse cx="500" cy="190" rx="300" ry="34" fill="url(#ai)" opacity="${t.name === "dark" ? 0.5 : 0.28}" filter="url(#glow)"/>
<g class="rise">
<text x="500" y="76" text-anchor="middle" fill="${t.label}" style="font-size:34px;font-weight:700;letter-spacing:-1px">Let's build something good.</text>
<text x="500" y="112" text-anchor="middle" fill="${t.secondary}" style="font-size:16px;font-weight:500">Open to opportunities and collaborations.</text>
<text x="500" y="160" text-anchor="middle" fill="${t.tertiary}" style="font-size:12px;font-weight:500;letter-spacing:.2px">Designed and built in ${esc(CONTENT.place)}.</text>
</g>`,
  });
}

for (const t of Object.values(THEMES)) {
  write(`hero-${t.name}.svg`, hero(t));
  write(`about-${t.name}.svg`, about(t));
  write(`stack-${t.name}.svg`, stack(t));
  write(`footer-${t.name}.svg`, footer(t));
  for (const k of Object.keys(CARDS)) write(`card-${k}-${t.name}.svg`, card(t, k));
  for (const k of Object.keys(BUTTONS)) write(`btn-${k}-${t.name}.svg`, button(t, k));
}
for (const [k, [title, caption]] of Object.entries(HEADERS)) write(`h-${k}.svg`, header(title, caption));
console.log("assets written");
