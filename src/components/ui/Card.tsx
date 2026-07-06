import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export function Card({ children, className, description, title }: CardProps) {
  const classes = ["ui-card", className].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      {title || description ? (
        <header className="ui-card-header">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </header>
      ) : null}
      {children}
    </article>
  );
}
