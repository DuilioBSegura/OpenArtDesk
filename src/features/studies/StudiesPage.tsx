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
import {
  createStudy,
  deleteStudy,
  listStudies,
  updateStudy,
  type Study,
  type StudyDifficulty,
} from './studiesApi';

const categoryOptions = [
  ['drawing-fundamentals', 'Fundamentos do desenho'],
  ['anatomy', 'Anatomia'],
  ['perspective', 'Perspectiva'],
  ['composition', 'Composicao'],
  ['color-theory', 'Cor e luz'],
  ['digital-painting', 'Pintura digital'],
  ['gesture', 'Gesture drawing'],
  ['characters', 'Personagens'],
  ['scenarios', 'Cenarios'],
  ['other', 'Outro'],
] as const;

const categoryLabels = Object.fromEntries(categoryOptions) as Record<string, string>;

const difficultyLabels: Record<StudyDifficulty, string> = {
  easy: 'Facil',
  medium: 'Medio',
  hard: 'Dificil',
};

function isSupportedImage(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp')
  );
}

export function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('drawing-fundamentals');
  const [difficulty, setDifficulty] = useState<StudyDifficulty>('medium');
  const [description, setDescription] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | StudyDifficulty>('all');

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSaving;
  }, [title, isSaving]);

  const filteredStudies = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return studies.filter((study) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        study.title.toLowerCase().includes(normalizedSearch) ||
        study.description?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === 'all' || study.category === categoryFilter;
      const matchesDifficulty =
        difficultyFilter === 'all' || study.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [studies, searchQuery, categoryFilter, difficultyFilter]);

  async function loadStudies() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await listStudies();
      setStudies(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar os estudos.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudies();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Informe um titulo para o estudo.');
      return;
    }

    if (selectedImage && !isSupportedImage(selectedImage)) {
      setErrorMessage('Use uma imagem PNG, JPG, JPEG ou WEBP.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const imageBytes = selectedImage
        ? await fileToNumberArray(selectedImage)
        : null;

      await createStudy({
        title: title.trim(),
        category,
        difficulty,
        description: description.trim() || null,
        originalImageName: selectedImage?.name ?? null,
        imageBytes,
      });

      setSelectedImage(null);
      setTitle('');
      setCategory('drawing-fundamentals');
      setDifficulty('medium');
      setDescription('');

      const fileInput = document.getElementById('study-image-file');

      if (fileInput instanceof HTMLInputElement) {
        fileInput.value = '';
      }

      await loadStudies();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel salvar o estudo.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteStudy(study: Study) {
    const confirmed = window.confirm(
      `Excluir o estudo "${study.title}"?\n\nSe houver imagem importada, ela tambem sera removida da pasta local do OpenArtDesk.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteStudy(study.id);
      await loadStudies();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel excluir o estudo.',
      );
    }
  }

  async function handleEditStudy(study: Study) {
    const editedTitle = window.prompt('Titulo:', study.title);

    if (editedTitle === null) {
      return;
    }

    const editedCategory = window.prompt('Categoria:', study.category ?? '');

    if (editedCategory === null) {
      return;
    }

    const editedDifficulty = window.prompt(
      'Dificuldade: easy, medium ou hard',
      study.difficulty ?? 'medium',
    );

    if (editedDifficulty === null) {
      return;
    }

    const editedDescription = window.prompt('Observacoes:', study.description ?? '');

    if (editedDescription === null) {
      return;
    }

    try {
      setErrorMessage(null);

      await updateStudy({
        id: study.id,
        title: editedTitle,
        category: editedCategory.trim() || null,
        difficulty: editedDifficulty.trim()
          ? (editedDifficulty as StudyDifficulty)
          : null,
        description: editedDescription.trim() || null,
      });

      await loadStudies();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel editar o estudo.',
      );
    }
  }

  return (
    <div className="desktop-page">
      <PageHero
        eyebrow="Estudos"
        title="Registre sua evolucao visual"
        description="Cadastre estudos, exercicios e praticas visuais. Imagens opcionais sao copiadas para a pasta local e os metadados ficam no SQLite local."
        actions={<Badge tone="accent">{studies.length} estudo(s)</Badge>}
      />

      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}

      <SectionCard
        title="Adicionar estudo"
        description="Use este registro como um diario visual da sua pratica."
      >
        <form className="app-form" onSubmit={handleSubmit}>
          <Field label="Titulo">
            <input
              className="app-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Estudo de maos em perspectiva"
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

            <Field label="Dificuldade percebida">
              <select
                className="app-select"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as StudyDifficulty)
                }
              >
                <option value="easy">Facil</option>
                <option value="medium">Medio</option>
                <option value="hard">Dificil</option>
              </select>
            </Field>
          </div>

          <Field label="Imagem opcional" hint="PNG, JPG, JPEG ou WEBP.">
            <input
              id="study-image-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              className="app-file-input"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedImage(file);

                if (file && !title.trim()) {
                  setTitle(file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ''));
                }
              }}
            />
          </Field>

          <Field label="Observacoes">
            <textarea
              className="app-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="O que voce estudou? O que percebeu? O que quer melhorar?"
            />
          </Field>

          <ActionButtonGroup>
            <Button type="submit" disabled={!canSubmit} variant="primary">
              {isSaving ? 'Salvando...' : 'Adicionar estudo'}
            </Button>
          </ActionButtonGroup>
        </form>
      </SectionCard>

      <SectionCard
        title="Buscar e filtrar estudos"
        description="Refine estudos por texto, categoria e dificuldade."
      >
        <div className="filter-grid form-grid-3">
          <Field label="Busca">
            <input
              className="app-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Titulo ou observacoes..."
            />
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

          <Field label="Dificuldade">
            <select
              className="app-select"
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(event.target.value as 'all' | StudyDifficulty)
              }
            >
              <option value="all">Todas</option>
              <option value="easy">Facil</option>
              <option value="medium">Medio</option>
              <option value="hard">Dificil</option>
            </select>
          </Field>
        </div>

        <div className="filter-footer">
          <span>
            Mostrando {filteredStudies.length} de {studies.length} estudo(s).
          </span>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setDifficultyFilter('all');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Estudos cadastrados"
        description="Historico dos seus estudos salvos localmente."
        actions={<Badge>{filteredStudies.length} estudo(s)</Badge>}
      >
        {isLoading ? (
          <div className="loading-panel">
            <p>Carregando estudos...</p>
          </div>
        ) : filteredStudies.length === 0 ? (
          <div className="ui-empty-state">
            <h3>Nenhum estudo encontrado</h3>
            <p>Registre seu primeiro estudo ou ajuste os filtros atuais.</p>
          </div>
        ) : (
          <div className="entity-list">
            {filteredStudies.map((study) => (
              <article key={study.id} className="entity-card">
                <div className="entity-card-layout">
                  <div className="entity-card-main">
                    <div>
                      <h3>{study.title}</h3>
                      <p>Criado em {new Date(study.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="action-row">
                      {study.category ? (
                        <Badge>{categoryLabels[study.category] ?? study.category}</Badge>
                      ) : null}
                      {study.difficulty ? (
                        <Badge tone="warning">{difficultyLabels[study.difficulty]}</Badge>
                      ) : null}
                      {study.imagePath ? <Badge tone="success">Imagem salva</Badge> : null}
                    </div>

                    {study.description ? <p>{study.description}</p> : null}
                  </div>

                  <div className="entity-card-actions">
                    <Button size="sm" onClick={() => handleEditStudy(study)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteStudy(study)}
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
