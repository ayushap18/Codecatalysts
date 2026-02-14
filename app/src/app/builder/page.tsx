"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  ChefHat,
  Atom,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RadialChart from "@/components/flavorprint/radial-chart";
import SpectrumGauge from "@/components/spectrum/spectrum-gauge";
import {
  getMoleculesForIngredientAsync,
  generateFlavorPrintAsync,
  calculatePhilosophyScoreAsync,
  FLAVOR_CATEGORIES,
  classifyFlavor,
} from "@/lib/algorithms/flavorprint";
import { getFoodPairings } from "@/lib/api/flavordb";
import type { FlavorPrint, PhilosophyScore, RecipeIngredient } from "@/types";

interface Suggestion {
  name: string;
  moleculeCount: number;
  categories: string[];
}

function buildFakeIngredients(names: string[]): RecipeIngredient[] {
  return names.map((name, i) => ({
    recipe_no: 0,
    ingredient_phrase: name,
    ingredient: name,
    quantity: "",
    ing_id: i,
  }));
}

export default function BuilderPage() {
  const [query, setQuery] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [flavorprint, setFlavorprint] = useState<FlavorPrint | null>(null);
  const [philosophy, setPhilosophy] = useState<PhilosophyScore | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);

  // Recalculate FlavorPrint when ingredients change
  useEffect(() => {
    if (ingredients.length === 0) {
      setFlavorprint(null);
      setPhilosophy(null);
      return;
    }

    let cancelled = false;
    const update = async () => {
      setLoading(true);
      const fakeIngs = buildFakeIngredients(ingredients);
      const [fp, ps] = await Promise.all([
        generateFlavorPrintAsync(0, "Custom Recipe", "Custom", "Custom", fakeIngs),
        calculatePhilosophyScoreAsync(fakeIngs),
      ]);
      if (!cancelled) {
        setFlavorprint(fp);
        setPhilosophy(ps);
        setLoading(false);
      }
    };
    update();
    return () => { cancelled = true; };
  }, [ingredients]);

  // On-demand suggestion fetch — only when user clicks "Get Suggestions"
  const fetchSuggestions = useCallback(async () => {
    if (ingredients.length < 1) return;
    setSugLoading(true);
    try {
      const lastIng = ingredients[ingredients.length - 1];
      const pairData = await getFoodPairings(lastIng);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pairs: string[] = Array.isArray(pairData) ? pairData.map((p: any) =>
        (p.entity_alias_readable || p.name || "").toLowerCase()
      ).filter(Boolean) : [];

      const filtered = pairs
        .filter((p) => !ingredients.includes(p))
        .slice(0, 4);

      const results: Suggestion[] = [];
      for (const name of filtered) {
        const mols = await getMoleculesForIngredientAsync(name);
        if (mols.length > 0) {
          const cats = new Set<string>();
          for (const m of mols) {
            m.flavor_profile.split(",").map((s) => s.trim()).forEach((p) => {
              cats.add(classifyFlavor(p));
            });
          }
          results.push({
            name,
            moleculeCount: mols.length,
            categories: Array.from(cats).slice(0, 4),
          });
        }
      }
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
    setSugLoading(false);
  }, [ingredients]);

  const addIngredient = useCallback(
    (name: string) => {
      const lower = name.trim().toLowerCase();
      if (!lower || ingredients.includes(lower)) return;
      setIngredients((prev) => [...prev, lower]);
      setQuery("");
    },
    [ingredients]
  );

  const removeIngredient = useCallback((name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addIngredient(query);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-background dark:from-orange-950/10 dark:to-background">
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
            className="mb-4 border border-[#FF6F00]/20 text-[#FF6F00]"
          >
            <ChefHat className="mr-1 h-3 w-3" />
            Interactive Builder
          </Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Recipe{" "}
            <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">
              Builder
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Add ingredients one by one and watch the molecular fingerprint
            evolve in real-time. Get AI-powered pairing suggestions.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto mb-6 flex max-w-xl gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Add an ingredient... (e.g. garlic, tomato, basil)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button
            type="submit"
            className="h-12 bg-[#FF6F00] px-6 hover:bg-[#E65100]"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </motion.form>

        {/* Ingredient badges */}
        {ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto mb-8 flex max-w-xl flex-wrap justify-center gap-2"
          >
            <AnimatePresence>
              {ingredients.map((ing) => (
                <motion.div
                  key={ing}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge className="gap-1.5 bg-[#FF6F00] px-3 py-1.5 text-sm text-white hover:bg-[#E65100]">
                    {ing}
                    <button onClick={() => removeIngredient(ing)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF6F00]" />
            <span className="text-sm text-muted-foreground">
              Analyzing flavor molecules...
            </span>
          </div>
        )}

        {/* Results grid */}
        {flavorprint && flavorprint.totalMolecules > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 md:grid-cols-2"
          >
            {/* Left: FlavorPrint */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-xl font-bold">
                    Molecular Fingerprint
                  </h2>
                  <div className="flex justify-center">
                    <RadialChart flavorprint={flavorprint} size={340} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-lg font-bold text-[#FF6F00]">
                        {flavorprint.totalMolecules}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Molecules
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-lg font-bold text-[#E91E63]">
                        {flavorprint.categories.filter((c) => c.count > 0).length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Categories
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-lg font-bold text-[#4CAF50]">
                        {flavorprint.analyzedCount}/{flavorprint.ingredientCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Analyzed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Philosophy + Suggestions */}
            <div className="space-y-6">
              {philosophy && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-xl font-bold">
                      Cooking Philosophy
                    </h2>
                    <SpectrumGauge
                      score={philosophy}
                      recipeName="Your Recipe"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-[#FF6F00]" />
                    Suggested Pairings
                  </h3>
                  {sugLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Finding pairings...
                      </span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {suggestions.map((sug) => (
                        <button
                          key={sug.name}
                          onClick={() => addIngredient(sug.name)}
                          className="flex w-full items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-left transition-colors hover:border-[#FF6F00]/40 hover:bg-[#FF6F00]/5"
                        >
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {sug.name}
                            </p>
                            <div className="mt-0.5 flex gap-1">
                              {sug.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="rounded px-1 py-0.5 text-[9px] text-white capitalize"
                                  style={{
                                    backgroundColor:
                                      FLAVOR_CATEGORIES[cat] || "#90A4AE",
                                  }}
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Atom className="h-3 w-3" />
                            {sug.moleculeCount}
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={fetchSuggestions}
                        className="mt-1 w-full text-center text-xs text-muted-foreground hover:text-[#FF6F00]"
                      >
                        Refresh suggestions
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSuggestions}
                        disabled={ingredients.length === 0}
                        className="w-full gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Get Pairing Suggestions
                      </Button>
                      <p className="mt-2 text-[10px] text-muted-foreground text-center">
                        Uses 1 API credit to find molecular pairings
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {ingredients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="py-16 text-center"
          >
            <ChefHat className="mx-auto h-16 w-16 text-muted-foreground/20" />
            <h3 className="mt-4 text-lg font-semibold">
              Start Building Your Recipe
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Add ingredients to watch the molecular fingerprint evolve.
              The FlavorPrint radial chart and Philosophy Spectrum update in
              real-time as you build.
            </p>
            <div className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-2">
              {["chicken", "garlic", "tomato", "basil", "olive oil", "onion"].map(
                (ing) => (
                  <button
                    key={ing}
                    onClick={() => addIngredient(ing)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm capitalize text-muted-foreground transition-colors hover:border-[#FF6F00]/50 hover:text-[#FF6F00]"
                  >
                    {ing}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
