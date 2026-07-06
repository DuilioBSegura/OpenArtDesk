import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./app/AppShell";
import { appRoutes, defaultRoute } from "./app/routes";
import { useAppPreferences } from "./features/preferences/useAppPreferences";
import { applyModulePreferences } from "./features/preferences/preferencesUtils";

function App() {
  const [activeModuleId, setActiveModuleId] = useState(defaultRoute.id);
  const {
    appearance,
    completeOnboarding,
    error: preferencesError,
    isLoading: isPreferencesLoading,
    preferences,
    updateAppearance,
  } = useAppPreferences();

  const routes = useMemo(
    () => applyModulePreferences(appRoutes, preferences.modules),
    [preferences.modules],
  );

  const activeModule = useMemo(
    () =>
      routes.find((route) => route.id === activeModuleId)?.module ??
      routes[0]?.module ??
      defaultRoute.module,
    [activeModuleId, routes],
  );

  useEffect(() => {
    if (isPreferencesLoading) {
      return;
    }

    if (preferences.onboarding.completed && activeModuleId === "onboarding") {
      setActiveModuleId("dashboard");
    }
  }, [activeModuleId, isPreferencesLoading, preferences.onboarding.completed]);

  return (
    <AppShell
      activeModule={activeModule}
      appearance={appearance}
      isPreferencesLoading={isPreferencesLoading}
      onAppearanceChange={updateAppearance}
      onCompleteOnboarding={completeOnboarding}
      onboardingCompleted={preferences.onboarding.completed}
      preferencesError={preferencesError}
      routes={routes}
      onNavigate={setActiveModuleId}
    />
  );
}

export default App;
