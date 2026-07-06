import { useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ErrorMessage,
  MetricCard,
  SectionCard,
} from '../../components/ui/Surface';
import { formatFileSize } from '../../shared/utils/formatters';
import {
  createFullBackup,
  openBackupsFolder,
  type BackupResult,
} from './backupApi';

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
          : 'Nao foi possivel criar o backup completo.',
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
          : 'Nao foi possivel abrir a pasta de backups.',
      );
    }
  }

  return (
    <SectionCard
      title="Backup completo local"
      description="Gere um arquivo .zip com banco SQLite, preferencias locais e arquivos gerenciados pelo OpenArtDesk."
      actions={<Badge>Sprint 08</Badge>}
    >
      <div className="data-tile">
        <span>O que entra no backup</span>
        <strong>SQLite, preferences.json, PDFs importados, imagens e arquivos internos.</strong>
        <p className="mt-2 text-sm text-muted-foreground">
          Backups existentes e arquivos temporarios ficam fora do pacote para evitar copia recursiva.
        </p>
      </div>

      {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}

      {lastBackup ? (
        <div className="metric-grid mt-4">
          <MetricCard label="Arquivo" value={lastBackup.backupFileName} />
          <MetricCard
            label="Itens incluidos"
            value={lastBackup.includedFilesCount}
          />
          <MetricCard
            tone="success"
            label="Tamanho"
            value={formatFileSize(lastBackup.sizeBytes, { useKbBelowMb: true })}
          />
        </div>
      ) : null}

      <div className="action-button-group mt-4">
        <Button
          type="button"
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          variant="primary"
        >
          {isCreatingBackup ? 'Criando backup...' : 'Criar backup completo'}
        </Button>

        <Button type="button" onClick={handleOpenBackupsFolder}>
          Abrir pasta de backups
        </Button>
      </div>
    </SectionCard>
  );
}
