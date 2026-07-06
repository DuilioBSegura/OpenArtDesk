import type { ReactNode } from "react";
import { PageHero } from "../ui/Surface";

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
    <section className="desktop-page">
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      {children}
    </section>
  );
}
