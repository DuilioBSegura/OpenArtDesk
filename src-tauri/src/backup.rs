use crate::db::app_data_dir;
use serde::Serialize;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipWriter};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupResult {
    pub backup_file_name: String,
    pub backup_relative_path: String,
    pub included_files_count: usize,
    pub size_bytes: u64,
    pub created_at: String,
}

fn app_data_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_data_dir(app)
}

fn backups_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let root = app_data_root(app)?;
    let backups = root.join("backups");

    fs::create_dir_all(&backups)
        .map_err(|error| format!("Could not create backups directory: {error}"))?;

    Ok(backups)
}

fn should_skip_path(root: &Path, path: &Path) -> bool {
    let Ok(relative_path) = path.strip_prefix(root) else {
        return true;
    };

    let mut components = relative_path.components();

    let Some(first_component) = components.next() else {
        return false;
    };

    let first = first_component.as_os_str().to_string_lossy();

    first == "backups" || first == "temp"
}

fn normalize_zip_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn add_file_to_zip(
    zip: &mut ZipWriter<File>,
    absolute_path: &Path,
    relative_path: &Path,
    options: SimpleFileOptions,
) -> Result<(), String> {
    let zip_path = normalize_zip_path(relative_path);

    zip.start_file(zip_path, options)
        .map_err(|error| format!("Could not start zip file entry: {error}"))?;

    let mut file = File::open(absolute_path)
        .map_err(|error| format!("Could not open file for backup: {error}"))?;

    let mut buffer = Vec::new();

    file.read_to_end(&mut buffer)
        .map_err(|error| format!("Could not read file for backup: {error}"))?;

    zip.write_all(&buffer)
        .map_err(|error| format!("Could not write file to backup: {error}"))?;

    Ok(())
}

#[tauri::command]
pub fn create_full_backup(app: tauri::AppHandle) -> Result<BackupResult, String> {
    let root = app_data_root(&app)?;
    let backups = backups_dir(&app)?;

    let created_at = chrono::Utc::now().to_rfc3339();
    let timestamp = chrono::Utc::now().format("%Y%m%d-%H%M%S").to_string();
    let backup_file_name = format!("openartdesk-backup-{timestamp}.zip");
    let backup_path = backups.join(&backup_file_name);

    let backup_file = File::create(&backup_path)
        .map_err(|error| format!("Could not create backup file: {error}"))?;

    let mut zip = ZipWriter::new(backup_file);

    let options = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o644);

    let manifest = format!(
        r#"{{
  "appName": "OpenArtDesk",
  "backupVersion": 1,
  "createdAt": "{created_at}",
  "description": "Full local backup containing SQLite metadata, local preferences and managed files."
}}"#
    );

    zip.start_file("backup-manifest.json", options)
        .map_err(|error| format!("Could not create backup manifest: {error}"))?;

    zip.write_all(manifest.as_bytes())
        .map_err(|error| format!("Could not write backup manifest: {error}"))?;

    let mut included_files_count = 0usize;

    for entry in WalkDir::new(&root) {
        let entry = entry.map_err(|error| format!("Could not read app data entry: {error}"))?;
        let path = entry.path();

        if path.is_dir() {
            continue;
        }

        if should_skip_path(&root, path) {
            continue;
        }

        let relative_path = path
            .strip_prefix(&root)
            .map_err(|error| format!("Could not compute backup relative path: {error}"))?;

        add_file_to_zip(&mut zip, path, relative_path, options)?;
        included_files_count += 1;
    }

    zip.finish()
        .map_err(|error| format!("Could not finalize backup zip: {error}"))?;

    let size_bytes = fs::metadata(&backup_path)
        .map_err(|error| format!("Could not read backup file metadata: {error}"))?
        .len();

    Ok(BackupResult {
        backup_file_name,
        backup_relative_path: format!("backups/{}", backup_path.file_name().unwrap().to_string_lossy()),
        included_files_count,
        size_bytes,
        created_at,
    })
}

#[tauri::command]
pub fn open_backups_folder(app: tauri::AppHandle) -> Result<(), String> {
    let backups = backups_dir(&app)?;

    opener::open(backups)
        .map_err(|error| format!("Could not open backups folder: {error}"))?;

    Ok(())
}
