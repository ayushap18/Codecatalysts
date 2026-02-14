"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, GitCompareArrows, Search, Globe, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TwinCard from "@/components/twins/twin-card";
import { searchRecipesByTitle, getRecipeById, getRecipes } from "@/lib/api/recipedb";
import { addToHistory } from "@/lib/api/cache";
import {
  generateFlavorPrint,
  calculateTwinScore,
} from "@/lib/algorithms/flavorprint";
import type { TwinResult, RecipeDetail, Recipe } from "@/types";

export default function TwinsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><Navbar /><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>}>
      <TwinsContent />
    </Suspense>
  );
}

function TwinsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("recipeId");

  const [query, setQuery] = useState("");
  const [sourceDetail, setSourceDetail] = useState<RecipeDetail | null>(null);
  const [twins, setTwins] = useState<TwinResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [apiCalls, setApiCalls] = useState(0);

  const findTwins = useCallback(async (recipeId: string | number) => {
    setLoading(true);
    setTwins([]);
    setApiCalls(0);
    setStatus("Loading source recipe...");

    let calls = 0;

    try {
      // 1 API call: get source recipe
      const source = await getRecipeById(recipeId);
      calls++;
      setApiCalls(calls);

      if (!source.recipe) {
        setStatus("Recipe not found.");
        setLoading(false);
        return;
      }
      setSourceDetail(source as RecipeDetail);

      // Track in history
      addToHistory({
        type: "twins",
        title: `Twins: ${source.recipe.recipe_title}`,
        subtitle: `${source.recipe.sub_region} - ${source.recipe.continent}`,
        path: `/twins?recipeId=${source.recipe.recipe_id}`,
        recipeId: source.recipe.recipe_id,
        img_url: source.recipe.img_url,
      });

      const sourceFP = generateFlavorPrint(
        source.recipe.recipe_id,
        source.recipe.recipe_title,
        source.recipe.sub_region,
        source.recipe.continent,
        source.ingredients
      );

      if (sourceFP.totalMolecules === 0) {
        setStatus("Not enough flavor data for this recipe to find twins.");
        setLoading(false);
        return;
      }

      setStatus("Finding diverse candidates (smart batch)...");

      // Smart strategy: fetch 2 pages of recipes (2 API calls) for a diverse set
      // instead of 15 separate cuisine searches (15+ calls)
      const candidates: Recipe[] = [];
      const seenIds = new Set<number>([source.recipe.recipe_id]);

      // Fetch 2 random-ish pages to get diverse recipes
      const page1 = Math.floor(Math.random() * 50) + 1;
      const page2 = page1 + Math.floor(Math.random() * 20) + 10;

      const [batch1, batch2] = await Promise.all([
        getRecipes(page1, 20),
        getRecipes(page2, 20),
      ]);
      calls += 2;
      setApiCalls(calls);

      for (const r of [...batch1.recipes, ...batch2.recipes]) {
        if (!seenIds.has(r.recipe_id) && r.continent !== source.recipe.continent) {
          seenIds.add(r.recipe_id);
          candidates.push(r);
        }
      }

      // Also try a few cuisine-specific lookups if we don't have enough diversity
      // Pick only 3 cuisines that differ from source to minimize calls
      const diverseCuisines = ["Japanese", "Mexican", "Italian", "Ethiopian", "Thai", "Korean"]
        .filter((c) => c.toLowerCase() !== source.recipe!.sub_region?.toLowerCase())
        .slice(0, 3);

      if (candidates.length < 15) {
        for (const cuisine of diverseCuisines) {
          try {
            setStatus(`Checking ${cuisine} recipes...`);
            const recipes = await searchRecipesByTitle(cuisine);
            calls++;
            setApiCalls(calls);
            for (const r of (Array.isArray(recipes) ? recipes : []).slice(0, 3)) {
              if (!seenIds.has(r.recipe_id)) {
                seenIds.add(r.recipe_id);
                candidates.push(r);
              }
            }
          } catch { /* skip */ }
        }
      }

      // Now get details for top candidates — limit to 8 max
      const toAnalyze = candidates.slice(0, 8);
      setStatus(`Analyzing ${toAnalyze.length} candidates...`);

      const results: TwinResult[] = [];

      for (const candidate of toAnalyze) {
        try {
          const twinDetail = await getRecipeById(candidate.recipe_id);
          calls++;
          setApiCalls(calls);

          if (!twinDetail.recipe || !twinDetail.ingredients?.length) continue;

          const twinFP = generateFlavorPrint(
            twinDetail.recipe.recipe_id,
            twinDetail.recipe.recipe_title,
            twinDetail.recipe.sub_region,
            twinDetail.recipe.continent,
            twinDetail.ingredients
          );

          if (twinFP.totalMolecules === 0) continue;

          const result = calculateTwinScore(
            source as RecipeDetail,
            sourceFP,
            twinDetail as RecipeDetail,
            twinFP
          );
          if (result.molecularSimilarity > 0.05) {
            results.push(result);
          }
        } catch { /* skip */ }
      }

      results.sort((a, b) => b.twinScore - a.twinScore);
      setTwins(results.slice(0, 5));
      setStatus(
        results.length > 0
          ? `Found ${results.length} flavor twin(s) using only ${calls} API calls!`
          : "No strong twins found. Try a recipe with more common ingredients."
      );
    } catch (err) {
      setStatus("Error finding twins. Please try again.");
      console.error(err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialId) findTwins(initialId);
  }, [initialId, findTwins]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const results = await searchRecipesByTitle(query);
    const first = Array.isArray(results) ? results[0] : null;
    if (first) findTwins(first.recipe_id);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background dark:from-green-950/10 dark:to-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Badge variant="secondary" className="mb-4 border border-[#4CAF50]/20 text-[#4CAF50]">
            <GitCompareArrows className="mr-1 h-3 w-3" />
            Cross-Cultural Discovery
          </Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Cross-Cultural{" "}
            <span className="bg-gradient-to-r from-[#4CAF50] to-[#2196F3] bg-clip-text text-transparent">
              Flavor Twins
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Discover recipes from different countries that share the same
            molecular fingerprint but use different ingredients.
          </p>
        </motion.div>

        {!initialId && (
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
                placeholder="Search a recipe to find its twins..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-10 text-base"
              />
            </div>
            <Button type="submit" className="h-12 bg-[#4CAF50] px-6 hover:bg-[#388E3C]">
              Find Twins
            </Button>
          </motion.form>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
            <p className="text-sm text-muted-foreground">{status}</p>
            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                {apiCalls} API call{apiCalls !== 1 ? "s" : ""} used
              </span>
            </div>
          </div>
        )}

        {!loading && status && twins.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">{status}</p>
        )}

        {/* Source recipe info */}
        {!loading && sourceDetail && twins.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 rounded-lg border border-[#4CAF50]/20 bg-[#4CAF50]/5 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing flavor twins for{" "}
                <strong className="text-foreground">
                  {sourceDetail.recipe.recipe_title}
                </strong>{" "}
                ({sourceDetail.recipe.sub_region}, {sourceDetail.recipe.continent})
              </p>
              <div className="flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-yellow-500" />
                {apiCalls} calls
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          {twins.map((twin, i) => (
            <TwinCard key={i} twin={twin} />
          ))}
        </div>

        {/* Empty state */}
        {!loading && !status && twins.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="py-16 text-center"
          >
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/20" />
            <h3 className="mt-4 text-lg font-semibold">Discover Global Connections</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Search for any recipe to find its flavor twins from around the world.
              Optimized to use minimal API credits with smart caching.
            </p>
            <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300">
              <Zap className="h-4 w-4 shrink-0" />
              <span>Uses ~11 API calls per search (vs 91 before). Repeated searches are cached for free.</span>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
