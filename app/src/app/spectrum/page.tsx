"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, BarChart3, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SpectrumGauge from "@/components/spectrum/spectrum-gauge";
import RadialChart from "@/components/flavorprint/radial-chart";
import { searchRecipesByTitle, getRecipeById } from "@/lib/api/recipedb";
import { generateFlavorPrint, calculatePhilosophyScore } from "@/lib/algorithms/flavorprint";
import type { RecipeDetail, FlavorPrint, PhilosophyScore } from "@/types";

export default function SpectrumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><Navbar /><div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div></div>}>
      <SpectrumContent />
    </Suspense>
  );
}

function SpectrumContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("recipeId");

  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<
    { detail: RecipeDetail; fp: FlavorPrint; philosophy: PhilosophyScore }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const analyzeRecipe = useCallback(async (recipeId: string | number) => {
    setLoading(true);
    try {
      const data = await getRecipeById(recipeId);
      if (!data.recipe || !data.ingredients?.length) {
        setLoading(false);
        return;
      }
      const fp = generateFlavorPrint(
        data.recipe.recipe_id,
        data.recipe.recipe_title,
        data.recipe.sub_region,
        data.recipe.continent,
        data.ingredients
      );
      const ps = calculatePhilosophyScore(data.ingredients);
      setRecipes((prev) => [
        ...prev,
        { detail: data as RecipeDetail, fp, philosophy: ps },
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialId) analyzeRecipe(initialId);
  }, [initialId, analyzeRecipe]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const results = await searchRecipesByTitle(query);
    const first = Array.isArray(results) ? results[0] : null;
    if (first) analyzeRecipe(first.recipe_id);
    setQuery("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-background dark:from-blue-950/10 dark:to-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Badge variant="secondary" className="mb-4 border border-[#2196F3]/20 text-[#2196F3]">
            <BookOpen className="mr-1 h-3 w-3" />
            Based on Ahn et al. (2011)
          </Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Philosophy{" "}
            <span className="bg-gradient-to-r from-[#2196F3] to-[#9C27B0] bg-clip-text text-transparent">
              Spectrum
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Western cuisines pair ingredients sharing flavor compounds. East Asian
            cuisines pair ingredients that don&apos;t. Where does your recipe fall?
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          className="mx-auto mb-8 flex max-w-xl gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Add a recipe to compare... (e.g. Sushi, Tacos, Biryani)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button type="submit" className="h-12 bg-[#2196F3] px-6 hover:bg-[#1976D2]">
            Analyze
          </Button>
        </motion.form>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#2196F3]" />
            <span className="text-sm text-muted-foreground">Analyzing recipe...</span>
          </div>
        )}

        {/* Comparison header */}
        {recipes.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-lg border border-[#2196F3]/20 bg-[#2196F3]/5 p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Comparing {recipes.length} recipes on the Pairing-Contrast spectrum
            </p>
            <button
              onClick={() => setRecipes([])}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </motion.div>
        )}

        <div className="space-y-10">
          {recipes.map((r, i) => (
            <motion.div
              key={r.detail.recipe.recipe_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold">
                        {r.detail.recipe.recipe_title}
                      </h2>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="secondary">
                          {r.detail.recipe.sub_region}
                        </Badge>
                        <Badge variant="outline">
                          {r.detail.recipe.continent}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-4 py-2 text-lg font-bold ${
                        r.philosophy.label === "Pairing"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                          : r.philosophy.label === "Contrast"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400"
                      }`}
                    >
                      {r.philosophy.score}%
                    </div>
                  </div>

                  <SpectrumGauge
                    score={r.philosophy}
                    recipeName={r.detail.recipe.recipe_title}
                  />

                  <div className="mt-6 flex justify-center">
                    <RadialChart flavorprint={r.fp} size={300} />
                  </div>

                  {/* Remove button */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() =>
                        setRecipes((prev) =>
                          prev.filter(
                            (p) =>
                              p.detail.recipe.recipe_id !== r.detail.recipe.recipe_id
                          )
                        )
                      }
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remove from comparison
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {recipes.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="py-16 text-center"
          >
            <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/20" />
            <h3 className="mt-4 text-lg font-semibold">Analyze Cooking Philosophy</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Search for recipes to see where they fall on the Pairing-Contrast spectrum.
              Compare dishes from different cuisines to discover their cooking philosophy.
            </p>
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4">
              <Card className="border-none bg-orange-50/50 dark:bg-orange-950/10">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-semibold text-orange-600">Pairing</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ingredients share flavor molecules (Western style)
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-blue-50/50 dark:bg-blue-950/10">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-semibold text-blue-600">Contrast</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ingredients don&apos;t share molecules (East Asian style)
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
