import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppearanceUpdate } from "../../types/appearance";
import { loadAppPreferences, saveAppPreferences } from "./preferencesApi";
import {
  mergePreferences,
  preferencesToAppearance,
  withDefaultPreferences,
} from "./preferencesUtils";
import type { AppPreferences } from "./types";
import { defaultPreferences } from "./types";
import { useSystemTheme } from "./useSystemTheme";

export function useAppPreferences() {
  const systemTheme = useSystemTheme();
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadAppPreferences()
      .then((loadedPreferences) => {
        if (!isMounted) {
          return;
        }

        setPreferences(withDefaultPreferences(loadedPreferences));
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) {
          return;
        }

        setPreferences(defaultPreferences);
        setError(readErrorMessage(loadError));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const persistPreferences = useCallback(async (next: AppPreferences) => {
    try {
      const savedPreferences = await saveAppPreferences(next);
      setPreferences(withDefaultPreferences(savedPreferences));
      setError(null);
    } catch (saveError) {
      setError(readErrorMessage(saveError));
    }
  }, []);

  const updatePreferences = useCallback(
    (update: Partial<AppPreferences>) => {
      setPreferences((currentPreferences) => {
        const nextPreferences = mergePreferences(currentPreferences, update);
        void persistPreferences(nextPreferences);
        return nextPreferences;
      });
    },
    [persistPreferences],
  );

  const updateAppearance = useCallback(
    (update: AppearanceUpdate) => {
      updatePreferences({
        appearance: {
          ...preferences.appearance,
          ...(update.theme ? { theme: update.theme } : {}),
          ...(update.density ? { density: update.density } : {}),
          ...(update.accent ? { accentColor: update.accent } : {}),
        },
      });
    },
    [preferences.appearance, updatePreferences],
  );

  const completeOnboarding = useCallback(() => {
    updatePreferences({
      onboarding: {
        completed: true,
      },
    });
  }, [updatePreferences]);

  const appearance = useMemo(
    () => preferencesToAppearance(preferences, systemTheme),
    [preferences, systemTheme],
  );

  return {
    appearance,
    completeOnboarding,
    error,
    isLoading,
    preferences,
    updateAppearance,
  };
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel acessar as preferencias locais.";
}
