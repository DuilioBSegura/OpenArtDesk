import { ModulePlaceholder } from "../../components/feedback/ModulePlaceholder";
import { PageScaffold } from "../../components/layout/PageScaffold";
import { Button } from "../../components/ui/Button";
import type { ModulePageProps } from "../../types/modules";

export function OnboardingPage({
  onCompleteOnboarding,
  onboardingCompleted,
}: ModulePageProps) {
  return (
    <PageScaffold
      eyebrow="Boas-vindas"
      title="Organize sua mesa de estudos local"
      description="Esta e a primeira tela do OpenArtDesk. A Sprint 4 salva preferencias locais sem dados reais ou funcionalidades de dominio."
    >
      <div className="onboarding-grid">
        <article>
          <h3>Privado por padrao</h3>
          <p>O MVP sera local-first e offline-first, sem login obrigatorio.</p>
        </article>
        <article>
          <h3>Modular desde o inicio</h3>
          <p>A sidebar nasce de um registry para facilitar novas abas.</p>
        </article>
        <article>
          <h3>Customizavel</h3>
          <p>A base visual usa variaveis CSS para temas futuros.</p>
        </article>
      </div>
      <ModulePlaceholder
        items={[
          "Rotas centralizadas a partir do moduleRegistry.",
          "Modelo preparado para esconder, ordenar e agrupar modulos.",
          "Preferencias de interface salvas em JSON local.",
          "Sem SQLite, upload, backup, IA, plugins ou leitor PDF.",
        ]}
      />
      <div className="onboarding-actions">
        <Button onClick={onCompleteOnboarding} variant="primary">
          {onboardingCompleted ? "Onboarding concluido" : "Concluir onboarding"}
        </Button>
      </div>
    </PageScaffold>
  );
}
