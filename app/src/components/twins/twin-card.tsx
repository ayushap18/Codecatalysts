"use client";

import type { TwinResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Props {
  twin: TwinResult;
}

export default function TwinCard({ twin }: Props) {
  const pct = Math.round(twin.molecularSimilarity * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid gap-6 md:grid-cols-[1fr_auto_1fr]"
    >
      {/* Source */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {twin.source.recipe.recipe_title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{twin.source.recipe.sub_region}</Badge>
            <Badge variant="outline">{twin.source.recipe.continent}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {twin.source.recipe.img_url && (
            <img
              src={twin.source.recipe.img_url}
              alt={twin.source.recipe.recipe_title}
              className="mb-3 h-40 w-full rounded-lg object-cover"
            />
          )}
          <p className="text-sm text-muted-foreground">
            {twin.source.ingredients.map((i) => i.ingredient).join(", ")}
          </p>
        </CardContent>
      </Card>

      {/* Score */}
      <div className="flex flex-col items-center justify-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#FF6F00] bg-[#FF6F00]/10"
        >
          <span className="text-2xl font-bold text-[#FF6F00]">{pct}%</span>
        </motion.div>
        <span className="text-sm font-semibold">Molecular Match</span>
        <div className="text-center text-xs text-muted-foreground">
          <p>{twin.sharedMolecules.length} shared molecules</p>
          <p>{twin.sharedIngredients.length} shared ingredients</p>
        </div>
      </div>

      {/* Twin */}
      <Card className="border-[#FF6F00]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {twin.twin.recipe.recipe_title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{twin.twin.recipe.sub_region}</Badge>
            <Badge variant="outline">{twin.twin.recipe.continent}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {twin.twin.recipe.img_url && (
            <img
              src={twin.twin.recipe.img_url}
              alt={twin.twin.recipe.recipe_title}
              className="mb-3 h-40 w-full rounded-lg object-cover"
            />
          )}
          <p className="text-sm text-muted-foreground">
            {twin.twin.ingredients.map((i) => i.ingredient).join(", ")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
