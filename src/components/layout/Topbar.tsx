import type { AppModule } from "../../types/modules";

type TopbarProps = {
  activeModule: AppModule;
  isPreferencesLoading: boolean;
  preferencesError: string | null;
};

export function Topbar({
  activeModule,
  isPreferencesLoading,
  preferencesError,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <span className="topbar-eyebrow">Sprint 4</span>
        <h1>{activeModule.label}</h1>
        {activeModule.description ? (
          <p className="topbar-description">{activeModule.description}</p>
        ) : null}
      </div>
      <div className="topbar-actions" aria-label="Estado do aplicativo">
        <span className="status-pill">Offline-first</span>
        <span className="status-pill">Local-first</span>
        <span
          className="status-pill"
          data-state={preferencesError ? "danger" : "default"}
          title={preferencesError ?? undefined}
        >
          {preferencesError
            ? "Preferencias com erro"
            : isPreferencesLoading
              ? "Carregando preferencias"
              : "Preferencias locais"}
        </span>
      </div>
    </header>
  );
}
