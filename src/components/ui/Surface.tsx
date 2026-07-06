import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

type PageHeroProps = {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function PageHero({ actions, description, eyebrow, title }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div>
        <p className="page-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-hero-actions">{actions}</div> : null}
    </section>
  );
}

type SectionCardProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title?: string;
};

export function SectionCard({
  actions,
  children,
  className,
  description,
  eyebrow,
  title,
  ...props
}: SectionCardProps) {
  const classes = ["section-card", className].filter(Boolean).join(" ");

  return (
    <section className={classes} {...props}>
      {title || description || eyebrow || actions ? (
        <header className="section-card-header">
          <div>
            {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="section-card-actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

type MetricCardProps = {
  description?: string;
  label: string;
  tone?: "neutral" | "accent" | "success" | "warning";
  value: ReactNode;
};

export function MetricCard({
  description,
  label,
  tone = "neutral",
  value,
}: MetricCardProps) {
  return (
    <article className="metric-card" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      {description ? <p>{description}</p> : null}
    </article>
  );
}

type FieldProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
  hint?: string;
  label: string;
};

export function Field({ children, className, hint, label, ...props }: FieldProps) {
  const classes = ["app-field", className].filter(Boolean).join(" ");

  return (
    <label className={classes} {...props}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

type ErrorMessageProps = {
  children: ReactNode;
};

export function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <strong>Algo precisa de atencao</strong>
      <p>{children}</p>
    </div>
  );
}

type ActionButtonGroupProps = {
  children: ReactNode;
};

export function ActionButtonGroup({ children }: ActionButtonGroupProps) {
  return <div className="action-button-group">{children}</div>;
}
