import { invoke } from '@tauri-apps/api/core';

export type DashboardTotals = {
  libraryItems: number;
  studies: number;
  activities: number;
  references: number;
  completedActivities: number;
  totalCompletedMinutes: number;
};

export type DashboardLibraryItem = {
  id: string;
  title: string;
  author: string | null;
  status: string;
  updatedAt: string;
};

export type DashboardStudy = {
  id: string;
  title: string;
  category: string | null;
  difficulty: string | null;
  updatedAt: string;
};

export type DashboardActivity = {
  id: string;
  title: string;
  activityDate: string | null;
  durationMinutes: number | null;
  focusArea: string | null;
  status: string;
  updatedAt: string;
};

export type DashboardReference = {
  id: string;
  title: string;
  url: string | null;
  category: string | null;
  status: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totals: DashboardTotals;
  recentLibraryItems: DashboardLibraryItem[];
  recentStudies: DashboardStudy[];
  recentActivities: DashboardActivity[];
  recentReferences: DashboardReference[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return invoke<DashboardSummary>('get_dashboard_summary');
}