"use client";

import Link from "next/link";
import { Flame, Github, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6F00] to-[#E91E63]">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold">
                FlavorPrint
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Molecular recipe fingerprinting that reveals hidden connections between cuisines across 74 countries.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  FlavorPrint Visualizer
                </Link>
              </li>
              <li>
                <Link href="/twins" className="transition-colors hover:text-foreground">
                  Cross-Cultural Flavor Twins
                </Link>
              </li>
              <li>
                <Link href="/spectrum" className="transition-colors hover:text-foreground">
                  Philosophy Spectrum
                </Link>
              </li>
              <li>
                <Link href="/explore" className="transition-colors hover:text-foreground">
                  Ingredient Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Data Sources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1">
                RecipeDB — 118K+ recipes
                <ExternalLink className="h-3 w-3" />
              </li>
              <li className="flex items-center gap-1">
                FlavorDB — 25,595 molecules
                <ExternalLink className="h-3 w-3" />
              </li>
              <li>CoSyLab, IIIT Delhi</li>
              <li className="text-xs">CC BY-NC-SA 3.0</li>
            </ul>
          </div>

          {/* Research */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">References</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Ahn et al., Scientific Reports (2011)</li>
              <li>Garg et al., NAR (2017)</li>
              <li>Bagler et al., Comp. Gastronomy</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Built for ForkIT Challenge 2025 by Team CodeCatalysts
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/ayushap18/Codecatalysts"
              target="_blank"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
