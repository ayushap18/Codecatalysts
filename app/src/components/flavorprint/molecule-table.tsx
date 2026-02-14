"use client";

import { Badge } from "@/components/ui/badge";
import type { FlavorPrint } from "@/types";
import { motion } from "framer-motion";

interface Props {
  flavorprint: FlavorPrint;
}

export default function MoleculeTable({ flavorprint }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold">
          Molecular Breakdown
        </h3>
        <span className="text-sm text-muted-foreground">
          {flavorprint.totalMolecules} unique molecules from{" "}
          {flavorprint.analyzedCount}/{flavorprint.ingredientCount} ingredients
        </span>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2 text-left font-medium">Molecule</th>
              <th className="px-4 py-2 text-left font-medium">Flavor Profile</th>
              <th className="px-4 py-2 text-left font-medium">Category</th>
            </tr>
          </thead>
          <tbody>
            {flavorprint.molecules.map((mol, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="px-4 py-2 font-mono text-xs">{mol.common_name}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {mol.flavor_profile.split(",").map((f, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {f.trim()}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {flavorprint.categories
                    .filter((c) => c.molecules.includes(mol.common_name))
                    .map((c) => (
                      <span
                        key={c.name}
                        className="mr-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name}
                      </span>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
