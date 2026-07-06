import { EmptyModulePage } from "../../components/feedback/EmptyModulePage";

export function LocalDataPage() {
  return (
    <EmptyModulePage
      eyebrow="Privacidade"
      title="Dados Locais"
      description="Area reservada para explicar onde os dados ficam e como backup funcionara no MVP."
      items={[
        "Sem SQLite nesta sprint.",
        "Sem backup nesta sprint.",
        "Sem envio de dados para servidores.",
      ]}
    />
  );
}
