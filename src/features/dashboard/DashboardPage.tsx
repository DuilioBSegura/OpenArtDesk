import { useEffect, useMemo, useState } from 'react';

import {
  getDashboardSummary,
  type DashboardActivity,
  type DashboardLibraryItem,
  type DashboardReference,
  type DashboardStudy,
  type DashboardSummary,
} from './dashboardApi';

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return '0 min';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

function formatOptionalDate(value: string | null | undefined) {
  if (!value) {
    return 'Sem data';
  }

  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return date.toLocaleDateString();
}

function normalizeDisplayUrl(url: string | null) {
  if (!url) {
    return 'Sem link';
  }

  return url.replace(/^https?:\/\//, '');
}

function DashboardMetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-semibold text-foreground">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function EmptyRecentList({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function RecentSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>

        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function RecentLibraryItems({ items }: { items: DashboardLibraryItem[] }) {
  if (items.length === 0) {
    return <EmptyRecentList message="Nenhum PDF cadastrado ainda." />;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-border bg-surface-elevated p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            {item.title}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {item.author || 'Autor não informado'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              {item.status}
            </span>

            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              Atualizado em {formatOptionalDate(item.updatedAt)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecentStudies({ studies }: { studies: DashboardStudy[] }) {
  if (studies.length === 0) {
    return <EmptyRecentList message="Nenhum estudo cadastrado ainda." />;
  }

  return (
    <div className="grid gap-3">
      {studies.map((study) => (
        <article
          key={study.id}
          className="rounded-xl border border-border bg-surface-elevated p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            {study.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {study.category ? (
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {study.category}
              </span>
            ) : null}

            {study.difficulty ? (
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {study.difficulty}
              </span>
            ) : null}

            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              Atualizado em {formatOptionalDate(study.updatedAt)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecentActivities({ activities }: { activities: DashboardActivity[] }) {
  if (activities.length === 0) {
    return <EmptyRecentList message="Nenhuma atividade cadastrada ainda." />;
  }

  return (
    <div className="grid gap-3">
      {activities.map((activity) => (
        <article
          key={activity.id}
          className="rounded-xl border border-border bg-surface-elevated p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            {activity.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              {activity.status}
            </span>

            {activity.focusArea ? (
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {activity.focusArea}
              </span>
            ) : null}

            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              {formatDuration(activity.durationMinutes ?? 0)}
            </span>

            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              {formatOptionalDate(activity.activityDate)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecentReferences({ references }: { references: DashboardReference[] }) {
  if (references.length === 0) {
    return <EmptyRecentList message="Nenhuma referência cadastrada ainda." />;
  }

  return (
    <div className="grid gap-3">
      {references.map((reference) => (
        <article
          key={reference.id}
          className="rounded-xl border border-border bg-surface-elevated p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            {reference.title}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {normalizeDisplayUrl(reference.url)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              {reference.status}
            </span>

            {reference.category ? (
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {reference.category}
              </span>
            ) : null}

            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              Atualizado em {formatOptionalDate(reference.updatedAt)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasAnyData = useMemo(() => {
    if (!summary) {
      return false;
    }

    return (
      summary.totals.libraryItems > 0 ||
      summary.totals.studies > 0 ||
      summary.totals.activities > 0 ||
      summary.totals.references > 0
    );
  }, [summary]);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await getDashboardSummary();
      setSummary(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">Dashboard</p>

          <h1 className="text-2xl font-semibold text-foreground">
            Visão geral do seu ambiente de estudos
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Acompanhe sua biblioteca, estudos, atividades e referências salvas
            localmente no OpenArtDesk.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground">
            Carregando dashboard...
          </p>
        </section>
      ) : summary ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard
              label="Biblioteca"
              value={summary.totals.libraryItems}
              description="PDFs e materiais locais"
            />

            <DashboardMetricCard
              label="Estudos"
              value={summary.totals.studies}
              description="Registros de evolução"
            />

            <DashboardMetricCard
              label="Atividades"
              value={summary.totals.activities}
              description="Práticas e tarefas"
            />

            <DashboardMetricCard
              label="Referências"
              value={summary.totals.references}
              description="Links e materiais externos"
            />
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <DashboardMetricCard
              label="Atividades concluídas"
              value={summary.totals.completedActivities}
              description="Sessões marcadas como concluídas"
            />

            <DashboardMetricCard
              label="Tempo concluído"
              value={formatDuration(summary.totals.totalCompletedMinutes)}
              description="Soma das atividades concluídas"
            />
          </section>

          {!hasAnyData ? (
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Comece montando seu ambiente
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Adicione PDFs na Biblioteca, registre Estudos, crie Atividades
                ou salve Referências. O dashboard será preenchido automaticamente
                com seus dados locais.
              </p>
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-2">
            <RecentSection
              title="Biblioteca recente"
              description="Últimos PDFs e materiais adicionados."
            >
              <RecentLibraryItems items={summary.recentLibraryItems} />
            </RecentSection>

            <RecentSection
              title="Estudos recentes"
              description="Últimos registros de evolução."
            >
              <RecentStudies studies={summary.recentStudies} />
            </RecentSection>

            <RecentSection
              title="Atividades recentes"
              description="Últimas práticas e tarefas salvas."
            >
              <RecentActivities activities={summary.recentActivities} />
            </RecentSection>

            <RecentSection
              title="Referências recentes"
              description="Últimos links e materiais externos."
            >
              <RecentReferences references={summary.recentReferences} />
            </RecentSection>
          </section>
        </>
      ) : null}
    </div>
  );
}