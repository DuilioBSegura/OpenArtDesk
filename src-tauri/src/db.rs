use rusqlite::Connection;
use std::{fs, path::PathBuf};
use tauri::Manager;

pub fn database_file_name() -> &'static str {
    "openartdesk.sqlite"
}

pub fn app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|error| format!("Could not create app data directory: {error}"))?;

    Ok(app_data_dir)
}

pub fn database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join(database_file_name()))
}

pub fn open_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let path = database_path(app)?;

    Connection::open(path).map_err(|error| format!("Could not open SQLite database: {error}"))
}
