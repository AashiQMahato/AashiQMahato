// Renders the GitHub analytics cards into /assets/metrics.
//
//   GH_TOKEN=... node .github/scripts/metrics.mjs [login]
//
// The workflow's built-in GITHUB_TOKEN is enough: everything here is public
// profile data, so no personal access token or repository secret is needed.
// If a METRICS_TOKEN secret (classic PAT, read:user) is ever added, the
// workflow prefers it and private contributions get counted too.

import { mkdirSync, writeFileSync } from "node:fs";
import { THEMES, EASE, esc, svg, panel } from "./theme.mjs";

const LOGIN = process.argv[2] ?? process.env.GITHUB_REPOSITORY_OWNER ?? "AashiQMahato";
const TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error("Set GH_TOKEN (the workflow passes github.token).");

const OUT = new URL("../../assets/metrics/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      totalCount
      nodes { stargazerCount languages(first: 12, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
    }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalIssueContributions
      totalPullRequestReviewContributions restrictedContributionsCount
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": "profile-metrics" },
  body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
});
const json = await res.json();
if (!res.ok || json.errors) throw new Error(`GitHub API ${res.status}: ${JSON.stringify(json.errors ?? json)}`);
const u = json.data.user;
const cc = u.contributionsCollection;
const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);

// ── Derived numbers ──────────────────────────────────────────────────────────
const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
// Today usually has no contributions yet when the cron fires; that shouldn't
// reset the current streak, so start counting from yesterday in that case.
let current = 0;
for (let i = days.length - 1 - (days.at(-1)?.contributionCount ? 0 : 1); i >= 0 && days[i].contributionCount; i--) current++;

const langTotals = new Map();
for (const r of u.repositories.nodes)
  for (const e of r.languages.edges) {
    const cur = langTotals.get(e.node.name) ?? { size: 0, color: e.node.color ?? "#8E8E93" };
    cur.size += e.size;
    langTotals.set(e.node.name, cur);
  }
const langSum = [...langTotals.values()].reduce((s, l) => s + l.size, 0) || 1;
let langs = [...langTotals].map(([name, l]) => ({ name, color: l.color, pct: (l.size / langSum) * 100 }))
  .sort((a, b) => b.pct - a.pct);
if (langs.length > 8) {
  const rest = langs.slice(7).reduce((s, l) => s + l.pct, 0);
  langs = [...langs.slice(0, 7), { name: "Other", color: "#8E8E93", pct: rest }];
}

const fmt = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-US"));
const STYLE_RISE = `.rise{animation:rise .8s ${EASE} both}@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;
const updated = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kathmandu" });

function heading(t, title, caption, w) {
  return `<text x="36" y="52" fill="${t.label}" style="font-size:19px;font-weight:700;letter-spacing:-.3px">${esc(title)}</text>
<text x="${w - 36}" y="52" text-anchor="end" fill="${t.tertiary}" style="font-size:12.5px;font-weight:500">${esc(caption)}</text>`;
}

// ── Overview ─────────────────────────────────────────────────────────────────
function overview(t) {
  const W = 480, H = 300;
  const p = panel(t, { x: 10, y: 6, w: W - 20, h: H - 20, r: 24, id: "o" });
  const total = cc.contributionCalendar.totalContributions;
  const stats = [
    ["Commits", cc.totalCommitContributions, t.blue],
    ["Pull requests", cc.totalPullRequestContributions, t.purple],
    ["Issues", cc.totalIssueContributions, t.orange],
    ["Stars earned", stars, t.pink],
    ["Repositories", u.repositories.totalCount, t.teal],
    ["Followers", u.followers.totalCount, t.green],
  ];
  const cells = stats.map(([label, v, c], i) => {
    const x = 36 + (i % 3) * 140, y = 186 + Math.floor(i / 3) * 56;
    return `<g class="rise" style="animation-delay:${(0.15 + i * 0.05).toFixed(2)}s">
<circle cx="${x + 4}" cy="${y - 7}" r="4" fill="${c}"/>
<text x="${x + 15}" y="${y - 2}" fill="${t.label}" style="font-size:20px;font-weight:700;letter-spacing:-.4px">${fmt(v)}</text>
<text x="${x}" y="${y + 18}" fill="${t.secondary}" style="font-size:12px;font-weight:500">${esc(label)}</text></g>`;
  }).join("\n");
  return svg({
    w: W, h: H,
    title: "GitHub activity",
    desc: `${total} contributions in the last year: ${stats.map(([l, v]) => `${l} ${v}`).join(", ")}.`,
    defs: p.defs + `<linearGradient id="num" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.blue}"/><stop offset="1" stop-color="${t.purple}"/></linearGradient>`,
    style: STYLE_RISE,
    body: `${p.body}
${heading(t, "Activity", "Last 12 months", W)}
<g class="rise">
<text x="34" y="122" fill="url(#num)" style="font-size:54px;font-weight:700;letter-spacing:-2px">${fmt(total)}</text>
<text x="36" y="146" fill="${t.secondary}" style="font-size:13px;font-weight:500">contributions · ${current}-day current streak</text>
</g>
<rect x="36" y="160" width="${W - 72}" height="1" fill="${t.hairline}"/>
${cells}`,
  });
}

// ── Languages ────────────────────────────────────────────────────────────────
function languages(t) {
  const W = 480, H = 300, BX = 36, BW = W - 72;
  const p = panel(t, { x: 10, y: 6, w: W - 20, h: H - 20, r: 24, id: "l" });
  let x = BX;
  const segs = langs.map((l) => {
    const w = (l.pct / 100) * BW;
    // 2px gaps between segments, like the Storage bar in iOS Settings.
    const s = `<rect x="${x.toFixed(1)}" y="82" width="${Math.max(0, w - 2).toFixed(1)}" height="14" fill="${l.color}"/>`;
    x += w;
    return s;
  }).join("");
  const legend = langs.map((l, i) => {
    const cx = BX + (i % 2) * (BW / 2 + 12), cy = 136 + Math.floor(i / 2) * 34;
    return `<g class="rise" style="animation-delay:${(0.3 + i * 0.04).toFixed(2)}s">
<circle cx="${cx + 5}" cy="${cy - 4.5}" r="5" fill="${l.color}"/>
<text x="${cx + 18}" y="${cy}" fill="${t.label}" style="font-size:14px;font-weight:600;letter-spacing:-.1px">${esc(l.name)}</text>
<text x="${cx + BW / 2 - 18}" y="${cy}" text-anchor="end" fill="${t.secondary}" style="font-size:13px;font-weight:500;font-variant-numeric:tabular-nums">${l.pct < 0.1 ? "<0.1" : l.pct.toFixed(1)}%</text></g>`;
  }).join("\n");
  return svg({
    w: W, h: H,
    title: "Most used languages",
    desc: langs.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", "),
    defs: p.defs + `<clipPath id="bar"><rect x="${BX}" y="82" width="${BW}" height="14" rx="7"/></clipPath>`,
    style: `${STYLE_RISE}
.grow{transform-origin:${BX}px 0;animation:grow 1.1s ${EASE} .1s both}@keyframes grow{from{transform:scaleX(0)}to{transform:none}}`,
    body: `${p.body}
${heading(t, "Languages", "By code size, public repos", W)}
<rect x="${BX}" y="82" width="${BW}" height="14" rx="7" fill="${t.fill}"/>
<g clip-path="url(#bar)"><g class="grow">${segs}</g></g>
${legend}`,
  });
}

// ── Contribution calendar ────────────────────────────────────────────────────
function calendar(t) {
  const W = 1000, CELL = 13, GAP = 3.4, X0 = 67, Y0 = 108;
  const weeks = cc.contributionCalendar.weeks;
  const H = Y0 + 7 * (CELL + GAP) + 64;
  const p = panel(t, { x: 12, y: 8, w: W - 24, h: H - 28, r: 26, id: "cal" });
  const level = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
  // A single-hue ramp reads as "more" at a glance; mixing hues would not.
  const ramp = [t.fill, ...[0.3, 0.5, 0.75, 1].map((o) => `${t.blue}" fill-opacity="${o}`)];
  let cells = "", months = "", lastMonth = -1;
  weeks.forEach((w, wi) => {
    const x = X0 + wi * (CELL + GAP);
    const first = new Date(w.contributionDays[0].date + "T00:00:00Z");
    if (first.getUTCMonth() !== lastMonth && wi < weeks.length - 2) {
      lastMonth = first.getUTCMonth();
      if (wi > 0 || first.getUTCDate() <= 7)
        months += `<text x="${x}" y="${Y0 - 12}" fill="${t.tertiary}" style="font-size:11.5px;font-weight:500">${first.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}</text>`;
    }
    cells += `<g class="col" style="animation-delay:${(0.1 + wi * 0.012).toFixed(3)}s">`;
    for (const d of w.contributionDays) {
      const wd = new Date(d.date + "T00:00:00Z").getUTCDay();
      cells += `<rect x="${x}" y="${(Y0 + wd * (CELL + GAP)).toFixed(1)}" width="${CELL}" height="${CELL}" rx="3.5" fill="${ramp[level[d.contributionLevel] ?? 0]}"><title>${d.date}: ${d.contributionCount}</title></rect>`;
    }
    cells += "</g>";
  });
  const dayLabels = [[1, "Mon"], [3, "Wed"], [5, "Fri"]].map(([i, l]) =>
    `<text x="${X0 - 10}" y="${Y0 + i * (CELL + GAP) + 10}" text-anchor="end" fill="${t.tertiary}" style="font-size:11px;font-weight:500">${l}</text>`).join("");
  const legendX = W - 36 - 5 * (CELL + 3) - 34;
  const legend = `<text x="${legendX - 8}" y="${H - 38}" text-anchor="end" fill="${t.tertiary}" style="font-size:11.5px">Less</text>` +
    ramp.map((f, i) => `<rect x="${legendX + i * (CELL + 3)}" y="${H - 48}" width="${CELL}" height="${CELL}" rx="3.5" fill="${f}"/>`).join("") +
    `<text x="${legendX + 5 * (CELL + 3) + 5}" y="${H - 38}" fill="${t.tertiary}" style="font-size:11.5px">More</text>`;
  const chips = [["Current streak", `${current} days`], ["Longest streak", `${longest} days`], ["Total", fmt(cc.contributionCalendar.totalContributions)]];
  let cx = W - 36;
  const chipSvg = chips.reverse().map(([k, v]) => {
    const s = `<text x="${cx}" y="46" text-anchor="end" fill="${t.label}" style="font-size:19px;font-weight:700;letter-spacing:-.3px">${esc(v)}</text><text x="${cx}" y="66" text-anchor="end" fill="${t.tertiary}" style="font-size:11.5px;font-weight:500">${esc(k)}</text>`;
    cx -= 130;
    return s;
  }).join("");
  return svg({
    w: W, h: H,
    title: "Contribution calendar",
    desc: `${cc.contributionCalendar.totalContributions} contributions in the last year. Current streak ${current} days, longest ${longest} days.`,
    defs: p.defs,
    style: `.col{animation:col .6s ${EASE} both}@keyframes col{from{opacity:0}to{opacity:1}}`,
    body: `${p.body}
<text x="36" y="52" fill="${t.label}" style="font-size:19px;font-weight:700;letter-spacing:-.3px">Contributions</text>
<text x="36" y="72" fill="${t.tertiary}" style="font-size:12.5px;font-weight:500">Updated ${esc(updated)}</text>
${chipSvg}
${months}${dayLabels}
${cells}
${legend}`,
  });
}

for (const t of Object.values(THEMES)) {
  writeFileSync(new URL(`overview-${t.name}.svg`, OUT), overview(t));
  writeFileSync(new URL(`languages-${t.name}.svg`, OUT), languages(t));
  writeFileSync(new URL(`calendar-${t.name}.svg`, OUT), calendar(t));
}
console.log(`metrics: ${cc.contributionCalendar.totalContributions} contributions, ${langs.length} languages, streak ${current}/${longest}`);
