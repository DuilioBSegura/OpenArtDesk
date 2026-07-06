import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function SettingsPage() {
  return (
    <EmptyModulePage
      eyebrow="Sistema"
      title="Configuracoes"
      description="Placeholder para preferencias e ajustes locais futuros."
      items={[
        "Preferencias visuais ja ficam na pagina Customizacao.",
        "Sem permissoes novas.",
        "Sem integracoes online.",
      ]}
    />
  );
}
