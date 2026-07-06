import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  createLibraryItem,
  listLibraryItems,
  openLibraryItemFile,
  type LibraryItem,
  type LibraryItemStatus,
} from './libraryApi';

const statusLabels: Record<LibraryItemStatus, string> = {
  'to-read': 'Quero ler',
  reading: 'Lendo',
  completed: 'Concluído',
  paused: 'Pausado',
};

function formatFileSize(fileSize: number | null) {
  if (!fileSize) {
    return 'Tamanho desconhecido';
  }

  const sizeInMb = fileSize / 1024 / 1024;

  return `${sizeInMb.toFixed(2)} MB`;
}

async function fileToNumberArray(file: File): Promise<number[]> {
  const buffer = await file.arrayBuffer();

  return Array.from(new Uint8Array(buffer));
}

export function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('drawing-fundamentals');
  const [status, setStatus] = useState<LibraryItemStatus>('to-read');
  const [description, setDescription] = useState('');

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && selectedFile !== null && !isSaving;
  }, [title, selectedFile, isSaving]);

  async function loadItems() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const libraryItems = await listLibraryItems();
      setItems(libraryItems);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a biblioteca.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('Selecione um PDF antes de salvar.');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Nesta versão, apenas arquivos PDF são aceitos.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const fileBytes = await fileToNumberArray(selectedFile);

      await createLibraryItem({
        title: title.trim(),
        author: author.trim() || null,
        category,
        description: description.trim() || null,
        status,
        originalFileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileBytes,
      });

      setSelectedFile(null);
      setTitle('');
      setAuthor('');
      setCategory('drawing-fundamentals');
      setStatus('to-read');
      setDescription('');

      const fileInput = document.getElementById('library-pdf-file');

      if (fileInput instanceof HTMLInputElement) {
        fileInput.value = '';
      }

      await loadItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o PDF à biblioteca.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleOpenFile(itemId: string) {
    try {
      setErrorMessage(null);
      await openLibraryItemFile(itemId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir o PDF.',
      );
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">Minha Biblioteca</p>

          <h1 className="text-2xl font-semibold text-foreground">
            Organize seus PDFs locais
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Cadastre PDFs importantes para seus estudos. O arquivo será copiado
            para a pasta local do OpenArtDesk e os metadados serão salvos no
            SQLite local.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Adicionar PDF
        </h2>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Título
              <input
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Figure Drawing for All It's Worth"
              />
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Autor
              <input
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Ex: Andrew Loomis"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Categoria
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="drawing-fundamentals">Fundamentos do desenho</option>
                <option value="anatomy">Anatomia</option>
                <option value="perspective">Perspectiva</option>
                <option value="composition">Composição</option>
                <option value="color-theory">Cor e luz</option>
                <option value="digital-painting">Pintura digital</option>
                <option value="other">Outro</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Status
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as LibraryItemStatus)
                }
              >
                <option value="to-read">Quero ler</option>
                <option value="reading">Lendo</option>
                <option value="completed">Concluído</option>
                <option value="paused">Pausado</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-foreground">
            PDF local
            <input
              id="library-pdf-file"
              type="file"
              accept="application/pdf,.pdf"
              className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);

                if (file && !title.trim()) {
                  setTitle(file.name.replace(/\.pdf$/i, ''));
                }
              }}
            />
          </label>

          <label className="grid gap-2 text-sm text-foreground">
            Observações
            <textarea
              className="min-h-24 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Por que esse material é importante? O que você quer estudar nele?"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-fit rounded-xl border border-border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Adicionar à biblioteca'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              PDFs cadastrados
            </h2>

            <p className="text-sm text-muted-foreground">
              Materiais salvos localmente no OpenArtDesk.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {items.length} item(ns)
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Carregando biblioteca...
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-elevated p-6">
            <p className="text-sm font-medium text-foreground">
              Nenhum PDF cadastrado ainda.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Adicione seu primeiro material para começar a montar sua biblioteca
              local.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {item.author || 'Autor não informado'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        {statusLabels[item.status]}
                      </span>

                      {item.category ? (
                        <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      ) : null}

                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                      </span>
                    </div>

                    {item.description ? (
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}

                    {item.originalFileName ? (
                      <p className="text-xs text-muted-foreground">
                        Arquivo original: {item.originalFileName}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground"
                    onClick={() => handleOpenFile(item.id)}
                  >
                    Abrir PDF
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