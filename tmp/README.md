# Handoff: Amundsen Homestead — farm store

## Overview
A mobile-first farm-store front for **Amundsen Homestead** where customers browse fresh
farm goods, pick a quantity, and reserve for pickup. Norwegian-language UI.

The bundle contains **two visual directions** of the same flow and content — implement whichever
the client picks (or offer both as themes):
- **2a «Tømmer»** — warm "market-stall": dark forest-brown wood background, cream product cards,
  chunky slab typography, tactile **3D press** effects. (Primary — fully documented below.)
- **3a «Rosemåling»** — Norwegian folk-art / Telemark bunad: parchment-cream background, deep
  Telemark-red framing with gold + green accents, inscriptional caps, decorative double borders.
  (Documented in its own section near the end.)

The **2a** direction (below) is described first and in most detail.

The design is **adaptive to how many listings exist**:
- **1 listing** → a large single-product **hero page** (product is the whole home screen,
  reserve directly there).
- **2+ listings** → a **card list** (tap a card → product detail → reserve).

Full flow in both modes: browse → quantity → reserve → **confirmation**. A live "X igjen"
stock counter decrements on each reservation, and sold-out items are disabled.

## About the Design Files
The file in this bundle (`Homestead.dc.html`) is a **design reference created in HTML** — a
working prototype showing intended look and behavior, **not production code to copy directly**.
It is authored in an internal "Design Component" format (custom `<sc-for>`, `<sc-if>`,
`{{ }}` tags and a `Component` logic class); **do not ship that format**.

The task is to **recreate this design in the target codebase's existing environment** (React,
Vue, Svelte, SwiftUI, native, etc.) using its established patterns, component library, and
state management. If no front-end environment exists yet, pick the most appropriate framework
for the project and implement there. Open the HTML file in a browser to see the real thing and
interact with it.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are all
specified below. Recreate the UI pixel-accurately using the codebase's own libraries/patterns.

---

## Screens / Views

Device canvas for the prototype: **392 × 812 px** phone frame (mobile-first). Real
implementation should be responsive; these are the reference proportions.

### 1. Top bar (persistent on every screen)
- Background `#2E2013` (dark bark brown), full width, padding `16px 24px 12px`,
  drop shadow `0 4px 0 rgba(0,0,0,.25)`.
- Left: `🌾 AMUNDSEN` — Alfa Slab One, 17px, color `#E0A63C` (wheat), letter-spacing `.02em`.
- Right: `HOMESTEAD` — monospace, 10px, uppercase, letter-spacing `.12em`, color `#B79361`.

### 2. Home — SINGLE-listing hero (when only 1 product is for sale)
Purpose: put the one product front and center; reserve without leaving the page.
Layout: vertical, padding `22px 22px 30px`, on the dark wood background.
- Eyebrow: `● til salgs nå` — monospace, 11px, uppercase, letter-spacing `.22em`, color `#E0A63C`, centered.
- Product image: height 300px, border-radius 22px, **3D raised** look —
  `box-shadow: inset 0 0 0 3px rgba(255,255,255,.35), 0 10px 0 #C1A578, 0 22px 30px -12px rgba(20,12,5,.55)`.
  (In the prototype it's a striped placeholder labeled `foto: <product>`; use the real photo.)
- Product name: Alfa Slab One, 40px, line-height .98, color `#F3E7D2`, centered,
  text-shadow `0 3px 0 rgba(0,0,0,.35)`.
- Meta row (centered): unit text 13px `#C4A87F` + a status pill (see Status Pills).
- Description: 15px, line-height 1.55, color `#C4A87F`, centered.
- **Reserve panel** (cream card): background `#F3E7D2`, radius 20px, padding 18px,
  3D shadow `0 8px 0 #C9A876, 0 18px 24px -12px rgba(20,12,5,.5)`. Contains:
  - Price: Alfa Slab One, 28px, color `#2E2013`.
  - Quantity stepper (see Stepper).
  - Reserve button (see Buttons): full width, label `RESERVER · <total> kr`.

### 3. Home — MULTI-listing cards (when 2+ products)
Purpose: browse all listings.
- Header block (centered, padding `20px 24px 22px`): eyebrow `— rett fra jorda —`
  (monospace 11px, uppercase, letter-spacing .22em, `#B79361`), then title
  `FERSKE VARER` — Alfa Slab One 36px, `#F3E7D2`, the word "VARER" in `#E0A63C`,
  text-shadow `0 3px 0 rgba(0,0,0,.35)`; subtitle 13px `#C4A87F`.
- Product cards (list, padding `0 22px`): each card is a **horizontal** cream tile,
  `display:flex; gap:14px; padding:12px; margin-bottom:18px`, background `#F3E7D2`,
  radius 18px, **3D**: `box-shadow: 0 7px 0 #C9A876, 0 16px 22px -10px rgba(20,12,5,.55)`.
  - Thumbnail: 88×88px, radius 13px, `inset 0 0 0 2px rgba(255,255,255,.35), 0 3px 0 #C1A578`.
  - Name: Bitter, 700, 19px, `#2E2013`.
  - Unit: 12px, `#9A8259`.
  - Bottom row: price (Bitter 700, 16px, `#2E2013`) + status pill.
  - Whole card is tappable → product detail.
- Footer line: `Takk for at du handler lokalt 💛` — Bitter italic, 15px, `#B79361`, centered.

### 4. Product detail (reached from a card)
- Back button: cream pill `← Butikk`, Work Sans 700 13px, `#2E2013`, `box-shadow 0 4px 0 #C9A876`.
- Image: height 240px, radius 18px, same 3D raised treatment as hero (offset shadow `0 8px 0 #C1A578`).
- Name: Alfa Slab One, 27px, `#F3E7D2`, text-shadow `0 2px 0 rgba(0,0,0,.3)`; unit 13px `#C4A87F`; status pill top-right.
- Description: 15px, line-height 1.55, `#C4A87F`.
- Reserve panel: identical to the hero's cream reserve card (price 26px, stepper, reserve button).

### 5. Confirmation
Centered column, padding `60px 30px`, on dark background.
- Check badge: 82×82px, radius 18px, background `#E0A63C`, glyph `✓` 40px `#2E2013`,
  rotated `-4deg`, 3D shadow `0 8px 0 #A9761E, 0 18px 26px -12px rgba(20,12,5,.6)`,
  entrance animation `popIn`.
- Title: `RESERVERT!` — Alfa Slab One 34px `#F3E7D2`, text-shadow `0 2px 0 rgba(0,0,0,.3)`.
- Body: 14px `#C4A87F`, max-width 250px — "Vi legger det klart. Hent på gården innen 2 dager 💛".
- Summary card (cream, radius 18px, `box-shadow 0 7px 0 #C9A876`): product name (Bitter 700 20px `#2E2013`),
  `Antall: <n>` (13px `#9A8259`), and total (Alfa Slab One 20px `#A9761E`).
- Primary button `TILBAKE TIL BUTIKKEN` (wheat, full width) → returns to home (keeps single/multi mode).

---

## Reusable component specs

### Status pills (live stock)
Rule from stock count `s`:
- `s === 0` → **"Utsolgt"** — bg `#E3D5BF`, text `#8A6A50`.
- `1 ≤ s ≤ 3` → **"Kun {s} igjen"** — bg `#F4E0BE`, text `#9A6516` (amber, low).
- `s > 3` → **"{s} igjen"** — bg `#DDE2BE`, text `#566327` (olive, ok).
Pill style: font-weight 700, 11px (12px on detail/hero), padding `3px 9px` (`4–5px 11px` larger),
border-radius 6px.

### Quantity stepper
- Wrapper on cream panel; buttons 40×40px, radius 12px, background `#2E2013`, glyph `#F3E7D2`, 22px.
- **3D:** `box-shadow: 0 4px 0 #14100A`; on `:active` `transform: translateY(3px); box-shadow: 0 1px 0 #14100A`.
- Value: Bitter 700, 22px, `#2E2013`, min-width 34px, centered.
- Clamp: min 1, max = current stock of the active product.

### Buttons — the "3D press" language
Primary (wheat): background `#E0A63C`, text `#2E2013`, Alfa Slab One 18px, radius 15px, padding 16px.
- Rest: `box-shadow: 0 6px 0 #A9761E, 0 14px 20px -10px rgba(20,12,5,.5)`.
- `:active`: `transform: translateY(4px); box-shadow: 0 2px 0 #A9761E` (button visibly "presses down").
- Transition: `transform .1s ease, box-shadow .1s ease`.
Disabled/sold-out: background `#E3D5BF`, text `#A08A6A`, no shadow, label `UTSOLGT`.
Cards use the same offset-shadow idea with `#C9A876` as the "thickness" color; on hover they
raise (`translateY(-2px)`, bigger offset), on active they press (`translateY(4px)`, smaller offset).

### View-mode toggle (prototype-only helper)
A segmented control ("1 annonse" / "Flere annonser") is included **only to demo** the adaptive
layout. In production the mode is driven by the actual number of active listings, not a manual toggle.

---

## Interactions & Behavior
- **Tap card** → product detail (multi mode only).
- **Back (`← Butikk`)** → return to card list.
- **Stepper − / +** → adjust quantity, clamped to `[1, stock]`.
- **Reserve** → decrement that product's stock by the chosen quantity, record the reservation
  (name, qty, total), navigate to confirmation. If stock would hit 0 it then shows "Utsolgt".
- **Tilbake til butikken** → home, quantity reset to 1.
- **Screen entrance**: `scrIn` — fade + translateY(10px→0) over .35–.4s ease.
- **Confirmation badge**: `popIn` — scale 0.7 → 1.08 → 1 over .5s ease.
- **Press feedback**: every button/card translates down on `:active` with a shrinking offset shadow (the 3D effect). ~100ms.
- **Hover** (pointer devices): cards raise slightly.

## State Management
Per product-flow you need:
- `products`: list of `{ name, price (number, NOK), unit, description, stock }`.
- `screen`: `'home' | 'detail' | 'confirmation'`.
- `activeIndex`: which product is open (0 in single-listing hero mode).
- `qty`: current quantity (int ≥ 1, ≤ active stock).
- `reservation`: `{ name, qty, total }` captured at reserve time (for the confirmation screen).
- Derived: `isSingleListing = products.length === 1` selects hero vs. cards.
- On reserve: `stock -= qty` for the active product (persist server-side in production;
  the "X igjen" counter reflects live remaining stock).

## Design Tokens

Colors
- Dark wood bg: `#33251A` → `#241811` (vertical gradient) with faint 48px plank stripes
  (`repeating-linear-gradient(90deg, rgba(255,255,255,.02) 0 1px, transparent 1px 48px)`).
- Bark (bars/steppers): `#2E2013`; deepest shadow `#14100A`.
- Cream surface: `#F3E7D2`; card "thickness" shadow `#C9A876`; image thickness `#C1A578`.
- Wheat accent: `#E0A63C`; pressed/shadow `#A9761E`; on cream text `#A9761E`.
- Muted browns (text on dark): `#C4A87F`, `#B79361`, `#9A8259`, `#7A6248`.
- Ink (text on cream): `#2E2013`.
- Status olive: bg `#DDE2BE` / text `#566327`. Status amber: bg `#F4E0BE` / text `#9A6516`.
  Status sold: bg `#E3D5BF` / text `#8A6A50`.
- Image placeholder stripes (replace with photos): `#E4D0AE` / `#D6BC90`.

Typography (Google Fonts)
- Display / headings / buttons / price: **Alfa Slab One** (400).
- Product names, quantity value, italic footer: **Bitter** (400/500/600/700 + italic).
- UI / body / labels: **Work Sans** (400/500/600/700).
- Small technical labels & eyebrows: system **monospace** (`ui-monospace`).

Radii: buttons/steppers 12–15px, cards 18px, images 18–22px, panels 20px, pills 6px, top-bar pills 100px.

Shadows / 3D: offset "hard" shadows (`0 Npx 0 <color>`) create thickness; press states reduce
the offset and translate the element down by the same delta. Pair with a soft ambient shadow
(`0 Npx Mpx -Kpx rgba(20,12,5,.5)`).

Motion: `scrIn` (.35–.4s), `popIn` (.5s), press transitions ~.1s ease.

## Assets
- **No raster assets shipped.** All product images are striped placeholders labeled
  `foto: <product name>` — replace with real farm photos (recommended ~1:1 for cards, ~4:3 for hero/detail).
- A logo/wordmark is currently just the text `🌾 AMUNDSEN`. Swap for the real Amundsen Homestead logo when available.
- Icons used: `✓` (confirmation) and `🌾`/`💛` emoji — replace with the codebase's icon set if preferred.

## Sample content (Norwegian, used in the prototype)
Products (name · price NOK · unit · stock · description):
- Ferske egg · 65 · 12-kartong · 12 · "Frilandsegg samlet i morges. Store, med dyp oransje plomme og fast hvite."
- Flytende honning · 120 · 500 g glass · 4 · "Sommerhonning fra egne kuber. Mild, blomstrete og aldri varmebehandlet."
- Nypoteter · 55 · 2 kg kurv · 8 · "Nygravde mandelpoteter. Tynt skall og en naturlig søt, smøraktig smak."
- Bringebærsyltetøy · 95 · 400 g glass · 2 · "Kokt på håndplukkede bær samme dag. Lite sukker, mye bær."
- Surdeigsbrød · 70 · hel · 0 · "Bakt i vedovn på 24 timers heving. Sprø skorpe, saftig innmat." (sold-out example)

Key copy: eyebrow `— rett fra jorda —` / `● til salgs nå`; title `FERSKE VARER`; reserve `RESERVER · {total} kr`;
confirmation `RESERVERT!` + "Vi legger det klart. Hent på gården innen 2 dager 💛"; footer
"Takk for at du handler lokalt 💛".

---

# Alternative direction: 3a «Rosemåling» (Norwegian folk-art / Telemark bunad)

Same content, screens, flow, state model, and status logic as 2a — only the **visual skin
differs**. It swaps the wood-and-3D language for a **flat, framed folk-art** language inspired
by rosemaling, hardingfele rosing, and the Telemark bunad (red + gold + green on parchment).
The single/multi adaptive-home behavior is not wired into this variant in the prototype, but the
same rule should apply in production.

## Look & feel
- **Background**: parchment cream `#F2E7CE` (flat — no wood texture, no 3D offset shadows).
- **Structural color** (frames, top bar, borders, back button, stepper outline): deep Telemark
  red `#8E2323`.
- **Accents**: gold/ochre `#C8912E`, barn/embroidery red `#A23B2C` (price + primary button),
  pine green `#3E5D42` / `#4E7A52` (used sparingly, e.g. confirmation seal ring, badge dots).
- **Phone frame**: concentric rings `0 0 0 8px #8E2323, 0 0 0 10px #F2E7CE, 0 0 0 12px #C8912E`
  (red / cream / gold) — a painted-frame look.

## Typography
- Headings / product names / price / buttons: **Marcellus SC** (inscriptional small caps).
- Body, units, subtitles: **Spectral** (often *italic* for a hand-lettered feel).
- Status pills, small labels: **Work Sans**. Technical placeholder labels: monospace.

## Screen specifics (deltas from 2a)
- **Top bar**: solid `#8E2323`, wordmark `🌾 Amundsen` in Marcellus SC gold `#EDD9A8`, right
  `HOMESTEAD` monospace tan `#E3B98C`. Directly beneath: a striped **rosemaling trim placeholder**
  band (`#9C3232`/`#872A2A` stripes, gold hairlines top/bottom, label `bord: rosemaling-ranke`) —
  replace with a real rosemaling border artwork.
- **Decorative divider** (used under the shop title and on the confirmation): centered row —
  short gold rule, gold **diamond** (`9×9px` rotated square), red **dot** (`7×7px` circle), gold
  diamond, gold rule. This diamond+dot motif is the folk signature; reuse it as a section marker.
- **Product cards**: flat cream `#F8F0DD`, **double frame** = `1.5px solid #8E2323` border +
  `box-shadow: inset 0 0 0 3px #F8F0DD, inset 0 0 0 4px rgba(200,145,46,.55)` (cream gap, then gold
  inner hairline), radius 7px. Hover: gold inner line brightens + soft red-tinted lift. Thumbnail
  84×84px, radius 4px, `inset 0 0 0 2px #8E2323`.
- **Status pills**: flat tint + **1px `#8E2323` (Telemark-red) border**, radius 4px, Work Sans 600.
  Same tints/text as 2a's status colors (olive ok, ochre low, muted-red sold).
- **Detail image**: triple inset frame `inset 0 0 0 3px #8E2323, inset 0 0 0 6px #F2E7CE, inset 0 0 0 7px rgba(200,145,46,.6)`.
- **Price row on detail**: bracketed by gold hairlines top and bottom; price in Marcellus SC `#A23B2C`.
- **Stepper**: cream buttons, `1.5px #8E2323` border, ink glyph; active → `#E7DCC2` fill (no 3D translate).
- **Primary button (Reserve)**: barn red `#A23B2C`, cream text, Marcellus SC, radius 7px, subtle
  inner highlight `inset 0 1px 0 rgba(255,255,255,.18)`; hover `#8A3226`; active scale .98.
- **Confirmation seal**: circular `#8E2323` badge, gold `✓`, concentric rings
  `0 0 0 4px #F2E7CE, 0 0 0 6px #C8912E, 0 0 0 8px #3E5D42` (cream / gold / green). Title
  `Reservert!` in Marcellus SC, followed by the diamond+dot divider.

## Placeholders to replace with real craft artwork
- The `bord: rosemaling-ranke` strip → a genuine rosemaling border/ranke illustration.
- All `foto: <product>` striped fields → real product photography.
- Consider a hardingfele-inspired mother-of-pearl/black rosing motif as an optional header crest.

## 3a design tokens (additions to the shared token list)
- Telemark red `#8E2323`; embroidery/barn red `#A23B2C` (+ hover `#8A3226`).
- Gold/ochre `#C8912E`; on-red gold text `#EDD9A8`; on-red tan `#E3B98C`.
- Pine green `#3E5D42` / `#4E7A52`. Parchment `#F2E7CE`; card cream `#F8F0DD`.
- Fonts: Marcellus SC, Spectral (add to the Alfa Slab One / Bitter / Work Sans set).
- Radii here are small (4–7px) and flat — no offset "3D" shadows (that language belongs to 2a only).

---

## Files
- `Homestead.dc.html` — the full interactive design reference containing **both** the 2a «Tømmer»
  and 3a «Rosemåling» directions side by side (open in a browser; each is a working
  browse → reserve → confirm flow). In 2a, use the "1 annonse / Flere annonser" toggle to see the
  adaptive single-listing vs. multi-listing home layouts.
