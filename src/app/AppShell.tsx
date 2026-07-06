import type { AppRoute } from "./routes";
import { MainContent } from "../components/layout/MainContent";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import type { AppearanceController } from "../types/appearance";
import type { AppModule } from "../types/modules";

type AppShellProps = AppearanceController & {
  activeModule: AppModule;
  routes: AppRoute[];
  onNavigate: (moduleId: AppModule["id"]) => void;
};

export function AppShell({
  activeModule,
  appearance,
  isPreferencesLoading,
  onAppearanceChange,
  onCompleteOnboarding,
  onboardingCompleted,
  preferencesError,
  routes,
  onNavigate,
}: AppShellProps) {
  return (
    <div
      className="app-shell"
      data-accent={appearance.accent}
      data-density={appearance.density}
      data-theme={appearance.resolvedTheme}
    >
      <Sidebar
        activeModuleId={activeModule.id}
        routes={routes}
        onNavigate={onNavigate}
      />
      <div className="workspace">
        <Topbar
          activeModule={activeModule}
          isPreferencesLoading={isPreferencesLoading}
          preferencesError={preferencesError}
        />
        <MainContent
          activeModule={activeModule}
          appearance={appearance}
          isPreferencesLoading={isPreferencesLoading}
          onAppearanceChange={onAppearanceChange}
          onCompleteOnboarding={onCompleteOnboarding}
          onboardingCompleted={onboardingCompleted}
          preferencesError={preferencesError}
        />
      </div>
    </div>
  );
}
