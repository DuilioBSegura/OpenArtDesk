import { invoke } from '@tauri-apps/api/core';

export type BackupResult = {
  backupFileName: string;
  backupRelativePath: string;
  includedFilesCount: number;
  sizeBytes: number;
  createdAt: string;
};

export async function createFullBackup(): Promise<BackupResult> {
  return invoke<BackupResult>('create_full_backup');
}

export async function openBackupsFolder(): Promise<void> {
  return invoke<void>('open_backups_folder');
}