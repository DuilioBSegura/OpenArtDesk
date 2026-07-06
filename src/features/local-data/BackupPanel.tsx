import { useState } from 'react';

import {
  createFullBackup,
  openBackupsFolder,
  type BackupResult,
} from './backupApi';

function formatFileSize(sizeBytes: number) {
  const sizeInMb = sizeBytes / 1024 / 1024;

  if (sizeInMb < 1) {
    return `${(sizeBytes / 1024).toFixed(2)} KB`;
  }

  return `${sizeInMb.toFixed(2)} MB`;
}

export function BackupPanel() {
  const [lastBackup, setLastBackup] = useState<BackupResult | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCreateBackup() {
    try {
      setIsCreatingBackup(true);
      setErrorMessage(null);

      const result = await createFullBackup();
      setLastBackup(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o backup completo.',
      );
    } finally {
      setIsCreatingBackup(false);
    }
  }

  async function handleOpenBackupsFolder() {
    try {
      setErrorMessage(null);
      await openBackupsFolder();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir a pasta de backups.',
      );
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Backup completo local
          </h2>

          <p className="text-sm text-muted-foreground">
            Gere um arquivo .zip com banco SQLite, preferências locais e arquivos
            gerenciados pelo OpenArtDesk.
          </p>
        </div>

        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          Sprint 08
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface-elevated p-4">
        <p className="text-sm font-medium text-foreground">
          O que entra no backup?
        </p>

        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Banco SQLite local com metadados.</li>
          <li>Arquivo local de preferências.</li>
          <li>PDFs importados para a Biblioteca.</li>
          <li>Capas, imagens, brushes e imports gerenciados pelo app.</li>
        </ul>

        <p className="mt-3 text-xs text-muted-foreground">
          A pasta de backups e arquivos temporários não são incluídos para evitar
          backups recursivos.
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-border bg-surface-elevated p-4 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}

      {lastBackup ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-elevated p-4">
            <p className="text-xs text-muted-foreground">Arquivo</p>
            <p className="mt-1 break-all text-sm font-medium text-foreground">
              {lastBackup.backupFileName}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-4">
            <p className="text-xs text-muted-foreground">Itens incluídos</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {lastBackup.includedFilesCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-4">
            <p className="text-xs text-muted-foreground">Tamanho</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatFileSize(lastBackup.sizeBytes)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="rounded-xl border border-border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreatingBackup ? 'Criando backup...' : 'Criar backup completo'}
        </button>

        <button
          type="button"
          onClick={handleOpenBackupsFolder}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground"
        >
          Abrir pasta de backups
        </button>
      </div>
    </section>
  );
}