# Masyarakat Baru: Build Plan

> **What this is:** the single source of truth for building **Masyarakat Baru**, a static website that works as an interactive proposal (cold email) to [Malaka Project](https://www.youtube.com/@MalakaProjectid).
> **How to use it:** read this before starting any work. Tick the checkboxes as milestones land. Record changes of direction in the [Decision Log](#13-decision-log) instead of silently rewriting sections.

---

## Table of Contents

1. [Goal and Success Criteria](#1-goal-and-success-criteria)
2. [The Pitch in One Page](#2-the-pitch-in-one-page)
3. [Scope](#3-scope)
4. [Tech Stack](#4-tech-stack)
5. [Information Architecture](#5-information-architecture)
6. [Design System](#6-design-system)
7. [Feature Specs](#7-feature-specs)
   - 7.1 [Landing Page (the Proposal)](#71-landing-page-the-proposal)
   - 7.2 [Bahasa Bayi Policy and Economic Calculator](#72-bahasa-bayi-policy-and-economic-calculator)
   - 7.3 [Kuis Sesat Pikir (Daily Fallacy Quiz)](#73-kuis-sesat-pikir-daily-fallacy-quiz)
   - 7.4 [Kamus Sesat Pikir (Fallacy Cheat Sheet)](#74-kamus-sesat-pikir-fallacy-cheat-sheet)
   - 7.5 [Social Issues Impact Simulator](#75-social-issues-impact-simulator)
8. [Content and Data Layer ("CMS-ready")](#8-content-and-data-layer-cms-ready)
9. [Project Structure](#9-project-structure)
10. [Quality Bar](#10-quality-bar)
11. [Milestones and Roadmap](#11-milestones-and-roadmap)
12. [Outreach Package (Cold Email)](#12-outreach-package-cold-email)
13. [Decision Log](#13-decision-log)
14. [Risks and Mitigations](#14-risks-and-mitigations)
15. [Open Questions](#15-open-questions)
16. [Working Conventions](#16-working-conventions)
17. [Action Items (later)](#17-action-items-later)

---

## 1. Goal and Success Criteria

**Goal:** show Malaka Project's founders a working prototype of the "Malaka Interactive Suite" rather than describing it. The site should make the case that their audience of 1.38M+ can move from passive viewing to active participation, and that I am the person to build it.

**The prototype succeeds if:**

- [ ] A founder can open the link on a phone and use all three tools within 3 minutes without instructions.
- [ ] Every tool clearly maps to an existing Malaka series (Bahasa Bayi, The Court / Sabda PS, investigative documentaries).
- [ ] Content reads as **neutral, sourced and respectful**, so it would not embarrass Malaka if shared publicly.
- [ ] The architecture visibly supports the production path in the deck: content lives in JSON that a headless CMS can replace later.
- [ ] Lighthouse scores of at least 90 for Performance, Accessibility, Best Practices and SEO on mobile.
- [ ] The cold email gets a reply, or a meeting.

**Non-goals for the prototype:** user accounts, a real backend, a real CMS, payments or donations handled on-site, or production-grade economic modelling.

---

## 2. The Pitch in One Page

Summarised from `Malaka_Project_Overview.pdf` ("The Next Era of Malaka"):

| Project | Core intent | Target segment | Associated series | Cognitive skill | Accent |
|---|---|---|---|---|---|
| Bahasa Bayi Calculator | Inform | Pragmatists | Bahasa Bayi / Danantara | Economic literacy | Teal |
| Fallacy Quiz and Cheat Sheet | Sharpen | Debaters | The Court / Sabda PS | Logical reasoning | Gold |
| Impact Simulator | Empathize | Activists | Investigative docs (Rantau Bakula) | Empathy and action | Pink |

- **Narrative:** "The Limit of the Play Button": passive consumption (1.38M+ listeners) becomes active participation (Masyarakat Baru).
- **Funnel:** YouTube engagement (Views, then Likes, then Subs) feeds the interactive web (Calculate, then Simulate, then Act), which leads to civic action.
- **KPIs:** Daily Active Thinkers (quiz streaks), Scenarios Completed (simulator), Conversion to Civic Action (external action links clicked).
- **Production roadmap pitched to Malaka:** Phase 1 (months 1–2) Daily Fallacy Quiz, Phase 2 (months 3–4) Bahasa Bayi Calculator, Phase 3 (months 5–6) Impact Simulator.
- **Production architecture pitched:** Next.js/React frontend, a headless CMS so the editorial team can update content without code, and serverless/edge hosting.

> This repo is a **compressed prototype** of all three phases. The six-month roadmap is what we sell; this site proves it can be done.

---

## 3. Scope

### In scope (MVP)

| # | Feature | Source idea |
|---|---|---|
| F0 | Landing page that tells the pitch and links to each tool | PDF |
| F1 | Bahasa Bayi Policy and Economic Calculator | Idea 1 |
| F2 | Kuis Sesat Pikir: daily fallacy quiz with streak and share | Idea 3, Option A |
| F3 | Kamus Sesat Pikir: searchable fallacy cheat sheet | Idea 3, Option B |
| F4 | Impact Simulator, Scenario A: "18 Tahun di Rantau Bakula" (citizen in a land dispute, empathy) | Idea 2 and PDF |
| F5 | Impact Simulator, Scenario B: "Tambang di Desa Kami" (village leader facing a mining trade-off) | Idea 2 |
| F6 | Privacy-friendly analytics events that mirror the deck's KPIs | PDF |

### Stretch (only after MVP is done)

- Quiz practice mode (unlimited random questions).
- Simulator path visualiser (the decision tree with the user's route highlighted, as on slide 8).
- English language toggle.
- A Decap CMS demo running on the JSON content, to show "the editorial team can update this without code."
- Generated per-result OG images for sharing.

### Out of scope

Login, comments, leaderboards, server-side storage, real donation processing.

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) with `output: 'export'`** | Matches the stack pitched in the deck, so the prototype *is* the proposed architecture. Static export means free hosting and no server. |
| Language | TypeScript (strict) | Typed content schemas, so calculator and engine bugs show up at compile time. |
| Styling | Tailwind CSS v4 | Fast iteration; design tokens live in `src/app/globals.css` (`@theme`). |
| Charts | Recharts | Declarative React charts, responsive, good enough for bar, line and donut charts. |
| Content validation | zod | Validate every JSON content file in tests. This is the seam where a CMS plugs in later. |
| Search | Plain normalised `includes`, with Fuse.js only if needed | Fewer than 30 fallacies does not need a search library. |
| Persistence | `localStorage`, wrapped in try/catch | Streaks, quiz history and simulator progress. No backend. |
| Unit tests | Vitest | Pure logic in `src/lib`. |
| E2E smoke | Playwright | One happy-path test per route. |
| Analytics | Umami Cloud or Plausible (cookieless) | No consent banner needed; custom events map to KPIs. |
| Hosting | **GitHub Pages (temporary)**, then Vercel or similar | Pages is free and already next to the repo. It serves under `/masyarakat-baru/`, handled by the `BASE_PATH` env var. Move later for preview URLs per PR and a cleaner URL (see [Action Items](#17-action-items-later)). |
| CI | GitHub Actions | lint, typecheck, test, build on every push. |
| Font | Plus Jakarta Sans (headings and body), JetBrains Mono (numbers) | Plus Jakarta Sans was designed in Indonesia, which is a small and meaningful touch. |

**Coming from Go:** keep business logic in plain, pure TypeScript functions in `src/lib` (calculator math, daily seed, streak and scenario engine). Treat React components like Go handlers: thin, with logic delegated to pure functions you can unit test.

---

## 5. Information Architecture

The UI language is **Bahasa Indonesia** (Malaka's audience). Code, comments and this doc are in English.

| Route | Page | Feature |
|---|---|---|
| `/` | Landing page: the proposal | F0 |
| `/bahasa-bayi` | Policy and Economic Calculator | F1 |
| `/kuis-sesat-pikir` | Daily fallacy quiz | F2 |
| `/kamus-sesat-pikir` | Fallacy cheat sheet (`#<slug>` deep links) | F3 |
| `/simulator` | Scenario picker | F4, F5 |
| `/simulator/rantau-bakula` | Scenario A | F4 |
| `/simulator/tambang` | Scenario B | F5 |
| `/tentang` | About this prototype, the builder, contact, disclaimer, data sources | F0 |

**Global navigation:** logo ("Masyarakat Baru"), the three tool links with their accent dots, and a "Tentang" link. On mobile, use a bottom tab bar, because most of the audience is on phones.

**Global footer disclaimer (required on every page):**
> *Prototipe konsep independen untuk diajukan kepada Malaka Project. Tidak berafiliasi dengan, atau didukung oleh, Malaka Project.*

---

## 6. Design System

Derived from the deck's visual language.

**Mood:** "ambient dark mode", blueprint grid, frosted-glass cards, high contrast, minimal text.

### Color tokens (CSS variables in `src/app/globals.css`, mapped via `@theme`)

| Token | Use | Starting value (tune for contrast) |
|---|---|---|
| `--bg` | Page background (charcoal) | `#16191d` |
| `--surface` | Glass card | `rgba(255,255,255,0.06)` + `backdrop-blur` |
| `--border` | Card and grid lines | `rgba(255,255,255,0.10)` |
| `--text` / `--text-muted` | Body text | `#f2f3f5` / `#a3a9b3` |
| `--accent-gold` | Primary CTA, quiz | `#e8c547` |
| `--accent-teal` | Calculator | `#7fd3dc` |
| `--accent-pink` | Simulator | `#d26fa6` |
| `--good` / `--bad` | Correct/wrong, positive/negative deltas | Pick values that are colour-blind safe and always pair them with icon and text |

- Dark-first. A light theme is optional and is a stretch goal.
- A faint blueprint grid background (SVG pattern, `opacity ~0.04`).
- Cards: `rounded-2xl`, 1px border, glass blur, and a 3px accent bar on top (as on the deck's suite cards).
- Numbers use a mono font with tabular figures, so slider readouts do not jitter.
- Motion: subtle (150–250ms). Respect `prefers-reduced-motion`.
- Imagery for the simulator: grayscale photojournalism style. Use **only** images with a clear license (Unsplash or Pexels, or ones Malaka provides later). Credit every image.

### Shared components

`Card`, `AccentBar`, `Button` (primary/ghost), `Slider` (accessible, with value readout), `Select`, `Toggle`, `Tag`, `StatTile`, `Meter`, `Accordion`, `ShareButton` (Web Share API with clipboard fallback), `SourceNote` (a small "Sumber" link), `Disclaimer`.

---

## 7. Feature Specs

### 7.1 Landing Page (the Proposal)

This is the page the cold email links to, so it must pitch quickly.

**Sections, in order:**

1. **Hero:** "Dari Penonton Menjadi Warga" (from viewers to citizens), a one-line pitch, and a CTA to "Coba sekarang" that scrolls to the tools.
2. **The Limit of the Play Button:** passive vs active, using the 1.38M+ figure. Verify the current subscriber count before sending.
3. **Three tool cards:** accent-coloured, each with a one-line value prop and the matching Malaka series. Each card links to its live tool.
4. **Activation Matrix:** the table from section 2.
5. **Consumption-to-Action funnel:** a simple SVG curve with the three KPIs.
6. **Roadmap:** the three phases (months 1–6).
7. **Architecture:** Next.js, headless CMS and edge, with the note "this prototype already runs on this stack."
8. **About me and CTA:** a short bio, links to GitHub and LinkedIn, and a "Mari ngobrol" button (mailto or Cal.com link).

**Acceptance:** the hero and tool cards are visible within the first two mobile screens. Every tool card links to a working tool.

---

### 7.2 Bahasa Bayi Policy and Economic Calculator

**Tagline:** *"Membuat makroekonomi jadi mikro-personal."* (Making macroeconomics micro-personal.)

Three tabs, each usable on its own:

#### Tab 1: "Angka Raksasa, Bahasa Bayi" (big number translator)

- Pick a preset big figure, or type your own. Presets: total APBN spending, the Danantara asset figure, and a flagship programme budget (for example Makan Bergizi Gratis).
- Output:
  - Per citizen: per year, per month and per day.
  - Per household (using the average household size from BPS).
  - **Bahasa Bayi analogies:** "= X porsi mie ayam per orang", "= Y tahun gaji UMR", "= Z sekolah dasar". Analogy unit prices live in `assumptions.json`, each with a source.
- Every preset shows a `SourceNote` (the official document and its year).

#### Tab 2: "Ke Mana Pajakmu?" (where does your tax go)

- **Demographic toggles** (from deck slide 5): monthly income bracket, marital status and dependents (affects PTKP), and region (affects UMP/UMK comparisons and the analogy price level).
- **Computes:**
  - Estimated annual PPh 21, using the progressive brackets from UU HPP (5% / 15% / 25% / 30% / 35%) after PTKP. Verify brackets and PTKP against the current regulation and store them in `assumptions.json`.
  - Estimated VAT paid, from a user-adjustable "share of income spent on taxable goods" multiplied by the current PPN rate. Verify the effective rate.
  - The total, split across APBN spending functions by the current allocation shares. Shown as a donut chart and a list such as "Rp 412.000 untuk pendidikan".
- **Output copy example:** *"Dari pajakmu tahun ini, sekitar Rp X membantu membiayai sekolah dan Rp Y untuk subsidi energi."*

#### Tab 3: "Jadi Menkeu Sehari" (finance minister for a day: the trade-off simulator)

- **Scenario sliders** (deck slide 5): reallocate spending across categories (education, health, social protection, energy subsidies, infrastructure, defence, Danantara/investment, debt interest is locked), plus levers for the PPN rate and the energy subsidy level.
- **Constraints shown live:**
  - A deficit meter against the **3% of GDP legal cap**. It turns red and explains the rule when exceeded.
  - Mandatory spending floors (for example 20% for education, as mandated) are flagged when violated.
- **Real-time outputs:**
  - Per-citizen change by category (bar chart, before vs after).
  - Indicator cards: inflation pressure, public service coverage and household disposable income. Each shows a direction and rough magnitude (for example "↑ sedang"), **not** a precise forecast.
  - "Bahasa Bayi" summary sentence: *"Kamu memindahkan Rp 50 T dari subsidi energi ke kesehatan: itu ~Rp 180.000 per orang per tahun, dan harga BBM berpotensi naik."*
- **"Bagaimana kami menghitung?" drawer:** lists every coefficient and assumption with its source. Honesty is a feature.
- **Shareable state:** slider values are encoded in URL query params, so "Lihat skenarioku" links reproduce the scenario. This needs no backend.

#### Model rules (non-negotiable)

- All math lives in `src/lib/calculator/*.ts` as pure functions, with unit tests.
- All numbers (budget figures, population, tax brackets, coefficients, analogy prices) live in `src/content/budget.json` and `src/content/assumptions.json`, each with `source`, `sourceUrl` and `year`.
- The UI always labels the model as **"Simulasi edukatif, bukan proyeksi resmi."** (educational simulation, not an official projection).
- Coefficients for indirect effects (inflation and so on) are simple and explicit (linear, with a stated elasticity). They must be explained, not hidden.

#### Data to gather (checklist)

- [ ] APBN (latest enacted year): total spending, revenue, deficit and the breakdown by function. Source: Kemenkeu (Nota Keuangan / APBN Kita).
- [ ] Population and average household size. Source: BPS.
- [ ] GDP (nominal), for the deficit percentage. Source: BPS / Kemenkeu.
- [ ] PPh 21 brackets, PTKP values and the current PPN rate. Source: UU HPP and later regulations.
- [ ] Danantara headline figures as explained in Malaka's Bahasa Bayi episode, plus the official source.
- [ ] Flagship programme budgets (for example MBG). Source: Kemenkeu / Bappenas.
- [ ] UMP by province (for region toggles). Source: Kemnaker.
- [ ] Analogy prices (mie ayam, school construction cost and so on), with a source or clearly stated estimate.

**Acceptance:** sliders update charts with no visible lag on a mid-range Android phone. Every displayed number traces to a source or an explained assumption. Unit tests cover the tax bracket math and the per-capita conversions.

---

### 7.3 Kuis Sesat Pikir (Daily Fallacy Quiz)

**Tagline:** *"30 detik sehari untuk berpikir lebih jernih."* (30 seconds a day to think more clearly.)

**Flow:**

1. Open the page. Today's set has **3 statements**, matching the deck's "3/3 Correct" mock. The count is a config constant.
2. Each statement is shown as a realistic public comment (for example a netizen comment on the APBN, or a debate quote), with a context label.
3. Pick one of 3 options: the correct fallacy and 2 distractors. "Argumen Valid" can be the correct answer sometimes, so users don't learn that every statement is a fallacy.
4. Instant feedback: correct or wrong, plus a **2-sentence explanation** (why it is a fallacy, and how to spot it) and a link to the fallacy's card in the Kamus.
5. Result screen: score, 🔥 streak, a countdown to tomorrow's set, and **Share**.

**Daily selection:** deterministic, so no backend is needed.

```ts
// Day index in Asia/Jakarta (WIB, UTC+7), so the set changes at local midnight.
const day = daysSinceEpochInWIB(now);
const set = pickN(pool, QUESTIONS_PER_DAY, seed(day)); // seeded shuffle, no repeats within the cycle
```

**Streak logic** (in `localStorage`, all pure functions with tests):

- Completing today's set when the last completion was yesterday adds 1 to the streak.
- If the last completion was today, nothing changes (the user can't replay for points).
- If there's a gap of more than one day, the streak resets to 1.
- If storage is unavailable, the quiz still works and the streak UI is hidden.

**Share text** (Wordle-style, no spoilers):

```
Kuis Sesat Pikir #128 🧠
🟩🟩🟥  2/3 · 🔥 5 hari
aliflazuardi.github.io/masyarakat-baru/kuis-sesat-pikir
```

**Content:** a pool of **at least 21 items** (one week of 3 per day), with 30 as the target. See the schema in §8.

**Acceptance:** the same set shows for everyone on the same WIB date. The streak survives reloads. Sharing works via the Web Share API on mobile and via the clipboard on desktop.

---

### 7.4 Kamus Sesat Pikir (Fallacy Cheat Sheet)

**Tagline:** *"Contekan untuk debat di kolom komentar."* (A cheat sheet for comment-section debates.)

- A grid of fallacy cards: Indonesian name, English name, and a category tag.
- **Categories:** Serangan Personal (personal attack), Pengalihan (distraction), Logika Keliru (faulty logic), Manipulasi Emosi (emotional manipulation).
- **Search bar:** matches name, alias and definition. It ignores case and accents and also matches English names.
- **Tag filter chips**, which combine with search.
- Clicking a card expands it as an accordion on mobile, or a modal on desktop, showing:
  - Definition (1–2 sentences)
  - Example from Indonesian public discourse (generic, no real named people)
  - "Cara Menanggapi" (how to counter it)
  - Related fallacies
  - "Uji dirimu" (test yourself), linking to the quiz
- Deep links: `/kamus-sesat-pikir#ad-hominem` opens that card. Quiz explanations link here.
- **Starting set (about 18):** Ad Hominem, Straw Man, Slippery Slope, False Dilemma, Whataboutism, Red Herring, Appeal to Authority, Appeal to Emotion, Bandwagon (Argumentum ad Populum), Hasty Generalization, Post Hoc, Circular Reasoning, Tu Quoque, Loaded Question, No True Scotsman, Cherry Picking, Anecdotal Evidence, Burden of Proof.

**Acceptance:** search results update as you type. Every quiz `fallacyId` resolves to a card (enforced by a test). Each card has a stable `#slug` link.

---

### 7.5 Social Issues Impact Simulator

**Tagline:** *"Dari kisah yang didengar, menjadi pengalaman yang dirasakan."* (From stories heard to experiences lived.)

#### Engine (shared by all scenarios)

A data-driven branching narrative. Scenarios are JSON files; the engine is pure TypeScript.

- **Nodes:** `scene` (text, optional image, choices) or `ending` (outcome, reflection, links).
- **Meters** are declared per scenario. Examples: *Dana* (money), *Waktu* (time), *Kepercayaan Warga* (community trust), *Lingkungan* (environment), *Kesejahteraan* (wellbeing).
- **Choices:**
  - `effects`: meter deltas.
  - Optional `requires`: a meter threshold. If it isn't met, the choice is shown disabled with a reason, for example "Dana tidak cukup untuk menyewa pengacara". Disabled options are part of the empathy lesson.
  - Optional `outcomes`: weighted probabilistic branches (the deck's "data-backed outcome probabilities"). The probability is shown on screen, for example "~30% kasus serupa berhasil di pengadilan". It cites a source or is labelled as an estimate.
- **Seeded RNG:** pass a seed, so a run can be replayed and tested.
- **Progress** is saved in `localStorage`, so a reload resumes the run.

#### Scenario A: "18 Tahun di Rantau Bakula" (citizen perspective, empathy)

Based on the deck's slide 8 tree:

```
Start: 18-year land dispute in Rantau Bakula
├── Pursue legal action (costly) ──► Bureaucratic delay, financial strain
└── Seek community mediation (risky)
    ├── ──► Bureaucratic delay, financial strain
    └── Media exposure (high visibility)
        ├── Outcome: partial recognition, continued uncertainty
        └── Outcome: public pressure, potential retaliation
```

- Expand to about 12–20 nodes, with 3–4 distinct endings.
- Ground it in **publicly reported facts** from Malaka's investigative coverage. Where details are unknown or sensitive, fictionalise and label clearly: *"Skenario ini terinspirasi kisah nyata; nama dan detail telah disederhanakan."* (Inspired by a true story; names and details simplified.) Never put words in real people's mouths.

#### Scenario B: "Tambang di Desa Kami" (local leader perspective, trade-off)

- The user plays a *kepala desa* (village head). A company offers a mining concession.
- Trade-offs: village revenue and jobs now vs water quality, farmland, health and social cohesion later. Show turns as years passing (Year 1, Year 3, Year 10) so long-term costs surface after short-term gains.
- 3–4 endings that are not simply "good" or "bad". Each shows its winners and losers.

#### End screen (the "Conversion Engine")

1. The outcome narrative, a recap of the meters, and the path taken. A visual tree is a stretch goal.
2. **"Kisah aslinya"** (the real story): a link to the relevant Malaka episode(s).
3. **"Ambil Tindakan"** (take action): curated external links, for example Kitabisa campaigns, legal aid organisations (LBH), or environmental NGOs. **Every link is verified as legitimate before launch** and stored in the scenario JSON. The click is tracked as the KPI event.
4. Buttons: "Main lagi dengan pilihan berbeda" (replay with different choices) and share.

**Validation (`scenario.test.ts`, run against every scenario file):**

- Every `next` and `outcomes[].next` resolves to an existing node.
- Every node is reachable from `start`.
- Every path terminates at an `ending` (no dead ends, no unintended cycles).
- Outcome weights sum to 1.
- Every meter referenced is declared.

**Acceptance:** both scenarios are playable start to finish on mobile in about 3–5 minutes. Validation tests pass. Every action link is verified.

---

## 8. Content and Data Layer ("CMS-ready")

All editorial content lives in `src/content/` as JSON and is validated with zod schemas in `src/content/schema.ts`. Components never import JSON directly. They call loader functions in `src/lib/content.ts`. **This loader is the single seam to replace with a headless CMS fetch later**, which is the deck's "editorial team updates without writing a line of code."

### Schemas (sketch)

```ts
// fallacies.json
Fallacy = {
  slug: string;              // "ad-hominem"
  nameId: string;            // "Serangan Pribadi"
  nameEn: string;            // "Ad Hominem"
  aliases: string[];
  category: "serangan-personal" | "pengalihan" | "logika-keliru" | "manipulasi-emosi";
  definition: string;
  example: string;
  counter: string;           // "Cara Menanggapi"
  related: string[];         // slugs
}

// quiz.json
QuizItem = {
  id: string;
  context: string;           // "Komentar warganet tentang APBN"
  statement: string;
  options: string[];         // fallacy slugs or "valid"; length 3
  answer: string;            // one of options
  explanation: string;       // max 2 sentences
}

// budget.json and assumptions.json
Figure = { key: string; label: string; value: number; unit: "IDR" | "persen" | "orang" | ...;
           year: number; source: string; sourceUrl: string; note?: string }

// scenarios/<slug>.json
Scenario = {
  slug, title, perspective, intro, disclaimer,
  meters: { key, label, initial, min, max }[],
  start: string,
  nodes: Record<string, SceneNode | EndingNode>,
  realStory: { title, url }[],     // Malaka episodes
  actions: { label, url, org, verifiedAt }[]
}
```

### Content guidelines

- **Neutral and nonpartisan.** Never name real politicians, parties or public figures in fallacy examples or quiz statements. Use generic speakers ("seorang pejabat", "warganet", "seorang komentator").
- **Sourced:** every number needs a `source`. If it's an estimate, say so in the UI.
- **Respectful:** simulator content about real communities avoids sensationalism and attributes facts to reporting.
- **Plain Indonesian:** short sentences in the *Bahasa Bayi* spirit, avoiding jargon or explaining it inline.

---

## 9. Project Structure

```
masyarakat-baru/
├── BUILD_PLAN.md                 # this file
├── CLAUDE.md                     # working rules for AI assistants
├── README.md                     # short public intro + live link
├── next.config.ts                # output: 'export'
├── scripts/serve-static.mjs      # preview/E2E server for out/
├── public/
│   ├── og/                       # Open Graph images per page
│   └── images/simulator/         # licensed images + CREDITS.md
├── src/
│   ├── app/
│   │   ├── globals.css           # design tokens (Tailwind v4 @theme)
│   │   ├── layout.tsx            # nav, footer disclaimer, fonts, analytics
│   │   ├── page.tsx              # F0 landing / proposal
│   │   ├── bahasa-bayi/page.tsx  # F1
│   │   ├── kuis-sesat-pikir/page.tsx    # F2
│   │   ├── kamus-sesat-pikir/page.tsx   # F3
│   │   ├── simulator/page.tsx            # scenario picker
│   │   ├── simulator/[slug]/page.tsx     # F4/F5 (generateStaticParams)
│   │   └── tentang/page.tsx
│   ├── components/
│   │   ├── ui/                   # Card, Button, Slider, Meter, ...
│   │   ├── calculator/
│   │   ├── quiz/
│   │   ├── kamus/
│   │   └── simulator/
│   ├── content/
│   │   ├── schema.ts
│   │   ├── fallacies.json
│   │   ├── quiz.json
│   │   ├── budget.json
│   │   ├── assumptions.json
│   │   └── scenarios/
│   │       ├── rantau-bakula.json
│   │       └── tambang.json
│   └── lib/
│       ├── content.ts            # loaders (future CMS seam)
│       ├── calculator/           # tax.ts, perCapita.ts, reallocation.ts
│       ├── quiz/                 # daily.ts (seeded pick), streak.ts
│       ├── simulator/engine.ts   # state machine, seeded RNG
│       ├── storage.ts            # safe localStorage wrapper
│       └── analytics.ts          # track(event, props)
├── tests/
│   ├── unit/                     # vitest
│   └── e2e/                      # playwright smoke tests
└── .github/workflows/ci.yml
```

---

## 10. Quality Bar

| Area | Requirement |
|---|---|
| Mobile-first | Works from **360px** wide. No horizontal scroll. Touch targets at least 44px. |
| Performance | Lighthouse mobile ≥ 90. JS under 200KB gzipped per route. LCP under 2.5s on simulated 4G. |
| Accessibility | Keyboard-operable sliders and choices, visible focus, `aria-live` on calculator results and quiz feedback, WCAG AA contrast, and correct/wrong never conveyed by colour alone. |
| SEO and sharing | Per-page `<title>`, description and OG image. `lang="id"`. |
| Privacy | No cookies, no PII. Analytics are cookieless and aggregate only. |
| Resilience | Everything works with `localStorage` blocked (features degrade, nothing crashes). |
| Tests | Vitest covers all of `src/lib`. Content schema tests cover all JSON. Playwright runs one smoke test per route. |
| CI | lint, typecheck, unit tests, `next build` — all green before merging to `main`. |

### Analytics events (map to deck KPIs)

| Event | KPI |
|---|---|
| `quiz_completed` `{score, streak}` | Daily Active Thinkers |
| `scenario_completed` `{slug, ending}` | Scenarios Completed |
| `action_link_clicked` `{slug, org}` | Conversion to Civic Action |
| `calculator_shared` `{tab}` | Engagement |
| `kamus_card_opened` `{slug}` | Engagement |

---

## 11. Milestones and Roadmap

Estimates are focused hours for one developer. Content writing is counted separately because it is the hidden cost.

### Phase 0: Setup (about 0.5 day)
- [x] Scaffold Next.js + TypeScript + Tailwind with `output: 'export'`
- [x] ESLint, Prettier, Vitest, Playwright, and a GitHub Actions CI workflow
- [x] Design tokens, fonts, layout shell, nav, footer disclaimer
- [x] `storage.ts`, `analytics.ts` (no-op in dev), `content.ts` and zod schemas
- [ ] Deploy the shell to GitHub Pages (`.github/workflows/deploy-pages.yml`) *(needs Settings → Pages → Source: GitHub Actions, then a push to `main`)*

### Phase 1: Kamus + Kuis Sesat Pikir (about 1.5 days + content)
*Mirrors the deck's Phase 1: quickest to build and the most viral.*
- [x] Write `fallacies.json` (about 18 entries)
- [x] Kamus page: grid, search, tag filter, accordion/modal, deep links
- [x] Write `quiz.json` (at least 21 items; target 30)
- [x] `daily.ts` (WIB day index, seeded pick) and `streak.ts`, with tests
- [x] Quiz UI: question, feedback, result, streak, countdown, share
- [x] Test that every quiz option resolves to a fallacy or "valid"

### Phase 2: Bahasa Bayi Calculator (about 3 days + data gathering)
*Mirrors the deck's Phase 2: needs data modelling.*
- [ ] Gather and source all figures (checklist in §7.2), and fill in `budget.json` and `assumptions.json`
- [ ] `perCapita.ts`, `tax.ts` and `reallocation.ts`, with unit tests
- [ ] Tab 1: big number translator with analogies
- [ ] Tab 2: "Ke Mana Pajakmu?", with demographic toggles and a donut chart
- [ ] Tab 3: "Jadi Menkeu Sehari", with sliders, deficit meter, indicator cards and before/after chart
- [ ] "Bagaimana kami menghitung?" drawer
- [ ] URL-encoded shareable scenarios

### Phase 3: Impact Simulator (about 3 days + writing)
*Mirrors the deck's Phase 3: narrative- and design-intensive.*
- [ ] `engine.ts`: state machine, meters, `requires`, weighted outcomes, seeded RNG, with tests
- [ ] Scenario validator tests
- [ ] Simulator UI: scene card, choices, meters, transitions, resume-from-storage
- [ ] Write Scenario A, "Rantau Bakula" (research Malaka's coverage first)
- [ ] Write Scenario B, "Tambang di Desa Kami"
- [ ] End screen: real story links, verified action links, replay, share
- [ ] Source licensed images and write `CREDITS.md`

### Phase 4: Landing Page and Polish (about 1.5 days)
- [ ] Landing page sections (§7.1)
- [ ] `/tentang`: about, data sources, disclaimer, contact
- [ ] OG images for each page
- [ ] Accessibility pass (keyboard, screen reader spot-check, contrast)
- [ ] Performance pass (Lighthouse at least 90 on all routes)
- [ ] Test on a real mid-range Android phone and on iOS Safari
- [ ] Copy-edit all Indonesian text (ideally by a second reader)

### Phase 5: Launch and Outreach (about 0.5 day)
- [ ] Final production deploy, plus a custom domain (optional; see [Action Items](#17-action-items-later))
- [ ] Turn on analytics and confirm events fire
- [ ] Record a 60–90s walkthrough video
- [ ] Send the cold email (§12)
- [ ] Follow up after 5–7 days if there's no reply

**Total:** about 10 focused days plus content work. If time is short, cut the stretch goals first, then Scenario B. **Never cut sourcing or the disclaimers.**

---

## 12. Outreach Package (Cold Email)

**Deliverables:**

1. The live site URL (with Vercel preview links kept for specific tools).
2. A 60–90 second screen-recorded walkthrough (Loom or a YouTube unlisted link).
3. The PDF deck (`Malaka_Project_Overview.pdf`) as an optional attachment.

**Email skeleton (to be written in Indonesian):**

1. **Hook (1 line):** reference a specific recent episode and what it made you think.
2. **The insight (2 lines):** 1.38M+ people watch; the next step is giving them tools to *practice* what Malaka teaches.
3. **The proof (1 line and a link):** "Saya sudah membangun prototipenya: [link]." (I've already built the prototype.)
4. **What's inside (3 bullets):** one per tool, each tied to a Malaka series.
5. **The ask (1 line):** a 20-minute call to discuss bringing this to Malaka's audience.
6. **Sign-off:** name, a one-line credential, GitHub link.

**Before sending:**

- [ ] Find the official business contact through the YouTube channel "About" page or Malaka's other official channels.
- [ ] Verify the stats quoted (subscriber/listener counts, episode view counts).
- [ ] Check that every episode link points to the correct, live video.

---

## 13. Decision Log

Append new entries; don't rewrite old ones.

| Date | Decision | Reason | Alternatives considered |
|---|---|---|---|
| 2026-10-01 | All three ideas ship in **one** static site | One link to send; tools cross-link (quiz to kamus, simulator to calculator) | Three separate mini-sites |
| 2026-10-01 | Next.js static export | Matches the deck's pitched stack, so the prototype doubles as an architecture demo | Vite + React (simpler), Astro (lighter), plain HTML + Alpine, ClojureScript (fun to learn, but riskier for a client-facing deliverable) |
| 2026-10-01 | Ship both fallacy options (quiz **and** cheat sheet) | The deck pairs them; the quiz drives habit and the kamus gives lasting utility | Pick one |
| 2026-10-01 | 3 quiz questions per day | Matches the deck's "3/3 Correct" mock; still about 30 seconds | 1 question per day (idea 3A) |
| 2026-10-01 | JSON + zod content layer behind `content.ts` | Demonstrates the "CMS-ready" claim without running a CMS | Real headless CMS now (overkill for a pitch) |
| 2026-10-01 | Indonesian UI, English code and docs | Audience is Indonesian | Bilingual from day one |
| 2026-10-01 | Commits are authored by the repo owner only; no AI co-author trailers | Owner's preference | — |
| 2026-10-01 | Next.js 16 + Tailwind v4: tokens in CSS `@theme`, no `tailwind.config` | v4's default, CSS-first config | Tailwind v3 with a JS config |
| 2026-10-01 | Self-hosted fonts via `@fontsource-variable` instead of `next/font/google` | Builds work offline and in CI with no Google Fonts fetch | `next/font/google` |
| 2026-10-01 | `trailingSlash: true` and a zero-dependency `scripts/serve-static.mjs` | Static hosts resolve `/route/` to `index.html`; E2E tests run against the exact `out/` that ships | `next start` (not available with static export), `serve` package |
| 2026-10-01 | Playwright pinned to 1.56 | Matches the Chromium preinstalled in Claude Code cloud sessions; CI installs its own browser | Latest Playwright |
| 2026-10-01 | Host on **GitHub Pages** for now, with `BASE_PATH` support | Free, no extra account, deploys from `main` via Actions; moving later is cheap because the site is a plain static export | Vercel now (needs an account connection), Netlify, Cloudflare Pages |
| 2026-10-01 | Kamus cards expand as an accordion on all screen sizes | One interaction model, simpler code, and deep links stay in context; a modal adds focus-trap complexity for little gain | Modal on desktop (as first specced in §7.4) |
| 2026-10-01 | Daily set is chosen per "cycle": the pool is shuffled once every `floor(pool / 3)` days and sliced day by day | Guarantees no repeats within a cycle while staying deterministic and backend-free | Independent random pick per day (can repeat) |
| 2026-10-01 | Quiz progress is saved after every answer, and a finished set can't be replayed | A reload resumes mid-set, and the streak and score can't be farmed | Only save on completion |
| 2026-10-01 | Quiz and streak UI render only after hydration (`useHydrated`) | They depend on the client clock and localStorage; avoids hydration mismatches | Render with a server-side date |

---

## 14. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Economic figures are wrong or outdated | Credibility loss with a channel known for explainers | Every number is sourced with its year; "simulasi edukatif" label; a methodology drawer; double-check figures against the official documents |
| Content seen as politically partisan | Malaka declines to be associated | No real names in examples; balanced trade-offs; a neutral tone review before launch |
| Misrepresenting the Rantau Bakula community | Ethical harm, reputational harm | Stick to publicly reported facts; "inspired by" disclaimer; link to the original reporting |
| Implying an affiliation with Malaka | Trust or legal issues | Global disclaimer; no Malaka logo or brand assets without permission |
| Unverified donation/action links | Users sent to scams | Only well-known platforms or organisations; record a `verifiedAt` date on each link |
| Scope creep delays the email | The opportunity cools off | Strict MVP; stretch goals only after Phase 5 is ready; cut Scenario B before cutting quality |
| Poor performance on low-end phones | The audience bounces | Performance budget; avoid heavy animation libraries; test on a real device |

---

## 15. Open Questions

- [ ] Final site name and domain: `aliflazuardi.github.io/masyarakat-baru` for now; a custom domain later?
- [ ] Should there be an English toggle (in case the founders want to show it to international partners)?
- [ ] Which exact Malaka episodes to link for each tool? (Needs titles and URLs.)
- [ ] How much of the builder's personal portfolio goes on `/tentang`?
- [ ] For Rantau Bakula, which public reporting is the factual baseline?

---

## 16. Working Conventions

- **Branching:** `main` is always deployable. Do feature work on short-lived branches (`feat/kuis`, `feat/kalkulator`, ...).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `content:`, `chore:`, `docs:`, `test:`).
- **Attribution:** commits are authored solely by the repo owner. **Do not add `Co-Authored-By` trailers or any other AI attribution lines** to commit messages or PR descriptions. (Enforced for Claude Code via `.claude/settings.json` and `CLAUDE.md`.)
- **Keeping this plan current:** when a milestone lands, tick its box in the same PR. When scope or approach changes, add a row to the Decision Log.
- **Definition of done (per feature):** acceptance criteria met, tests pass, works at 360px, keyboard accessible, content sourced, and the checkbox ticked here.

---

## 17. Action Items (later)

Deferred work that isn't tied to a phase. Review this list before Phase 5 (launch and outreach).

- [ ] **Move hosting off GitHub Pages** to Vercel, Netlify or Cloudflare Pages:
  - Connect the repo on the new platform, with `npm run build` as the build command and `out/` as the output directory.
  - Leave `BASE_PATH` unset (root domain), so URLs lose the `/masyarakat-baru/` prefix.
  - Turn on preview deployments per PR, which are useful to link in the cold email.
  - Delete `.github/workflows/deploy-pages.yml` and turn off Pages in repo settings.
  - Update the share-text URL in §7.3 and any links in the README or outreach email.
- [ ] Consider a custom domain (for example `masyarakatbaru.id`) before sending the cold email.

