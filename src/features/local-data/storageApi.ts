import { invoke } from '@tauri-apps/api/core';

export type StorageDirectoryStatus = {
  key: string;
  relativePath: string;
  exists: boolean;
};

export type StorageStatus = {
  initialized: boolean;
  rootDirectoryName: string;
  directories: StorageDirectoryStatus[];
  error: string | null;
};

export async function getStorageStatus(): Promise<StorageStatus> {
  return invoke<StorageStatus>('get_storage_status');
}