import { invoke } from '@tauri-apps/api/core';

export type ActivityStatus = 'planned' | 'done' | 'skipped';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  activityDate: string | null;
  durationMinutes: number | null;
  focusArea: string | null;
  energyLevel: EnergyLevel | null;
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateActivityInput = {
  title: string;
  description?: string | null;
  activityDate?: string | null;
  durationMinutes?: number | null;
  focusArea?: string | null;
  energyLevel?: EnergyLevel | null;
  status: ActivityStatus;
};

export async function listActivities(): Promise<Activity[]> {
  return invoke<Activity[]>('list_activities');
}

export async function createActivity(
  input: CreateActivityInput,
): Promise<Activity> {
  return invoke<Activity>('create_activity', {
    input,
  });
}