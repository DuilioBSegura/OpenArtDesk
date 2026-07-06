import type {
  AccentTone,
  DensityMode,
  ThemePreference,
} from "../../types/appearance";

export type AppPreferences = {
  schemaVersion: number;
  appearance: {
    theme: ThemePreference;
    density: DensityMode;
    accentColor: AccentTone;
  };
  onboarding: {
    completed: boolean;
  };
  modules: {
    hiddenModuleIds: string[];
    moduleOrder: string[];
  };
};

export const defaultPreferences: AppPreferences = {
  schemaVersion: 1,
  appearance: {
    theme: "dark",
    density: "comfortable",
    accentColor: "moss",
  },
  onboarding: {
    completed: false,
  },
  modules: {
    hiddenModuleIds: [],
    moduleOrder: [],
  },
};
