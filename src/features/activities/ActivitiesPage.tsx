import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function ActivitiesPage() {
  return (
    <EmptyModulePage
      eyebrow="Pratica"
      title="Atividades"
      description="Espaco inicial para futuras tarefas e praticas de estudo."
      items={[
        "Sem tarefas reais nesta sprint.",
        "Sem calendario ou prazos.",
        "Sem sistema de produtividade avancado.",
      ]}
    />
  );
}
