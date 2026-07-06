import type { ReactNode } from "react";
import { PageHeader } from "../ui/PageHeader";

type PageScaffoldProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageScaffold({
  eyebrow,
  title,
  description,
  children,
}: PageScaffoldProps) {
  return (
    <section className="page-surface">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      {children}
    </section>
  );
}
