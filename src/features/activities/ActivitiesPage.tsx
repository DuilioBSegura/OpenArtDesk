import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ActionButtonGroup,
  ErrorMessage,
  Field,
  MetricCard,
  PageHero,
  SectionCard,
} from '../../components/ui/Surface';
import { formatDuration, formatOptionalDate } from '../../shared/utils/formatters';
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
  type Activity,
  type ActivityStatus,
  type EnergyLevel,
} from './activitiesApi';

const statusLabels: Record<ActivityStatus, string> = {
  planned: 'Planejada',
  done: 'Concluida',
  skipped: 'Pulada',
};

const energyLabels: Record<EnergyLevel, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

const focusOptions = [
  ['drawing', 'Desenho'],
  ['anatomy', 'Anatomia'],
  ['perspective', 'Perspectiva'],
  ['composition', 'Composicao'],
  ['color', 'Cor e luz'],
  ['painting', 'Pintura digital'],
  ['reading', 'Leitura'],
  ['review', 'Revisao'],
  ['other', 'Outro'],
] as const;

const focusAreaLabels = Object.fromEntries(focusOptions) as Record<string, string>;

function todayAsInputDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [activityDate, setActivityDate] = useState(todayAsInputDate());
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [focusArea, setFocusArea] = useState('drawing');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [status, setStatus] = useState<ActivityStatus>('done');
  const [description, setDescription] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
  const [focusFilter, setFocusFilter] = useState('all');
  const [energyFilter, setEnergyFilter] = useState<'all' | EnergyLevel>('all');

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSaving;
  }, [title, isSaving]);

  const filteredActivities = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        activity.title.toLowerCase().includes(normalizedSearch) ||
        activity.description?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' || activity.status === statusFilter;
      const matchesFocus =
        focusFilter === 'all' || activity.focusArea === focusFilter;
      const matchesEnergy =
        energyFilter === 'all' || activity.energyLevel === energyFilter;

      return matchesSearch && matchesStatus && matchesFocus && matchesEnergy;
    });
  }, [activities, searchQuery, statusFilter, focusFilter, energyFilter]);

  const totalMinutes = useMemo(() => {
    return filteredActivities.reduce((total, activity) => {
      if (activity.status !== 'done') {
        return total;
      }

      return total + (activity.durationMinutes ?? 0);
    }, 0);
  }, [filteredActivities]);

  const completedActivities = useMemo(() => {
    return filteredActivities.filter((activity) => activity.status === 'done').length;
  }, [filteredActivities]);

  async function loadActivities() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await listActivities();
      setActivities(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar as atividades.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Informe um titulo para a atividade.');
      return;
    }

    const parsedDuration = durationMinutes.trim()
      ? Number(durationMinutes)
      : null;

    if (parsedDuration !== null && Number.isNaN(parsedDuration)) {
      setErrorMessage('Informe uma duracao valida em minutos.');
      return;
    }

    if (parsedDuration !== null && parsedDuration < 0) {
      setErrorMessage('A duracao nao pode ser negativa.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await createActivity({
        title: title.trim(),
        activityDate: activityDate || null,
        durationMinutes: parsedDuration,
        focusArea,
        energyLevel,
        status,
        description: description.trim() || null,
      });

      setTitle('');
      setActivityDate(todayAsInputDate());
      setDurationMinutes('30');
      setFocusArea('drawing');
      setEnergyLevel('medium');
      setStatus('done');
      setDescription('');

      await loadActivities();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar a atividade.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteActivity(activity: Activity) {
    const confirmed = window.confirm(`Excluir a atividade "${activity.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteActivity(activity.id);
      await loadActivities();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel excluir a atividade.',
      );
    }
  }

  async function handleEditActivity(activity: Activity) {
    const editedTitle = window.prompt('Titulo:', activity.title);

    if (editedTitle === null) {
      return;
    }

    const editedActivityDate = window.prompt(
      'Data no formato YYYY-MM-DD:',
      activity.activityDate ?? '',
    );

    if (editedActivityDate === null) {
      return;
    }

    const durationText = window.prompt(
      'Duracao em minutos:',
      activity.durationMinutes?.toString() ?? '',
    );

    if (durationText === null) {
      return;
    }

    const parsedDuration = durationText.trim() ? Number(durationText) : null;

    if (parsedDuration !== null && Number.isNaN(parsedDuration)) {
      setErrorMessage('Informe uma duracao valida em minutos.');
      return;
    }

    const editedFocusArea = window.prompt('Foco:', activity.focusArea ?? '');

    if (editedFocusArea === null) {
      return;
    }

    const editedEnergyLevel = window.prompt(
      'Energia: low, medium ou high',
      activity.energyLevel ?? 'medium',
    );

    if (editedEnergyLevel === null) {
      return;
    }

    const editedStatus = window.prompt(
      'Status: planned, done ou skipped',
      activity.status,
    );

    if (editedStatus === null) {
      return;
    }

    const editedDescription = window.prompt(
      'Observacoes:',
      activity.description ?? '',
    );

    if (editedDescription === null) {
      return;
    }

    try {
      setErrorMessage(null);

      await updateActivity({
        id: activity.id,
        title: editedTitle,
        activityDate: editedActivityDate.trim() || null,
        durationMinutes: parsedDuration,
        focusArea: editedFocusArea.trim() || null,
        energyLevel: editedEnergyLevel.trim()
          ? (editedEnergyLevel as EnergyLevel)
          : null,
        status: editedStatus as ActivityStatus,
        description: editedDescription.trim() || null,
      });

      await loadActivities();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel editar a atividade.',
      );
    }
  }

  return (
    <div className="desktop-page">
      <PageHero
        eyebrow="Atividades"
        title="Acompanhe sua rotina de estudo"
        description="Registre sessoes de estudo, praticas artisticas, leituras e revisoes. Tudo fica salvo localmente no SQLite do OpenArtDesk."
        actions={<Badge tone="accent">{activities.length} atividade(s)</Badge>}
      />

      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}

      <section className="metric-grid">
        <MetricCard
          label="Registradas"
          value={activities.length}
          description="Total salvo localmente"
        />
        <MetricCard
          tone="success"
          label="Concluidas"
          value={completedActivities}
          description="Dentro dos filtros atuais"
        />
        <MetricCard
          tone="accent"
          label="Tempo concluido"
          value={formatDuration(totalMinutes)}
          description="Soma das atividades filtradas"
        />
      </section>

      <SectionCard
        title="Adicionar atividade"
        description="Registre uma pratica, tarefa ou sessao de estudo."
      >
        <form className="app-form" onSubmit={handleSubmit}>
          <Field label="Titulo">
            <input
              className="app-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: 30 minutos de gesture drawing"
            />
          </Field>

          <div className="form-grid-2">
            <Field label="Data">
              <input
                type="date"
                className="app-input"
                value={activityDate}
                onChange={(event) => setActivityDate(event.target.value)}
              />
            </Field>

            <Field label="Duracao em minutos">
              <input
                type="number"
                min="0"
                className="app-input"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                placeholder="30"
              />
            </Field>
          </div>

          <div className="form-grid-3">
            <Field label="Foco">
              <select
                className="app-select"
                value={focusArea}
                onChange={(event) => setFocusArea(event.target.value)}
              >
                {focusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Energia">
              <select
                className="app-select"
                value={energyLevel}
                onChange={(event) =>
                  setEnergyLevel(event.target.value as EnergyLevel)
                }
              >
                <option value="low">Baixa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                className="app-select"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ActivityStatus)
                }
              >
                <option value="planned">Planejada</option>
                <option value="done">Concluida</option>
                <option value="skipped">Pulada</option>
              </select>
            </Field>
          </div>

          <Field label="Observacoes">
            <textarea
              className="app-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Como foi a pratica? O que funcionou? O que precisa melhorar?"
            />
          </Field>

          <ActionButtonGroup>
            <Button type="submit" disabled={!canSubmit} variant="primary">
              {isSaving ? 'Salvando...' : 'Adicionar atividade'}
            </Button>
          </ActionButtonGroup>
        </form>
      </SectionCard>

      <SectionCard
        title="Buscar e filtrar atividades"
        description="Refine praticas por texto, status, foco e energia."
      >
        <div className="filter-grid form-grid-4">
          <Field label="Busca">
            <input
              className="app-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Titulo ou observacoes..."
            />
          </Field>

          <Field label="Status">
            <select
              className="app-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | ActivityStatus)
              }
            >
              <option value="all">Todos</option>
              <option value="planned">Planejada</option>
              <option value="done">Concluida</option>
              <option value="skipped">Pulada</option>
            </select>
          </Field>

          <Field label="Foco">
            <select
              className="app-select"
              value={focusFilter}
              onChange={(event) => setFocusFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {focusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Energia">
            <select
              className="app-select"
              value={energyFilter}
              onChange={(event) =>
                setEnergyFilter(event.target.value as 'all' | EnergyLevel)
              }
            >
              <option value="all">Todas</option>
              <option value="low">Baixa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </Field>
        </div>

        <div className="filter-footer">
          <span>
            Mostrando {filteredActivities.length} de {activities.length} atividade(s).
          </span>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setFocusFilter('all');
              setEnergyFilter('all');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Atividades cadastradas"
        description="Historico das suas praticas e sessoes de estudo."
        actions={<Badge>{filteredActivities.length} atividade(s)</Badge>}
      >
        {isLoading ? (
          <div className="loading-panel">
            <p>Carregando atividades...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="ui-empty-state">
            <h3>Nenhuma atividade encontrada</h3>
            <p>Registre sua primeira pratica ou ajuste os filtros atuais.</p>
          </div>
        ) : (
          <div className="entity-list">
            {filteredActivities.map((activity) => (
              <article key={activity.id} className="entity-card">
                <div className="entity-card-layout">
                  <div className="entity-card-main">
                    <div>
                      <h3>{activity.title}</h3>
                      <p>{formatOptionalDate(activity.activityDate)}</p>
                    </div>

                    <div className="action-row">
                      <Badge tone={activity.status === 'done' ? 'success' : 'neutral'}>
                        {statusLabels[activity.status]}
                      </Badge>
                      {activity.focusArea ? (
                        <Badge>
                          {focusAreaLabels[activity.focusArea] ?? activity.focusArea}
                        </Badge>
                      ) : null}
                      {activity.energyLevel ? (
                        <Badge>Energia {energyLabels[activity.energyLevel]}</Badge>
                      ) : null}
                      <Badge>{formatDuration(activity.durationMinutes)}</Badge>
                    </div>

                    {activity.description ? <p>{activity.description}</p> : null}
                  </div>

                  <div className="entity-card-actions">
                    <Button size="sm" onClick={() => handleEditActivity(activity)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteActivity(activity)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
