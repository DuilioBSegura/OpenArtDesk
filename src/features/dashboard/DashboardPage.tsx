import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function DashboardPage() {
  return (
    <EmptyModulePage
      eyebrow="Visao geral"
      title="Dashboard"
      description="Espaco reservado para resumos locais dos estudos quando os modulos de dominio existirem."
      items={[
        "Sem metricas reais nesta sprint.",
        "Sem analytics remoto.",
        "Preparado para receber dados locais futuramente.",
      ]}
    />
  );
}
