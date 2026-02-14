"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Eye,
  ChevronRight,
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
import type {
  FlavorPrint,
  PhilosophyScore,
  RecipeIngredient,
  FlavorMolecule,
} from "@/types";

// ── Static data ──────────────────────────────────────────────
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
  "LAB READY",
];

// ── Pre-built experiment examples (TinkerCAD-like library) ───
interface LabExperiment {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
}

const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: "italian-marriage",
    title: "The Italian Marriage",
    description:
      "Tomato + Basil is the iconic pairing. Both share Linalool — a floral molecule that binds them at the molecular level.",
    ingredients: ["tomato", "basil", "garlic", "olive oil"],
    tags: ["Western Pairing", "Floral Bond"],
    difficulty: "Beginner",
    icon: "IT",
  },
  {
    id: "indian-spice-trio",
    title: "Indian Spice Trio",
    description:
      "Cumin + Coriander + Chili. Despite their different flavor profiles, these spices share woody terpenes (p-Cymene, Beta-pinene) creating an unexpected molecular bridge.",
    ingredients: ["cumin", "coriander", "chili", "ginger"],
    tags: ["Contrast Style", "Spice Chemistry"],
    difficulty: "Intermediate",
    icon: "IN",
  },
  {
    id: "butter-chicken-base",
    title: "Butter Chicken Base",
    description:
      "Butter + Chicken + Garlic + Ginger. Diacetyl from butter meets meaty sulfur compounds, while Citral from ginger adds citrus brightness.",
    ingredients: ["butter", "chicken", "garlic", "ginger", "onion"],
    tags: ["Cross-Category", "Umami Rich"],
    difficulty: "Advanced",
    icon: "BC",
  },
  {
    id: "citrus-herb-fusion",
    title: "Citrus-Herb Fusion",
    description:
      "Lemon + Basil + Coriander — all three share Linalool, making this a near-perfect molecular triad. Pure pairing chemistry.",
    ingredients: ["lemon", "basil", "coriander"],
    tags: ["Perfect Match", "Floral-Citrus"],
    difficulty: "Beginner",
    icon: "CH",
  },
  {
    id: "earthy-comfort",
    title: "Earthy Comfort Bowl",
    description:
      "Potato + Lentil + Carrot + Onion. These root vegetables share Nonanal and earthy compounds, producing deep grounding flavors.",
    ingredients: ["potato", "lentil", "carrot", "onion"],
    tags: ["Earth Tones", "Root Chemistry"],
    difficulty: "Beginner",
    icon: "EC",
  },
  {
    id: "sweet-spice-alchemy",
    title: "Sweet Spice Alchemy",
    description:
      "Cinnamon + Coconut + Sugar + Milk. Cinnamaldehyde meets Delta-decalactone creating a warm-creamy molecule cascade. Classic dessert science.",
    ingredients: ["cinnamon", "coconut", "sugar", "milk"],
    tags: ["Dessert Science", "Warm-Sweet"],
    difficulty: "Intermediate",
    icon: "SS",
  },
  {
    id: "umami-bomb",
    title: "Umami Bomb",
    description:
      "Chicken + Egg + Onion + Black Pepper. Hydrogen sulfide from egg meets meaty compounds from chicken. Dimethyl trisulfide acts as the molecular glue.",
    ingredients: ["chicken", "egg", "onion", "black pepper"],
    tags: ["Umami Stack", "Sulfur Bridge"],
    difficulty: "Advanced",
    icon: "UB",
  },
  {
    id: "thai-contrast",
    title: "Thai Contrast Profile",
    description:
      "Coconut + Chili + Lemon + Basil. Capsaicin heat vs cooling Linalool, sweet lactones vs sharp citrus — maximum molecular contrast.",
    ingredients: ["coconut", "chili", "lemon", "basil"],
    tags: ["East Asian Style", "Max Contrast"],
    difficulty: "Advanced",
    icon: "TC",
  },
];

// ── Intro Overlay ────────────────────────────────────────────
function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

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

      <motion.div
        className="absolute h-32 w-32 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,111,0,0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

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

        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/10 md:w-72">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6F00] via-[#E91E63] to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-4 font-mono text-[10px] text-white/40"
        >
          {PALETTE_INGREDIENTS.length} INGREDIENTS /{" "}
          {PALETTE_INGREDIENTS.reduce(
            (sum, n) => sum + getMoleculesForIngredient(n).length,
            0
          )}{" "}
          MOLECULES LOADED
        </motion.p>
      </div>

      {step >= INTRO_STEPS.length - 1 && (
        <motion.div
          className="absolute inset-0 z-20 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}

      <button
        onClick={onDone}
        className="absolute bottom-6 right-6 z-30 font-mono text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/70"
      >
        Skip [Esc]
      </button>
    </motion.div>
  );
}

// ── Tab: Molecular Kitchen (zero API) ────────────────────────
function MolecularKitchen() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

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
    () =>
      Array.from(
        new Map(allMolecules.map((m) => [m.common_name, m])).values()
      ),
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
    const lastMols = getMoleculesForIngredient(last).map(
      (m) => m.common_name
    );
    const prevMols = getMoleculesForIngredient(prev).map(
      (m) => m.common_name
    );
    const shared = lastMols.filter((m) => prevMols.includes(m));
    const jaccard = jaccardSimilarity(lastMols, prevMols);
    return { last, prev, shared, jaccard };
  }, [selectedIngredients]);

  const moleculesColored = useMemo(
    () =>
      uniqueMolecules.map((m) => {
        const cat = classifyFlavor(m.flavor_profile);
        return {
          ...m,
          category: cat,
          color: FLAVOR_CATEGORIES[cat] || "#90A4AE",
        };
      }),
    [uniqueMolecules]
  );

  const addIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev : [...prev, name]
    );
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) => prev.filter((n) => n !== name));
  }, []);

  const clearAll = useCallback(() => setSelectedIngredients([]), []);

  return (
    <div className="space-y-6">
      {/* 3-Panel Grid */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr_300px]">
        {/* LEFT: Ingredient Palette */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Beaker className="h-4 w-4 text-emerald-400" />
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
                      ? "border-emerald-500 bg-emerald-500/15 text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "border-white/10 text-white/70 hover:border-emerald-500/40 hover:bg-white/5"
                  )}
                >
                  <p className="font-medium capitalize">{name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
                    <Atom className="h-3 w-3" />
                    {mols.length} molecules
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* CENTER: The Beaker */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6">
            {selectedIngredients.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="absolute right-4 top-4 z-10 gap-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
            )}

            <h2 className="mb-4 text-center text-sm font-semibold text-white">
              The Beaker
              {selectedIngredients.length > 0 && (
                <span className="ml-2 text-white/40">
                  ({selectedIngredients.length} ingredient
                  {selectedIngredients.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>

            <div className="relative mx-auto flex min-h-[260px] w-full max-w-sm items-end justify-center rounded-b-[2rem] rounded-t-xl border-2 border-dashed border-emerald-500/30 bg-gradient-to-t from-emerald-500/5 to-transparent">
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
                <p className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/30">
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
                          <span className="mt-1 text-[9px] capitalize text-white/50">
                            {name}
                          </span>
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

            {flavorprint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 grid grid-cols-3 gap-3 text-center"
              >
                <div className="rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-emerald-400">
                    {flavorprint.totalMolecules}
                  </p>
                  <p className="text-[10px] text-white/40">Molecules</p>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-[#FF6F00]">
                    {
                      flavorprint.categories.filter((c) => c.count > 0)
                        .length
                    }
                  </p>
                  <p className="text-[10px] text-white/40">Categories</p>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-[#E91E63]">
                    {flavorprint.analyzedCount}/{flavorprint.ingredientCount}
                  </p>
                  <p className="text-[10px] text-white/40">Analyzed</p>
                </div>
              </motion.div>
            )}
          </div>

          {flavorprint && flavorprint.totalMolecules > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex justify-center">
                <RadialChart flavorprint={flavorprint} size={280} />
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Analysis Dashboard */}
        <div className="space-y-4">
          {compatibility && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Zap className="h-4 w-4 text-[#FF6F00]" />
                Reaction
              </h3>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs capitalize text-white/50">
                  {compatibility.prev} + {compatibility.last}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-0",
                    compatibility.jaccard > 0.3
                      ? "bg-green-500/20 text-green-400"
                      : compatibility.jaccard > 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  )}
                >
                  {Math.round(compatibility.jaccard * 100)}% match
                </Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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
                  <p className="mb-1 text-[10px] font-medium text-white/40">
                    Shared Molecules ({compatibility.shared.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {compatibility.shared.map((m) => (
                      <span
                        key={m}
                        className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-white/40">
                  No shared molecules — a contrast pairing!
                </p>
              )}
            </motion.div>
          )}

          {philosophy && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="mb-3 text-sm font-semibold text-white">
                Cooking Philosophy
              </h3>
              <SpectrumGauge score={philosophy} recipeName="Lab Mix" />
            </motion.div>
          )}

          {flavorprint &&
            flavorprint.categories.some((c) => c.count > 0) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <h3 className="mb-3 text-sm font-semibold text-white">
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
                          <span className="w-14 shrink-0 text-xs capitalize text-white/70">
                            {cat.name}
                          </span>
                          <div className="flex-1">
                            <div className="h-1.5 w-full rounded-full bg-white/10">
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
                          <span className="w-5 shrink-0 text-right text-[10px] text-white/40">
                            {cat.count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

          {selectedIngredients.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-white/10" />
              <p className="mt-3 text-sm text-white/40">
                Add ingredients to see molecular analysis
              </p>
              <p className="mt-1 text-[10px] text-white/20">
                All computation runs locally — zero API credits
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Molecule Ribbon */}
      {uniqueMolecules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Atom className="h-4 w-4 text-[#E91E63]" />
            Detected Molecules ({uniqueMolecules.length})
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {moleculesColored.map((mol) => (
              <motion.div
                key={mol.common_name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: mol.color }}
                />
                <span className="whitespace-nowrap font-mono text-xs text-white/80">
                  {mol.common_name}
                </span>
                <span className="text-[9px] capitalize text-white/30">
                  {mol.category}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Tab: Formula Library ─────────────────────────────────────
function FormulaLibrary({
  onLoadExperiment,
}: {
  onLoadExperiment: (ingredients: string[]) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const activeExperiment = LAB_EXPERIMENTS.find((e) => e.id === active);

  const experimentData = useMemo(() => {
    if (!activeExperiment) return null;

    const ings = activeExperiment.ingredients;
    const fakeIngs: RecipeIngredient[] = ings.map((name, i) => ({
      recipe_no: 0,
      ingredient_phrase: name,
      ingredient: name,
      quantity: "",
      ing_id: i,
    }));

    const fp = generateFlavorPrint(0, activeExperiment.title, "Lab", "Lab", fakeIngs);
    const phil = ings.length >= 2 ? calculatePhilosophyScore(fakeIngs) : null;

    // Build molecule map per ingredient
    const ingMols: { name: string; molecules: { common_name: string; flavor_profile: string; category: string; color: string }[] }[] = [];
    for (const name of ings) {
      const mols = getMoleculesForIngredient(name);
      ingMols.push({
        name,
        molecules: mols.map((m) => {
          const cat = classifyFlavor(m.flavor_profile);
          return { ...m, category: cat, color: FLAVOR_CATEGORIES[cat] || "#90A4AE" };
        }),
      });
    }

    // Find shared molecules across all ingredients
    const allMolNames = ingMols.map((im) => im.molecules.map((m) => m.common_name));
    const shared: string[] = [];
    if (allMolNames.length >= 2) {
      const first = new Set(allMolNames[0]);
      for (const name of first) {
        if (allMolNames.slice(1).some((arr) => arr.includes(name))) {
          shared.push(name);
        }
      }
    }

    return { fp, phil, ingMols, shared };
  }, [activeExperiment]);

  return (
    <div className="space-y-6">
      {/* Experiment Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LAB_EXPERIMENTS.map((exp) => (
          <motion.button
            key={exp.id}
            onClick={() => setActive(active === exp.id ? null : exp.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
              active === exp.id
                ? "border-[#FF6F00]/50 bg-[#FF6F00]/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            )}
          >
            {/* Icon badge */}
            <div
              className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg font-mono text-xs font-bold",
                active === exp.id
                  ? "bg-[#FF6F00] text-white"
                  : "bg-white/10 text-white/60"
              )}
            >
              {exp.icon}
            </div>
            <h3 className="text-sm font-semibold text-white">{exp.title}</h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/40">
              {exp.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-white/30">
                {exp.ingredients.length} ingredients
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  exp.difficulty === "Beginner"
                    ? "text-green-400/60"
                    : exp.difficulty === "Intermediate"
                      ? "text-yellow-400/60"
                      : "text-red-400/60"
                )}
              >
                {exp.difficulty}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Expanded experiment detail */}
      <AnimatePresence>
        {activeExperiment && experimentData && (
          <motion.div
            key={activeExperiment.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[#FF6F00]/30 bg-white/[0.03] p-6">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
                    {activeExperiment.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/50">
                    {activeExperiment.description}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    onLoadExperiment(activeExperiment.ingredients)
                  }
                  className="shrink-0 gap-1.5 bg-[#FF6F00] text-white hover:bg-[#E65100]"
                  size="sm"
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  Load in Kitchen
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Molecular Formula Table */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Atom className="h-4 w-4 text-emerald-400" />
                    Molecular Formula
                  </h3>
                  <div className="space-y-3">
                    {experimentData.ingMols.map((im) => (
                      <div key={im.name} className="rounded-lg bg-white/5 p-3">
                        <p className="mb-2 text-xs font-semibold capitalize text-white/80">
                          {im.name}
                        </p>
                        <div className="space-y-1">
                          {im.molecules.map((mol) => (
                            <div
                              key={mol.common_name}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: mol.color }}
                                />
                                <span className="font-mono text-[11px] text-white/70">
                                  {mol.common_name}
                                </span>
                                {experimentData.shared.includes(
                                  mol.common_name
                                ) && (
                                  <span className="rounded bg-[#FF6F00]/20 px-1 text-[8px] font-bold text-[#FF6F00]">
                                    SHARED
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] capitalize text-white/30">
                                {mol.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shared molecules highlight */}
                  {experimentData.shared.length > 0 && (
                    <div className="mt-4 rounded-lg border border-[#FF6F00]/20 bg-[#FF6F00]/5 p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6F00]">
                        Molecular Bridges ({experimentData.shared.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {experimentData.shared.map((m) => (
                          <span
                            key={m}
                            className="rounded-full bg-[#FF6F00]/15 px-2.5 py-1 font-mono text-[10px] text-[#FF6F00]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Charts */}
                <div className="space-y-4">
                  {experimentData.fp.totalMolecules > 0 && (
                    <div className="flex justify-center">
                      <RadialChart
                        flavorprint={experimentData.fp}
                        size={260}
                      />
                    </div>
                  )}
                  {experimentData.phil && (
                    <div className="rounded-lg bg-white/5 p-3">
                      <SpectrumGauge
                        score={experimentData.phil}
                        recipeName={activeExperiment.title}
                      />
                    </div>
                  )}
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white/5 p-2">
                      <p className="text-lg font-bold text-emerald-400">
                        {experimentData.fp.totalMolecules}
                      </p>
                      <p className="text-[9px] text-white/30">
                        Total Molecules
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2">
                      <p className="text-lg font-bold text-[#FF6F00]">
                        {experimentData.shared.length}
                      </p>
                      <p className="text-[9px] text-white/30">
                        Shared Bridges
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2">
                      <p className="text-lg font-bold text-[#E91E63]">
                        {
                          experimentData.fp.categories.filter(
                            (c) => c.count > 0
                          ).length
                        }
                      </p>
                      <p className="text-[9px] text-white/30">
                        Flavor Categories
                      </p>
                    </div>
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

// ── Tab: Live Experiment (1 free API call) ───────────────────
function LiveExperiment() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    name: string;
    molecules: FlavorMolecule[];
    categories: { name: string; color: string; count: number }[];
  } | null>(null);
  const [error, setError] = useState("");

  const handleSearch = useCallback(async () => {
    const term = query.trim().toLowerCase();
    if (!term) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await getEntitiesByName(term);
      const entities = data?.content || [];
      if (entities.length === 0) {
        setError(`No FlavorDB entry found for "${term}". Try a common ingredient like "mango", "thyme", or "beef".`);
        setLoading(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entity = entities[0] as any;
      const mols: FlavorMolecule[] = (entity.molecules || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m: any) => ({
          common_name: m.common_name || m.commonName || m.common_Name || "Unknown",
          flavor_profile: m.flavor_profile || m.flavorProfile || m.flavor_Profile || "other",
          pubchem_id: m.pubchem_id || m.pubchemId,
        })
      );

      // Categorize
      const catMap: Record<string, string[]> = {};
      for (const mol of mols) {
        const profiles = mol.flavor_profile.split(",").map((s) => s.trim());
        for (const profile of profiles) {
          const cat = classifyFlavor(profile);
          if (!catMap[cat]) catMap[cat] = [];
          if (!catMap[cat].includes(mol.common_name)) {
            catMap[cat].push(mol.common_name);
          }
        }
      }

      const categories = Object.entries(catMap)
        .map(([name, molecules]) => ({
          name,
          color: FLAVOR_CATEGORIES[name] || "#90A4AE",
          count: molecules.length,
        }))
        .sort((a, b) => b.count - a.count);

      setResult({
        name: entity.entity_alias_readable || term,
        molecules: mols,
        categories,
      });
    } catch {
      setError("API request failed. Check your connection or try again.");
    }
    setLoading(false);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
          Live Molecular{" "}
          <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">
            Analysis
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Search any ingredient beyond our static library. Uses 1 API call
          per unique search (cached for 24h after first lookup).
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="mx-auto flex max-w-lg gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search any ingredient... (e.g. mango, thyme, beef)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#FF6F00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6F00]/30"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-12 bg-[#FF6F00] px-6 text-white hover:bg-[#E65100] disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Zap className="mr-1 h-4 w-4" />
              Analyze
            </>
          )}
        </Button>
      </form>

      {/* Quick suggestions */}
      <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-2">
        {["mango", "thyme", "beef", "saffron", "vanilla", "coffee"].map(
          (s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
              }}
              className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-white/40 transition-colors hover:border-[#FF6F00]/30 hover:text-white/60"
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-lg rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-xl border border-[#FF6F00]/30 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold capitalize text-white">
                {result.name}
              </h3>
              <Badge
                variant="secondary"
                className="border-0 bg-emerald-500/20 text-emerald-400"
              >
                {result.molecules.length} molecules detected
              </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category breakdown */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Flavor Categories
                </h4>
                <div className="space-y-2">
                  {result.categories.map((cat) => {
                    const maxCount = Math.max(
                      ...result.categories.map((c) => c.count)
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
                        <span className="w-14 shrink-0 text-xs capitalize text-white/60">
                          {cat.name}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full bg-white/10">
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
                        <span className="w-5 shrink-0 text-right text-xs text-white/40">
                          {cat.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Molecule list */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Full Molecular Composition
                </h4>
                <div className="max-h-[300px] space-y-1 overflow-y-auto pr-2">
                  {result.molecules.map((mol, i) => {
                    const cat = classifyFlavor(mol.flavor_profile);
                    const color = FLAVOR_CATEGORIES[cat] || "#90A4AE";
                    return (
                      <motion.div
                        key={mol.common_name + i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-xs text-white/70">
                            {mol.common_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/30">
                          {mol.flavor_profile}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-white/5 p-3 text-center">
              <p className="text-[10px] text-white/30">
                Data sourced from FlavorDB (CoSyLab, IIIT Delhi) — cached locally for 24 hours
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!result && !error && !loading && (
        <div className="py-8 text-center">
          <TestTubes className="mx-auto h-12 w-12 text-white/10" />
          <p className="mt-3 text-sm text-white/30">
            Search for any ingredient to see its complete molecular profile
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
type LabTab = "kitchen" | "library" | "live";

export default function PlaygroundPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<LabTab>("kitchen");
  const [kitchenIngredients, setKitchenIngredients] = useState<string[]>([]);

  const dismissIntro = useCallback(() => setShowIntro(false), []);

  // When an experiment from the library is loaded into the kitchen
  const loadExperiment = useCallback((ingredients: string[]) => {
    setKitchenIngredients(ingredients);
    setActiveTab("kitchen");
  }, []);

  const tabs: { id: LabTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "kitchen",
      label: "Molecular Kitchen",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      id: "library",
      label: "Formula Library",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: "live",
      label: "Live Experiment",
      icon: <TestTubes className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Intro Animation Overlay ──────────────────── */}
      <AnimatePresence>
        {showIntro && <IntroOverlay onDone={dismissIntro} />}
      </AnimatePresence>

      {/* ── Lab Header (no Navbar) ───────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Exit Lab
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-[#FF6F00]">
                <FlaskConical className="h-4 w-4 text-white" />
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-sm font-bold">
                Molecular Kitchen Lab
              </span>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            {activeTab === "live" ? "1 API Credit / Search" : "Zero API Credits"}
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ── Tab Navigation ─────────────────────────── */}
        <div className="mb-6 flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#FF6F00] to-[#E91E63] text-white shadow-lg"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "kitchen" && (
              <MolecularKitchenWithPreload
                preloadIngredients={kitchenIngredients}
                onClearPreload={() => setKitchenIngredients([])}
              />
            )}
            {activeTab === "library" && (
              <FormulaLibrary onLoadExperiment={loadExperiment} />
            )}
            {activeTab === "live" && <LiveExperiment />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Kitchen wrapper that handles preloaded ingredients ────────
function MolecularKitchenWithPreload({
  preloadIngredients,
  onClearPreload,
}: {
  preloadIngredients: string[];
  onClearPreload: () => void;
}) {
  // This is a thin wrapper — the actual MolecularKitchen manages its own state
  // but we need to pass preloaded ingredients when switching from library
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (preloadIngredients.length > 0) {
      setKey((k) => k + 1);
      onClearPreload();
    }
  }, [preloadIngredients, onClearPreload]);

  return (
    <MolecularKitchenStateful
      key={key}
      initialIngredients={preloadIngredients}
    />
  );
}

function MolecularKitchenStateful({
  initialIngredients,
}: {
  initialIngredients: string[];
}) {
  const [selectedIngredients, setSelectedIngredients] =
    useState<string[]>(initialIngredients);

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
    () =>
      Array.from(
        new Map(allMolecules.map((m) => [m.common_name, m])).values()
      ),
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
    const lastMols = getMoleculesForIngredient(last).map(
      (m) => m.common_name
    );
    const prevMols = getMoleculesForIngredient(prev).map(
      (m) => m.common_name
    );
    const shared = lastMols.filter((m) => prevMols.includes(m));
    const jaccard = jaccardSimilarity(lastMols, prevMols);
    return { last, prev, shared, jaccard };
  }, [selectedIngredients]);

  const moleculesColored = useMemo(
    () =>
      uniqueMolecules.map((m) => {
        const cat = classifyFlavor(m.flavor_profile);
        return {
          ...m,
          category: cat,
          color: FLAVOR_CATEGORIES[cat] || "#90A4AE",
        };
      }),
    [uniqueMolecules]
  );

  const addIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev : [...prev, name]
    );
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) => prev.filter((n) => n !== name));
  }, []);

  const clearAll = useCallback(() => setSelectedIngredients([]), []);

  return (
    <div className="space-y-6">
      {/* 3-Panel Grid */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr_300px]">
        {/* LEFT: Ingredient Palette */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Beaker className="h-4 w-4 text-emerald-400" />
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
                      ? "border-emerald-500 bg-emerald-500/15 text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "border-white/10 text-white/70 hover:border-emerald-500/40 hover:bg-white/5"
                  )}
                >
                  <p className="font-medium capitalize">{name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
                    <Atom className="h-3 w-3" />
                    {mols.length} molecules
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* CENTER: The Beaker */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6">
            {selectedIngredients.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="absolute right-4 top-4 z-10 gap-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
            )}

            <h2 className="mb-4 text-center text-sm font-semibold text-white">
              The Beaker
              {selectedIngredients.length > 0 && (
                <span className="ml-2 text-white/40">
                  ({selectedIngredients.length} ingredient
                  {selectedIngredients.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>

            <div className="relative mx-auto flex min-h-[260px] w-full max-w-sm items-end justify-center rounded-b-[2rem] rounded-t-xl border-2 border-dashed border-emerald-500/30 bg-gradient-to-t from-emerald-500/5 to-transparent">
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
                <p className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/30">
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
                          <span className="mt-1 text-[9px] capitalize text-white/50">
                            {name}
                          </span>
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

            {flavorprint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 grid grid-cols-3 gap-3 text-center"
              >
                <div className="rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-emerald-400">
                    {flavorprint.totalMolecules}
                  </p>
                  <p className="text-[10px] text-white/40">Molecules</p>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-[#FF6F00]">
                    {
                      flavorprint.categories.filter((c) => c.count > 0)
                        .length
                    }
                  </p>
                  <p className="text-[10px] text-white/40">Categories</p>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-[#E91E63]">
                    {flavorprint.analyzedCount}/{flavorprint.ingredientCount}
                  </p>
                  <p className="text-[10px] text-white/40">Analyzed</p>
                </div>
              </motion.div>
            )}
          </div>

          {flavorprint && flavorprint.totalMolecules > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex justify-center">
                <RadialChart flavorprint={flavorprint} size={280} />
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Analysis Dashboard */}
        <div className="space-y-4">
          {compatibility && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Zap className="h-4 w-4 text-[#FF6F00]" />
                Reaction
              </h3>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs capitalize text-white/50">
                  {compatibility.prev} + {compatibility.last}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-0",
                    compatibility.jaccard > 0.3
                      ? "bg-green-500/20 text-green-400"
                      : compatibility.jaccard > 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  )}
                >
                  {Math.round(compatibility.jaccard * 100)}% match
                </Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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
                  <p className="mb-1 text-[10px] font-medium text-white/40">
                    Shared Molecules ({compatibility.shared.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {compatibility.shared.map((m) => (
                      <span
                        key={m}
                        className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-white/40">
                  No shared molecules — a contrast pairing!
                </p>
              )}
            </motion.div>
          )}

          {philosophy && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="mb-3 text-sm font-semibold text-white">
                Cooking Philosophy
              </h3>
              <SpectrumGauge score={philosophy} recipeName="Lab Mix" />
            </motion.div>
          )}

          {flavorprint &&
            flavorprint.categories.some((c) => c.count > 0) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <h3 className="mb-3 text-sm font-semibold text-white">
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
                          <span className="w-14 shrink-0 text-xs capitalize text-white/70">
                            {cat.name}
                          </span>
                          <div className="flex-1">
                            <div className="h-1.5 w-full rounded-full bg-white/10">
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
                          <span className="w-5 shrink-0 text-right text-[10px] text-white/40">
                            {cat.count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

          {selectedIngredients.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-white/10" />
              <p className="mt-3 text-sm text-white/40">
                Add ingredients to see molecular analysis
              </p>
              <p className="mt-1 text-[10px] text-white/20">
                All computation runs locally — zero API credits
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Molecule Ribbon */}
      {uniqueMolecules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Atom className="h-4 w-4 text-[#E91E63]" />
            Detected Molecules ({uniqueMolecules.length})
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {moleculesColored.map((mol) => (
              <motion.div
                key={mol.common_name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: mol.color }}
                />
                <span className="whitespace-nowrap font-mono text-xs text-white/80">
                  {mol.common_name}
                </span>
                <span className="text-[9px] capitalize text-white/30">
                  {mol.category}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
