import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  createActivity,
  listActivities,
  type Activity,
  type ActivityStatus,
  type EnergyLevel,
} from './activitiesApi';

const statusLabels: Record<ActivityStatus, string> = {
  planned: 'Planejada',
  done: 'Concluída',
  skipped: 'Pulada',
};

const energyLabels: Record<EnergyLevel, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const focusAreaLabels: Record<string, string> = {
  drawing: 'Desenho',
  anatomy: 'Anatomia',
  perspective: 'Perspectiva',
  composition: 'Composição',
  color: 'Cor e luz',
  painting: 'Pintura digital',
  reading: 'Leitura',
  review: 'Revisão',
  other: 'Outro',
};

function todayAsInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return 'Sem duração';
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

function formatActivityDate(activityDate: string | null) {
  if (!activityDate) {
    return 'Sem data';
  }

  return new Date(`${activityDate}T00:00:00`).toLocaleDateString();
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

  const totalMinutes = useMemo(() => {
    return activities.reduce((total, activity) => {
      if (activity.status !== 'done') {
        return total;
      }

      return total + (activity.durationMinutes ?? 0);
    }, 0);
  }, [activities]);

  const completedActivities = useMemo(() => {
    return activities.filter((activity) => activity.status === 'done').length;
  }, [activities]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSaving;
  }, [title, isSaving]);

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
          : 'Não foi possível carregar as atividades.',
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
      setErrorMessage('Informe um título para a atividade.');
      return;
    }

    const parsedDuration = durationMinutes.trim()
      ? Number(durationMinutes)
      : null;

    if (parsedDuration !== null && Number.isNaN(parsedDuration)) {
      setErrorMessage('Informe uma duração válida em minutos.');
      return;
    }

    if (parsedDuration !== null && parsedDuration < 0) {
      setErrorMessage('A duração não pode ser negativa.');
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
          : 'Não foi possível salvar a atividade.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">Atividades</p>

          <h1 className="text-2xl font-semibold text-foreground">
            Registre suas práticas
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Cadastre sessões de estudo, práticas artísticas, leituras e revisões.
            Tudo fica salvo localmente no SQLite do OpenArtDesk.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Atividades registradas</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {activities.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Concluídas</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {completedActivities}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Tempo concluído</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatDuration(totalMinutes)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Adicionar atividade
        </h2>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-foreground">
            Título
            <input
              className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: 30 minutos de gesture drawing"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Data
              <input
                type="date"
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={activityDate}
                onChange={(event) => setActivityDate(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Duração em minutos
              <input
                type="number"
                min="0"
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                placeholder="30"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-foreground">
              Foco
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={focusArea}
                onChange={(event) => setFocusArea(event.target.value)}
              >
                <option value="drawing">Desenho</option>
                <option value="anatomy">Anatomia</option>
                <option value="perspective">Perspectiva</option>
                <option value="composition">Composição</option>
                <option value="color">Cor e luz</option>
                <option value="painting">Pintura digital</option>
                <option value="reading">Leitura</option>
                <option value="review">Revisão</option>
                <option value="other">Outro</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Energia
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={energyLevel}
                onChange={(event) =>
                  setEnergyLevel(event.target.value as EnergyLevel)
                }
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Status
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ActivityStatus)
                }
              >
                <option value="planned">Planejada</option>
                <option value="done">Concluída</option>
                <option value="skipped">Pulada</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-foreground">
            Observações
            <textarea
              className="min-h-24 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Como foi a prática? O que funcionou? O que precisa melhorar?"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-fit rounded-xl border border-border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Adicionar atividade'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Atividades cadastradas
            </h2>

            <p className="text-sm text-muted-foreground">
              Histórico inicial das suas práticas e sessões de estudo.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {activities.length} atividade(s)
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Carregando atividades...
          </p>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-elevated p-6">
            <p className="text-sm font-medium text-foreground">
              Nenhuma atividade cadastrada ainda.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Registre sua primeira prática para começar a acompanhar sua rotina.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {activity.title}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {formatActivityDate(activity.activityDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                      {statusLabels[activity.status]}
                    </span>

                    {activity.focusArea ? (
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        {focusAreaLabels[activity.focusArea] ?? activity.focusArea}
                      </span>
                    ) : null}

                    {activity.energyLevel ? (
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        Energia {energyLabels[activity.energyLevel]}
                      </span>
                    ) : null}

                    <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                      {formatDuration(activity.durationMinutes)}
                    </span>
                  </div>

                  {activity.description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}