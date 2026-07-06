import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function SettingsPage() {
  return (
    <EmptyModulePage
      eyebrow="Sistema"
      title="Configuracoes"
      description="Placeholder para preferencias e ajustes locais futuros."
      items={[
        "Sem persistencia de configuracoes nesta sprint.",
        "Sem permissoes novas.",
        "Sem integracoes online.",
      ]}
    />
  );
}
