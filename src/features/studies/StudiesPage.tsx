import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  createStudy,
  deleteStudy,
  listStudies,
  updateStudy,
  type Study,
  type StudyDifficulty,
} from './studiesApi';

const categoryLabels: Record<string, string> = {
  'drawing-fundamentals': 'Fundamentos do desenho',
  anatomy: 'Anatomia',
  perspective: 'Perspectiva',
  composition: 'Composição',
  'color-theory': 'Cor e luz',
  'digital-painting': 'Pintura digital',
  gesture: 'Gesture drawing',
  characters: 'Personagens',
  scenarios: 'Cenários',
  other: 'Outro',
};

const difficultyLabels: Record<StudyDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

async function fileToNumberArray(file: File): Promise<number[]> {
  const buffer = await file.arrayBuffer();

  return Array.from(new Uint8Array(buffer));
}

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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !isSaving;
  }, [title, isSaving]);

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
          : 'Não foi possível carregar os estudos.',
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
      setErrorMessage('Informe um título para o estudo.');
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
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o estudo.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">Estudos</p>

          <h1 className="text-2xl font-semibold text-foreground">
            Registre sua evolução
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Cadastre estudos, exercícios e práticas visuais. As imagens são
            copiadas para a pasta local do OpenArtDesk e os metadados ficam no
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
          Adicionar estudo
        </h2>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-foreground">
            Título
            <input
              className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Estudo de mãos em perspectiva"
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
                <option value="drawing-fundamentals">Fundamentos do desenho</option>
                <option value="anatomy">Anatomia</option>
                <option value="perspective">Perspectiva</option>
                <option value="composition">Composição</option>
                <option value="color-theory">Cor e luz</option>
                <option value="digital-painting">Pintura digital</option>
                <option value="gesture">Gesture drawing</option>
                <option value="characters">Personagens</option>
                <option value="scenarios">Cenários</option>
                <option value="other">Outro</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Dificuldade percebida
              <select
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as StudyDifficulty)
                }
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-foreground">
            Imagem do estudo opcional
            <input
              id="study-image-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedImage(file);

                if (file && !title.trim()) {
                  setTitle(file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ''));
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
              placeholder="O que você estudou? O que percebeu? O que quer melhorar?"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-fit rounded-xl border border-border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Adicionar estudo'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Estudos cadastrados
            </h2>

            <p className="text-sm text-muted-foreground">
              Histórico inicial dos seus estudos salvos localmente.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {studies.length} estudo(s)
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Carregando estudos...
          </p>
        ) : studies.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-elevated p-6">
            <p className="text-sm font-medium text-foreground">
              Nenhum estudo cadastrado ainda.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Registre seu primeiro estudo para começar a acompanhar sua
              evolução.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {studies.map((study) => (
              <article
                key={study.id}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {study.title}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(study.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {study.category ? (
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        {categoryLabels[study.category] ?? study.category}
                      </span>
                    ) : null}

                    {study.difficulty ? (
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        {difficultyLabels[study.difficulty]}
                      </span>
                    ) : null}

                    {study.imagePath ? (
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        Imagem salva
                      </span>
                    ) : null}
                  </div>

                  {study.description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      {study.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="w-fit rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground"
                  onClick={() => handleDeleteStudy(study)}
                >
                  Excluir
                </button>

                <button
                  type="button"
                  className="w-fit rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground"
                  onClick={() => handleEditStudy(study)}
                >
                  Editar
                </button> 
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  async function handleDeleteStudy(study: Study) {
    const confirmed = window.confirm(
      `Excluir o estudo "${study.title}"?\n\nSe houver imagem importada, ela também será removida da pasta local do OpenArtDesk.`,
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
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o estudo.',
      );
    }
  }

async function handleEditStudy(study: Study) {
  const title = window.prompt('Título:', study.title);

  if (title === null) {
    return;
  }

  const category = window.prompt('Categoria:', study.category ?? '');

  if (category === null) {
    return;
  }

  const difficulty = window.prompt(
    'Dificuldade: easy, medium ou hard',
    study.difficulty ?? 'medium',
  );

  if (difficulty === null) {
    return;
  }

  const description = window.prompt('Observações:', study.description ?? '');

  if (description === null) {
    return;
  }

  try {
    setErrorMessage(null);

    await updateStudy({
      id: study.id,
      title,
      category: category.trim() || null,
      difficulty: difficulty.trim()
        ? (difficulty as StudyDifficulty)
        : null,
      description: description.trim() || null,
    });

    await loadStudies();
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : 'Não foi possível editar o estudo.',
      );
    }
  }

}