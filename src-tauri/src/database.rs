use rusqlite::{Connection, OptionalExtension};
use serde::Serialize;
use std::fs;
use tauri::Manager;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseStatus {
    pub initialized: bool,
    pub database_file_name: String,
    pub schema_version: Option<String>,
    pub tables: Vec<String>,
    pub error: Option<String>,
}

fn database_file_name() -> &'static str {
    "openartdesk.sqlite"
}

fn database_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|error| format!("Could not create app data directory: {error}"))?;

    Ok(app_data_dir.join(database_file_name()))
}

fn open_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let path = database_path(app)?;
    Connection::open(path).map_err(|error| format!("Could not open SQLite database: {error}"))
}

fn apply_schema(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            r#"
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS app_metadata (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS library_items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT,
                description TEXT,
                category TEXT,
                status TEXT NOT NULL,
                cover_path TEXT,
                file_path TEXT,
                original_file_name TEXT,
                file_type TEXT,
                file_size INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
                );

            CREATE TABLE IF NOT EXISTS studies (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              category TEXT,
              difficulty TEXT,
              image_path TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS reference_items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                url TEXT,
                description TEXT,
                category TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS activities (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              activity_date TEXT,
              duration_minutes INTEGER,
              focus_area TEXT,
              energy_level TEXT,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tags (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS item_tags (
              id TEXT PRIMARY KEY,
              tag_id TEXT NOT NULL,
              target_id TEXT NOT NULL,
              target_type TEXT NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );

            INSERT INTO app_metadata (key, value, updated_at)
            VALUES ('schema_version', '1', datetime('now'))
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at;
            "#,
        )
        .map_err(|error| format!("Could not apply database schema: {error}"))?;

    Ok(())
}

fn get_schema_version(connection: &Connection) -> Result<Option<String>, String> {
    connection
        .query_row(
            "SELECT value FROM app_metadata WHERE key = 'schema_version'",
            [],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map_err(|error| format!("Could not read schema version: {error}"))
}

fn get_tables(connection: &Connection) -> Result<Vec<String>, String> {
    let mut statement = connection
        .prepare(
            r#"
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name NOT LIKE 'sqlite_%'
            ORDER BY name
            "#,
        )
        .map_err(|error| format!("Could not prepare table list query: {error}"))?;

    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|error| format!("Could not query table list: {error}"))?;

    let mut tables = Vec::new();

    for row in rows {
        tables.push(row.map_err(|error| format!("Could not read table name: {error}"))?);
    }

    Ok(tables)
}

pub fn initialize_database(app: &tauri::AppHandle) -> Result<(), String> {
    let connection = open_connection(app)?;
    apply_schema(&connection)?;
    Ok(())
}

#[tauri::command]
pub fn get_database_status(app: tauri::AppHandle) -> DatabaseStatus {
    match open_connection(&app).and_then(|connection| {
        apply_schema(&connection)?;
        let schema_version = get_schema_version(&connection)?;
        let tables = get_tables(&connection)?;

        Ok(DatabaseStatus {
            initialized: true,
            database_file_name: database_file_name().to_string(),
            schema_version,
            tables,
            error: None,
        })
    }) {
        Ok(status) => status,
        Err(error) => DatabaseStatus {
            initialized: false,
            database_file_name: database_file_name().to_string(),
            schema_version: None,
            tables: Vec::new(),
            error: Some(error),
        },
    }
}

