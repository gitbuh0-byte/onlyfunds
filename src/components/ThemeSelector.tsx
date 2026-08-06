import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export type Theme = "light" | "dark" | "system";

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes: { id: Theme; label: string; icon: any }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div id="theme-selector-container" className="flex items-center space-x-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-full border border-gray-200 dark:border-zinc-700">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = currentTheme === t.id;
        return (
          <button
            key={t.id}
            id={`theme-btn-${t.id}`}
            onClick={() => onThemeChange(t.id)}
            className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-sm font-medium scale-105"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-zinc-700/50"
            }`}
            title={`${t.label} Mode`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
