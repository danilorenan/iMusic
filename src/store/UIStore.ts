import { create } from 'zustand';

interface UIState {
    isOfflineMode: boolean;
    isPlayerExpanded: boolean;

    setOfflineMode: (offline: boolean) => void;
    setPlayerExpanded: (expanded: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isOfflineMode: false,
    isPlayerExpanded: false,

    setOfflineMode: (offline) => set({ isOfflineMode: offline }),
    setPlayerExpanded: (expanded) => set({ isPlayerExpanded: expanded })
}));
