"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Loader2, ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findSubstitutions, FLAVOR_CATEGORIES } from "@/lib/algorithms/substitution";
import type { SubstitutionResult } from "@/lib/algorithms/substitution";
import type { RecipeIngredient } from "@/types";

interface Props {
  ingredients: RecipeIngredient[];
}

export default function SubstitutionPanel({ ingredients }: Props) {
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [results, setResults] = useState<SubstitutionResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFindSubstitutions(ingredientName: string) {
    setSelectedIngredient(ingredientName);
    setLoading(true);
    setResults([]);

    const existing = ingredients.map((i) => i.ingredient.toLowerCase());
    const subs = await findSubstitutions(ingredientName, existing);
    setResults(subs);
    setLoading(false);
  }

  return (
    <div>
      {/* Ingredient selector */}
      <p className="mb-3 text-sm text-muted-foreground">
        Select an ingredient to find molecular substitutes:
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {ingredients.map((ing, i) => (
          <button
            key={i}
            onClick={() => handleFindSubstitutions(ing.ingredient)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
              selectedIngredient === ing.ingredient
                ? "border-[#FF6F00] bg-[#FF6F00]/10 text-[#FF6F00]"
                : "border-border text-muted-foreground hover:border-[#FF6F00]/50 hover:text-foreground"
            }`}
          >
            {ing.ingredient}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#FF6F00]" />
          <span className="text-sm text-muted-foreground">
            Finding molecular substitutes for {selectedIngredient}...
          </span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {!loading && results.length > 0 && (
          <motion.div
            key={selectedIngredient}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="mb-4 rounded-lg border border-[#FF6F00]/20 bg-[#FF6F00]/5 p-3">
              <p className="text-sm">
                Showing substitutes for{" "}
                <strong className="capitalize text-[#FF6F00]">
                  {selectedIngredient}
                </strong>{" "}
                ranked by molecular similarity
              </p>
            </div>

            {results.map((sub, i) => (
              <motion.div
                key={sub.substitute}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium capitalize line-through opacity-50">
                        {sub.original}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold capitalize text-[#FF6F00]">
                        {sub.substitute}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-muted"
                      style={{ width: 60 }}
                    >
                      <div
                        className="h-2 rounded-full bg-[#FF6F00]"
                        style={{ width: `${Math.round(sub.matchScore * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#FF6F00]">
                      {Math.round(sub.matchScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Shared molecules */}
                {sub.sharedMolecules.length > 0 && (
                  <div className="mt-2">
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ArrowRightLeft className="h-3 w-3" />
                      Shared: {sub.sharedMolecules.join(", ")}
                    </p>
                  </div>
                )}

                {/* Flavor impact */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {sub.flavorImpact.gained.slice(0, 3).map((cat) => (
                    <Badge
                      key={`+${cat}`}
                      variant="secondary"
                      className="gap-0.5 text-[10px]"
                    >
                      <Plus className="h-2.5 w-2.5 text-green-600" />
                      <span className="capitalize">{cat}</span>
                    </Badge>
                  ))}
                  {sub.flavorImpact.lost.slice(0, 3).map((cat) => (
                    <Badge
                      key={`-${cat}`}
                      variant="secondary"
                      className="gap-0.5 text-[10px]"
                    >
                      <Minus className="h-2.5 w-2.5 text-red-500" />
                      <span className="capitalize">{cat}</span>
                    </Badge>
                  ))}
                </div>

                {/* Categories */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {sub.categories.slice(0, 5).map((cat) => (
                    <span
                      key={cat}
                      className="rounded px-1.5 py-0.5 text-[9px] text-white capitalize"
                      style={{
                        backgroundColor: FLAVOR_CATEGORIES[cat] || "#90A4AE",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      {!loading && selectedIngredient && results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No molecular substitutes found for {selectedIngredient}. Try another
          ingredient.
        </p>
      )}

      {/* Empty state */}
      {!selectedIngredient && (
        <div className="py-8 text-center">
          <ArrowRightLeft className="mx-auto h-10 w-10 text-muted-foreground/20" />
          <p className="mt-3 text-sm text-muted-foreground">
            Click an ingredient above to find molecularly similar substitutes.
          </p>
        </div>
      )}
    </div>
  );
}
