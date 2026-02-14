"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMoleculesForIngredient,
  jaccardSimilarity,
  classifyFlavor,
  FLAVOR_CATEGORIES,
} from "@/lib/algorithms/flavorprint";
import { PALETTE_INGREDIENTS } from "./experiments";

interface CellData {
  ingA: string;
  ingB: string;
  similarity: number;
  shared: string[];
  uniqueA: string[];
  uniqueB: string[];
}

function heatColor(value: number): string {
  if (value >= 0.4) return "rgba(239, 68, 68, 0.85)";
  if (value >= 0.25) return "rgba(249, 115, 22, 0.7)";
  if (value >= 0.15) return "rgba(234, 179, 8, 0.5)";
  if (value >= 0.05) return "rgba(52, 211, 153, 0.3)";
  if (value > 0) return "rgba(99, 102, 241, 0.2)";
  return "rgba(255,255,255,0.03)";
}

export default function CompatibilityHeatmap() {
  const [selected, setSelected] = useState<CellData | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const ingredients = PALETTE_INGREDIENTS;

  // Pre-compute molecule names for each ingredient
  const ingredientMols = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const name of ingredients) {
      map[name] = getMoleculesForIngredient(name).map((m) => m.common_name);
    }
    return map;
  }, [ingredients]);

  // Compute the full matrix
  const matrix = useMemo(() => {
    const grid: CellData[][] = [];
    for (let i = 0; i < ingredients.length; i++) {
      const row: CellData[] = [];
      for (let j = 0; j < ingredients.length; j++) {
        if (i === j) {
          row.push({ ingA: ingredients[i], ingB: ingredients[j], similarity: 1, shared: ingredientMols[ingredients[i]], uniqueA: [], uniqueB: [] });
        } else {
          const molsA = ingredientMols[ingredients[i]];
          const molsB = ingredientMols[ingredients[j]];
          const shared = molsA.filter((m) => molsB.includes(m));
          const uniqueA = molsA.filter((m) => !molsB.includes(m));
          const uniqueB = molsB.filter((m) => !molsA.includes(m));
          const sim = jaccardSimilarity(molsA, molsB);
          row.push({ ingA: ingredients[i], ingB: ingredients[j], similarity: sim, shared, uniqueA, uniqueB });
        }
      }
      grid.push(row);
    }
    return grid;
  }, [ingredients, ingredientMols]);

  // Stats
  const stats = useMemo(() => {
    let maxSim = 0;
    let maxPair: [string, string] = ["", ""];
    let totalBridges = 0;
    let zeroPairs = 0;
    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const cell = matrix[i][j];
        if (cell.similarity > maxSim) {
          maxSim = cell.similarity;
          maxPair = [cell.ingA, cell.ingB];
        }
        if (cell.shared.length > 0) totalBridges++;
        if (cell.similarity === 0) zeroPairs++;
      }
    }
    const totalPairs = (ingredients.length * (ingredients.length - 1)) / 2;
    return { maxSim, maxPair, totalBridges, zeroPairs, totalPairs };
  }, [matrix, ingredients]);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
          Ingredient Compatibility{" "}
          <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">
            Heatmap
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Pairwise Jaccard molecular similarity across {ingredients.length} ingredients.
          Click any cell to inspect shared molecules. Zero API credits.
        </p>
      </div>

      {/* Stats bar */}
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-3 text-center">
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-lg font-bold text-emerald-400">{stats.totalPairs}</p>
          <p className="text-[9px] text-white/30">Total Pairs</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-lg font-bold text-[#FF6F00]">{stats.totalBridges}</p>
          <p className="text-[9px] text-white/30">With Bridges</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-lg font-bold text-red-400">{stats.zeroPairs}</p>
          <p className="text-[9px] text-white/30">Zero Overlap</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-lg font-bold text-[#E91E63]">{Math.round(stats.maxSim * 100)}%</p>
          <p className="text-[9px] text-white/30">Max Similarity</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mx-auto flex max-w-lg items-center justify-center gap-2">
        <span className="text-[10px] text-white/30">0%</span>
        <div className="flex h-3 flex-1 overflow-hidden rounded-full">
          <div className="flex-1" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="flex-1" style={{ background: "rgba(99, 102, 241, 0.2)" }} />
          <div className="flex-1" style={{ background: "rgba(52, 211, 153, 0.3)" }} />
          <div className="flex-1" style={{ background: "rgba(234, 179, 8, 0.5)" }} />
          <div className="flex-1" style={{ background: "rgba(249, 115, 22, 0.7)" }} />
          <div className="flex-1" style={{ background: "rgba(239, 68, 68, 0.85)" }} />
        </div>
        <span className="text-[10px] text-white/30">100%</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="mx-auto" style={{ minWidth: ingredients.length * 36 + 80 }}>
          {/* Top labels */}
          <div className="flex" style={{ paddingLeft: 80 }}>
            {ingredients.map((name, j) => (
              <div
                key={name}
                className={cn(
                  "flex w-[36px] shrink-0 items-end justify-center pb-1 text-[8px] font-medium transition-colors",
                  hoveredCol === j ? "text-[#FF6F00]" : "text-white/40"
                )}
                style={{ height: 60 }}
              >
                <span
                  className="block origin-bottom-left -rotate-45 whitespace-nowrap capitalize"
                >
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {matrix.map((row, i) => (
            <div key={ingredients[i]} className="flex items-center">
              {/* Row label */}
              <div
                className={cn(
                  "w-[80px] shrink-0 pr-2 text-right text-[10px] font-medium capitalize transition-colors",
                  hoveredRow === i ? "text-[#FF6F00]" : "text-white/50"
                )}
              >
                {ingredients[i]}
              </div>
              {/* Cells */}
              {row.map((cell, j) => {
                const isDiag = i === j;
                const isHighlighted = hoveredRow === i || hoveredCol === j;
                const isSelected =
                  selected &&
                  selected.ingA === cell.ingA &&
                  selected.ingB === cell.ingB;
                return (
                  <motion.div
                    key={`${i}-${j}`}
                    className={cn(
                      "flex h-[32px] w-[36px] shrink-0 cursor-pointer items-center justify-center border border-white/[0.04] text-[9px] font-mono transition-all",
                      isDiag && "cursor-default",
                      isHighlighted && !isDiag && "border-white/20",
                      isSelected && "ring-1 ring-[#FF6F00]"
                    )}
                    style={{
                      backgroundColor: isDiag
                        ? "rgba(255,255,255,0.08)"
                        : heatColor(cell.similarity),
                    }}
                    whileHover={isDiag ? {} : { scale: 1.3, zIndex: 10 }}
                    onClick={() => {
                      if (!isDiag) setSelected(cell);
                    }}
                    onMouseEnter={() => {
                      setHoveredRow(i);
                      setHoveredCol(j);
                    }}
                    onMouseLeave={() => {
                      setHoveredRow(null);
                      setHoveredCol(null);
                    }}
                    title={
                      isDiag
                        ? ingredients[i]
                        : `${ingredients[i]} × ${ingredients[j]}: ${Math.round(cell.similarity * 100)}%`
                    }
                  >
                    {isDiag ? (
                      <span className="text-white/20">●</span>
                    ) : cell.similarity > 0 ? (
                      <span className="text-white/70">
                        {Math.round(cell.similarity * 100)}
                      </span>
                    ) : (
                      <span className="text-white/10">·</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Best pair callout */}
      <div className="mx-auto max-w-lg rounded-lg border border-[#FF6F00]/20 bg-[#FF6F00]/5 p-3 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF6F00]">
          Strongest Molecular Bond
        </p>
        <p className="mt-1 text-sm text-white">
          <span className="capitalize">{stats.maxPair[0]}</span> +{" "}
          <span className="capitalize">{stats.maxPair[1]}</span>
          <span className="ml-2 rounded bg-[#FF6F00]/20 px-2 py-0.5 text-xs font-bold text-[#FF6F00]">
            {Math.round(stats.maxSim * 100)}% match
          </span>
        </p>
      </div>

      {/* Selected cell detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={`${selected.ingA}-${selected.ingB}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-xl border border-[#FF6F00]/30 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  <span className="capitalize">{selected.ingA}</span>
                  <span className="mx-2 text-white/30">×</span>
                  <span className="capitalize">{selected.ingB}</span>
                  <span
                    className={cn(
                      "ml-3 rounded px-2 py-0.5 text-xs font-bold",
                      selected.similarity > 0.25
                        ? "bg-green-500/20 text-green-400"
                        : selected.similarity > 0
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {Math.round(selected.similarity * 100)}% Jaccard
                  </span>
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-full p-1 text-white/30 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Shared */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Shared Molecules ({selected.shared.length})
                  </p>
                  {selected.shared.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.shared.map((m) => {
                        const cat = classifyFlavor(
                          getMoleculesForIngredient(selected.ingA).find(
                            (mol) => mol.common_name === m
                          )?.flavor_profile || ""
                        );
                        return (
                          <span
                            key={m}
                            className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400"
                          >
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  FLAVOR_CATEGORIES[cat] || "#90A4AE",
                              }}
                            />
                            {m}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/30">
                      No shared molecules — a pure contrast pairing
                    </p>
                  )}
                </div>

                {/* Unique A */}
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6F00]">
                    Only in{" "}
                    <span className="capitalize">{selected.ingA}</span> (
                    {selected.uniqueA.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.uniqueA.map((m) => (
                      <span
                        key={m}
                        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Unique B */}
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#E91E63]">
                    Only in{" "}
                    <span className="capitalize">{selected.ingB}</span> (
                    {selected.uniqueB.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.uniqueB.map((m) => (
                      <span
                        key={m}
                        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flavor category analysis */}
              <div className="mt-4 rounded-lg bg-white/5 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  <Atom className="mr-1 inline h-3 w-3" />
                  Molecular Bridge Analysis
                </p>
                {selected.shared.length > 0 ? (
                  <p className="text-xs leading-relaxed text-white/60">
                    <span className="capitalize text-white/80">{selected.ingA}</span> and{" "}
                    <span className="capitalize text-white/80">{selected.ingB}</span> share{" "}
                    <span className="font-bold text-emerald-400">{selected.shared.length}</span>{" "}
                    molecule{selected.shared.length !== 1 ? "s" : ""} out of{" "}
                    {new Set([
                      ...getMoleculesForIngredient(selected.ingA).map((m) => m.common_name),
                      ...getMoleculesForIngredient(selected.ingB).map((m) => m.common_name),
                    ]).size}{" "}
                    unique molecules. This makes them a{" "}
                    <span className="font-semibold text-[#FF6F00]">
                      {selected.similarity > 0.3 ? "strong pairing" : selected.similarity > 0.1 ? "moderate pairing" : "weak pairing"}
                    </span>{" "}
                    in food pairing theory.
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-white/60">
                    These ingredients share no molecules, creating a{" "}
                    <span className="font-semibold text-blue-400">contrast</span> pairing.
                    In East Asian culinary philosophy, contrast pairings create complexity
                    through molecular tension rather than harmony.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
