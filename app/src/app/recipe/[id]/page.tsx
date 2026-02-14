"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Flame,
  GitCompareArrows,
  BarChart3,
  Atom,
  UtensilsCrossed,
  Leaf,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RadialChart from "@/components/flavorprint/radial-chart";
import MoleculeTable from "@/components/flavorprint/molecule-table";
import SpectrumGauge from "@/components/spectrum/spectrum-gauge";
import { getRecipeById, getRecipeInstructions } from "@/lib/api/recipedb";
import { addToHistory } from "@/lib/api/cache";
import {
  generateFlavorPrint,
  calculatePhilosophyScore,
} from "@/lib/algorithms/flavorprint";
import type { RecipeDetail, FlavorPrint, PhilosophyScore } from "@/types";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [flavorprint, setFlavorprint] = useState<FlavorPrint | null>(null);
  const [philosophy, setPhilosophy] = useState<PhilosophyScore | null>(null);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getRecipeById(recipeId);
        if (!data.recipe) {
          setLoading(false);
          return;
        }
        setDetail(data as RecipeDetail);

        // Track in history
        addToHistory({
          type: "recipe",
          title: data.recipe.recipe_title,
          subtitle: `${data.recipe.sub_region} - ${data.recipe.continent}`,
          path: `/recipe/${recipeId}`,
          recipeId: data.recipe.recipe_id,
          img_url: data.recipe.img_url,
        });

        if (data.recipe && data.ingredients) {
          const fp = generateFlavorPrint(
            data.recipe.recipe_id,
            data.recipe.recipe_title,
            data.recipe.sub_region,
            data.recipe.continent,
            data.ingredients
          );
          setFlavorprint(fp);

          const ps = calculatePhilosophyScore(data.ingredients);
          setPhilosophy(ps);
        }

        // Load instructions
        try {
          const steps = await getRecipeInstructions(recipeId);
          if (Array.isArray(steps)) setInstructions(steps);
        } catch {
          // Instructions not available for all recipes
        }
      } catch (err) {
        console.error("Failed to load recipe", err);
      }
      setLoading(false);
    }
    load();
  }, [recipeId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <Skeleton className="mx-auto mt-8 h-[380px] w-[380px] rounded-full" />
        </div>
      </div>
    );
  }

  if (!detail?.recipe) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold">Recipe not found</h2>
          <p className="mt-2 text-muted-foreground">
            The recipe you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const recipe = detail.recipe;

  const dietaryTags = [
    recipe.vegan === "1" && "Vegan",
    recipe.pescetarian === "1" && "Pescetarian",
    recipe.ovo_vegetarian === "1" && "Ovo-Vegetarian",
    recipe.lacto_vegetarian === "1" && "Lacto-Vegetarian",
    recipe.ovo_lacto_vegetarian === "1" && "Ovo-Lacto Vegetarian",
  ].filter(Boolean) as string[];

  const processes = recipe.processes
    ? recipe.processes.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-background dark:from-orange-950/10 dark:to-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-[1fr_1.2fr]"
        >
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl">
            {recipe.img_url ? (
              <>
                <img
                  src={recipe.img_url}
                  alt={recipe.recipe_title}
                  className="h-64 w-full object-cover md:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      {recipe.sub_region}
                    </Badge>
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      {recipe.continent}
                    </Badge>
                    {dietaryTags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-green-500/90 text-white hover:bg-green-500"
                      >
                        <Leaf className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-muted md:h-80">
                <ChefHat className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
              {recipe.recipe_title}
            </h1>

            {/* Quick stats */}
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {recipe.total_time && recipe.total_time !== "0" && (
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                  <Clock className="h-3.5 w-3.5" /> {recipe.total_time} min
                </span>
              )}
              {recipe.servings && recipe.servings !== "0" && (
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                  <Users className="h-3.5 w-3.5" /> {recipe.servings} servings
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <Flame className="h-3.5 w-3.5" />{" "}
                {Math.round(recipe["energy (kcal)"])} kcal
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <MapPin className="h-3.5 w-3.5" /> {recipe.region}
              </span>
            </div>

            {/* Nutrition cards */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                {
                  label: "Calories",
                  val: `${Math.round(recipe["energy (kcal)"])}`,
                  unit: "kcal",
                  color: "#FF6F00",
                },
                {
                  label: "Protein",
                  val: `${Math.round(recipe["protein (g)"])}`,
                  unit: "g",
                  color: "#E91E63",
                },
                {
                  label: "Carbs",
                  val: `${Math.round(recipe["carbohydrate, by difference (g)"])}`,
                  unit: "g",
                  color: "#4CAF50",
                },
                {
                  label: "Fat",
                  val: `${Math.round(recipe["total lipid (fat) (g)"])}`,
                  unit: "g",
                  color: "#2196F3",
                },
              ].map((n) => (
                <Card key={n.label} className="border-none bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold" style={{ color: n.color }}>
                      {n.val}
                      <span className="text-xs font-normal text-muted-foreground">
                        {n.unit}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {n.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ingredients preview */}
            <div className="mt-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Ingredients ({detail.ingredients.length})
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detail.ingredients.map((ing, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {ing.ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cooking processes */}
            {processes.length > 0 && (
              <div className="mt-3">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Cooking Methods
                </h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {processes.map((p) => (
                    <span
                      key={p}
                      className="rounded border border-border/50 px-2 py-0.5 text-[10px] capitalize text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabbed Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Tabs defaultValue="flavorprint">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="flavorprint" className="gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                FlavorPrint
              </TabsTrigger>
              <TabsTrigger value="philosophy" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Philosophy
              </TabsTrigger>
              <TabsTrigger value="molecules" className="gap-1.5">
                <Atom className="h-3.5 w-3.5" />
                Molecules
              </TabsTrigger>
              {instructions.length > 0 && (
                <TabsTrigger value="instructions" className="gap-1.5">
                  <ChefHat className="h-3.5 w-3.5" />
                  Steps
                </TabsTrigger>
              )}
            </TabsList>

            {/* FlavorPrint Tab */}
            <TabsContent value="flavorprint" className="mt-6">
              {flavorprint ? (
                <div>
                  <div className="mb-4 text-center">
                    <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                      Molecular Fingerprint
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {flavorprint.analyzedCount} of{" "}
                      {flavorprint.ingredientCount} ingredients analyzed across{" "}
                      {flavorprint.categories.length} flavor categories
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <RadialChart flavorprint={flavorprint} size={420} />
                  </div>

                  {/* Category legend */}
                  <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2">
                    {flavorprint.categories
                      .filter((c) => c.count > 0)
                      .map((cat) => (
                        <div
                          key={cat.name}
                          className="flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs capitalize">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {cat.count}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-8 flex justify-center gap-3">
                    <Button
                      onClick={() =>
                        router.push(`/twins?recipeId=${recipeId}`)
                      }
                      className="bg-[#4CAF50] hover:bg-[#388E3C]"
                    >
                      <GitCompareArrows className="mr-2 h-4 w-4" />
                      Find Flavor Twins
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/spectrum?recipeId=${recipeId}`)
                      }
                      variant="outline"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Philosophy Spectrum
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="py-12 text-center text-muted-foreground">
                  Not enough data to generate a FlavorPrint for this recipe.
                </p>
              )}
            </TabsContent>

            {/* Philosophy Tab */}
            <TabsContent value="philosophy" className="mt-6">
              {philosophy ? (
                <div className="mx-auto max-w-2xl">
                  <h2 className="mb-6 text-center font-[family-name:var(--font-playfair)] text-2xl font-bold">
                    Cooking Philosophy
                  </h2>
                  <SpectrumGauge
                    score={philosophy}
                    recipeName={recipe.recipe_title}
                  />
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <Card className="border-none bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold text-blue-600">
                          {philosophy.contrastPairs}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contrast Pairs
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-none bg-gray-50 dark:bg-gray-800/20">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold">
                          {philosophy.totalPairs}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Pairs
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-none bg-orange-50 dark:bg-orange-950/20">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold text-orange-600">
                          {philosophy.pairingPairs}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pairing Pairs
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="py-12 text-center text-muted-foreground">
                  Philosophy analysis not available for this recipe.
                </p>
              )}
            </TabsContent>

            {/* Molecules Tab */}
            <TabsContent value="molecules" className="mt-6">
              {flavorprint ? (
                <MoleculeTable flavorprint={flavorprint} />
              ) : (
                <p className="py-12 text-center text-muted-foreground">
                  No molecule data available for this recipe.
                </p>
              )}
            </TabsContent>

            {/* Instructions Tab */}
            {instructions.length > 0 && (
              <TabsContent value="instructions" className="mt-6">
                <h2 className="mb-6 font-[family-name:var(--font-playfair)] text-2xl font-bold">
                  Cooking Instructions
                </h2>
                <div className="space-y-4">
                  {instructions.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6F00]/10">
                        <span className="text-sm font-bold text-[#FF6F00]">
                          {i + 1}
                        </span>
                      </div>
                      <p className="pt-1 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
