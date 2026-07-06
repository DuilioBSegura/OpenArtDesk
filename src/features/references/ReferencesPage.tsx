import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  createReference,
  listReferences,
  openReferenceUrl,
  type ReferenceItem,
  type ReferenceStatus,
} from './referencesApi';

const statusLabels: Record<ReferenceStatus, string> = {
  'to-study': 'Quero estudar',
  studying: 'Estudando',
  completed: 'Concluído',
  archived: 'Arquivado',
};

const categoryLabels: Record<string, string> = {
  article: 'Artigo',
  video: 'Vídeo',
  course: 'Curso',
  tutorial: 'Tutorial',
  inspiration: 'Inspiração',
  tool: 'Ferramenta',
  book: 'Livro',
  community: 'Comunidade',
  other: 'Outro',
};

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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSaving;
  }, [title, isSaving]);

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
          : 'Não foi possível carregar as referências.',
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
      setErrorMessage('Informe um título para a referência.');
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
          : 'Não foi possível salvar a referência.',
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
          : 'Não foi possível abrir a referência.',
      );
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">Referências</p>

          <h1 className="text-2xl font-semibold text-foreground">
            Organize links e materiais externos
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Salve links de artigos, vídeos, cursos, tutoriais, inspirações e
            ferramentas que ajudam seus estudos. Os dados ficam no SQLite local.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {references.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Quero estudar</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {referencesToStudy}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Estudando</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {referencesInProgress}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground">Concluídas</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {completedReferences}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Adicionar referência
        </h2>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-foreground">
            Título
            <input
              className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Tutorial de perspectiva para cenários"
            />
          </label>

          <label className="grid gap-2 text-sm text-foreground">
            URL
            <input
              className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Categoria
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="article">Artigo</option>
                <option value="video">Vídeo</option>
                <option value="course">Curso</option>
                <option value="tutorial">Tutorial</option>
                <option value="inspiration">Inspiração</option>
                <option value="tool">Ferramenta</option>
                <option value="book">Livro</option>
                <option value="community">Comunidade</option>
                <option value="other">Outro</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Status
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ReferenceStatus)
                }
              >
                <option value="to-study">Quero estudar</option>
                <option value="studying">Estudando</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-foreground">
            Observações
            <textarea
              className="min-h-24 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Por que essa referência é útil? Quando pretende estudar?"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-fit rounded-xl border border-border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Adicionar referência'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Referências cadastradas
            </h2>

            <p className="text-sm text-muted-foreground">
              Links e materiais externos salvos localmente.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {references.length} referência(s)
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Carregando referências...
          </p>
        ) : references.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-elevated p-6">
            <p className="text-sm font-medium text-foreground">
              Nenhuma referência cadastrada ainda.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Salve seu primeiro link ou material externo para estudar depois.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {references.map((reference) => (
              <article
                key={reference.id}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {reference.title}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {normalizeDisplayUrl(reference.url)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        {statusLabels[reference.status]}
                      </span>

                      {reference.category ? (
                        <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                          {categoryLabels[reference.category] ?? reference.category}
                        </span>
                      ) : null}
                    </div>

                    {reference.description ? (
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        {reference.description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    disabled={!reference.url}
                    className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleOpenReference(reference.id)}
                  >
                    Abrir link
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}