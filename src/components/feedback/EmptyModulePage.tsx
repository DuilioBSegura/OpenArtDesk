import { PageScaffold } from "../layout/PageScaffold";
import { ModulePlaceholder } from "./ModulePlaceholder";

type EmptyModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export function EmptyModulePage({
  eyebrow,
  title,
  description,
  items,
}: EmptyModulePageProps) {
  return (
    <PageScaffold eyebrow={eyebrow} title={title} description={description}>
      <ModulePlaceholder items={items} />
    </PageScaffold>
  );
}
