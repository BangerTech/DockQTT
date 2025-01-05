import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type ThemeState = Pick<ThemeStore, 'isDarkMode'>;
type ThemeActions = Pick<ThemeStore, 'toggleTheme'>;

export const useThemeStore = create<ThemeStore>()(
  persist<ThemeStore>(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state: ThemeState) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'theme-storage',
    }
  )
); 