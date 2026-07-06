import { invoke } from "@tauri-apps/api/core";
import type { AppPreferences } from "./types";

export async function loadAppPreferences(): Promise<AppPreferences> {
  return invoke<AppPreferences>("get_app_preferences");
}

export async function saveAppPreferences(
  preferences: AppPreferences,
): Promise<AppPreferences> {
  return invoke<AppPreferences>("save_app_preferences", { preferences });
}
