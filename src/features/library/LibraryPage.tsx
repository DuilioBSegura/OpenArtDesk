import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function LibraryPage() {
  return (
    <EmptyModulePage
      eyebrow="Materiais"
      title="Minha Biblioteca"
      description="Base visual para organizar PDFs e materiais locais em uma sprint futura."
      items={[
        "Nenhum upload ou importacao de PDF foi implementado.",
        "Nenhum arquivo e copiado para o filesystem.",
        "Abertura no leitor padrao fica para a sprint de biblioteca.",
      ]}
    />
  );
}
