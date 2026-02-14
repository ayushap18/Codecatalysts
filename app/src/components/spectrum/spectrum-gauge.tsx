"use client";

import type { PhilosophyScore } from "@/types";
import { motion } from "framer-motion";

interface Props {
  score: PhilosophyScore;
  recipeName: string;
}

export default function SpectrumGauge({ score, recipeName }: Props) {
  return (
    <div className="space-y-4">
      <div className="relative h-10 w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-gray-300 to-orange-500">
        <motion.div
          className="absolute top-0 h-10 w-1 bg-foreground shadow-lg"
          initial={{ left: "50%" }}
          animate={{ left: `${score.score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute -top-8 rounded-md bg-foreground px-2 py-1 text-xs font-bold text-background"
          initial={{ left: "50%" }}
          animate={{ left: `${score.score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transform: "translateX(-50%)" }}
        >
          {score.score}%
        </motion.div>
      </div>
      <div className="flex justify-between text-sm font-medium">
        <span className="text-blue-600">Contrast (East Asian)</span>
        <span className="text-muted-foreground">Balanced</span>
        <span className="text-orange-600">Pairing (Western)</span>
      </div>
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm">
          <strong>{recipeName}</strong> scores <strong>{score.score}%</strong> on
          the pairing spectrum, classified as{" "}
          <strong className={
            score.label === "Pairing"
              ? "text-orange-600"
              : score.label === "Contrast"
              ? "text-blue-600"
              : "text-gray-600"
          }>
            {score.label}
          </strong>.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Average shared molecules per ingredient pair:{" "}
          <strong>{score.avgSharedMolecules}</strong> | {score.pairingPairs}{" "}
          pairing pairs, {score.contrastPairs} contrast pairs out of{" "}
          {score.totalPairs} total.
        </p>
      </div>
    </div>
  );
}
