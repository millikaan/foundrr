# Mission Control — Design System (derived from Aqua)

**For: Claude Code.**
**Goal:** One design system, derived from Aqua's visual language, applied across **both** surfaces:
- the **landing page** (Aqua's airy, light public face), and
- the **Mission Control dashboard** (Aqua's dark side, operationalized).

This file is the single source of truth. The landing-page brief and the product build brief both defer to it. Build the landing page to the **Marketing expression** and build/refactor the dashboard to the **Dashboard expression** so they are unmistakably the same family.

> **The key principle:** apply Aqua's *system* (restraint, single accent, type discipline, hairline components, spacing rhythm) — not Aqua's *marketing layout*. A dense real-time tool needs scannability and legible status, so the dashboard keeps its data density and semantic colors while wearing Aqua's discipline. Aqua already runs light *and* near-black sections; the dashboard simply lives on the dark side full-time.

---

## 1. Foundations (shared tokens)

### Neutrals — the backbone
```
--void      #0d1014   dashboard base / Aqua dark sections
--void-2    #0f1318   raised dark surface
--canvas    #f6f7f9   marketing light canvas
--canvas-2  #ffffff   light raised surface
--ink       #1b2128   text on light
--line-d    #232c37   hairline on dark
--line-l    #e6e8ec   hairline on light
--text      #e6eaf0   primary text on dark
--muted     #8a95a3   secondary
--faint     #5b6573   tertiary / labels
```

### Accent — one color, used sparingly (Aqua's blue → our amber)
```
--signal    #f2a23c   THE accent: live/active, primary CTA, focal glow
--signal-gl rgba(242,162,60,.55)   glow only
```
Use amber with Aqua-level restraint: on marketing, 2–3 appearances on the whole page (CTA pill + one focal glow). On the dashboard, amber means **"live / primary action"** and nothing else.

### Semantic set — dashboard only, used only where meaning requires
An ops tool can't be pure monochrome; status must read instantly. These are functional, not decorative — never use them as styling.
```
--cool   #56b6c2   interactive / links / port numbers
--ok     #74c69d   success / committed / healthy
--alert  #e5645a   stop / error / destructive
```
The marketing site does **not** use the semantic set — it stays monochrome + amber, true to Aqua.

### Type
- **Display / headings:** a humanist grotesk at **light weight (300–400)** — Inter, Geist, or General Sans. The large + thin headline is Aqua's signature; carry the *light weight* into every heading on both surfaces.
- **Data / code / numerics:** **JetBrains Mono.** All ports, counts, ids, timestamps, paths, terminal, and stat numbers. Shared across both surfaces.
- **Utility labels:** small uppercase, letter-spaced `~1.2px`, `--faint` — panel titles, eyebrows, stat captions.

| Role | Font | Weight | Notes |
| --- | --- | --- | --- |
| Marketing hero | humanist sans | 300 | oversized, airy |
| Section / panel title | humanist sans | 300–400 | light, never bold |
| Utility label | humanist sans | 600 | tiny, uppercase, tracked |
| Data / numbers | JetBrains Mono | 500–600 | ports, counts, ids |
| Body / subtext | humanist sans | 400 | muted, restrained |

### Spacing, radius, line
- Spacing scale (px): `4 · 8 · 12 · 16 · 24 · 40 · 64 · 96`. Marketing leans to the large end (Aqua's air); dashboard leans to `8–16` but keeps breathing room via hairlines, not crowding.
- Radius: `--r 10px` cards, pill (`999px`) buttons, `8px` controls.
- Separation: prefer **1px hairlines** (`--line-d` / `--line-l`) over heavy borders or shadows. Aqua separates with whitespace and hairlines, almost never with drop shadows.

### Motion
Restrained. Section fade/translate-in on the marketing page; a single breathing pulse on live elements. Honor `prefers-reduced-motion` everywhere — kill reveals and pulses when set.

---

## 2. Two expressions

### Marketing expression (landing page)
Canvas `--canvas` / near-black `--void` sections alternating. Oversized thin headlines, monochrome + amber only, generous whitespace, product shown in clean dark frames. (Full section spec lives in the landing-page brief — that brief now inherits these tokens.)

### Dashboard expression (the product)
The dashboard lives on `--void`. It adopts Aqua's restraint, type system, hairline components, and spacing rhythm — while keeping the density and semantic status colors a monitoring tool requires. The result: the dashboard looks like Aqua's dark sections came alive with real data.

---

## 3. Applying the system to the dashboard (do this)

Refactor every dashboard surface to these specs. Where the existing telemetry-console build already matches, keep it; where it's heavier/noisier than Aqua, lighten it.

**Global**
- Background `--void`. Separate regions with 1px `--line-d` hairlines, not boxes or shadows.
- More whitespace than a typical dashboard: card padding `13–16px`, generous gaps. Bring Aqua's air without losing density.
- Headings/section titles in light-weight humanist sans; all numbers/ids/ports in JetBrains Mono.

**Header (telemetry strip)**
- Wordmark `◆ MISSION CONTROL` (light weight) + hostname in `--faint` mono. Hairline bottom only.
- Live metrics: the *value* in mono; only the **live-agents** metric tinted `--signal`. Everything else neutral. One faint amber sweep line under the header is the single permitted flourish.

**Agent cards**
- Soft rounded card, `--panel` fill, 1px `--line-d`. Active card carries a thin `--signal` left edge + glow; idle cards are fully neutral. The amber only appears when the machine is actually working — state is encoded in color, Aqua-style.
- Project name in **mono** (it's an identifier). Status pill = breathing amber pulse when active, `--faint` when idle. Current-activity line in `--cool`. Stat row (files/tools/cmds/subagents/prompts/uptime): numbers mono, captions tiny uppercase `--faint`. Achievements list: hairline-topped, mono, with a small `--ok` marker.

**Server rows**
- Same card language. Port in mono `--cool` (semantic = interactive). Framework label in light sans, command truncated in `--faint` mono. Controls = small pill **ghost** buttons; primary action amber-outlined, destructive reveals `--alert` on hover only.

**Terminal**
- Pure `--void` background, JetBrains Mono, **amber cursor** — this literally is an Aqua dark frame. Tab chrome: minimal, hairline, active tab tinted `--signal`. No heavy borders.

**Buttons & controls (shared with marketing)**
- Default: pill, transparent fill, 1px `--line` border, neutral text; hover lifts border to `--cool`.
- Primary: amber-outlined pill, used sparingly (the one main action per view).
- Destructive: neutral until hover, then `--alert`.

**Empty states**
- Aqua-style: centered, airy, one light-weight line + a single amber pill CTA. No mock rows ever.

---

## 4. Definition of done
- Open the landing page and the dashboard side by side: same type system, same single-amber discipline, same hairline-and-whitespace construction, same restraint. Clearly one product.
- The dashboard stays fully scannable and legible at a glance — status reads instantly, density intact. Aqua's discipline made it *calmer*, not less functional.
- Amber appears only for live/primary across the whole product. Semantic colors appear only where meaning demands.
- `prefers-reduced-motion` fully respected; AA contrast on every text token.

## 5. Don't
- Don't import Aqua's airy *layout* into the dashboard — import its *system*. Density stays.
- Don't let amber become decorative, and don't add a second decorative accent. One accent.
- Don't make headings bold — the light weight is the signature on both surfaces.
- Don't separate with drop shadows or heavy borders where a hairline + whitespace will do.
- Don't drop the dashboard's semantic status colors in the name of monochrome purity — legibility wins.
