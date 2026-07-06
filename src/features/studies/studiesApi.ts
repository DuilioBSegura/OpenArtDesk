import { invoke } from '@tauri-apps/api/core';

export type StudyDifficulty = 'easy' | 'medium' | 'hard';

export type Study = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: StudyDifficulty | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateStudyInput = {
  title: string;
  description?: string | null;
  category?: string | null;
  difficulty?: StudyDifficulty | null;
  originalImageName?: string | null;
  imageBytes?: number[] | null;
};

export async function listStudies(): Promise<Study[]> {
  return invoke<Study[]>('list_studies');
}

export async function createStudy(input: CreateStudyInput): Promise<Study> {
  return invoke<Study>('create_study', {
    input,
  });
}