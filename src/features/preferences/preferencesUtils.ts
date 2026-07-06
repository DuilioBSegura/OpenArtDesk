import type { AppRoute } from "../../app/routes";
import type {
  AccentTone,
  AppearanceState,
  ResolvedThemeMode,
  ThemePreference,
} from "../../types/appearance";
import { defaultAppearance } from "../../types/appearance";
import type { AppPreferences } from "./types";
import { defaultPreferences } from "./types";

const accentTones: AccentTone[] = ["moss", "blue", "amber"];

export function resolveThemePreference(
  theme: ThemePreference,
  systemTheme: ResolvedThemeMode,
): ResolvedThemeMode {
  return theme === "system" ? systemTheme : theme;
}

export function preferencesToAppearance(
  preferences: AppPreferences,
  systemTheme: ResolvedThemeMode,
): AppearanceState {
  return {
    theme: preferences.appearance.theme,
    resolvedTheme: resolveThemePreference(
      preferences.appearance.theme,
      systemTheme,
    ),
    density: preferences.appearance.density,
    accent: normalizeAccent(preferences.appearance.accentColor),
  };
}

export function mergePreferences(
  preferences: AppPreferences,
  update: Partial<AppPreferences>,
): AppPreferences {
  return {
    ...preferences,
    ...update,
    appearance: {
      ...preferences.appearance,
      ...update.appearance,
    },
    onboarding: {
      ...preferences.onboarding,
      ...update.onboarding,
    },
    modules: {
      ...preferences.modules,
      ...update.modules,
    },
  };
}

export function applyModulePreferences(
  routes: AppRoute[],
  preferences: AppPreferences["modules"],
): AppRoute[] {
  const hiddenIds = new Set(preferences.hiddenModuleIds);
  const orderIndex = new Map(
    preferences.moduleOrder.map((moduleId, index) => [moduleId, index]),
  );

  return routes
    .filter((route) => !hiddenIds.has(route.id))
    .slice()
    .sort((left, right) => {
      const leftIndex = orderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = orderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER;

      if (leftIndex !== rightIndex) {
        return leftIndex - rightIndex;
      }

      return left.module.order - right.module.order;
    });
}

export function withDefaultPreferences(
  preferences: AppPreferences | null | undefined,
): AppPreferences {
  if (!preferences || preferences.schemaVersion !== defaultPreferences.schemaVersion) {
    return defaultPreferences;
  }

  return mergePreferences(defaultPreferences, preferences);
}

function normalizeAccent(accentColor: string): AccentTone {
  return accentTones.includes(accentColor as AccentTone)
    ? (accentColor as AccentTone)
    : defaultAppearance.accent;
}
