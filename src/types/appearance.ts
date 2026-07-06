export type ResolvedThemeMode = "dark" | "light";

export type ThemePreference = ResolvedThemeMode | "system";

export type DensityMode = "comfortable" | "compact";

export type AccentTone = "moss" | "blue" | "amber";

export type AppearanceState = {
  theme: ThemePreference;
  resolvedTheme: ResolvedThemeMode;
  density: DensityMode;
  accent: AccentTone;
};

export const defaultAppearance: AppearanceState = {
  theme: "dark",
  resolvedTheme: "dark",
  density: "comfortable",
  accent: "moss",
};

export type AppearanceUpdate = Partial<AppearanceState>;

export type AppearanceController = {
  appearance: AppearanceState;
  isPreferencesLoading: boolean;
  onCompleteOnboarding: () => void;
  onAppearanceChange: (update: AppearanceUpdate) => void;
  onboardingCompleted: boolean;
  preferencesError: string | null;
};
