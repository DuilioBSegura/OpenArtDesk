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
import {
  createReference,
  deleteReference,
  listReferences,
  openReferenceUrl,
  updateReference,
  type ReferenceItem,
  type ReferenceStatus,
} from './referencesApi';

const statusLabels: Record<ReferenceStatus, string> = {
  'to-study': 'Quero estudar',
  studying: 'Estudando',
  completed: 'Concluido',
  archived: 'Arquivado',
};

const categoryOptions = [
  ['article', 'Artigo'],
  ['video', 'Video'],
  ['course', 'Curso'],
  ['tutorial', 'Tutorial'],
  ['inspiration', 'Inspiracao'],
  ['tool', 'Ferramenta'],
  ['book', 'Livro'],
  ['community', 'Comunidade'],
  ['other', 'Outro'],
] as const;

const categoryLabels = Object.fromEntries(categoryOptions) as Record<string, string>;

function normalizeDisplayUrl(url: string | null) {
  if (!url) {
    return 'Sem link';
  }

  return url.replace(/^https?:\/\//, '');
}

export function ReferencesPage() {
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('tutorial');
  const [status, setStatus] = useState<ReferenceStatus>('to-study');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReferenceStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSaving;
  }, [title, isSaving]);

  const filteredReferences = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return references.filter((reference) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        reference.title.toLowerCase().includes(normalizedSearch) ||
        reference.description?.toLowerCase().includes(normalizedSearch) ||
        reference.url?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' || reference.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || reference.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [references, searchQuery, statusFilter, categoryFilter]);

  const referencesToStudy = useMemo(() => {
    return references.filter((reference) => reference.status === 'to-study').length;
  }, [references]);

  const referencesInProgress = useMemo(() => {
    return references.filter((reference) => reference.status === 'studying').length;
  }, [references]);

  const completedReferences = useMemo(() => {
    return references.filter((reference) => reference.status === 'completed').length;
  }, [references]);

  async function loadReferences() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await listReferences();
      setReferences(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar as referencias.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReferences();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Informe um titulo para a referencia.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await createReference({
        title: title.trim(),
        url: url.trim() || null,
        category,
        status,
        description: description.trim() || null,
      });

      setTitle('');
      setUrl('');
      setCategory('tutorial');
      setStatus('to-study');
      setDescription('');

      await loadReferences();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar a referencia.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleOpenReference(referenceId: string) {
    try {
      setErrorMessage(null);
      await openReferenceUrl(referenceId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel abrir a referencia.',
      );
    }
  }

  async function handleDeleteReference(reference: ReferenceItem) {
    const confirmed = window.confirm(`Excluir a referencia "${reference.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteReference(reference.id);
      await loadReferences();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel excluir a referencia.',
      );
    }
  }

  async function handleEditReference(reference: ReferenceItem) {
    const editedTitle = window.prompt('Titulo:', reference.title);

    if (editedTitle === null) {
      return;
    }

    const editedUrl = window.prompt('URL:', reference.url ?? '');

    if (editedUrl === null) {
      return;
    }

    const editedCategory = window.prompt('Categoria:', reference.category ?? '');

    if (editedCategory === null) {
      return;
    }

    const editedStatus = window.prompt(
      'Status: to-study, studying, completed ou archived',
      reference.status,
    );

    if (editedStatus === null) {
      return;
    }

    const editedDescription = window.prompt(
      'Observacoes:',
      reference.description ?? '',
    );

    if (editedDescription === null) {
      return;
    }

    try {
      setErrorMessage(null);

      await updateReference({
        id: reference.id,
        title: editedTitle,
        url: editedUrl.trim() || null,
        category: editedCategory.trim() || null,
        status: editedStatus as ReferenceStatus,
        description: editedDescription.trim() || null,
      });

      await loadReferences();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel editar a referencia.',
      );
    }
  }

  return (
    <div className="desktop-page">
      <PageHero
        eyebrow="Referencias"
        title="Centralize links e materiais externos"
        description="Salve artigos, videos, cursos, tutoriais, inspiracoes e ferramentas que ajudam seus estudos. Os dados ficam no SQLite local."
        actions={<Badge tone="accent">{references.length} referencia(s)</Badge>}
      />

      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}

      <section className="metric-grid">
        <MetricCard label="Total" value={references.length} description="Links salvos" />
        <MetricCard
          tone="warning"
          label="Quero estudar"
          value={referencesToStudy}
          description="Fila de estudo"
        />
        <MetricCard
          tone="accent"
          label="Estudando"
          value={referencesInProgress}
          description="Em andamento"
        />
        <MetricCard
          tone="success"
          label="Concluidas"
          value={completedReferences}
          description="Marcadas como finalizadas"
        />
      </section>

      <SectionCard
        title="Adicionar referencia"
        description="Guarde um link com contexto suficiente para voltar depois."
      >
        <form className="app-form" onSubmit={handleSubmit}>
          <Field label="Titulo">
            <input
              className="app-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Tutorial de perspectiva para cenarios"
            />
          </Field>

          <Field label="URL">
            <input
              className="app-input"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
            />
          </Field>

          <div className="form-grid-2">
            <Field label="Categoria">
              <select
                className="app-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                className="app-select"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ReferenceStatus)
                }
              >
                <option value="to-study">Quero estudar</option>
                <option value="studying">Estudando</option>
                <option value="completed">Concluido</option>
                <option value="archived">Arquivado</option>
              </select>
            </Field>
          </div>

          <Field label="Observacoes">
            <textarea
              className="app-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Por que essa referencia e util? Quando pretende estudar?"
            />
          </Field>

          <ActionButtonGroup>
            <Button type="submit" disabled={!canSubmit} variant="primary">
              {isSaving ? 'Salvando...' : 'Adicionar referencia'}
            </Button>
          </ActionButtonGroup>
        </form>
      </SectionCard>

      <SectionCard
        title="Buscar e filtrar referencias"
        description="Refine links por texto, status e categoria."
      >
        <div className="filter-grid form-grid-3">
          <Field label="Busca">
            <input
              className="app-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Titulo, URL ou observacoes..."
            />
          </Field>

          <Field label="Status">
            <select
              className="app-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | ReferenceStatus)
              }
            >
              <option value="all">Todos</option>
              <option value="to-study">Quero estudar</option>
              <option value="studying">Estudando</option>
              <option value="completed">Concluido</option>
              <option value="archived">Arquivado</option>
            </select>
          </Field>

          <Field label="Categoria">
            <select
              className="app-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Todas</option>
              {categoryOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="filter-footer">
          <span>
            Mostrando {filteredReferences.length} de {references.length} referencia(s).
          </span>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Referencias cadastradas"
        description="Links e materiais externos salvos localmente."
        actions={<Badge>{filteredReferences.length} referencia(s)</Badge>}
      >
        {isLoading ? (
          <div className="loading-panel">
            <p>Carregando referencias...</p>
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="ui-empty-state">
            <h3>Nenhuma referencia encontrada</h3>
            <p>Salve um link ou ajuste os filtros atuais.</p>
          </div>
        ) : (
          <div className="entity-list">
            {filteredReferences.map((reference) => (
              <article key={reference.id} className="entity-card">
                <div className="entity-card-layout">
                  <div className="entity-card-main">
                    <div>
                      <h3>{reference.title}</h3>
                      <p>{normalizeDisplayUrl(reference.url)}</p>
                    </div>

                    <div className="action-row">
                      <Badge tone={reference.status === 'completed' ? 'success' : 'neutral'}>
                        {statusLabels[reference.status]}
                      </Badge>
                      {reference.category ? (
                        <Badge>{categoryLabels[reference.category] ?? reference.category}</Badge>
                      ) : null}
                    </div>

                    {reference.description ? <p>{reference.description}</p> : null}
                  </div>

                  <div className="entity-card-actions">
                    <Button
                      size="sm"
                      disabled={!reference.url}
                      onClick={() => handleOpenReference(reference.id)}
                    >
                      Abrir link
                    </Button>
                    <Button size="sm" onClick={() => handleEditReference(reference)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteReference(reference)}
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
