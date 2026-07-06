use crate::db::app_data_dir;
use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageDirectoryStatus {
    pub key: String,
    pub relative_path: String,
    pub exists: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageStatus {
    pub initialized: bool,
    pub root_directory_name: String,
    pub directories: Vec<StorageDirectoryStatus>,
    pub error: Option<String>,
}

fn required_directories() -> Vec<(&'static str, &'static str)> {
    vec![
        ("files", "files"),
        ("library_pdfs", "files/library/pdfs"),
        ("library_covers", "files/library/covers"),
        ("study_images", "files/studies/images"),
        ("reference_images", "files/references/images"),
        ("brushes", "files/brushes"),
        ("imports", "files/imports"),
        ("backups", "backups"),
        ("temp", "temp"),
    ]
}

fn app_storage_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_data_dir(app)
}

pub fn initialize_storage(app: &tauri::AppHandle) -> Result<(), String> {
    let root = app_storage_root(app)?;

    for (_, relative_path) in required_directories() {
        fs::create_dir_all(root.join(relative_path))
            .map_err(|error| format!("Could not create directory '{relative_path}': {error}"))?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_storage_status(app: tauri::AppHandle) -> StorageStatus {
    match app_storage_root(&app).and_then(|root| {
        initialize_storage(&app)?;

        let directories = required_directories()
            .into_iter()
            .map(|(key, relative_path)| StorageDirectoryStatus {
                key: key.to_string(),
                relative_path: relative_path.to_string(),
                exists: root.join(relative_path).exists(),
            })
            .collect::<Vec<_>>();

        Ok(StorageStatus {
            initialized: true,
            root_directory_name: root
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("OpenArtDesk")
                .to_string(),
            directories,
            error: None,
        })
    }) {
        Ok(status) => status,
        Err(error) => StorageStatus {
            initialized: false,
            root_directory_name: "OpenArtDesk".to_string(),
            directories: Vec::new(),
            error: Some(error),
        },
    }
}
