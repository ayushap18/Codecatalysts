"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  getMoleculesForIngredient,
  jaccardSimilarity,
  classifyFlavor,
  FLAVOR_CATEGORIES,
} from "@/lib/algorithms/flavorprint";
import { getCuisineIngredients } from "./experiments";

interface Bridge {
  ingA: string;
  ingB: string;
  similarity: number;
  shared: string[];
  sharedCategories: string[];
}

// Generate a creative fusion concept name
function fusionConcept(ingA: string, ingB: string, cuisineA: string, cuisineB: string): string {
  const concepts: Record<string, string> = {
    "Indian-Italian": "Masala Meets Mediterranean",
    "Indian-Thai": "Spice Silk Road",
    "Indian-Mexican": "Chili Corridor",
    "Indian-French": "Colonial Fusion",
    "Indian-Japanese": "Curry & Umami",
    "Indian-Chinese": "Indo-Chinese",
    "Italian-Thai": "Basil East-West",
    "Italian-Mexican": "Latin Mediterranean",
    "Italian-French": "Romance Kitchen",
    "Italian-Japanese": "Zen Trattoria",
    "Thai-Mexican": "Tropical Fire",
    "Thai-French": "Saigon Bistro",
    "Thai-Japanese": "Pacific Rim",
    "Mexican-French": "Oaxacan Brasserie",
    "Middle Eastern-Indian": "Silk Route",
    "Middle Eastern-Italian": "Ancient Med",
    "Middle Eastern-French": "Levantine Bistro",
    "American-Italian": "New York Classic",
    "American-Mexican": "Tex-Mex Molecular",
    "Chinese-Japanese": "East Asian Harmony",
    "Chinese-Thai": "Southeast Fusion",
  };
  const key1 = `${cuisineA}-${cuisineB}`;
  const key2 = `${cuisineB}-${cuisineA}`;
  return concepts[key1] || concepts[key2] || `${cuisineA}×${cuisineB} Fusion`;
}

const FUSION_CUISINES = [
  "Indian", "Italian", "Thai", "Mexican", "Middle Eastern",
  "French", "Japanese", "Chinese", "American", "Mediterranean",
];

export default function FusionGenerator() {
  const [cuisineA, setCuisineA] = useState<string>("Indian");
  const [cuisineB, setCuisineB] = useState<string>("Italian");
  const [expandedBridge, setExpandedBridge] = useState<string | null>(null);

  const cuisineMap = useMemo(() => getCuisineIngredients(), []);

  // Compute cross-cuisine molecular bridges
  const bridges = useMemo(() => {
    if (cuisineA === cuisineB) return [];
    const ingsA = cuisineMap[cuisineA] || [];
    const ingsB = cuisineMap[cuisineB] || [];
    const results: Bridge[] = [];

    for (const a of ingsA) {
      const molsA = getMoleculesForIngredient(a).map((m) => m.common_name);
      if (molsA.length === 0) continue;
      for (const b of ingsB) {
        if (a === b) continue; // Skip same ingredient
        const molsB = getMoleculesForIngredient(b).map((m) => m.common_name);
        if (molsB.length === 0) continue;
        const shared = molsA.filter((m) => molsB.includes(m));
        if (shared.length === 0) continue;
        const sim = jaccardSimilarity(molsA, molsB);
        const sharedCategories = Array.from(
          new Set(
            shared.map((m) => {
              const mol = getMoleculesForIngredient(a).find((x) => x.common_name === m);
              return classifyFlavor(mol?.flavor_profile || "");
            })
          )
        );
        results.push({ ingA: a, ingB: b, similarity: sim, shared, sharedCategories });
      }
    }

    // Sort by similarity (strongest bridges first)
    results.sort((a, b) => b.similarity - a.similarity);
    return results;
  }, [cuisineA, cuisineB, cuisineMap]);

  // Common ingredients between the two cuisines
  const commonIngredients = useMemo(() => {
    const ingsA = new Set(cuisineMap[cuisineA] || []);
    const ingsB = cuisineMap[cuisineB] || [];
    return ingsB.filter((b) => ingsA.has(b));
  }, [cuisineA, cuisineB, cuisineMap]);

  // Top bridge molecules (most frequently shared)
  const topBridgeMolecules = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const b of bridges) {
      for (const m of b.shared) {
        freq[m] = (freq[m] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [bridges]);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
          Fusion Recipe{" "}
          <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">
            Generator
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Select two cuisines to discover molecular bridges between their ingredients.
          The algorithm finds shared flavor molecules that make cross-cuisine fusion work. Zero API credits.
        </p>
      </div>

      {/* Cuisine Selectors */}
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#FF6F00]">
            Cuisine A
          </label>
          <div className="relative">
            <select
              value={cuisineA}
              onChange={(e) => setCuisineA(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm font-medium text-white focus:border-[#FF6F00]/50 focus:outline-none"
            >
              {FUSION_CUISINES.map((c) => (
                <option key={c} value={c} className="bg-black text-white">
                  {c} ({(cuisineMap[c] || []).length} ingredients)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Atom className="h-6 w-6 text-[#FF6F00]" />
          </motion.div>
        </div>

        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#E91E63]">
            Cuisine B
          </label>
          <div className="relative">
            <select
              value={cuisineB}
              onChange={(e) => setCuisineB(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm font-medium text-white focus:border-[#E91E63]/50 focus:outline-none"
            >
              {FUSION_CUISINES.map((c) => (
                <option key={c} value={c} className="bg-black text-white">
                  {c} ({(cuisineMap[c] || []).length} ingredients)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
        </div>
      </div>

      {cuisineA === cuisineB ? (
        <div className="py-12 text-center">
          <p className="text-sm text-white/30">Select two different cuisines to generate fusion bridges</p>
        </div>
      ) : (
        <>
          {/* Fusion Header */}
          <motion.div
            key={`${cuisineA}-${cuisineB}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-3xl rounded-xl border border-[#FF6F00]/20 bg-gradient-to-r from-[#FF6F00]/5 to-[#E91E63]/5 p-5 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Fusion Concept
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
              {fusionConcept("", "", cuisineA, cuisineB)}
            </h3>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/40">
              <span>
                <span className="font-bold text-[#FF6F00]">{bridges.length}</span> molecular bridges
              </span>
              <span className="text-white/10">|</span>
              <span>
                <span className="font-bold text-emerald-400">{commonIngredients.length}</span> shared ingredients
              </span>
              <span className="text-white/10">|</span>
              <span>
                <span className="font-bold text-[#E91E63]">{topBridgeMolecules.length}</span> bridge molecules
              </span>
            </div>
          </motion.div>

          {/* Common Ingredients */}
          {commonIngredients.length > 0 && (
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-2 text-xs font-semibold text-white/50">
                Shared Ingredients (appear in both cuisines)
              </h3>
              <div className="flex flex-wrap gap-2">
                {commonIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium capitalize text-emerald-400"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Bridge Molecules */}
          {topBridgeMolecules.length > 0 && (
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/50">
                <Zap className="h-3.5 w-3.5 text-[#FF6F00]" />
                Key Bridge Molecules (frequency across pairs)
              </h3>
              <div className="flex flex-wrap gap-2">
                {topBridgeMolecules.map(([mol, count]) => {
                  const cat = classifyFlavor(
                    getMoleculesForIngredient(
                      bridges.find((b) => b.shared.includes(mol))?.ingA || ""
                    ).find((m) => m.common_name === mol)?.flavor_profile || ""
                  );
                  return (
                    <span
                      key={mol}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: FLAVOR_CATEGORIES[cat] || "#90A4AE" }}
                      />
                      <span className="font-mono text-xs text-white/80">{mol}</span>
                      <span className="rounded bg-white/10 px-1 py-0.5 text-[8px] text-white/40">
                        ×{count}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Molecular Bridges List */}
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-3 text-xs font-semibold text-white/50">
              All Molecular Bridges — ranked by Jaccard similarity
            </h3>
            <div className="space-y-2">
              {bridges.slice(0, 20).map((bridge, idx) => {
                const key = `${bridge.ingA}-${bridge.ingB}`;
                const isExpanded = expandedBridge === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <button
                      onClick={() => setExpandedBridge(isExpanded ? null : key)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all",
                        isExpanded
                          ? "border-[#FF6F00]/40 bg-[#FF6F00]/10"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/40">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-sm font-medium capitalize text-white">
                              {bridge.ingA}
                            </span>
                            <span className="mx-2 text-xs text-white/20">←→</span>
                            <span className="text-sm font-medium capitalize text-white">
                              {bridge.ingB}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "border-0 font-mono",
                              bridge.similarity > 0.25
                                ? "bg-green-500/20 text-green-400"
                                : bridge.similarity > 0.1
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-blue-500/20 text-blue-400"
                            )}
                          >
                            {Math.round(bridge.similarity * 100)}%
                          </Badge>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-white/30 transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="border-0 bg-[#FF6F00]/15 text-[10px] text-[#FF6F00]"
                        >
                          {cuisineA}
                        </Badge>
                        <span className="text-[10px] text-white/20">bridges to</span>
                        <Badge
                          variant="secondary"
                          className="border-0 bg-[#E91E63]/15 text-[10px] text-[#E91E63]"
                        >
                          {cuisineB}
                        </Badge>
                        <span className="ml-auto text-[10px] text-white/20">
                          {bridge.shared.length} shared molecule{bridge.shared.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mx-2 rounded-b-xl border border-t-0 border-[#FF6F00]/20 bg-white/[0.02] p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Shared molecules */}
                              <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                  Bridge Molecules
                                </p>
                                <div className="space-y-1.5">
                                  {bridge.shared.map((m) => {
                                    const mol = getMoleculesForIngredient(bridge.ingA).find(
                                      (x) => x.common_name === m
                                    );
                                    const cat = classifyFlavor(mol?.flavor_profile || "");
                                    return (
                                      <div
                                        key={m}
                                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                              backgroundColor:
                                                FLAVOR_CATEGORIES[cat] || "#90A4AE",
                                            }}
                                          />
                                          <span className="font-mono text-xs text-white/80">
                                            {m}
                                          </span>
                                        </div>
                                        <span className="text-[10px] capitalize text-white/30">
                                          {cat}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Fusion idea */}
                              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6F00]">
                                  Why This Bridge Works
                                </p>
                                <p className="text-xs leading-relaxed text-white/60">
                                  <span className="capitalize text-white/80">{bridge.ingA}</span>{" "}
                                  ({cuisineA}) and{" "}
                                  <span className="capitalize text-white/80">{bridge.ingB}</span>{" "}
                                  ({cuisineB}) share{" "}
                                  <span className="font-bold text-emerald-400">
                                    {bridge.shared.join(", ")}
                                  </span>
                                  . These{" "}
                                  <span className="text-white/80">
                                    {bridge.sharedCategories.join(", ")}
                                  </span>{" "}
                                  molecules create a natural flavor bridge, allowing the two
                                  ingredients to harmonize in a fusion dish despite originating
                                  from different culinary traditions.
                                </p>
                                <div className="mt-3 rounded bg-[#FF6F00]/10 px-3 py-2">
                                  <p className="text-[10px] font-bold text-[#FF6F00]">
                                    Fusion Potential:{" "}
                                    {bridge.similarity > 0.25
                                      ? "High — Strong molecular harmony"
                                      : bridge.similarity > 0.1
                                        ? "Medium — Complementary profiles"
                                        : "Subtle — Interesting contrast"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {bridges.length > 20 && (
              <p className="mt-3 text-center text-[10px] text-white/20">
                Showing top 20 of {bridges.length} molecular bridges
              </p>
            )}

            {bridges.length === 0 && (
              <div className="py-8 text-center">
                <Atom className="mx-auto h-10 w-10 text-white/10" />
                <p className="mt-3 text-sm text-white/30">
                  No molecular bridges found between these cuisines
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
