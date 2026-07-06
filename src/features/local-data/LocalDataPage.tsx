import { useEffect, useState } from 'react';

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
                : 'Não foi possível carregar o status do banco local.',
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
                : 'Não foi possível carregar o status do armazenamento local.',
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
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">Dados Locais</p>

          <h1 className="text-2xl font-semibold text-foreground">
            Privacidade e armazenamento local
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            O OpenArtDesk salva seus dados localmente no seu computador.
            Preferências visuais ficam em JSON local, dados estruturados ficam
            em SQLite e arquivos grandes serão salvos no sistema de arquivos
            local.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Banco SQLite local
            </h2>

            <p className="text-sm text-muted-foreground">
              Status da camada de dados estruturados do aplicativo.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Sprint 05
          </span>
        </div>

        {isLoadingDatabaseStatus ? (
          <p className="text-sm text-muted-foreground">
            Verificando banco local...
          </p>
        ) : databaseStatus?.initialized ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <p className="text-xs text-muted-foreground">Status</p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  Inicializado
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <p className="text-xs text-muted-foreground">Arquivo</p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {databaseStatus.databaseFileName}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <p className="text-xs text-muted-foreground">Schema</p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  v{databaseStatus.schemaVersion ?? 'desconhecida'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Tabelas criadas
              </h3>

              <div className="flex flex-wrap gap-2">
                {databaseStatus.tables.map((table) => (
                  <span
                    key={table}
                    className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground"
                  >
                    {table}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-elevated p-4">
            <p className="text-sm font-medium text-foreground">
              Não foi possível inicializar o banco local.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {databaseStatus?.error ?? 'Erro desconhecido.'}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Estrutura de arquivos locais
            </h2>

            <p className="text-sm text-muted-foreground">
              Diretórios internos preparados para PDFs, capas, imagens,
              brushes, imports e backups.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Sprint 06
          </span>
        </div>

        {isLoadingStorageStatus ? (
          <p className="text-sm text-muted-foreground">
            Verificando pastas locais...
          </p>
        ) : storageStatus?.initialized ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <p className="text-xs text-muted-foreground">Status</p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  Inicializado
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <p className="text-xs text-muted-foreground">Diretório raiz</p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {storageStatus.rootDirectoryName}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Pastas preparadas
              </h3>

              <div className="grid gap-2 md:grid-cols-2">
                {storageStatus.directories.map((directory) => (
                  <div
                    key={directory.key}
                    className="rounded-xl border border-border bg-surface-elevated px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        {directory.relativePath}
                      </span>

                      <span className="text-xs font-medium text-foreground">
                        {directory.exists ? 'OK' : 'Ausente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-elevated p-4">
            <p className="text-sm font-medium text-foreground">
              Não foi possível inicializar a estrutura de arquivos locais.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {storageStatus?.error ?? 'Erro desconhecido.'}
            </p>
          </div>
        )}
      </section>
       <BackupPanel/>
    </div>
    
     
  );
}