import { invoke } from '@tauri-apps/api/core';

export type ReferenceStatus = 'to-study' | 'studying' | 'completed' | 'archived';

export type ReferenceItem = {
  id: string;
  title: string;
  url: string | null;
  description: string | null;
  category: string | null;
  status: ReferenceStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateReferenceInput = {
  title: string;
  url?: string | null;
  description?: string | null;
  category?: string | null;
  status: ReferenceStatus;
};

export async function listReferences(): Promise<ReferenceItem[]> {
  return invoke<ReferenceItem[]>('list_references');
}

export async function createReference(
  input: CreateReferenceInput,
): Promise<ReferenceItem> {
  return invoke<ReferenceItem>('create_reference', {
    input,
  });
}

export async function openReferenceUrl(referenceId: string): Promise<void> {
  return invoke<void>('open_reference_url', {
    referenceId,
  });
}

export async function deleteReference(referenceId: string): Promise<void> {
  return invoke<void>('delete_reference', {
    referenceId,
  });
}