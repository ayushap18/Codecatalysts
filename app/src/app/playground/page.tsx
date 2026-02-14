"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Atom,
  X,
  RotateCcw,
  Zap,
  Beaker,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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
import type { FlavorPrint, PhilosophyScore, RecipeIngredient, FlavorMolecule } from "@/types";

// ── Static data (zero API calls) ──────────────────────────────
const PALETTE_INGREDIENTS = [
  "chicken", "onion", "garlic", "tomato", "cumin", "coriander",
  "yogurt", "butter", "ginger", "chili", "lemon", "cinnamon",
  "rice", "black pepper", "milk", "coconut", "basil", "lentil",
  "potato", "carrot", "olive oil", "sugar", "egg", "flour",
].filter((name) => getMoleculesForIngredient(name).length > 0);

const INTRO_STEPS = [
  "BOOTING UP...",
  "LOADING MOLECULAR DATABASE...",
  "CALIBRATING FLAVOR SENSORS...",
  "INITIALIZING REACTION CHAMBER...",
  "PLAYGROUND READY",
];

// ── Intro Overlay ─────────────────────────────────────────────
function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  // Particle config (memoized once)
  const particles = useMemo(() => {
    const colors = Object.values(FLAVOR_CATEGORIES);
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 12,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
      dur: 2.5 + Math.random() * 4,
      delay: Math.random() * 0.8,
    }));
  }, []);

  // Step through intro text
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= INTRO_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(onDone, 700);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, [onDone]);

  // Escape to skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDone]);

  return (
    <motion.div
      key="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x1}%`,
            top: `${p.y1}%`,
            filter: `blur(${p.size > 10 ? 1 : 0}px)`,
          }}
          animate={{
            left: [`${p.x1}%`, `${p.x2}%`, `${p.x1}%`],
            top: [`${p.y1}%`, `${p.y2}%`, `${p.y1}%`],
            opacity: [0, 0.6, 0.2, 0.5, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glowing ring behind icon */}
      <motion.div
        className="absolute h-32 w-32 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,111,0,0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <FlaskConical className="mb-6 h-14 w-14 text-[#FF6F00]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white md:text-3xl"
        >
          Molecular Kitchen{" "}
          <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">
            Lab
          </span>
        </motion.h1>

        {/* Typewriter text */}
        <div className="h-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-xs tracking-[0.25em] text-emerald-400 md:text-sm"
            >
              {INTRO_STEPS[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/10 md:w-72">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6F00] via-[#E91E63] to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </div>

        {/* Molecule count indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-4 font-mono text-[10px] text-white/40"
        >
          {PALETTE_INGREDIENTS.length} INGREDIENTS / {
            PALETTE_INGREDIENTS.reduce((sum, n) => sum + getMoleculesForIngredient(n).length, 0)
          } MOLECULES LOADED
        </motion.p>
      </div>

      {/* White flash at end */}
      {step >= INTRO_STEPS.length - 1 && (
        <motion.div
          className="absolute inset-0 z-20 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}

      {/* Skip */}
      <button
        onClick={onDone}
        className="absolute bottom-6 right-6 z-30 font-mono text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/70"
      >
        Skip [Esc]
      </button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const dismissIntro = useCallback(() => setShowIntro(false), []);

  // ── Sync computed data (zero API calls) ───────────────────
  const fakeIngredients: RecipeIngredient[] = useMemo(
    () =>
      selectedIngredients.map((name, i) => ({
        recipe_no: 0,
        ingredient_phrase: name,
        ingredient: name,
        quantity: "",
        ing_id: i,
      })),
    [selectedIngredients]
  );

  const allMolecules: FlavorMolecule[] = useMemo(() => {
    const mols: FlavorMolecule[] = [];
    for (const name of selectedIngredients) {
      mols.push(...getMoleculesForIngredient(name));
    }
    return mols;
  }, [selectedIngredients]);

  const uniqueMolecules = useMemo(
    () => Array.from(new Map(allMolecules.map((m) => [m.common_name, m])).values()),
    [allMolecules]
  );

  const flavorprint: FlavorPrint | null = useMemo(() => {
    if (selectedIngredients.length === 0) return null;
    return generateFlavorPrint(0, "Lab Mix", "Lab", "Lab", fakeIngredients);
  }, [selectedIngredients, fakeIngredients]);

  const philosophy: PhilosophyScore | null = useMemo(() => {
    if (selectedIngredients.length < 2) return null;
    return calculatePhilosophyScore(fakeIngredients);
  }, [selectedIngredients, fakeIngredients]);

  const compatibility = useMemo(() => {
    if (selectedIngredients.length < 2) return null;
    const last = selectedIngredients[selectedIngredients.length - 1];
    const prev = selectedIngredients[selectedIngredients.length - 2];
    const lastMols = getMoleculesForIngredient(last).map((m) => m.common_name);
    const prevMols = getMoleculesForIngredient(prev).map((m) => m.common_name);
    const shared = lastMols.filter((m) => prevMols.includes(m));
    const jaccard = jaccardSimilarity(lastMols, prevMols);
    return { last, prev, shared, jaccard };
  }, [selectedIngredients]);

  const moleculesColored = useMemo(
    () =>
      uniqueMolecules.map((m) => {
        const cat = classifyFlavor(m.flavor_profile);
        return { ...m, category: cat, color: FLAVOR_CATEGORIES[cat] || "#90A4AE" };
      }),
    [uniqueMolecules]
  );

  // ── Callbacks ─────────────────────────────────────────────
  const addIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) => prev.filter((n) => n !== name));
  }, []);

  const clearAll = useCallback(() => setSelectedIngredients([]), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-background dark:from-emerald-950/10 dark:to-background">
      <Navbar />

      {/* ── Intro Animation Overlay ──────────────────────── */}
      <AnimatePresence>
        {showIntro && <IntroOverlay onDone={dismissIntro} />}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ── Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <Badge
            variant="secondary"
            className="mb-4 border border-emerald-500/20 text-emerald-600"
          >
            <FlaskConical className="mr-1 h-3 w-3" />
            Zero API Credits
          </Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Molecular{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-[#FF6F00] bg-clip-text text-transparent">
              Kitchen Lab
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Click ingredients to drop them into the beaker. Watch molecular
            reactions, compatibility scores, and flavor fingerprints update
            instantly. All analysis runs locally — zero API credits used.
          </p>
        </motion.div>

        {/* ── 3-Panel Grid ───────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr_320px]">
          {/* ── LEFT: Ingredient Palette ─────────────────── */}
          <Card className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Beaker className="h-4 w-4 text-emerald-500" />
                Ingredient Palette
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
                {PALETTE_INGREDIENTS.map((name) => {
                  const mols = getMoleculesForIngredient(name);
                  const isSelected = selectedIngredients.includes(name);
                  return (
                    <motion.button
                      key={name}
                      onClick={() =>
                        isSelected ? removeIngredient(name) : addIngredient(name)
                      }
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        "rounded-lg border p-2.5 text-left text-sm transition-all",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30"
                          : "border-border/50 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                      )}
                    >
                      <p className="font-medium capitalize">{name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Atom className="h-3 w-3" />
                        {mols.length} molecules
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── CENTER: The Beaker ───────────────────────── */}
          <div className="space-y-4">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                {/* Clear button */}
                {selectedIngredients.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="absolute right-4 top-4 z-10 gap-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                  </Button>
                )}

                <h2 className="mb-4 text-center text-sm font-semibold">
                  The Beaker
                  {selectedIngredients.length > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({selectedIngredients.length} ingredient
                      {selectedIngredients.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </h2>

                {/* Beaker container */}
                <div className="relative mx-auto flex min-h-[260px] w-full max-w-sm items-end justify-center rounded-b-[2rem] rounded-t-xl border-2 border-dashed border-emerald-500/30 bg-gradient-to-t from-emerald-500/5 to-transparent">
                  {/* Bubbling effect when items exist */}
                  {selectedIngredients.length > 0 && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={`bubble-${i}`}
                          className="absolute rounded-full bg-emerald-400/20"
                          style={{
                            width: 4 + Math.random() * 8,
                            height: 4 + Math.random() * 8,
                            left: `${20 + Math.random() * 60}%`,
                            bottom: 0,
                          }}
                          animate={{
                            y: [0, -(100 + Math.random() * 150)],
                            opacity: [0.6, 0],
                          }}
                          transition={{
                            duration: 1.5 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                          }}
                        />
                      ))}
                    </>
                  )}

                  {selectedIngredients.length === 0 ? (
                    <p className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground/60">
                      <FlaskConical className="h-10 w-10" />
                      Click ingredients to add...
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-end justify-center gap-3 p-5">
                      <AnimatePresence>
                        {selectedIngredients.map((name) => {
                          const mols = getMoleculesForIngredient(name);
                          const cat =
                            mols.length > 0
                              ? classifyFlavor(mols[0].flavor_profile)
                              : "other";
                          const color = FLAVOR_CATEGORIES[cat] || "#90A4AE";
                          return (
                            <motion.div
                              key={name}
                              initial={{ opacity: 0, y: -40, scale: 0.3 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0, y: 20 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 18,
                              }}
                              className="group relative flex flex-col items-center"
                            >
                              <motion.div
                                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg"
                                style={{ backgroundColor: color }}
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                onClick={() => removeIngredient(name)}
                                title={`Remove ${name}`}
                              >
                                {name.slice(0, 2).toUpperCase()}
                              </motion.div>
                              <span className="mt-1 text-[9px] capitalize text-muted-foreground">
                                {name}
                              </span>
                              {/* X on hover */}
                              <div className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 group-hover:block">
                                <X className="h-2.5 w-2.5 text-white" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                {flavorprint && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 grid grid-cols-3 gap-3 text-center"
                  >
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-emerald-500">
                        {flavorprint.totalMolecules}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Molecules</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-[#FF6F00]">
                        {flavorprint.categories.filter((c) => c.count > 0).length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Categories</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-[#E91E63]">
                        {flavorprint.analyzedCount}/{flavorprint.ingredientCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Analyzed</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* RadialChart below beaker */}
            {flavorprint && flavorprint.totalMolecules > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card>
                  <CardContent className="flex justify-center p-4">
                    <RadialChart flavorprint={flavorprint} size={280} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Analysis Dashboard ────────────────── */}
          <div className="space-y-4">
            {/* Compatibility */}
            {compatibility && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Zap className="h-4 w-4 text-[#FF6F00]" />
                      Reaction
                    </h3>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs capitalize text-muted-foreground">
                        {compatibility.prev} + {compatibility.last}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          compatibility.jaccard > 0.3
                            ? "bg-green-500/10 text-green-600"
                            : compatibility.jaccard > 0
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                        }
                      >
                        {Math.round(compatibility.jaccard * 100)}% match
                      </Badge>
                    </div>
                    {/* Score bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6F00] to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(Math.round(compatibility.jaccard * 100), 2)}%`,
                        }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    {compatibility.shared.length > 0 ? (
                      <div className="mt-3">
                        <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                          Shared Molecules ({compatibility.shared.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {compatibility.shared.map((m) => (
                            <span
                              key={m}
                              className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-600"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        No shared molecules — a contrast pairing!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Philosophy Gauge */}
            {philosophy && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold">
                      Cooking Philosophy
                    </h3>
                    <SpectrumGauge score={philosophy} recipeName="Lab Mix" />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Category Breakdown */}
            {flavorprint && flavorprint.categories.some((c) => c.count > 0) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold">
                      Flavor Breakdown
                    </h3>
                    <div className="space-y-2">
                      {flavorprint.categories
                        .filter((c) => c.count > 0)
                        .map((cat) => {
                          const maxCount = Math.max(
                            ...flavorprint.categories.map((c) => c.count)
                          );
                          return (
                            <div
                              key={cat.name}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="w-14 shrink-0 text-xs capitalize">
                                {cat.name}
                              </span>
                              <div className="flex-1">
                                <div className="h-1.5 w-full rounded-full bg-muted">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(cat.count / maxCount) * 100}%`,
                                    }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                              <span className="w-5 shrink-0 text-right text-[10px] text-muted-foreground">
                                {cat.count}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Empty state */}
            {selectedIngredients.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/20" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Add ingredients to see molecular analysis
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    All computation runs locally — zero API credits
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ── Bottom: Molecule Ribbon ────────────────────── */}
        {uniqueMolecules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Atom className="h-4 w-4 text-[#E91E63]" />
              Detected Molecules ({uniqueMolecules.length})
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-3">
              {moleculesColored.map((mol) => (
                <motion.div
                  key={mol.common_name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: mol.color }}
                  />
                  <span className="whitespace-nowrap font-mono text-xs">
                    {mol.common_name}
                  </span>
                  <span className="text-[9px] capitalize text-muted-foreground">
                    {mol.category}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
