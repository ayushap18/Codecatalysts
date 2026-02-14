"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, GitCompareArrows, Search, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TwinCard from "@/components/twins/twin-card";
import { searchRecipesByTitle, getRecipeById } from "@/lib/api/recipedb";
import {
  generateFlavorPrint,
  calculateTwinScore,
} from "@/lib/algorithms/flavorprint";
import type { TwinResult, RecipeDetail, Recipe } from "@/types";

// Diverse cuisines to search twins against
const TWIN_CUISINES = [
  "Ethiopian", "Mexican", "Japanese", "Italian", "Thai",
  "Indian", "French", "Korean", "Moroccan", "Peruvian",
  "Chinese", "Turkish", "Greek", "Brazilian", "Vietnamese",
];

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
  const [searchedCuisines, setSearchedCuisines] = useState(0);

  const findTwins = useCallback(async (recipeId: string | number) => {
    setLoading(true);
    setTwins([]);
    setSearchedCuisines(0);
    setStatus("Loading source recipe...");

    try {
      const source = await getRecipeById(recipeId);
      if (!source.recipe) {
        setStatus("Recipe not found.");
        setLoading(false);
        return;
      }
      setSourceDetail(source as RecipeDetail);

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

      setStatus("Searching for flavor twins across cuisines...");

      const results: TwinResult[] = [];
      let searched = 0;

      for (const cuisine of TWIN_CUISINES) {
        if (cuisine.toLowerCase() === source.recipe.sub_region?.toLowerCase()) continue;

        try {
          const recipes: Recipe[] = await searchRecipesByTitle(cuisine);
          const candidates = (Array.isArray(recipes) ? recipes : []).slice(0, 5);

          for (const candidate of candidates) {
            if (candidate.recipe_id === source.recipe.recipe_id) continue;
            try {
              const twinDetail = await getRecipeById(candidate.recipe_id);
              if (!twinDetail.recipe || !twinDetail.ingredients?.length) continue;

              const twinFP = generateFlavorPrint(
                twinDetail.recipe.recipe_id,
                twinDetail.recipe.recipe_title,
                twinDetail.recipe.sub_region,
                twinDetail.recipe.continent,
                twinDetail.ingredients
              );

              if (twinFP.totalMolecules === 0) continue;

              const result = calculateTwinScore(source as RecipeDetail, sourceFP, twinDetail as RecipeDetail, twinFP);
              if (result.molecularSimilarity > 0.1) {
                results.push(result);
              }
            } catch { /* skip failed lookups */ }
          }
        } catch { /* skip failed cuisine searches */ }

        searched++;
        setSearchedCuisines(searched);
        setStatus(`Searched ${cuisine}... found ${results.length} potential twins`);
      }

      results.sort((a, b) => b.twinScore - a.twinScore);
      setTwins(results.slice(0, 5));
      setStatus(
        results.length > 0
          ? `Found ${results.length} flavor twin(s)!`
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
            {/* Progress bar */}
            <div className="w-64">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-[#4CAF50]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(searchedCuisines / TWIN_CUISINES.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground">
                {searchedCuisines}/{TWIN_CUISINES.length} cuisines searched
              </p>
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
            className="mb-8 rounded-lg border border-[#4CAF50]/20 bg-[#4CAF50]/5 p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Showing flavor twins for{" "}
              <strong className="text-foreground">
                {sourceDetail.recipe.recipe_title}
              </strong>{" "}
              ({sourceDetail.recipe.sub_region}, {sourceDetail.recipe.continent})
            </p>
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
              We compare molecular profiles across {TWIN_CUISINES.length} different cuisines.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
