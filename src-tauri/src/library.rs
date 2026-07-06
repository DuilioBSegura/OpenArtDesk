use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLibraryItemInput {
    pub title: String,
    pub author: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: String,
    pub original_file_name: String,
    pub file_size: i64,
    pub file_bytes: Vec<u8>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryItem {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: String,
    pub cover_path: Option<String>,
    pub file_path: Option<String>,
    pub original_file_name: Option<String>,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
    pub created_at: String,
    pub updated_at: String,
}

fn database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    Ok(app_data_dir.join("openartdesk.sqlite"))
}

fn open_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let path = database_path(app)?;
    Connection::open(path).map_err(|error| format!("Could not open SQLite database: {error}"))
}

fn library_pdfs_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    let pdfs_dir = app_data_dir.join("files").join("library").join("pdfs");

    fs::create_dir_all(&pdfs_dir)
        .map_err(|error| format!("Could not create library PDFs directory: {error}"))?;

    Ok(pdfs_dir)
}

fn now_string() -> String {
    chrono::Utc::now().to_rfc3339()
}

fn create_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

fn sanitize_file_name(file_name: &str) -> String {
    file_name
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == '.' || character == '-' || character == '_' {
                character
            } else {
                '_'
            }
        })
        .collect()
}

#[tauri::command]
pub fn create_library_item(
    app: tauri::AppHandle,
    input: CreateLibraryItemInput,
) -> Result<LibraryItem, String> {
    if input.title.trim().is_empty() {
        return Err("Title is required.".to_string());
    }

    if !input
        .original_file_name
        .to_lowercase()
        .ends_with(".pdf")
    {
        return Err("Only PDF files are supported in this sprint.".to_string());
    }

    let id = create_id();
    let now = now_string();
    let safe_original_name = sanitize_file_name(&input.original_file_name);
    let internal_file_name = format!("{id}-{safe_original_name}");
    let relative_file_path = format!("files/library/pdfs/{internal_file_name}");

    let destination_path = library_pdfs_dir(&app)?.join(&internal_file_name);

    fs::write(&destination_path, &input.file_bytes)
        .map_err(|error| format!("Could not save PDF file: {error}"))?;

    let connection = open_connection(&app)?;

    connection
        .execute(
            r#"
            INSERT INTO library_items (
              id,
              title,
              author,
              description,
              category,
              status,
              cover_path,
              file_path,
              original_file_name,
              file_type,
              file_size,
              created_at,
              updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, ?7, ?8, ?9, ?10, ?11, ?12)
            "#,
            params![
                id,
                input.title.trim(),
                input.author.as_deref(),
                input.description.as_deref(),
                input.category.as_deref(),
                input.status,
                relative_file_path,
                input.original_file_name,
                "application/pdf",
                input.file_size,
                now,
                now,
            ],
        )
        .map_err(|error| format!("Could not insert library item: {error}"))?;

    get_library_item_by_id(&app, &id)
}

fn get_library_item_by_id(app: &tauri::AppHandle, id: &str) -> Result<LibraryItem, String> {
    let connection = open_connection(app)?;

    connection
        .query_row(
            r#"
            SELECT
              id,
              title,
              author,
              description,
              category,
              status,
              cover_path,
              file_path,
              original_file_name,
              file_type,
              file_size,
              created_at,
              updated_at
            FROM library_items
            WHERE id = ?1
            "#,
            params![id],
            |row| {
                Ok(LibraryItem {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    author: row.get(2)?,
                    description: row.get(3)?,
                    category: row.get(4)?,
                    status: row.get(5)?,
                    cover_path: row.get(6)?,
                    file_path: row.get(7)?,
                    original_file_name: row.get(8)?,
                    file_type: row.get(9)?,
                    file_size: row.get(10)?,
                    created_at: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            },
        )
        .map_err(|error| format!("Could not load library item: {error}"))
}

#[tauri::command]
pub fn list_library_items(app: tauri::AppHandle) -> Result<Vec<LibraryItem>, String> {
    let connection = open_connection(&app)?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              id,
              title,
              author,
              description,
              category,
              status,
              cover_path,
              file_path,
              original_file_name,
              file_type,
              file_size,
              created_at,
              updated_at
            FROM library_items
            ORDER BY updated_at DESC
            "#,
        )
        .map_err(|error| format!("Could not prepare library query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(LibraryItem {
                id: row.get(0)?,
                title: row.get(1)?,
                author: row.get(2)?,
                description: row.get(3)?,
                category: row.get(4)?,
                status: row.get(5)?,
                cover_path: row.get(6)?,
                file_path: row.get(7)?,
                original_file_name: row.get(8)?,
                file_type: row.get(9)?,
                file_size: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })
        .map_err(|error| format!("Could not query library items: {error}"))?;

    let mut items = Vec::new();

    for row in rows {
        items.push(row.map_err(|error| format!("Could not read library item: {error}"))?);
    }

    Ok(items)
}

#[tauri::command]
pub fn open_library_item_file(app: tauri::AppHandle, item_id: String) -> Result<(), String> {
    let item = get_library_item_by_id(&app, &item_id)?;

    let file_path = item
        .file_path
        .ok_or_else(|| "Library item does not have a file path.".to_string())?;

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    let absolute_path = app_data_dir.join(file_path);

    if !absolute_path.exists() {
        return Err("PDF file was not found on disk.".to_string());
    }

    opener::open(absolute_path).map_err(|error| format!("Could not open PDF file: {error}"))?;

    Ok(())
}
#[tauri::command]
pub fn delete_library_item(app: tauri::AppHandle, item_id: String) -> Result<(), String> {
    let item = get_library_item_by_id(&app, &item_id)?;

    let connection = open_connection(&app)?;

    connection
        .execute(
            "DELETE FROM library_items WHERE id = ?1",
            params![item_id],
        )
        .map_err(|error| format!("Could not delete library item: {error}"))?;

    if let Some(file_path) = item.file_path {
        let app_data_dir = app
            .path()
            .app_data_dir()
            .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

        let absolute_path = app_data_dir.join(file_path);

        if absolute_path.exists() {
            fs::remove_file(&absolute_path)
                .map_err(|error| format!("Could not remove library PDF file: {error}"))?;
        }
    }

    Ok(())
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLibraryItemInput {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: String,
}

#[tauri::command]
pub fn update_library_item(
    app: tauri::AppHandle,
    input: UpdateLibraryItemInput,
) -> Result<LibraryItem, String> {
    if input.title.trim().is_empty() {
        return Err("Title is required.".to_string());
    }

    let now = now_string();
    let connection = open_connection(&app)?;

    let affected_rows = connection
        .execute(
            r#"
            UPDATE library_items
            SET
              title = ?1,
              author = ?2,
              description = ?3,
              category = ?4,
              status = ?5,
              updated_at = ?6
            WHERE id = ?7
            "#,
            params![
                input.title.trim(),
                input.author.as_deref(),
                input.description.as_deref(),
                input.category.as_deref(),
                input.status,
                now,
                input.id,
            ],
        )
        .map_err(|error| format!("Could not update library item: {error}"))?;

    if affected_rows == 0 {
        return Err("Library item was not found.".to_string());
    }

    get_library_item_by_id(&app, &input.id)
}