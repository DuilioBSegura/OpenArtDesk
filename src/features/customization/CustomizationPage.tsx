import { PageScaffold } from "../../components/layout/PageScaffold";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ThemeOption } from "../../components/ui/ThemeOption";
import { Toggle } from "../../components/ui/Toggle";
import type {
  AccentTone,
  ThemePreference,
} from "../../types/appearance";
import type { ModulePageProps } from "../../types/modules";

const themeOptions: Array<{
  description: string;
  label: string;
  swatch: string;
  value: ThemePreference;
}> = [
  {
    value: "dark",
    label: "Escuro",
    description: "Prioridade visual do app desktop.",
    swatch: "linear-gradient(135deg, #151815 0%, #252b27 100%)",
  },
  {
    value: "light",
    label: "Claro",
    description: "Alternativa limpa para ambientes claros.",
    swatch: "linear-gradient(135deg, #eff2ef 0%, #ffffff 100%)",
  },
  {
    value: "system",
    label: "Sistema",
    description: "Acompanha claro/escuro do sistema operacional.",
    swatch: "linear-gradient(135deg, #151815 0%, #eff2ef 100%)",
  },
];

const accentOptions: Array<{
  label: string;
  swatch: string;
  value: AccentTone;
}> = [
  { value: "moss", label: "Musgo", swatch: "#62b59d" },
  { value: "blue", label: "Azul", swatch: "#6ba5e8" },
  { value: "amber", label: "Ambar", swatch: "#d7a348" },
];

export function CustomizationPage({
  appearance,
  isPreferencesLoading,
  onAppearanceChange,
  preferencesError,
}: ModulePageProps) {
  const isCompact = appearance.density === "compact";

  return (
    <PageScaffold
      eyebrow="Aparencia"
      title="Customizacao"
      description="Base inicial para temas, densidade e identidade visual do OpenArtDesk."
    >
      <div className="customization-grid">
        <div className="customization-controls">
          <section className="customization-panel" aria-labelledby="theme-panel">
            <h3 className="customization-panel-title" id="theme-panel">
              Tema
            </h3>
            <div className="customization-option-grid">
              {themeOptions.map((option) => (
                <ThemeOption
                  active={appearance.theme === option.value}
                  description={option.description}
                  key={option.value}
                  label={option.label}
                  onSelect={(theme) => onAppearanceChange({ theme })}
                  swatch={option.swatch}
                  value={option.value}
                />
              ))}
            </div>
          </section>

          <section
            className="customization-panel"
            aria-labelledby="density-panel"
          >
            <h3 className="customization-panel-title" id="density-panel">
              Densidade
            </h3>
            <Toggle
              checked={isCompact}
              description="Preferencia salva no JSON local do app."
              label={isCompact ? "Compacta" : "Confortavel"}
              onChange={(checked) =>
                onAppearanceChange({
                  density: checked ? "compact" : "comfortable",
                })
              }
            />
          </section>

          <section className="customization-panel" aria-labelledby="accent-panel">
            <h3 className="customization-panel-title" id="accent-panel">
              Destaque
            </h3>
            <div className="customization-accent-row">
              {accentOptions.map((option) => (
                <ThemeOption
                  active={appearance.accent === option.value}
                  description="Cor ativa"
                  key={option.value}
                  label={option.label}
                  onSelect={(accent) => onAppearanceChange({ accent })}
                  swatch={option.swatch}
                  value={option.value}
                />
              ))}
            </div>
          </section>
        </div>

        <section className="customization-preview" aria-label="Preview visual">
          <div className="preview-toolbar">
            <Badge tone="accent">Preview persistente</Badge>
            <Badge tone="success">CSS variables</Badge>
            <Badge tone="warning">
              {isPreferencesLoading ? "Carregando" : "JSON local"}
            </Badge>
          </div>

          {preferencesError ? (
            <EmptyState
              title="Preferencias em fallback"
              description={preferencesError}
            />
          ) : null}

          <div className="preview-window">
            <aside className="preview-rail" aria-label="Preview de sidebar">
              <strong>OpenArtDesk</strong>
              <span>Customizacao</span>
              <span>Biblioteca</span>
              <span>Estudos</span>
            </aside>

            <div className="preview-canvas">
              <div className="preview-badges">
                <Badge>Offline-first</Badge>
                <Badge tone="accent">Local workspace</Badge>
              </div>

              <div className="preview-card-grid">
                <Card
                  title="Mesa visual"
                  description="Tokens de tema aplicados ao shell, navegacao e conteudo."
                >
                  <p className="preview-note">
                    O preview acompanha tema, densidade e cor de destaque sem
                    usar localStorage, SQLite ou caminho hardcoded.
                  </p>
                </Card>
                <Card
                  title="Estudo criativo"
                  description="Base pronta para uma experiencia ajustavel."
                >
                  <div className="preview-action-row">
                    <Button variant="primary">Principal</Button>
                    <Button variant="secondary">Secundario</Button>
                    <Button variant="ghost">Discreto</Button>
                  </div>
                </Card>
              </div>

              <EmptyState
                title="Preferencias locais"
                description="As escolhas visuais sao salvas em preferences.json no diretorio de configuracao do app."
              />
            </div>
          </div>
        </section>
      </div>
    </PageScaffold>
  );
}
