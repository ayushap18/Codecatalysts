"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Loader2, Dna, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { computeCuisineDNA } from "@/lib/algorithms/cuisine-dna";
import { FLAVOR_CATEGORIES } from "@/lib/algorithms/flavorprint";
import { addToHistory } from "@/lib/api/cache";
import type { CuisineDNA } from "@/lib/algorithms/cuisine-dna";

const PRESET_COMBOS = [
  { label: "Indian vs Japanese", cuisines: ["Indian", "Japanese"] },
  { label: "Italian vs Mexican vs Thai", cuisines: ["Italian", "Mexican", "Thai"] },
  { label: "French vs Korean", cuisines: ["French", "Korean"] },
  { label: "Ethiopian vs Chinese", cuisines: ["Ethiopian", "Chinese"] },
  { label: "American vs Indian vs Japanese", cuisines: ["American", "Indian", "Japanese"] },
];

const CUISINES = [
  { name: "Indian", color: "#FF6F00" },
  { name: "Japanese", color: "#E91E63" },
  { name: "Mexican", color: "#4CAF50" },
  { name: "Italian", color: "#2196F3" },
  { name: "Thai", color: "#9C27B0" },
  { name: "French", color: "#795548" },
  { name: "Ethiopian", color: "#FF5722" },
  { name: "Korean", color: "#00BCD4" },
  { name: "Chinese", color: "#FFC107" },
  { name: "American", color: "#607D8B" },
];

export default function CuisinePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<CuisineDNA[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function toggleCuisine(name: string) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((c) => c !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  }

  async function handlePresetClick(cuisines: string[]) {
    setSelected(cuisines);
    setLoading(true);
    setResults([]);

    const dnaResults: CuisineDNA[] = [];
    for (const cuisineName of cuisines) {
      const cuisine = CUISINES.find((c) => c.name === cuisineName);
      setStatus(`Analyzing ${cuisineName}...`);
      try {
        const dna = await computeCuisineDNA(
          cuisineName,
          cuisine?.color || "#607D8B",
          5
        );
        dnaResults.push(dna);
      } catch {
        // Skip failed cuisines
      }
    }

    setResults(dnaResults);
    setStatus("");
    setLoading(false);
    if (dnaResults.length > 0) {
      addToHistory({
        type: "cuisine",
        title: `Cuisine DNA: ${dnaResults.map((r) => r.name).join(" vs ")}`,
        subtitle: `${dnaResults.length} cuisine${dnaResults.length !== 1 ? "s" : ""} analyzed`,
        path: `/cuisine?c=${encodeURIComponent(cuisines.join(","))}`,
      });
    }
  }

  async function analyze() {
    if (selected.length === 0) return;
    setLoading(true);
    setResults([]);

    const dnaResults: CuisineDNA[] = [];
    for (const cuisineName of selected) {
      const cuisine = CUISINES.find((c) => c.name === cuisineName);
      setStatus(`Analyzing ${cuisineName}...`);
      try {
        const dna = await computeCuisineDNA(
          cuisineName,
          cuisine?.color || "#607D8B",
          5
        );
        dnaResults.push(dna);
      } catch {
        // Skip failed cuisines
      }
    }

    setResults(dnaResults);
    setStatus("");
    setLoading(false);
    if (dnaResults.length > 0) {
      addToHistory({
        type: "cuisine",
        title: `Cuisine DNA: ${dnaResults.map((r) => r.name).join(" vs ")}`,
        subtitle: `${dnaResults.length} cuisine${dnaResults.length !== 1 ? "s" : ""} analyzed`,
        path: `/cuisine?c=${encodeURIComponent(selected.join(","))}`,
      });
    }
  }

  // Collect all categories present in results for chart
  const allCategories = results.length > 0
    ? Object.keys(FLAVOR_CATEGORIES).filter((cat) =>
        results.some((r) => (r.profile[cat] || 0) > 0.05)
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-background dark:from-teal-950/10 dark:to-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Badge
            variant="secondary"
            className="mb-4 border border-[#009688]/20 text-[#009688]"
          >
            <Dna className="mr-1 h-3 w-3" />
            Computational Gastronomy
          </Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Cuisine{" "}
            <span className="bg-gradient-to-r from-[#009688] to-[#4CAF50] bg-clip-text text-transparent">
              DNA
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Compare the molecular flavor signatures of world cuisines. Each
            cuisine&apos;s &ldquo;DNA&rdquo; is computed from sample recipes using FlavorDB.
          </p>
        </motion.div>

        {/* Cuisine selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="mb-3 text-center text-sm text-muted-foreground">
            Select up to 3 cuisines to compare:
          </p>
          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2">
            {CUISINES.map((cuisine) => {
              const isSelected = selected.includes(cuisine.name);
              return (
                <button
                  key={cuisine.name}
                  onClick={() => toggleCuisine(cuisine.name)}
                  disabled={!isSelected && selected.length >= 3}
                  className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "text-white shadow-md"
                      : "border-border text-muted-foreground hover:border-current disabled:opacity-40"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: cuisine.color, backgroundColor: cuisine.color }
                      : undefined
                  }
                >
                  <Globe className="h-3.5 w-3.5" />
                  {cuisine.name}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Button
              onClick={analyze}
              disabled={selected.length === 0 || loading}
              className="bg-[#009688] px-8 hover:bg-[#00796B]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Compare Cuisines
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Quick presets */}
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-8 max-w-xl text-center"
          >
            <p className="mb-3 text-xs text-muted-foreground">Or try a preset:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_COMBOS.map((combo) => (
                <button
                  key={combo.label}
                  onClick={() => handlePresetClick(combo.cuisines)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-[#009688]/50 hover:bg-[#009688]/5 hover:text-[#009688]"
                >
                  {combo.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-2 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#009688]" />
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Bar chart */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6 text-center font-[family-name:var(--font-playfair)] text-xl font-bold">
                  Flavor Category Comparison
                </h2>
                <div className="overflow-x-auto">
                  <div className="flex items-end gap-1" style={{ minWidth: allCategories.length * 60 }}>
                    {allCategories.map((cat) => (
                      <div key={cat} className="flex flex-col items-center" style={{ width: 50 }}>
                        <div className="flex h-40 items-end gap-0.5">
                          {results.map((r) => {
                            const val = r.profile[cat] || 0;
                            return (
                              <div
                                key={r.name}
                                className="w-3 rounded-t transition-all"
                                style={{
                                  height: `${Math.max(val * 100, 2)}%`,
                                  backgroundColor: r.color,
                                }}
                                title={`${r.name}: ${Math.round(val * 100)}%`}
                              />
                            );
                          })}
                        </div>
                        <p className="mt-1 text-[9px] text-muted-foreground capitalize">
                          {cat}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Legend */}
                <div className="mt-4 flex justify-center gap-4">
                  {results.map((r) => (
                    <span
                      key={r.name}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      {r.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6 text-center font-[family-name:var(--font-playfair)] text-xl font-bold">
                  Flavor Heatmap
                </h2>
                <div className="overflow-x-auto">
                  <table className="mx-auto">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-xs text-muted-foreground" />
                        {allCategories.map((cat) => (
                          <th
                            key={cat}
                            className="px-1 py-1 text-[9px] font-medium capitalize text-muted-foreground"
                            style={{ writingMode: "vertical-lr", maxHeight: 60 }}
                          >
                            {cat}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.name}>
                          <td className="px-2 py-1 text-xs font-medium" style={{ color: r.color }}>
                            {r.name}
                          </td>
                          {allCategories.map((cat) => {
                            const val = r.profile[cat] || 0;
                            return (
                              <td key={cat} className="px-0.5 py-0.5">
                                <div
                                  className="h-6 w-6 rounded"
                                  style={{
                                    backgroundColor: FLAVOR_CATEGORIES[cat],
                                    opacity: Math.max(val, 0.05),
                                  }}
                                  title={`${r.name} - ${cat}: ${Math.round(val * 100)}%`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {results.map((r) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className="border-2"
                    style={{ borderColor: `${r.color}30` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5" style={{ color: r.color }} />
                        <h3 className="font-semibold" style={{ color: r.color }}>
                          {r.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.recipeCount} recipe{r.recipeCount !== 1 ? "s" : ""} analyzed
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Dominant Flavors:</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {r.topCategories.slice(0, 3).map((cat) => (
                            <Badge
                              key={cat}
                              className="text-[10px] text-white capitalize"
                              style={{
                                backgroundColor: FLAVOR_CATEGORIES[cat] || "#90A4AE",
                              }}
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="py-16 text-center"
          >
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/20" />
            <h3 className="mt-4 text-lg font-semibold">Compare World Cuisines</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Select cuisines above and click &ldquo;Compare&rdquo; to discover their
              unique molecular flavor signatures. Each cuisine&apos;s DNA is computed
              from sample recipes analyzed through FlavorDB.
            </p>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
