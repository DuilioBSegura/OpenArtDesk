import { useEffect, useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { ErrorMessage, PageHero, SectionCard } from '../../components/ui/Surface';
import { BackupPanel } from './BackupPanel';
import {
  getDatabaseStatus,
  type DatabaseStatus,
} from './databaseapi';
import {
  getStorageStatus,
  type StorageStatus,
} from './storageApi';

export function LocalDataPage() {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [isLoadingDatabaseStatus, setIsLoadingDatabaseStatus] = useState(true);

  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [isLoadingStorageStatus, setIsLoadingStorageStatus] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseStatus() {
      try {
        const status = await getDatabaseStatus();

        if (isMounted) {
          setDatabaseStatus(status);
        }
      } catch (error) {
        if (isMounted) {
          setDatabaseStatus({
            initialized: false,
            databaseFileName: 'openartdesk.sqlite',
            schemaVersion: null,
            tables: [],
            error:
              error instanceof Error
                ? error.message
                : 'Nao foi possivel carregar o status do banco local.',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingDatabaseStatus(false);
        }
      }
    }

    async function loadStorageStatus() {
      try {
        const status = await getStorageStatus();

        if (isMounted) {
          setStorageStatus(status);
        }
      } catch (error) {
        if (isMounted) {
          setStorageStatus({
            initialized: false,
            rootDirectoryName: 'OpenArtDesk',
            directories: [],
            error:
              error instanceof Error
                ? error.message
                : 'Nao foi possivel carregar o status do armazenamento local.',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingStorageStatus(false);
        }
      }
    }

    loadDatabaseStatus();
    loadStorageStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="desktop-page">
      <PageHero
        eyebrow="Dados Locais"
        title="Privacidade e armazenamento local"
        description="O OpenArtDesk salva preferencias em JSON local, dados estruturados em SQLite e arquivos grandes no sistema de arquivos do seu computador."
        actions={<Badge tone="accent">Local-first</Badge>}
      />

      <SectionCard
        title="Banco SQLite local"
        description="Status da camada de dados estruturados do aplicativo."
        actions={<Badge>Sprint 05</Badge>}
      >
        {isLoadingDatabaseStatus ? (
          <div className="loading-panel">
            <p>Verificando banco local...</p>
          </div>
        ) : databaseStatus?.initialized ? (
          <div className="data-stack">
            <div className="data-card-grid">
              <div className="data-tile">
                <span>Status</span>
                <strong>Inicializado</strong>
              </div>
              <div className="data-tile">
                <span>Arquivo</span>
                <strong>{databaseStatus.databaseFileName}</strong>
              </div>
              <div className="data-tile">
                <span>Schema</span>
                <strong>v{databaseStatus.schemaVersion ?? 'desconhecida'}</strong>
              </div>
            </div>

            <div className="data-tile">
              <span>Tabelas criadas</span>
              <div className="action-row mt-3">
                {databaseStatus.tables.map((table) => (
                  <Badge key={table}>{table}</Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ErrorMessage>
            {databaseStatus?.error ?? 'Erro desconhecido ao inicializar o banco local.'}
          </ErrorMessage>
        )}
      </SectionCard>

      <SectionCard
        title="Estrutura de arquivos locais"
        description="Diretorios internos preparados para PDFs, capas, imagens, brushes, imports e backups."
        actions={<Badge>Sprint 06</Badge>}
      >
        {isLoadingStorageStatus ? (
          <div className="loading-panel">
            <p>Verificando pastas locais...</p>
          </div>
        ) : storageStatus?.initialized ? (
          <div className="data-stack">
            <div className="data-card-grid">
              <div className="data-tile">
                <span>Status</span>
                <strong>Inicializado</strong>
              </div>
              <div className="data-tile">
                <span>Diretorio raiz</span>
                <strong>{storageStatus.rootDirectoryName}</strong>
              </div>
            </div>

            <div className="data-tile">
              <span>Pastas preparadas</span>
              <div className="data-card-grid mt-3">
                {storageStatus.directories.map((directory) => (
                  <div key={directory.key} className="data-tile">
                    <span>{directory.relativePath}</span>
                    <strong>{directory.exists ? 'OK' : 'Ausente'}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ErrorMessage>
            {storageStatus?.error ??
              'Erro desconhecido ao inicializar a estrutura de arquivos locais.'}
          </ErrorMessage>
        )}
      </SectionCard>

      <BackupPanel />
    </div>
  );
}
