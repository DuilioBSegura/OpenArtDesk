import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function ReferencesPage() {
  return (
    <EmptyModulePage
      eyebrow="Inspiracao"
      title="Referencias"
      description="Base para referencias visuais, links e materiais de apoio com fonte clara."
      items={[
        "Sem downloads automaticos.",
        "Sem scraping.",
        "Politica de conteudo continua valendo para contribuicoes.",
      ]}
    />
  );
}
