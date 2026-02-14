"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, GitCompareArrows, BarChart3, Home, Moon, Sun, Beaker, Menu, X, ChefHat, Dna, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/twins", label: "Flavor Twins", icon: GitCompareArrows },
  { href: "/spectrum", label: "Spectrum", icon: BarChart3 },
  { href: "/explore", label: "Explore", icon: Beaker },
  { href: "/builder", label: "Builder", icon: ChefHat },
  { href: "/cuisine", label: "Cuisine DNA", icon: Dna },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6F00] to-[#E91E63]">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">
            FlavorPrint
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-[#FF6F00]/10 text-[#FF6F00]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="ml-2 h-6 w-px bg-border" />
          <Link
            href="/playground"
            className={cn(
              "ml-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
              pathname === "/playground"
                ? "bg-gradient-to-r from-emerald-500 to-[#FF6F00] text-white shadow-md"
                : "border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            )}
          >
            <FlaskConical className="h-4 w-4" />
            Lab
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-1 h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/playground"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all",
              pathname === "/playground"
                ? "bg-gradient-to-r from-emerald-500 to-[#FF6F00] text-white shadow-md"
                : "border border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Lab
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-9 w-9"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40 bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-[#FF6F00]/10 text-[#FF6F00]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
