"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Beaker,
  Atom,
  Sparkles,
  FlaskConical,
  Leaf,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  getMoleculesForIngredient,
  FLAVOR_CATEGORIES,
} from "@/lib/algorithms/flavorprint";
import { addToHistory } from "@/lib/api/cache";

interface IngredientAnalysis {
  name: string;
  molecules: { common_name: string; flavor_profile: string }[];
  categories: { name: string; count: number; color: string }[];
}

const POPULAR_INGREDIENTS = [
  "chicken",
  "garlic",
  "tomato",
  "ginger",
  "cinnamon",
  "basil",
  "lemon",
  "cumin",
  "butter",
  "coconut",
  "chili",
  "onion",
  "black pepper",
  "coriander",
  "yogurt",
  "rice",
];

function classifyFlavor(profile: string): string {
  const lower = profile.toLowerCase();
  for (const cat of Object.keys(FLAVOR_CATEGORIES)) {
    if (lower.includes(cat)) return cat;
  }
  if (lower.includes("roast") || lower.includes("toast")) return "warm";
  if (lower.includes("green") || lower.includes("grass")) return "herbal";
  if (lower.includes("butter") || lower.includes("cream") || lower.includes("fat")) return "creamy";
  if (lower.includes("pepper") || lower.includes("pungent")) return "spicy";
  if (lower.includes("lemon") || lower.includes("orange") || lower.includes("lime")) return "citrus";
  if (lower.includes("meat") || lower.includes("broth")) return "meaty";
  if (lower.includes("mushroom") || lower.includes("soil")) return "earthy";
  if (lower.includes("camphor") || lower.includes("menthol")) return "cooling";
  if (lower.includes("smoke") || lower.includes("char")) return "smoky";
  if (lower.includes("rose") || lower.includes("violet") || lower.includes("jasmine")) return "floral";
  if (lower.includes("apple") || lower.includes("berry") || lower.includes("banana")) return "fruity";
  if (lower.includes("nut") || lower.includes("almond") || lower.includes("hazel")) return "nutty";
  if (lower.includes("wood") || lower.includes("cedar") || lower.includes("oak")) return "woody";
  return "other";
}

function analyzeIngredient(name: string): IngredientAnalysis | null {
  const molecules = getMoleculesForIngredient(name);
  if (molecules.length === 0) return null;

  const catMap: Record<string, { count: number; color: string }> = {};
  for (const mol of molecules) {
    const profiles = mol.flavor_profile.split(",").map((s) => s.trim());
    for (const profile of profiles) {
      const cat = classifyFlavor(profile);
      if (!catMap[cat]) {
        catMap[cat] = { count: 0, color: FLAVOR_CATEGORIES[cat] || "#90A4AE" };
      }
      catMap[cat].count++;
    }
  }

  const categories = Object.entries(catMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count);

  return { name, molecules, categories };
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [analyses, setAnalyses] = useState<IngredientAnalysis[]>([]);
  const [notFound, setNotFound] = useState<string | null>(null);

  function handleSearch(ingredient: string) {
    const name = ingredient.trim().toLowerCase();
    if (!name) return;

    // Avoid duplicates
    if (analyses.some((a) => a.name === name)) return;

    const result = analyzeIngredient(name);
    if (result) {
      setAnalyses((prev) => [result, ...prev]);
      setNotFound(null);
      // Track in history
      addToHistory({
        type: "explore",
        title: `Explore: ${name}`,
        subtitle: `${result.molecules.length} molecules`,
        path: `/explore?q=${encodeURIComponent(name)}`,
      });
    } else {
      setNotFound(name);
    }
    setQuery("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-background dark:from-purple-950/10 dark:to-background">
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
            className="mb-4 border border-[#9C27B0]/20 text-[#9C27B0]"
          >
            <FlaskConical className="mr-1 h-3 w-3" />
            Ingredient Explorer
          </Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Explore{" "}
            <span className="bg-gradient-to-r from-[#9C27B0] to-[#E91E63] bg-clip-text text-transparent">
              Flavor Molecules
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover the molecules that make each ingredient unique. Search any
            ingredient to see its molecular flavor profile.
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
              placeholder="Search an ingredient... (e.g. garlic, cinnamon, basil)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button
            type="submit"
            className="h-12 bg-[#9C27B0] px-6 hover:bg-[#7B1FA2]"
          >
            <Beaker className="mr-2 h-4 w-4" />
            Explore
          </Button>
        </motion.form>

        {/* Popular ingredients */}
        {analyses.length === 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="mb-3 text-center text-sm text-muted-foreground">
              Popular ingredients to explore:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_INGREDIENTS.map((ing) => (
                <button
                  key={ing}
                  onClick={() => handleSearch(ing)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm capitalize text-muted-foreground transition-colors hover:border-[#9C27B0]/50 hover:text-[#9C27B0]"
                >
                  {ing}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Not found */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-50 p-4 text-center text-sm text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300"
            >
              <p>
                No molecule data found for &ldquo;{notFound}&rdquo;.
                Try one of the popular ingredients above.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-6">
          <AnimatePresence>
            {analyses.map((analysis, idx) => (
              <motion.div
                key={analysis.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx === 0 ? 0 : 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9C27B0]/10">
                          <Leaf className="h-6 w-6 text-[#9C27B0]" />
                        </div>
                        <div>
                          <CardTitle className="text-xl capitalize">
                            {analysis.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {analysis.molecules.length} flavor molecule
                            {analysis.molecules.length !== 1 ? "s" : ""} identified
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setAnalyses((prev) =>
                            prev.filter((a) => a.name !== analysis.name)
                          )
                        }
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Flavor categories bar */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium">
                        Flavor Profile
                      </p>
                      <div className="flex h-6 overflow-hidden rounded-full">
                        {analysis.categories.map((cat) => {
                          const total = analysis.categories.reduce(
                            (s, c) => s + c.count,
                            0
                          );
                          const width = (cat.count / total) * 100;
                          return (
                            <div
                              key={cat.name}
                              className="flex items-center justify-center text-[9px] font-medium text-white transition-all"
                              style={{
                                backgroundColor: cat.color,
                                width: `${width}%`,
                                minWidth: width > 5 ? undefined : "20px",
                              }}
                              title={`${cat.name}: ${cat.count}`}
                            >
                              {width > 12 ? cat.name : ""}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.categories.map((cat) => (
                          <div
                            key={cat.name}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-xs capitalize text-muted-foreground">
                              {cat.name} ({cat.count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Molecules */}
                    <div>
                      <p className="mb-2 text-sm font-medium">Molecules</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {analysis.molecules.map((mol) => (
                          <div
                            key={mol.common_name}
                            className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                          >
                            <Atom className="mt-0.5 h-4 w-4 shrink-0 text-[#9C27B0]" />
                            <div>
                              <p className="text-sm font-medium font-mono">
                                {mol.common_name}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {mol.flavor_profile
                                  .split(",")
                                  .map((f) => f.trim())
                                  .map((f) => (
                                    <Badge
                                      key={f}
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      {f}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state info */}
        {analyses.length === 0 && !notFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Beaker,
                  title: "22+ Ingredients",
                  desc: "Pre-cached molecular data for common cooking ingredients from FlavorDB.",
                },
                {
                  icon: Atom,
                  title: "25,595 Molecules",
                  desc: "Each ingredient mapped to its key flavor compounds and their profiles.",
                },
                {
                  icon: Sparkles,
                  title: "19 Categories",
                  desc: "Molecules classified into flavor categories: sweet, spicy, floral, fruity, and more.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <item.icon className="mx-auto h-8 w-8 text-[#9C27B0]/60" />
                      <h3 className="mt-3 font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
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
