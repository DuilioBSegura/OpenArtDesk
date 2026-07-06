import { invoke } from '@tauri-apps/api/core';

export type DatabaseStatus = {
  initialized: boolean;
  databaseFileName: string;
  schemaVersion: string | null;
  tables: string[];
  error: string | null;
};

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  return invoke<DatabaseStatus>('get_database_status');
}