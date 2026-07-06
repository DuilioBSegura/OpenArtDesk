import { invoke } from '@tauri-apps/api/core';

export type LibraryItemStatus = 'to-read' | 'reading' | 'completed' | 'paused';

export type LibraryItem = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  category: string | null;
  status: LibraryItemStatus;
  coverPath: string | null;
  filePath: string | null;
  originalFileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLibraryItemInput = {
  title: string;
  author?: string | null;
  description?: string | null;
  category?: string | null;
  status: LibraryItemStatus;
  originalFileName: string;
  fileSize: number;
  fileBytes: number[];
};

export async function listLibraryItems(): Promise<LibraryItem[]> {
  return invoke<LibraryItem[]>('list_library_items');
}

export async function createLibraryItem(
  input: CreateLibraryItemInput,
): Promise<LibraryItem> {
  return invoke<LibraryItem>('create_library_item', {
    input,
  });
}

export async function openLibraryItemFile(itemId: string): Promise<void> {
  return invoke<void>('open_library_item_file', {
    itemId,
  });
}

export async function deleteLibraryItem(itemId: string): Promise<void> {
  return invoke<void>('delete_library_item', {
    itemId,
  });
}