import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const storageKey = "linklab.theme";
const system = window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#fafafa");
  listeners.forEach((listener) => listener());
}

function syncPreference() {
  applyTheme(savedTheme() ?? (system.matches ? "dark" : "light"));
}

function onStorage(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) syncPreference();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    system.addEventListener("change", syncPreference);
    window.addEventListener("storage", onStorage);
    syncPreference();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      system.removeEventListener("change", syncPreference);
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);
  function toggleTheme() {
    const next = getSnapshot() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Keep the toggle usable when browser storage is unavailable.
    }
    applyTheme(next);
  }
  return { dark: theme === "dark", toggleTheme };
}
