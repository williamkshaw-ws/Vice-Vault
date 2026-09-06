import { create } from 'zustand';

type AppState = {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  mobileTab: 'bag' | 'catalog';
  setMobileTab: (tab: 'bag' | 'catalog') => void;
  
  bagTab: 'owned' | 'wishlist';
  setBagTab: (tab: 'owned' | 'wishlist') => void;
  
  catalogSortBy: string;
  setCatalogSortBy: (sort: string) => void;
  
  bagSortBy: string;
  setBagSortBy: (sort: string) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  bagSearchQuery: string;
  setBagSearchQuery: (query: string) => void;
  
  wishlistSearchQuery: string;
  setWishlistSearchQuery: (query: string) => void;
  
  dbPanelTab: 'browse' | 'admin' | 'users' | 'register';
  setDbPanelTab: (tab: 'browse' | 'admin' | 'users' | 'register') => void;
};

export const useAppStore = create<AppState>((set) => ({
  theme: (localStorage.getItem("vice_vault_theme") as 'light' | 'dark' | 'system') || "system",
  setTheme: (theme) => {
    localStorage.setItem("vice_vault_theme", theme);
    set({ theme });
  },
  
  mobileTab: 'bag',
  setMobileTab: (mobileTab) => set({ mobileTab }),
  
  bagTab: 'owned',
  setBagTab: (bagTab) => set({ bagTab, bagSortBy: 'added_desc' }), // Matches useEffect in App.tsx
  
  catalogSortBy: 'model_asc',
  setCatalogSortBy: (catalogSortBy) => set({ catalogSortBy }),
  
  bagSortBy: 'added_desc',
  setBagSortBy: (bagSortBy) => set({ bagSortBy }),
  
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  bagSearchQuery: '',
  setBagSearchQuery: (bagSearchQuery) => set({ bagSearchQuery }),
  
  wishlistSearchQuery: '',
  setWishlistSearchQuery: (wishlistSearchQuery) => set({ wishlistSearchQuery }),
  
  dbPanelTab: 'browse',
  setDbPanelTab: (dbPanelTab) => set({ dbPanelTab }),
}));
