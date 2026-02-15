"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, GitCompareArrows, BarChart3, Home, Moon, Sun, Beaker, Menu, X, ChefHat, Dna, FlaskConical, History, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/api/cache";

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const HISTORY_ICONS: Record<string, { icon: typeof Home; color: string }> = {
  search: { icon: Search, color: "text-muted-foreground" },
  recipe: { icon: ChefHat, color: "text-[#FF6F00]" },
  explore: { icon: Beaker, color: "text-[#9C27B0]" },
  twins: { icon: GitCompareArrows, color: "text-[#4CAF50]" },
  spectrum: { icon: BarChart3, color: "text-[#2196F3]" },
  builder: { icon: ChefHat, color: "text-[#E91E63]" },
  cuisine: { icon: Dna, color: "text-[#009688]" },
};

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
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory, pathname]);

  // Close history panel on outside click
  useEffect(() => {
    if (!historyOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-history-panel]")) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [historyOpen]);

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
          <div className="relative" data-history-panel>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setHistoryOpen(!historyOpen);
                refreshHistory();
              }}
              className={cn("ml-1 h-9 w-9", historyOpen && "bg-accent")}
            >
              <History className="h-4 w-4" />
            </Button>
            {history.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6F00] text-[8px] font-bold text-white">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
            <AnimatePresence>
              {historyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-[60] w-80 overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <History className="h-4 w-4 text-[#FF6F00]" />
                      Project History
                    </h3>
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          clearHistory();
                          refreshHistory();
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No activity yet
                      </p>
                    ) : (
                      history.slice(0, 20).map((entry) => {
                        const iconInfo = HISTORY_ICONS[entry.type] || HISTORY_ICONS.search;
                        const Icon = iconInfo.icon;
                        return (
                          <button
                            key={entry.path + entry.timestamp}
                            onClick={() => {
                              router.push(entry.path);
                              setHistoryOpen(false);
                            }}
                            className="flex w-full items-center gap-3 border-b border-border/30 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-accent"
                          >
                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted", iconInfo.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{entry.title}</p>
                              {entry.subtitle && (
                                <p className="truncate text-[10px] text-muted-foreground">
                                  {entry.subtitle}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 text-[9px] text-muted-foreground/60">
                              {formatTimeAgo(entry.timestamp)}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            onClick={(e) => {
              e.stopPropagation();
              setHistoryOpen(!historyOpen);
              refreshHistory();
            }}
            className={cn("h-9 w-9", historyOpen && "bg-accent")}
          >
            <History className="h-4 w-4" />
          </Button>
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
