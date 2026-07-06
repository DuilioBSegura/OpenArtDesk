use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

const PREFERENCES_FILE_NAME: &str = "preferences.json";
const SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPreferences {
    pub schema_version: u32,
    pub appearance: AppearancePreferences,
    pub onboarding: OnboardingPreferences,
    pub modules: ModulePreferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppearancePreferences {
    pub theme: ThemePreference,
    pub density: DensityPreference,
    pub accent_color: AccentColorPreference,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingPreferences {
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModulePreferences {
    pub hidden_module_ids: Vec<String>,
    pub module_order: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ThemePreference {
    Light,
    Dark,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DensityPreference {
    Comfortable,
    Compact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AccentColorPreference {
    Moss,
    Blue,
    Amber,
}

impl Default for AppPreferences {
    fn default() -> Self {
        Self {
            schema_version: SCHEMA_VERSION,
            appearance: AppearancePreferences {
                theme: ThemePreference::Dark,
                density: DensityPreference::Comfortable,
                accent_color: AccentColorPreference::Moss,
            },
            onboarding: OnboardingPreferences { completed: false },
            modules: ModulePreferences {
                hidden_module_ids: Vec::new(),
                module_order: Vec::new(),
            },
        }
    }
}

#[tauri::command]
pub fn get_app_preferences(app: AppHandle) -> Result<AppPreferences, String> {
    let preferences_path = preferences_file_path(&app)?;

    if !preferences_path.exists() {
        let preferences = AppPreferences::default();
        write_preferences_file(&preferences_path, &preferences)?;
        return Ok(preferences);
    }

    let content = fs::read_to_string(&preferences_path)
        .map_err(|_| "Nao foi possivel ler o arquivo de preferencias.".to_string())?;

    match serde_json::from_str::<AppPreferences>(&content) {
        Ok(preferences) if preferences.schema_version == SCHEMA_VERSION => Ok(preferences),
        _ => Ok(AppPreferences::default()),
    }
}

#[tauri::command]
pub fn save_app_preferences(
    app: AppHandle,
    preferences: AppPreferences,
) -> Result<AppPreferences, String> {
    if preferences.schema_version != SCHEMA_VERSION {
        return Err("Versao de preferencias nao suportada.".to_string());
    }

    let preferences_path = preferences_file_path(&app)?;
    write_preferences_file(&preferences_path, &preferences)?;

    Ok(preferences)
}

fn preferences_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Nao foi possivel resolver o diretorio local de configuracao.".to_string())?;

    Ok(config_dir.join(PREFERENCES_FILE_NAME))
}

fn write_preferences_file(path: &Path, preferences: &AppPreferences) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|_| "Nao foi possivel criar o diretorio de preferencias.".to_string())?;
    }

    let json = serde_json::to_string_pretty(preferences)
        .map_err(|_| "Nao foi possivel serializar as preferencias.".to_string())?;

    fs::write(path, format!("{json}\n"))
        .map_err(|_| "Nao foi possivel salvar o arquivo de preferencias.".to_string())
}
