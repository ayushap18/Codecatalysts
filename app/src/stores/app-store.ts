import { create } from "zustand";
import type { Recipe, RecipeDetail, FlavorPrint } from "@/types";

interface AppStore {
  selectedRecipe: RecipeDetail | null;
  selectedFlavorPrint: FlavorPrint | null;
  searchResults: Recipe[];
  isSearching: boolean;
  setSelectedRecipe: (r: RecipeDetail | null) => void;
  setSelectedFlavorPrint: (fp: FlavorPrint | null) => void;
  setSearchResults: (results: Recipe[]) => void;
  setIsSearching: (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedRecipe: null,
  selectedFlavorPrint: null,
  searchResults: [],
  isSearching: false,
  setSelectedRecipe: (r) => set({ selectedRecipe: r }),
  setSelectedFlavorPrint: (fp) => set({ selectedFlavorPrint: fp }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (v) => set({ isSearching: v }),
}));
