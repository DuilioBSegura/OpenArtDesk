import { useEffect, useState } from "react";
import type { ResolvedThemeMode } from "../../types/appearance";

function readSystemTheme(): ResolvedThemeMode {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function useSystemTheme(): ResolvedThemeMode {
  const [systemTheme, setSystemTheme] =
    useState<ResolvedThemeMode>(readSystemTheme);

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined;
    }

    const query = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => setSystemTheme(readSystemTheme());

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return systemTheme;
}
