import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function StudiesPage() {
  return (
    <EmptyModulePage
      eyebrow="Aprendizado"
      title="Estudos"
      description="Espaco reservado para planos e registros de estudo."
      items={[
        "Sem criacao de estudos nesta sprint.",
        "Sem persistencia local ainda.",
        "Modulo preparado para evoluir com fronteira propria.",
      ]}
    />
  );
}
