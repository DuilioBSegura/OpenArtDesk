import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ActionButtonGroup,
  ErrorMessage,
  Field,
  PageHero,
  SectionCard,
} from '../../components/ui/Surface';
import { fileToNumberArray } from '../../shared/utils/file';
import { formatFileSize } from '../../shared/utils/formatters';
import {
  createLibraryItem,
  deleteLibraryItem,
  listLibraryItems,
  openLibraryItemFile,
  updateLibraryItem,
  type LibraryItem,
  type LibraryItemStatus,
} from './libraryApi';

const statusLabels: Record<LibraryItemStatus, string> = {
  'to-read': 'Quero ler',
  reading: 'Lendo',
  completed: 'Concluido',
  paused: 'Pausado',
};

const categoryOptions = [
  ['drawing-fundamentals', 'Fundamentos do desenho'],
  ['anatomy', 'Anatomia'],
  ['perspective', 'Perspectiva'],
  ['composition', 'Composicao'],
  ['color-theory', 'Cor e luz'],
  ['digital-painting', 'Pintura digital'],
  ['other', 'Outro'],
] as const;

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LibraryItemStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.author?.toLowerCase().includes(normalizedSearch) ||
        item.description?.toLowerCase().includes(normalizedSearch) ||
        item.originalFileName?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

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
          : 'Nao foi possivel carregar a biblioteca.',
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
      setErrorMessage('Nesta versao, apenas arquivos PDF sao aceitos.');
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
          : 'Nao foi possivel adicionar o PDF a biblioteca.',
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
        error instanceof Error ? error.message : 'Nao foi possivel abrir o PDF.',
      );
    }
  }

  async function handleDeleteItem(item: LibraryItem) {
    const confirmed = window.confirm(
      `Excluir "${item.title}" da biblioteca?\n\nO PDF importado tambem sera removido da pasta local do OpenArtDesk.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteLibraryItem(item.id);
      await loadItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel excluir o item da biblioteca.',
      );
    }
  }

  async function handleEditItem(item: LibraryItem) {
    const editedTitle = window.prompt('Titulo:', item.title);

    if (editedTitle === null) {
      return;
    }

    const editedAuthor = window.prompt('Autor:', item.author ?? '');

    if (editedAuthor === null) {
      return;
    }

    const editedCategory = window.prompt('Categoria:', item.category ?? '');

    if (editedCategory === null) {
      return;
    }

    const editedStatus = window.prompt(
      'Status: to-read, reading, completed ou paused',
      item.status,
    );

    if (editedStatus === null) {
      return;
    }

    const editedDescription = window.prompt('Observacoes:', item.description ?? '');

    if (editedDescription === null) {
      return;
    }

    try {
      setErrorMessage(null);

      await updateLibraryItem({
        id: item.id,
        title: editedTitle,
        author: editedAuthor.trim() || null,
        category: editedCategory.trim() || null,
        status: editedStatus as LibraryItemStatus,
        description: editedDescription.trim() || null,
      });

      await loadItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel editar o item da biblioteca.',
      );
    }
  }

  return (
    <div className="desktop-page">
      <PageHero
        eyebrow="Minha Biblioteca"
        title="Organize seus PDFs locais"
        description="Cadastre PDFs importantes para seus estudos. O arquivo e copiado para a pasta local do OpenArtDesk e os metadados ficam no SQLite local."
        actions={<Badge tone="accent">{items.length} material(is)</Badge>}
      />

      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}

      <SectionCard
        title="Adicionar PDF"
        description="Inclua materiais que voce quer ler, revisar ou concluir."
      >
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <Field label="Titulo">
              <input
                className="app-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Figure Drawing for All It's Worth"
              />
            </Field>

            <Field label="Autor">
              <input
                className="app-input"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Ex: Andrew Loomis"
              />
            </Field>
          </div>

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
                  setStatus(event.target.value as LibraryItemStatus)
                }
              >
                <option value="to-read">Quero ler</option>
                <option value="reading">Lendo</option>
                <option value="completed">Concluido</option>
                <option value="paused">Pausado</option>
              </select>
            </Field>
          </div>

          <Field label="PDF local" hint="Somente arquivos PDF nesta versao.">
            <input
              id="library-pdf-file"
              type="file"
              accept="application/pdf,.pdf"
              className="app-file-input"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);

                if (file && !title.trim()) {
                  setTitle(file.name.replace(/\.pdf$/i, ''));
                }
              }}
            />
          </Field>

          <Field label="Observacoes">
            <textarea
              className="app-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Por que esse material e importante? O que voce quer estudar nele?"
            />
          </Field>

          <ActionButtonGroup>
            <Button type="submit" disabled={!canSubmit} variant="primary">
              {isSaving ? 'Salvando...' : 'Adicionar a biblioteca'}
            </Button>
          </ActionButtonGroup>
        </form>
      </SectionCard>

      <SectionCard
        title="Buscar e filtrar biblioteca"
        description="Refine seus PDFs por texto, status e categoria."
      >
        <div className="filter-grid form-grid-3">
          <Field label="Busca">
            <input
              className="app-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Titulo, autor ou arquivo..."
            />
          </Field>

          <Field label="Status">
            <select
              className="app-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | LibraryItemStatus)
              }
            >
              <option value="all">Todos</option>
              <option value="to-read">Quero ler</option>
              <option value="reading">Lendo</option>
              <option value="completed">Concluido</option>
              <option value="paused">Pausado</option>
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
            Mostrando {filteredItems.length} de {items.length} item(ns).
          </span>
          <Button
            type="button"
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
        title="PDFs cadastrados"
        description="Materiais salvos localmente no OpenArtDesk."
        actions={<Badge>{filteredItems.length} item(ns)</Badge>}
      >
        {isLoading ? (
          <div className="loading-panel">
            <p>Carregando biblioteca...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="ui-empty-state">
            <h3>Sua biblioteca ainda esta vazia</h3>
            <p>Adicione seu primeiro material para montar uma biblioteca local.</p>
          </div>
        ) : (
          <div className="entity-list">
            {filteredItems.map((item) => (
              <article key={item.id} className="entity-card">
                <div className="entity-card-layout">
                  <div className="entity-card-main">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.author || 'Autor nao informado'}</p>
                    </div>

                    <div className="action-row">
                      <Badge tone={item.status === 'completed' ? 'success' : 'neutral'}>
                        {statusLabels[item.status]}
                      </Badge>
                      {item.category ? <Badge>{item.category}</Badge> : null}
                      <Badge>{formatFileSize(item.fileSize)}</Badge>
                    </div>

                    {item.description ? <p>{item.description}</p> : null}
                    {item.originalFileName ? (
                      <p>Arquivo original: {item.originalFileName}</p>
                    ) : null}
                  </div>

                  <div className="entity-card-actions">
                    <Button size="sm" onClick={() => handleOpenFile(item.id)}>
                      Abrir PDF
                    </Button>
                    <Button size="sm" onClick={() => handleEditItem(item)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteItem(item)}
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
