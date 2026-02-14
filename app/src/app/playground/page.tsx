"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FlaskConical,
  Atom,
  X,
  RotateCcw,
  Zap,
  Beaker,
  Sparkles,
  ArrowLeft,
  BookOpen,
  TestTubes,
  Search,
  Loader2,
  History,
  Terminal,
  Play,
  Trash2,
  LayoutGrid,
  Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RadialChart from "@/components/flavorprint/radial-chart";
import SpectrumGauge from "@/components/spectrum/spectrum-gauge";
import {
  getMoleculesForIngredient,
  generateFlavorPrint,
  calculatePhilosophyScore,
  jaccardSimilarity,
  classifyFlavor,
  FLAVOR_CATEGORIES,
} from "@/lib/algorithms/flavorprint";
import { getEntitiesByName } from "@/lib/api/flavordb";
import type { FlavorPrint, PhilosophyScore, RecipeIngredient, FlavorMolecule } from "@/types";
import { LAB_EXPERIMENTS, CUISINE_CATEGORIES, PALETTE_INGREDIENTS, computeExperimentData } from "./experiments";
import type { LabExperiment } from "./experiments";
import CompatibilityHeatmap from "./heatmap";
import FusionGenerator from "./fusion";
import { ALL_API_ENDPOINTS, API_ENDPOINT_CATEGORIES } from "./api-endpoints";
import type { ApiEndpoint as FullApiEndpoint } from "./api-endpoints";

// ── Constants ────────────────────────────────────────────────
const INTRO_STEPS = [
  "BOOTING UP...",
  "LOADING MOLECULAR DATABASE...",
  "CALIBRATING FLAVOR SENSORS...",
  "INITIALIZING REACTION CHAMBER...",
  "LAB READY",
];

// ── History helpers ──────────────────────────────────────────
interface HistoryEntry {
  id: string;
  title: string;
  cuisine: string;
  ingredients: string[];
  timestamp: number;
}

function getLabHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lab-history") || "[]");
  } catch { return []; }
}

function addLabHistory(entry: Omit<HistoryEntry, "timestamp">) {
  const history = getLabHistory().filter((h) => h.id !== entry.id);
  history.unshift({ ...entry, timestamp: Date.now() });
  localStorage.setItem("lab-history", JSON.stringify(history.slice(0, 20)));
}

function clearLabHistory() {
  localStorage.removeItem("lab-history");
}

// ── Intro Overlay ────────────────────────────────────────────
function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const particles = useMemo(() => {
    const colors = Object.values(FLAVOR_CATEGORIES);
    return Array.from({ length: 30 }, (_, i) => ({
      id: i, color: colors[i % colors.length],
      size: 4 + Math.random() * 12,
      x1: Math.random() * 100, y1: Math.random() * 100,
      x2: Math.random() * 100, y2: Math.random() * 100,
      dur: 2.5 + Math.random() * 4, delay: Math.random() * 0.8,
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= INTRO_STEPS.length - 1) { clearInterval(timer); setTimeout(onDone, 700); return prev; }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, [onDone]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onDone(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDone]);

  return (
    <motion.div key="intro" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x1}%`, top: `${p.y1}%`, filter: `blur(${p.size > 10 ? 1 : 0}px)` }}
          animate={{ left: [`${p.x1}%`, `${p.x2}%`, `${p.x1}%`], top: [`${p.y1}%`, `${p.y2}%`, `${p.y1}%`], opacity: [0, 0.6, 0.2, 0.5, 0], scale: [0.5, 1.2, 0.8] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
      ))}
      <motion.div className="absolute h-32 w-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,111,0,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      <div className="relative z-10 flex flex-col items-center">
        <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
          <FlaskConical className="mb-6 h-14 w-14 text-[#FF6F00]" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-8 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white md:text-3xl">
          Molecular Kitchen <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">Lab</span>
        </motion.h1>
        <div className="h-6">
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }} className="font-mono text-xs tracking-[0.25em] text-emerald-400 md:text-sm">
              {INTRO_STEPS[step]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/10 md:w-72">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#FF6F00] via-[#E91E63] to-emerald-500"
            initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "easeInOut" }} />
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }} className="mt-4 font-mono text-[10px] text-white/40">
          {LAB_EXPERIMENTS.length} EXPERIMENTS / {PALETTE_INGREDIENTS.length} INGREDIENTS / {PALETTE_INGREDIENTS.reduce((s, n) => s + getMoleculesForIngredient(n).length, 0)} MOLECULES
        </motion.p>
      </div>
      {step >= INTRO_STEPS.length - 1 && (
        <motion.div className="absolute inset-0 z-20 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0] }} transition={{ duration: 0.5, delay: 0.2 }} />
      )}
      <button onClick={onDone} className="absolute bottom-6 right-6 z-30 font-mono text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/70">
        Skip [Esc]
      </button>
    </motion.div>
  );
}

// ── Kitchen Component (stateful, takes initial ingredients) ──
function MolecularKitchen({ initialIngredients = [] }: { initialIngredients?: string[] }) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialIngredients);
  const fakeIngredients: RecipeIngredient[] = useMemo(() => selectedIngredients.map((name, i) => ({ recipe_no: 0, ingredient_phrase: name, ingredient: name, quantity: "", ing_id: i })), [selectedIngredients]);
  const allMolecules: FlavorMolecule[] = useMemo(() => { const m: FlavorMolecule[] = []; for (const n of selectedIngredients) m.push(...getMoleculesForIngredient(n)); return m; }, [selectedIngredients]);
  const uniqueMolecules = useMemo(() => Array.from(new Map(allMolecules.map((m) => [m.common_name, m])).values()), [allMolecules]);
  const flavorprint: FlavorPrint | null = useMemo(() => selectedIngredients.length === 0 ? null : generateFlavorPrint(0, "Lab Mix", "Lab", "Lab", fakeIngredients), [selectedIngredients, fakeIngredients]);
  const philosophy: PhilosophyScore | null = useMemo(() => selectedIngredients.length < 2 ? null : calculatePhilosophyScore(fakeIngredients), [selectedIngredients, fakeIngredients]);
  const compatibility = useMemo(() => {
    if (selectedIngredients.length < 2) return null;
    const last = selectedIngredients[selectedIngredients.length - 1], prev = selectedIngredients[selectedIngredients.length - 2];
    const lastM = getMoleculesForIngredient(last).map((m) => m.common_name), prevM = getMoleculesForIngredient(prev).map((m) => m.common_name);
    return { last, prev, shared: lastM.filter((m) => prevM.includes(m)), jaccard: jaccardSimilarity(lastM, prevM) };
  }, [selectedIngredients]);
  const moleculesColored = useMemo(() => uniqueMolecules.map((m) => { const cat = classifyFlavor(m.flavor_profile); return { ...m, category: cat, color: FLAVOR_CATEGORIES[cat] || "#90A4AE" }; }), [uniqueMolecules]);
  const add = useCallback((name: string) => setSelectedIngredients((p) => p.includes(name) ? p : [...p, name]), []);
  const remove = useCallback((name: string) => setSelectedIngredients((p) => p.filter((n) => n !== name)), []);
  const clear = useCallback(() => setSelectedIngredients([]), []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr_300px]">
        {/* LEFT: Palette */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Beaker className="h-4 w-4 text-emerald-400" />Ingredient Palette</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
            {PALETTE_INGREDIENTS.map((name) => {
              const mols = getMoleculesForIngredient(name); const sel = selectedIngredients.includes(name);
              return (<motion.button key={name} onClick={() => sel ? remove(name) : add(name)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className={cn("rounded-lg border p-2.5 text-left text-sm transition-all", sel ? "border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500/30" : "border-white/10 text-white/70 hover:border-emerald-500/40 hover:bg-white/5")}>
                <p className="font-medium capitalize">{name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40"><Atom className="h-3 w-3" />{mols.length} molecules</p>
              </motion.button>);
            })}
          </div>
        </div>
        {/* CENTER: Beaker */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6">
            {selectedIngredients.length > 0 && (<Button variant="ghost" size="sm" onClick={clear} className="absolute right-4 top-4 z-10 gap-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"><RotateCcw className="h-3 w-3" />Clear</Button>)}
            <h2 className="mb-4 text-center text-sm font-semibold text-white">The Beaker{selectedIngredients.length > 0 && <span className="ml-2 text-white/40">({selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? "s" : ""})</span>}</h2>
            <div className="relative mx-auto flex min-h-[260px] w-full max-w-sm items-end justify-center rounded-b-[2rem] rounded-t-xl border-2 border-dashed border-emerald-500/30 bg-gradient-to-t from-emerald-500/5 to-transparent">
              {selectedIngredients.length > 0 && [...Array(6)].map((_, i) => (
                <motion.div key={`b-${i}`} className="absolute rounded-full bg-emerald-400/20" style={{ width: 4 + Math.random() * 8, height: 4 + Math.random() * 8, left: `${20 + Math.random() * 60}%`, bottom: 0 }}
                  animate={{ y: [0, -(100 + Math.random() * 150)], opacity: [0.6, 0] }} transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: i * 0.4 }} />
              ))}
              {selectedIngredients.length === 0 ? (
                <p className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/30"><FlaskConical className="h-10 w-10" />Click ingredients to add...</p>
              ) : (
                <div className="flex flex-wrap items-end justify-center gap-3 p-5">
                  <AnimatePresence>
                    {selectedIngredients.map((name) => {
                      const mols = getMoleculesForIngredient(name); const cat = mols.length > 0 ? classifyFlavor(mols[0].flavor_profile) : "other"; const color = FLAVOR_CATEGORIES[cat] || "#90A4AE";
                      return (<motion.div key={name} initial={{ opacity: 0, y: -40, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="group relative flex flex-col items-center">
                        <motion.div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg" style={{ backgroundColor: color }} whileHover={{ scale: 1.2, rotate: 10 }} onClick={() => remove(name)} title={`Remove ${name}`}>{name.slice(0, 2).toUpperCase()}</motion.div>
                        <span className="mt-1 text-[9px] capitalize text-white/50">{name}</span>
                        <div className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 group-hover:block"><X className="h-2.5 w-2.5 text-white" /></div>
                      </motion.div>);
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
            {flavorprint && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/5 p-2"><p className="text-lg font-bold text-emerald-400">{flavorprint.totalMolecules}</p><p className="text-[10px] text-white/40">Molecules</p></div>
              <div className="rounded-lg bg-white/5 p-2"><p className="text-lg font-bold text-[#FF6F00]">{flavorprint.categories.filter((c) => c.count > 0).length}</p><p className="text-[10px] text-white/40">Categories</p></div>
              <div className="rounded-lg bg-white/5 p-2"><p className="text-lg font-bold text-[#E91E63]">{flavorprint.analyzedCount}/{flavorprint.ingredientCount}</p><p className="text-[10px] text-white/40">Analyzed</p></div>
            </motion.div>)}
          </div>
          {flavorprint && flavorprint.totalMolecules > 0 && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex justify-center"><RadialChart flavorprint={flavorprint} size={280} /></div></motion.div>)}
        </div>
        {/* RIGHT: Dashboard */}
        <div className="space-y-4">
          {compatibility && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Zap className="h-4 w-4 text-[#FF6F00]" />Reaction</h3>
            <div className="mb-2 flex items-center justify-between"><span className="text-xs capitalize text-white/50">{compatibility.prev} + {compatibility.last}</span>
              <Badge variant="secondary" className={cn("border-0", compatibility.jaccard > 0.3 ? "bg-green-500/20 text-green-400" : compatibility.jaccard > 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400")}>{Math.round(compatibility.jaccard * 100)}% match</Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-r from-[#FF6F00] to-emerald-500" initial={{ width: 0 }} animate={{ width: `${Math.max(Math.round(compatibility.jaccard * 100), 2)}%` }} transition={{ duration: 0.6 }} /></div>
            {compatibility.shared.length > 0 ? (<div className="mt-3"><p className="mb-1 text-[10px] font-medium text-white/40">Shared Molecules ({compatibility.shared.length})</p><div className="flex flex-wrap gap-1">{compatibility.shared.map((m) => <span key={m} className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">{m}</span>)}</div></div>) : <p className="mt-2 text-[10px] text-white/40">No shared molecules — a contrast pairing!</p>}
          </motion.div>)}
          {philosophy && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><h3 className="mb-3 text-sm font-semibold text-white">Cooking Philosophy</h3><SpectrumGauge score={philosophy} recipeName="Lab Mix" /></motion.div>)}
          {flavorprint && flavorprint.categories.some((c) => c.count > 0) && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Flavor Breakdown</h3>
            <div className="space-y-2">{flavorprint.categories.filter((c) => c.count > 0).map((cat) => { const mx = Math.max(...flavorprint.categories.map((c) => c.count)); return (<div key={cat.name} className="flex items-center gap-2"><div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} /><span className="w-14 shrink-0 text-xs capitalize text-white/70">{cat.name}</span><div className="flex-1"><div className="h-1.5 w-full rounded-full bg-white/10"><motion.div className="h-full rounded-full" style={{ backgroundColor: cat.color }} initial={{ width: 0 }} animate={{ width: `${(cat.count / mx) * 100}%` }} transition={{ duration: 0.5 }} /></div></div><span className="w-5 shrink-0 text-right text-[10px] text-white/40">{cat.count}</span></div>); })}</div>
          </motion.div>)}
          {selectedIngredients.length === 0 && (<div className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center"><Sparkles className="mx-auto h-10 w-10 text-white/10" /><p className="mt-3 text-sm text-white/40">Add ingredients to see molecular analysis</p><p className="mt-1 text-[10px] text-white/20">Zero API credits</p></div>)}
        </div>
      </div>
      {/* Molecule Ribbon */}
      {uniqueMolecules.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Atom className="h-4 w-4 text-[#E91E63]" />Detected Molecules ({uniqueMolecules.length})</h3>
        <div className="flex gap-2 overflow-x-auto pb-3">{moleculesColored.map((mol) => (<motion.div key={mol.common_name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"><div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: mol.color }} /><span className="whitespace-nowrap font-mono text-xs text-white/80">{mol.common_name}</span><span className="text-[9px] capitalize text-white/30">{mol.category}</span></motion.div>))}</div>
      </motion.div>)}
    </div>
  );
}

// ── Formula Library (50+ experiments) ────────────────────────
function FormulaLibrary({ onLoadExperiment }: { onLoadExperiment: (exp: LabExperiment) => void }) {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = LAB_EXPERIMENTS;
    if (cuisine !== "All") list = list.filter((e) => e.cuisine === cuisine);
    if (search) { const q = search.toLowerCase(); list = list.filter((e) => e.title.toLowerCase().includes(q) || e.ingredients.some((i) => i.includes(q)) || e.tags.some((t) => t.toLowerCase().includes(q))); }
    return list;
  }, [search, cuisine]);

  const activeExp = LAB_EXPERIMENTS.find((e) => e.id === active);
  const expData = useMemo(() => {
    if (!activeExp) return null;
    const { ingMols, shared } = computeExperimentData(activeExp);
    const fakeIngs: RecipeIngredient[] = activeExp.ingredients.map((n, i) => ({ recipe_no: 0, ingredient_phrase: n, ingredient: n, quantity: "", ing_id: i }));
    const fp = generateFlavorPrint(0, activeExp.title, "Lab", "Lab", fakeIngs);
    const phil = activeExp.ingredients.length >= 2 ? calculatePhilosophyScore(fakeIngs) : null;
    return { fp, phil, ingMols, shared };
  }, [activeExp]);

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search experiments, ingredients, tags..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#FF6F00]/50 focus:outline-none" />
        </div>
        <div className="flex flex-wrap gap-1">
          {CUISINE_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCuisine(c)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-all", cuisine === c ? "bg-[#FF6F00] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60")}>{c}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/30">{filtered.length} experiment{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((exp) => (
          <motion.button key={exp.id} onClick={() => setActive(active === exp.id ? null : exp.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={cn("group relative overflow-hidden rounded-xl border p-3.5 text-left transition-all", active === exp.id ? "border-[#FF6F00]/50 bg-[#FF6F00]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]")}>
            <div className="mb-2 flex items-center justify-between">
              <span className={cn("rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold", active === exp.id ? "bg-[#FF6F00] text-white" : "text-white/50")}>{exp.cuisine.slice(0, 2).toUpperCase()}</span>
              <span className={cn("text-[9px]", exp.difficulty === "Beginner" ? "text-green-400/60" : exp.difficulty === "Intermediate" ? "text-yellow-400/60" : "text-red-400/60")}>{exp.difficulty}</span>
            </div>
            <h3 className="text-sm font-semibold text-white">{exp.title}</h3>
            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/40">{exp.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {exp.tags.map((t) => <span key={t} className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] text-white/40">{t}</span>)}
            </div>
            <p className="mt-1.5 text-[10px] text-white/25">{exp.ingredients.length} ingredients</p>
          </motion.button>
        ))}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {activeExp && expData && (
          <motion.div key={activeExp.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border border-[#FF6F00]/30 bg-white/[0.03] p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary" className="border-0 bg-white/10 text-white/50">{activeExp.cuisine}</Badge>
                    <Badge variant="secondary" className={cn("border-0", activeExp.difficulty === "Beginner" ? "bg-green-500/20 text-green-400" : activeExp.difficulty === "Intermediate" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400")}>{activeExp.difficulty}</Badge>
                  </div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">{activeExp.title}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/50">{activeExp.description}</p>
                </div>
                <Button onClick={() => onLoadExperiment(activeExp)} className="shrink-0 gap-1.5 bg-[#FF6F00] text-white hover:bg-[#E65100]" size="sm"><FlaskConical className="h-3.5 w-3.5" />Load in Kitchen</Button>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Molecular Formula */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Atom className="h-4 w-4 text-emerald-400" />Molecular Formula</h3>
                  <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
                    {expData.ingMols.map((im) => (
                      <div key={im.name} className="rounded-lg bg-white/5 p-3">
                        <p className="mb-2 text-xs font-semibold capitalize text-white/80">{im.name}</p>
                        <div className="space-y-1">{im.molecules.map((mol) => (
                          <div key={mol.common_name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: mol.color }} /><span className="font-mono text-[11px] text-white/70">{mol.common_name}</span>
                              {expData.shared.includes(mol.common_name) && <span className="rounded bg-[#FF6F00]/20 px-1 text-[8px] font-bold text-[#FF6F00]">SHARED</span>}
                            </div><span className="text-[10px] capitalize text-white/30">{mol.category}</span>
                          </div>))}</div>
                      </div>
                    ))}
                  </div>
                  {expData.shared.length > 0 && (<div className="mt-4 rounded-lg border border-[#FF6F00]/20 bg-[#FF6F00]/5 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6F00]">Molecular Bridges ({expData.shared.length})</p>
                    <div className="flex flex-wrap gap-1.5">{expData.shared.map((m) => <span key={m} className="rounded-full bg-[#FF6F00]/15 px-2.5 py-1 font-mono text-[10px] text-[#FF6F00]">{m}</span>)}</div>
                  </div>)}
                </div>
                {/* Charts */}
                <div className="space-y-4">
                  {expData.fp.totalMolecules > 0 && <div className="flex justify-center"><RadialChart flavorprint={expData.fp} size={260} /></div>}
                  {expData.phil && <div className="rounded-lg bg-white/5 p-3"><SpectrumGauge score={expData.phil} recipeName={activeExp.title} /></div>}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white/5 p-2"><p className="text-lg font-bold text-emerald-400">{expData.fp.totalMolecules}</p><p className="text-[9px] text-white/30">Molecules</p></div>
                    <div className="rounded-lg bg-white/5 p-2"><p className="text-lg font-bold text-[#FF6F00]">{expData.shared.length}</p><p className="text-[9px] text-white/30">Bridges</p></div>
                    <div className="rounded-lg bg-white/5 p-2"><p className="text-lg font-bold text-[#E91E63]">{expData.fp.categories.filter((c) => c.count > 0).length}</p><p className="text-[9px] text-white/30">Categories</p></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Live Experiment (1 API call) ─────────────────────────────
function LiveExperiment() {
  const [query, setQuery] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; molecules: FlavorMolecule[]; categories: { name: string; color: string; count: number }[] } | null>(null);

  const handleSearch = useCallback(async () => {
    const term = query.trim().toLowerCase(); if (!term) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await getEntitiesByName(term); const entities = data?.content || [];
      if (entities.length === 0) { setError(`No FlavorDB entry found for "${term}".`); setLoading(false); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entity = entities[0] as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mols: FlavorMolecule[] = (entity.molecules || []).map((m: any) => ({ common_name: m.common_name || m.commonName || m.common_Name || "Unknown", flavor_profile: m.flavor_profile || m.flavorProfile || m.flavor_Profile || "other", pubchem_id: m.pubchem_id || m.pubchemId }));
      const catMap: Record<string, string[]> = {};
      for (const mol of mols) { mol.flavor_profile.split(",").map((s) => s.trim()).forEach((p) => { const cat = classifyFlavor(p); if (!catMap[cat]) catMap[cat] = []; if (!catMap[cat].includes(mol.common_name)) catMap[cat].push(mol.common_name); }); }
      const categories = Object.entries(catMap).map(([n, ms]) => ({ name: n, color: FLAVOR_CATEGORIES[n] || "#90A4AE", count: ms.length })).sort((a, b) => b.count - a.count);
      setResult({ name: entity.entity_alias_readable || term, molecules: mols, categories });
    } catch { setError("API request failed."); }
    setLoading(false);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">Live Molecular <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">Analysis</span></h2>
        <p className="mt-2 text-sm text-white/40">Search any ingredient beyond our static library. Uses 1 API call per unique search (cached 24h).</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mx-auto flex max-w-lg gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="e.g. mango, thyme, beef, saffron..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#FF6F00]/50 focus:outline-none" />
        </div>
        <Button type="submit" disabled={loading || !query.trim()} className="h-12 bg-[#FF6F00] px-6 text-white hover:bg-[#E65100] disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="mr-1 h-4 w-4" />Analyze</>}
        </Button>
      </form>
      <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-2">{["mango", "thyme", "beef", "saffron", "vanilla", "coffee", "mushroom", "honey"].map((s) => (<button key={s} onClick={() => setQuery(s)} className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-white/40 hover:border-[#FF6F00]/30 hover:text-white/60">{s}</button>))}</div>
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-lg rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">{error}</motion.div>}
      {result && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-[#FF6F00]/30 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold capitalize text-white">{result.name}</h3>
            <Badge variant="secondary" className="border-0 bg-emerald-500/20 text-emerald-400">{result.molecules.length} molecules</Badge>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div><h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Flavor Categories</h4><div className="space-y-2">{result.categories.map((cat) => { const mx = Math.max(...result.categories.map((c) => c.count)); return (<div key={cat.name} className="flex items-center gap-2"><div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} /><span className="w-14 shrink-0 text-xs capitalize text-white/60">{cat.name}</span><div className="flex-1"><div className="h-2 w-full rounded-full bg-white/10"><motion.div className="h-full rounded-full" style={{ backgroundColor: cat.color }} initial={{ width: 0 }} animate={{ width: `${(cat.count / mx) * 100}%` }} transition={{ duration: 0.5 }} /></div></div><span className="w-5 shrink-0 text-right text-xs text-white/40">{cat.count}</span></div>); })}</div></div>
            <div><h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Molecular Composition</h4><div className="max-h-[300px] space-y-1 overflow-y-auto pr-2">{result.molecules.map((mol, i) => { const cat = classifyFlavor(mol.flavor_profile); const color = FLAVOR_CATEGORIES[cat] || "#90A4AE"; return (<motion.div key={mol.common_name + i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"><div className="flex items-center gap-2"><div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} /><span className="font-mono text-xs text-white/70">{mol.common_name}</span></div><span className="text-[10px] text-white/30">{mol.flavor_profile}</span></motion.div>); })}</div></div>
          </div>
          <div className="mt-4 rounded-lg bg-white/5 p-3 text-center"><p className="text-[10px] text-white/30">FlavorDB (CoSyLab, IIIT Delhi) — cached 24h</p></div>
        </div>
      </motion.div>)}
      {!result && !error && !loading && <div className="py-8 text-center"><TestTubes className="mx-auto h-12 w-12 text-white/10" /><p className="mt-3 text-sm text-white/30">Search any ingredient for its molecular profile</p></div>}
    </div>
  );
}

// ── API Explorer Tab ─────────────────────────────────────────
function ApiExplorer() {
  const [running, setRunning] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<Record<string, { data: any; time: number; error?: string }>>({});
  const [sourceFilter, setSourceFilter] = useState<"All" | "FlavorDB" | "RecipeDB">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEndpoints = useMemo(() => {
    let list = ALL_API_ENDPOINTS;
    if (sourceFilter !== "All") list = list.filter((e) => e.source === sourceFilter);
    if (categoryFilter !== "All") list = list.filter((e) => e.category === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.path.toLowerCase().includes(q));
    }
    return list;
  }, [sourceFilter, categoryFilter, searchQuery]);

  const liveCount = ALL_API_ENDPOINTS.filter((e) => e.status === "live").length;
  const demoCount = ALL_API_ENDPOINTS.filter((e) => e.status === "demo").length;

  const runEndpoint = useCallback(async (ep: FullApiEndpoint) => {
    if (ep.status === "demo") {
      // Show expected output instantly for demo endpoints
      setResults((prev) => ({ ...prev, [ep.id]: { data: ep.expectedOutput ? JSON.parse(ep.expectedOutput) : { message: "Demo endpoint — no live API wrapper available" }, time: 0 } }));
      return;
    }
    if (!ep.runner) return;
    setRunning(ep.id);
    const start = Date.now();
    try {
      const data = await ep.runner();
      setResults((prev) => ({ ...prev, [ep.id]: { data, time: Date.now() - start } }));
    } catch (err) {
      setResults((prev) => ({ ...prev, [ep.id]: { data: null, time: Date.now() - start, error: String(err) } }));
    }
    setRunning(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">API <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">Explorer</span></h2>
        <p className="mt-2 text-sm text-white/40">All {ALL_API_ENDPOINTS.length} FlavorDB and RecipeDB endpoints. <span className="text-emerald-400">{liveCount} live</span> with real API runners, <span className="text-yellow-400">{demoCount} demo</span> with expected output.</p>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-4xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search endpoints by name, description, or path..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#FF6F00]/50 focus:outline-none" />
        </div>
      </div>

      {/* Source Filter */}
      <div className="mx-auto flex max-w-4xl justify-center gap-2">
        {(["All", "FlavorDB", "RecipeDB"] as const).map((f) => (
          <button key={f} onClick={() => setSourceFilter(f)} className={cn("rounded-full px-4 py-1.5 text-xs font-medium transition-all", sourceFilter === f ? "bg-[#FF6F00] text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}>{f}</button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-1.5">
        {API_ENDPOINT_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={cn("rounded-full px-3 py-1 text-[10px] font-medium transition-all", categoryFilter === cat ? "bg-emerald-500 text-white" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50")}>
            {cat}
          </button>
        ))}
      </div>

      <p className="mx-auto max-w-4xl text-xs text-white/30">{filteredEndpoints.length} endpoint{filteredEndpoints.length !== 1 ? "s" : ""}</p>

      <div className="mx-auto max-w-4xl space-y-3">
        {filteredEndpoints.map((ep) => {
          const res = results[ep.id];
          const isDemo = ep.status === "demo";
          return (
            <div key={ep.id} className={cn("rounded-xl border p-4", isDemo ? "border-yellow-500/10 bg-white/[0.02]" : "border-white/10 bg-white/[0.03]")}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={cn("border-0 text-[10px]", ep.source === "FlavorDB" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>{ep.source}</Badge>
                    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", ep.method === "POST" ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400")}>{ep.method}</span>
                    <Badge variant="secondary" className={cn("border-0 text-[10px]", isDemo ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400")}>{isDemo ? "DEMO" : "LIVE"}</Badge>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/20">{ep.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{ep.name}</h3>
                  <p className="mt-1 text-[11px] text-white/40">{ep.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-white/20">{ep.path}</p>
                  {Object.keys(ep.exampleParams).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(ep.exampleParams).map(([k, v]) => (
                        <span key={k} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/30">{k}=<span className="text-[#FF6F00]">{v}</span></span>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={() => runEndpoint(ep)} disabled={running === ep.id} size="sm"
                  className={cn("shrink-0 gap-1.5 text-white disabled:opacity-40", isDemo ? "bg-yellow-500/20 hover:bg-yellow-500/30" : "bg-white/10 hover:bg-white/20")}>
                  {running === ep.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  {isDemo ? "Preview" : "Run"}
                </Button>
              </div>
              {/* Result */}
              {res && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
                  <div className="flex items-center justify-between rounded-t-lg bg-white/5 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-white/40">{res.error ? "ERROR" : isDemo ? "EXPECTED OUTPUT" : "RESPONSE"}</span>
                      {isDemo && !res.error && <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[8px] font-bold text-yellow-400">SIMULATED</span>}
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">{res.time === 0 ? "instant" : `${res.time}ms`}</span>
                  </div>
                  <pre className="max-h-[200px] overflow-auto rounded-b-lg bg-black/50 p-3 font-mono text-[10px] leading-relaxed text-white/60">
                    {res.error ? res.error : JSON.stringify(res.data, null, 2)}
                  </pre>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
type LabTab = "kitchen" | "library" | "heatmap" | "fusion" | "live" | "api";

export default function PlaygroundPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<LabTab>("kitchen");
  const [kitchenKey, setKitchenKey] = useState(0);
  const kitchenIngredientsRef = useRef<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => { setHistory(getLabHistory()); }, []);

  const dismissIntro = useCallback(() => setShowIntro(false), []);

  const loadExperiment = useCallback((exp: LabExperiment) => {
    kitchenIngredientsRef.current = exp.ingredients;
    setKitchenKey((k) => k + 1);
    setActiveTab("kitchen");
    addLabHistory({ id: exp.id, title: exp.title, cuisine: exp.cuisine, ingredients: exp.ingredients });
    setHistory(getLabHistory());
  }, []);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    kitchenIngredientsRef.current = entry.ingredients;
    setKitchenKey((k) => k + 1);
    setActiveTab("kitchen");
  }, []);

  const tabs: { id: LabTab; label: string; icon: React.ReactNode }[] = [
    { id: "kitchen", label: "Molecular Kitchen", icon: <FlaskConical className="h-4 w-4" /> },
    { id: "library", label: `Library (${LAB_EXPERIMENTS.length})`, icon: <BookOpen className="h-4 w-4" /> },
    { id: "heatmap", label: "Heatmap", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "fusion", label: "Fusion Lab", icon: <Shuffle className="h-4 w-4" /> },
    { id: "live", label: "Live Experiment", icon: <TestTubes className="h-4 w-4" /> },
    { id: "api", label: `API Explorer (${ALL_API_ENDPOINTS.length})`, icon: <Terminal className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence>{showIntro && <IntroOverlay onDone={dismissIntro} />}</AnimatePresence>

      {/* Lab Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/40 hover:bg-white/5 hover:text-white/70"><ArrowLeft className="h-3.5 w-3.5" />Exit Lab</Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-[#FF6F00]"><FlaskConical className="h-4 w-4 text-white" /></div>
              <span className="hidden font-[family-name:var(--font-playfair)] text-sm font-bold sm:inline">Molecular Kitchen Lab</span>
            </div>
          </div>
          <Badge variant="secondary" className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <Sparkles className="mr-1 h-3 w-3" />{activeTab === "live" || activeTab === "api" ? "1 Credit / Call" : "Zero API Credits"}
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex shrink-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", activeTab === tab.id ? "bg-gradient-to-r from-[#FF6F00] to-[#E91E63] text-white shadow-lg" : "text-white/40 hover:bg-white/5 hover:text-white/70")}>
              {tab.icon}<span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* History bar */}
        {history.length > 0 && (activeTab === "kitchen" || activeTab === "library") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white/50"><History className="h-3.5 w-3.5" />Recent Experiments</h3>
              <button onClick={() => { clearLabHistory(); setHistory([]); }} className="text-[10px] text-white/20 hover:text-red-400"><Trash2 className="inline h-3 w-3" /> Clear</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {history.slice(0, 10).map((h) => (
                <button key={h.id + h.timestamp} onClick={() => loadFromHistory(h)}
                  className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-left hover:border-[#FF6F00]/30 hover:bg-white/10">
                  <span className="rounded bg-white/10 px-1 py-0.5 font-mono text-[8px] text-white/40">{h.cuisine.slice(0, 2).toUpperCase()}</span>
                  <span className="text-xs text-white/60">{h.title}</span>
                  <span className="text-[9px] text-white/20">{h.ingredients.length} ing</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === "kitchen" && <MolecularKitchen key={kitchenKey} initialIngredients={kitchenIngredientsRef.current} />}
            {activeTab === "library" && <FormulaLibrary onLoadExperiment={loadExperiment} />}
            {activeTab === "heatmap" && <CompatibilityHeatmap />}
            {activeTab === "fusion" && <FusionGenerator />}
            {activeTab === "live" && <LiveExperiment />}
            {activeTab === "api" && <ApiExplorer />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
