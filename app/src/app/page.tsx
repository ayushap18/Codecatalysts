"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Flame,
  GitCompareArrows,
  BarChart3,
  Globe,
  Beaker,
  ChefHat,
  Atom,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { searchRecipesByTitle, getRecipeOfDay } from "@/lib/api/recipedb";
import type { Recipe } from "@/types";

const FEATURES = [
  {
    icon: Flame,
    title: "FlavorPrint Visualizer",
    desc: "Generate a radial molecular fingerprint for any recipe. See which flavor categories dominate at the molecular level.",
    color: "#FF6F00",
    href: "/",
    tag: "Core Feature",
  },
  {
    icon: GitCompareArrows,
    title: "Cross-Cultural Flavor Twins",
    desc: "Find recipes from different countries that taste the same with completely different ingredients.",
    color: "#4CAF50",
    href: "/twins",
    tag: "Discovery",
  },
  {
    icon: BarChart3,
    title: "Philosophy Spectrum",
    desc: "Classify recipes on the Pairing vs Contrast spectrum based on the Ahn et al. food pairing hypothesis.",
    color: "#2196F3",
    href: "/spectrum",
    tag: "Analysis",
  },
  {
    icon: Beaker,
    title: "Ingredient Explorer",
    desc: "Dive deep into individual ingredients and discover the flavor molecules that make them unique.",
    color: "#9C27B0",
    href: "/explore",
    tag: "Exploration",
  },
];

const STATS = [
  { label: "Recipes", value: "118K+", icon: ChefHat },
  { label: "Molecules", value: "25,595", icon: Atom },
  { label: "Countries", value: "74", icon: Globe },
  { label: "Ingredients", value: "23,500+", icon: Beaker },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recipeOfDay, setRecipeOfDay] = useState<Recipe | null>(null);

  useEffect(() => {
    getRecipeOfDay()
      .then((data) => {
        if (data) setRecipeOfDay(Array.isArray(data) ? data[0] : data);
      })
      .catch(() => {});
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchRecipesByTitle(query);
      setResults(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/10 dark:to-background">
      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-4 pt-20 pb-16 text-center">
        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-[#FF6F00]/20"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="secondary" className="mb-6 border border-[#FF6F00]/20 text-[#FF6F00]">
            <Sparkles className="mr-1 h-3 w-3" />
            Powered by Computational Gastronomy
          </Badge>

          <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Every dish has a{" "}
            <span className="bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent">
              molecular identity
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            FlavorPrint fingerprints recipes at the molecular level to discover
            hidden connections between cuisines across 74 countries and 25,595
            flavor molecules.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          className="mx-auto mt-10 flex max-w-xl gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search any recipe... (e.g. Butter Chicken, Ramen, Pad Thai)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button type="submit" className="h-12 bg-[#FF6F00] px-6 hover:bg-[#E65100]">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </motion.form>

        {/* Quick search suggestions */}
        {!searched && (
          <motion.div
            className="mt-4 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-xs text-muted-foreground">Try:</span>
            {["Butter Chicken", "Sushi", "Pad Thai", "Tacos", "Biryani"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-[#FF6F00]/50 hover:text-[#FF6F00]"
                >
                  {s}
                </button>
              )
            )}
          </motion.div>
        )}
      </section>

      {/* Stats Banner */}
      {!searched && (
        <motion.section
          className="mx-auto max-w-4xl px-4 pb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className="border-none bg-muted/50 text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="mx-auto h-6 w-6 text-[#FF6F00]" />
                    <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Search Results */}
      {(loading || searched) && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">
              {loading ? "Searching..." : `${results.length} recipes found`}
            </h2>
            {searched && !loading && (
              <button
                onClick={() => {
                  setSearched(false);
                  setResults([]);
                  setQuery("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear results
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="mb-3 h-36 w-full rounded-lg" />
                      <Skeleton className="mb-2 h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              : results.map((recipe) => (
                  <motion.div
                    key={recipe.recipe_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                      onClick={() =>
                        router.push(`/recipe/${recipe.recipe_id}`)
                      }
                    >
                      <CardContent className="p-0">
                        {recipe.img_url ? (
                          <div className="relative overflow-hidden">
                            <img
                              src={recipe.img_url}
                              alt={recipe.recipe_title}
                              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 left-3 right-3">
                              <h3 className="font-semibold leading-tight text-white">
                                {recipe.recipe_title}
                              </h3>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 pb-0">
                            <h3 className="font-semibold leading-tight">
                              {recipe.recipe_title}
                            </h3>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 pt-2">
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {recipe.sub_region}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recipe.continent}
                            </Badge>
                          </div>
                          {recipe.total_time &&
                            recipe.total_time !== "0" && (
                              <span className="text-xs text-muted-foreground">
                                {recipe.total_time} min
                              </span>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </section>
      )}

      {/* Features */}
      {!searched && (
        <>
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
                What You Can Discover
              </h2>
              <p className="mt-2 text-muted-foreground">
                Four powerful tools for exploring food at the molecular level
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
                >
                  <Card
                    className="group h-full cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => router.push(f.href)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${f.color}15` }}
                        >
                          <f.icon
                            className="h-6 w-6"
                            style={{ color: f.color }}
                          />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {f.tag}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 text-lg group-hover:text-[#FF6F00] transition-colors">
                        {f.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                      <div className="mt-4 flex items-center text-sm font-medium" style={{ color: f.color }}>
                        Explore
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Recipe of the Day */}
          {recipeOfDay && (
            <section className="mx-auto max-w-6xl px-4 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-[1fr_1.5fr]">
                    {recipeOfDay.img_url && (
                      <div className="relative h-48 md:h-auto">
                        <img
                          src={recipeOfDay.img_url}
                          alt={recipeOfDay.recipe_title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80 md:bg-gradient-to-t md:from-transparent md:to-transparent" />
                      </div>
                    )}
                    <div className="flex flex-col justify-center p-6 md:p-8">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#FF6F00]" />
                        <span className="text-sm font-medium text-[#FF6F00]">
                          Recipe of the Day
                        </span>
                      </div>
                      <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-bold">
                        {recipeOfDay.recipe_title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge>{recipeOfDay.sub_region}</Badge>
                        <Badge variant="outline">{recipeOfDay.continent}</Badge>
                        {recipeOfDay.total_time && recipeOfDay.total_time !== "0" && (
                          <Badge variant="secondary">
                            {recipeOfDay.total_time} min
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Discover the molecular fingerprint of this recipe and find
                        its flavor twins from across the world.
                      </p>
                      <Button
                        className="mt-4 w-fit bg-[#FF6F00] hover:bg-[#E65100]"
                        onClick={() =>
                          router.push(`/recipe/${recipeOfDay.recipe_id}`)
                        }
                      >
                        View FlavorPrint
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </section>
          )}

          {/* How it Works */}
          <section className="border-t border-border/40 bg-muted/20 py-16">
            <div className="mx-auto max-w-4xl px-4">
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
                  How FlavorPrint Works
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Three steps to reveal the molecular identity of any recipe
                </p>
              </motion.div>

              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Search a Recipe",
                    desc: "Choose from 118,000+ recipes spanning 74 countries in the RecipeDB database.",
                  },
                  {
                    step: "02",
                    title: "Analyze Molecules",
                    desc: "We map each ingredient to its flavor molecules from FlavorDB's 25,595 compounds.",
                  },
                  {
                    step: "03",
                    title: "Discover Patterns",
                    desc: "See the molecular fingerprint, find flavor twins, and understand cooking philosophies.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + i * 0.15 }}
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6F00]/10">
                      <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#FF6F00]">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
