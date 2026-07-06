import type { AppearanceController } from "../../types/appearance";
import type { AppModule } from "../../types/modules";

type MainContentProps = AppearanceController & {
  activeModule: AppModule;
};

export function MainContent({
  activeModule,
  appearance,
  isPreferencesLoading,
  onAppearanceChange,
  onCompleteOnboarding,
  onboardingCompleted,
  preferencesError,
}: MainContentProps) {
  const Page = activeModule.component;

  return (
    <main className="workspace-main">
      <Page
        module={activeModule}
        appearance={appearance}
        isPreferencesLoading={isPreferencesLoading}
        onAppearanceChange={onAppearanceChange}
        onCompleteOnboarding={onCompleteOnboarding}
        onboardingCompleted={onboardingCompleted}
        preferencesError={preferencesError}
      />
    </main>
  );
}
