import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import {
  ErrorMessage,
  MetricCard,
  PageHero,
  SectionCard,
} from '../../components/ui/Surface';
import { formatDuration, formatOptionalDate } from '../../shared/utils/formatters';
import {
  getDashboardSummary,
  type DashboardActivity,
  type DashboardLibraryItem,
  type DashboardReference,
  type DashboardStudy,
  type DashboardSummary,
} from './dashboardApi';

function normalizeDisplayUrl(url: string | null) {
  if (!url) {
    return 'Sem link';
  }

  return url.replace(/^https?:\/\//, '');
}

function EmptyRecentList({ message }: { message: string }) {
  return (
    <div className="ui-empty-state">
      <h3>Nada por aqui ainda</h3>
      <p>{message}</p>
    </div>
  );
}

function RecentSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <SectionCard title={title} description={description}>
      {children}
    </SectionCard>
  );
}

function RecentLibraryItems({ items }: { items: DashboardLibraryItem[] }) {
  if (items.length === 0) {
    return <EmptyRecentList message="Adicione PDFs para ver a biblioteca recente." />;
  }

  return (
    <div className="entity-list">
      {items.map((item) => (
        <article key={item.id} className="entity-card">
          <div className="entity-card-main">
            <div>
              <h3>{item.title}</h3>
              <p>{item.author || 'Autor nao informado'}</p>
            </div>

            <div className="action-row">
              <Badge>{item.status}</Badge>
              <Badge>Atualizado em {formatOptionalDate(item.updatedAt)}</Badge>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecentStudies({ studies }: { studies: DashboardStudy[] }) {
  if (studies.length === 0) {
    return <EmptyRecentList message="Registre estudos para acompanhar sua evolucao." />;
  }

  return (
    <div className="entity-list">
      {studies.map((study) => (
        <article key={study.id} className="entity-card">
          <div className="entity-card-main">
            <h3>{study.title}</h3>

            <div className="action-row">
              {study.category ? <Badge>{study.category}</Badge> : null}
              {study.difficulty ? <Badge tone="warning">{study.difficulty}</Badge> : null}
              <Badge>Atualizado em {formatOptionalDate(study.updatedAt)}</Badge>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecentActivities({ activities }: { activities: DashboardActivity[] }) {
  if (activities.length === 0) {
    return <EmptyRecentList message="Crie atividades para visualizar a rotina recente." />;
  }

  return (
    <div className="entity-list">
      {activities.map((activity) => (
        <article key={activity.id} className="entity-card">
          <div className="entity-card-main">
            <h3>{activity.title}</h3>

            <div className="action-row">
              <Badge tone={activity.status === 'done' ? 'success' : 'neutral'}>
                {activity.status}
              </Badge>
              {activity.focusArea ? <Badge>{activity.focusArea}</Badge> : null}
              <Badge>{formatDuration(activity.durationMinutes ?? 0, '0 min')}</Badge>
              <Badge>{formatOptionalDate(activity.activityDate)}</Badge>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecentReferences({ references }: { references: DashboardReference[] }) {
  if (references.length === 0) {
    return <EmptyRecentList message="Salve referencias para montar seu painel de estudo." />;
  }

  return (
    <div className="entity-list">
      {references.map((reference) => (
        <article key={reference.id} className="entity-card">
          <div className="entity-card-main">
            <div>
              <h3>{reference.title}</h3>
              <p>{normalizeDisplayUrl(reference.url)}</p>
            </div>

            <div className="action-row">
              <Badge>{reference.status}</Badge>
              {reference.category ? <Badge>{reference.category}</Badge> : null}
              <Badge>Atualizado em {formatOptionalDate(reference.updatedAt)}</Badge>
            </div>
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
          : 'Nao foi possivel carregar o dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="desktop-page">
      <PageHero
        eyebrow="Dashboard"
        title="Visao geral do seu ambiente de estudos"
        description="Acompanhe biblioteca, estudos, atividades e referencias salvas localmente no OpenArtDesk."
        actions={<Badge tone="accent">Mesa local</Badge>}
      />

      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}

      {isLoading ? (
        <section className="loading-panel">
          <p>Carregando dashboard...</p>
        </section>
      ) : summary ? (
        <>
          <section className="metric-grid">
            <MetricCard
              label="Biblioteca"
              value={summary.totals.libraryItems}
              description="PDFs e materiais locais"
            />
            <MetricCard
              label="Estudos"
              value={summary.totals.studies}
              description="Registros de evolucao"
            />
            <MetricCard
              label="Atividades"
              value={summary.totals.activities}
              description="Praticas e tarefas"
            />
            <MetricCard
              label="Referencias"
              value={summary.totals.references}
              description="Links e materiais externos"
            />
            <MetricCard
              tone="success"
              label="Concluidas"
              value={summary.totals.completedActivities}
              description="Atividades finalizadas"
            />
            <MetricCard
              tone="accent"
              label="Tempo concluido"
              value={formatDuration(summary.totals.totalCompletedMinutes, '0 min')}
              description="Soma das sessoes concluido"
            />
          </section>

          {!hasAnyData ? (
            <SectionCard
              title="Comece montando seu ambiente"
              description="Adicione PDFs na Biblioteca, registre Estudos, crie Atividades ou salve Referencias. O dashboard sera preenchido automaticamente com seus dados locais."
            >
              <Badge tone="accent">Tudo fica neste computador</Badge>
            </SectionCard>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-2">
            <RecentSection
              title="Biblioteca recente"
              description="Ultimos PDFs e materiais adicionados."
            >
              <RecentLibraryItems items={summary.recentLibraryItems} />
            </RecentSection>

            <RecentSection
              title="Estudos recentes"
              description="Ultimos registros de evolucao."
            >
              <RecentStudies studies={summary.recentStudies} />
            </RecentSection>

            <RecentSection
              title="Atividades recentes"
              description="Ultimas praticas e tarefas salvas."
            >
              <RecentActivities activities={summary.recentActivities} />
            </RecentSection>

            <RecentSection
              title="Referencias recentes"
              description="Ultimos links e materiais externos."
            >
              <RecentReferences references={summary.recentReferences} />
            </RecentSection>
          </section>
        </>
      ) : null}
    </div>
  );
}
