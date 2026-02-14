<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=FlavorPrint&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=32&desc=Molecular%20Recipe%20Fingerprinting%20%7C%20CodeCatalysts&descSize=16&descAlignY=52" width="100%"/>

<!-- Animated Typing SVG -->
<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=FF6F00&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=Every+dish+has+a+molecular+identity+%F0%9F%A7%AC;Find+flavor+twins+across+74+countries+%F0%9F%8C%8D;Computational+Gastronomy+meets+Data+Science+%F0%9F%94%AC" alt="Typing SVG" /></a>

<br/>

<!-- Badges Row 1 -->
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)](https://d3js.org/)

<!-- Badges Row 2 -->
[![RecipeDB](https://img.shields.io/badge/RecipeDB-118K_Recipes-FF6F00?style=for-the-badge&logo=cookiecutter&logoColor=white)](https://cosylab.iiitd.edu.in/recipedb/)
[![FlavorDB](https://img.shields.io/badge/FlavorDB-25K_Molecules-4CAF50?style=for-the-badge&logo=atom&logoColor=white)](https://cosylab.iiitd.edu.in/flavordb/)
[![Hackathon](https://img.shields.io/badge/ForkIT_Challenge-2025-E91E63?style=for-the-badge&logo=trophy&logoColor=white)](#)

<!-- Badges Row 3 -->
![Stars](https://img.shields.io/github/stars/ayushap18/Codecatalysts?style=for-the-badge&color=yellow)
![Forks](https://img.shields.io/github/forks/ayushap18/Codecatalysts?style=for-the-badge&color=blue)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)

<br/>

<!-- Animated Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

</div>

## The Problem

> *"Finding recipes is easy. Understanding **why** flavors work together, discovering your dish has a twin 6,000km away, and exploring the molecular science behind every bite -- that's what's missing."*

With **118,000+ recipes across 74 countries** in RecipeDB and **25,595 flavor molecules** in FlavorDB, the data for a revolution in food understanding exists. But no one has connected these datasets to reveal the hidden molecular relationships between the world's cuisines.

**FlavorPrint** bridges this gap.

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">
</div>

## What is FlavorPrint?

**FlavorPrint** is a molecular recipe fingerprinting platform that treats every dish as a unique molecular identity. It uses computational gastronomy to discover hidden connections between cuisines that look nothing alike but taste remarkably similar.

### Core Features

<table>
<tr>
<td width="33%" align="center">

#### FlavorPrint Visualizer
<br/>

```
     sweet
      /|\
  warm / | \ floral
      /  |  \
     /   |   \
----+----+----+----
     \   |   /
  smoky\ | / umami
      \|/
    bitter
```

Generate a **radial molecular fingerprint** for any recipe. See which flavor categories dominate, which molecules contribute, and what makes your dish unique at the molecular level.

</td>
<td width="33%" align="center">

#### Cross-Cultural Flavor Twins
<br/>

```
  INDIA          ETHIOPIA
    |     82%      |
  Butter  <--->  Doro
  Chicken        Wat
    |              |
  [====]        [====]
  Same molecules,
  different ingredients
```

Discover recipes from **different countries** that share the same molecular fingerprint. "This Ethiopian dish and this Indian curry are 82% molecular twins."

</td>
<td width="33%" align="center">

#### Philosophy Spectrum
<br/>

```
  CONTRAST <-------> PAIRING
  (East Asian)    (Western)
       |              |
       34%           71%
     Sambar    Butter Chicken
       |              |
  [==........]  [.........==]
  Fewer shared   More shared
  molecules      molecules
```

Classify recipes on the **Pairing vs Contrast spectrum** based on Ahn et al.'s food pairing hypothesis. Flip a recipe's philosophy to create novel dishes.

</td>
</tr>
</table>

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">
</div>

## The Science Behind It

FlavorPrint is built on two foundational research findings:

### 1. Flavor Network Theory (FlavorDB, Garg et al., NAR 2017)
Ingredients are connected by **shared flavor molecules**. Two ingredients sharing more molecules tend to pair well. FlavorDB maps **2,254 molecules** to **936 ingredients** across **34 categories**.

### 2. Food Pairing Hypothesis (Ahn et al., Scientific Reports 2011)
**Western cuisines** pair ingredients that **share** flavor compounds. **East Asian cuisines** pair ingredients that **don't share** compounds. This cultural divide in cooking philosophy is encoded in the molecular data.

**FlavorPrint combines both** to create something new: **cross-cultural molecular twinning** -- revealing that cuisine boundaries dissolve at the molecular level.

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">
</div>

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14+ (App Router) | Full-stack with API routes |
| **Language** | TypeScript (strict) | Type safety across the stack |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, polished UI |
| **Visualization** | D3.js + Recharts | Radial fingerprints, network graphs, charts |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Data Fetching** | TanStack Query | Caching, background refetching |
| **State** | Zustand | Lightweight client state |
| **Deployment** | Vercel | One-click deploy, edge functions |
| **APIs** | RecipeDB + FlavorDB | CoSyLab's proprietary datasets |

</div>

## Architecture

```
                    +---------------------------+
                    |      FlavorPrint UI        |
                    |    (Next.js + D3.js)       |
                    +------------+--------------+
                                 |
                    +------------+--------------+
                    |    Next.js API Routes      |
                    |  (Caching + Proxy Layer)   |
                    +-----+------------+--------+
                          |            |
                 +--------+--+  +-----+-------+
                 | RecipeDB   |  | FlavorDB     |
                 | 118K       |  | 25,595       |
                 | recipes    |  | molecules    |
                 | 74 countries|  | 936 entities |
                 +------------+  +-------------+
                     (cosylab.iiitd.edu.in)
```

## Key Algorithms

### Molecular Fingerprint Generation
```
Recipe → Extract Ingredients → Query FlavorDB for each
→ Aggregate all flavor molecules → Group by flavor category
→ Calculate concentration per category → Generate radial fingerprint
```

### Cross-Cultural Twin Detection
```
Recipe A (FlavorPrint) → Compare against all recipes in target cuisine
→ Jaccard Similarity on molecule sets → Filter: high molecular overlap
+ low ingredient overlap → Rank by "twin score" → Return top matches
```

### Philosophy Spectrum Score
```
Recipe → Get all ingredient pairs → For each pair, count shared molecules
→ Average shared molecules per pair → Compare to random baseline
→ Score > baseline = "Pairing" (Western) | Score < baseline = "Contrast" (Eastern)
```

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">
</div>

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ayushap18/Codecatalysts.git
cd Codecatalysts

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open in browser
open http://localhost:3000
```

## Project Structure

```
Codecatalysts/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── search/             # Recipe search + FlavorPrint
│   ├── twins/              # Cross-cultural twin finder
│   ├── spectrum/           # Philosophy spectrum analyzer
│   └── api/                # API proxy routes (RecipeDB + FlavorDB)
├── components/             # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── flavorprint/        # Radial fingerprint visualization
│   ├── twins/              # Twin comparison cards
│   └── spectrum/           # Spectrum gauge + world map
├── lib/                    # Core logic
│   ├── api/                # RecipeDB + FlavorDB client wrappers
│   ├── algorithms/         # Fingerprint, similarity, spectrum scoring
│   └── utils/              # Helpers, formatters, constants
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand state stores
├── styles/                 # Global CSS + Tailwind config
├── public/                 # Static assets
├── docs/                   # Project documentation + research
└── types/                  # Shared TypeScript types
```

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">
</div>

## Team: CodeCatalysts

<div align="center">

| Role | Focus Area |
|------|-----------|
| **Full-Stack** | Next.js, API integration, caching layer |
| **Frontend + Viz** | D3.js fingerprint, UI components, animations |
| **Data + Algorithms** | Similarity scoring, philosophy analysis, data pipeline |
| **Product + Pitch** | UX flow, demo script, presentation |

</div>

## References

1. **Garg, N. et al.** "FlavorDB: a database of flavor molecules" *Nucleic Acids Research*, 2017
2. **Ahn, Y-Y. et al.** "Flavor network and the principles of food pairing" *Scientific Reports*, 2011
3. **Bagler, G. et al.** "Computational Gastronomy: A Data Science Approach to Food"
4. **CoSyLab, IIIT Delhi** -- RecipeDB, FlavorDB, and related tools

## License

This project is built for the **ForkIT Challenge 2025** by IIIT Delhi's CoSyLab.

Licensed under [MIT](LICENSE).

---

<div align="center">

<!-- Animated Footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

**Built with science, served with flavor.**

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&pause=1000&color=FF6F00&center=true&vCenter=true&repeat=true&width=500&lines=CodeCatalysts+%C3%97+ForkIT+Challenge+2025+%C3%97+CoSyLab+IIIT+Delhi" alt="Typing SVG" /></a>

</div>
