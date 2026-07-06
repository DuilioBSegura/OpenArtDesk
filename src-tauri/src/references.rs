use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReferenceInput {
    pub title: String,
    pub url: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferenceItem {
    pub id: String,
    pub title: String,
    pub url: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: String,
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

fn now_string() -> String {
    chrono::Utc::now().to_rfc3339()
}

fn create_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

fn normalize_url(url: &str) -> String {
    let trimmed = url.trim();

    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        trimmed.to_string()
    } else {
        format!("https://{trimmed}")
    }
}

fn is_valid_url(url: &str) -> bool {
    let normalized = normalize_url(url);

    normalized.starts_with("https://")
        && normalized.contains('.')
        && normalized.len() >= "https://a.b".len()
}

#[tauri::command]
pub fn create_reference(
    app: tauri::AppHandle,
    input: CreateReferenceInput,
) -> Result<ReferenceItem, String> {
    if input.title.trim().is_empty() {
        return Err("Title is required.".to_string());
    }

    let normalized_url = match input.url.as_deref() {
        Some(url) if !url.trim().is_empty() => {
            if !is_valid_url(url) {
                return Err("URL is invalid.".to_string());
            }

            Some(normalize_url(url))
        }
        _ => None,
    };

    let id = create_id();
    let now = now_string();

    let connection = open_connection(&app)?;

    connection
        .execute(
            r#"
            INSERT INTO reference_items (
              id,
              title,
              url,
              description,
              category,
              status,
              created_at,
              updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
            params![
                id,
                input.title.trim(),
                normalized_url.as_deref(),
                input.description.as_deref(),
                input.category.as_deref(),
                input.status,
                now,
                now,
            ],
        )
        .map_err(|error| format!("Could not insert reference: {error}"))?;

    get_reference_by_id(&app, &id)
}

fn get_reference_by_id(app: &tauri::AppHandle, id: &str) -> Result<ReferenceItem, String> {
    let connection = open_connection(app)?;

    connection
        .query_row(
            r#"
            SELECT
              id,
              title,
              url,
              description,
              category,
              status,
              created_at,
              updated_at
            FROM reference_items
            WHERE id = ?1
            "#,
            params![id],
            |row| {
                Ok(ReferenceItem {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    url: row.get(2)?,
                    description: row.get(3)?,
                    category: row.get(4)?,
                    status: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .map_err(|error| format!("Could not load reference: {error}"))
}

#[tauri::command]
pub fn list_references(app: tauri::AppHandle) -> Result<Vec<ReferenceItem>, String> {
    let connection = open_connection(&app)?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              id,
              title,
              url,
              description,
              category,
              status,
              created_at,
              updated_at
            FROM reference_items
            ORDER BY updated_at DESC
            "#,
        )
        .map_err(|error| format!("Could not prepare references query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(ReferenceItem {
                id: row.get(0)?,
                title: row.get(1)?,
                url: row.get(2)?,
                description: row.get(3)?,
                category: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|error| format!("Could not query references: {error}"))?;

    let mut references = Vec::new();

    for row in rows {
        references.push(row.map_err(|error| format!("Could not read reference: {error}"))?);
    }

    Ok(references)
}

#[tauri::command]
pub fn open_reference_url(app: tauri::AppHandle, reference_id: String) -> Result<(), String> {
    let reference = get_reference_by_id(&app, &reference_id)?;

    let url = reference
        .url
        .ok_or_else(|| "Reference does not have an URL.".to_string())?;

    opener::open(url).map_err(|error| format!("Could not open reference URL: {error}"))?;

    Ok(())
}

#[tauri::command]
pub fn delete_reference(app: tauri::AppHandle, reference_id: String) -> Result<(), String> {
    let connection = open_connection(&app)?;

    let affected_rows = connection
        .execute(
            "DELETE FROM reference_items WHERE id = ?1",
            params![reference_id],
        )
        .map_err(|error| format!("Could not delete reference: {error}"))?;

    if affected_rows == 0 {
        return Err("Reference was not found.".to_string());
    }

    Ok(())
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateReferenceInput {
    pub id: String,
    pub title: String,
    pub url: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: String,
}

#[tauri::command]
pub fn update_reference(
    app: tauri::AppHandle,
    input: UpdateReferenceInput,
) -> Result<ReferenceItem, String> {
    if input.title.trim().is_empty() {
        return Err("Title is required.".to_string());
    }

    let normalized_url = match input.url.as_deref() {
        Some(url) if !url.trim().is_empty() => {
            if !is_valid_url(url) {
                return Err("URL is invalid.".to_string());
            }

            Some(normalize_url(url))
        }
        _ => None,
    };

    let now = now_string();
    let connection = open_connection(&app)?;

    let affected_rows = connection
        .execute(
            r#"
            UPDATE reference_items
            SET
              title = ?1,
              url = ?2,
              description = ?3,
              category = ?4,
              status = ?5,
              updated_at = ?6
            WHERE id = ?7
            "#,
            params![
                input.title.trim(),
                normalized_url.as_deref(),
                input.description.as_deref(),
                input.category.as_deref(),
                input.status,
                now,
                input.id,
            ],
        )
        .map_err(|error| format!("Could not update reference: {error}"))?;

    if affected_rows == 0 {
        return Err("Reference was not found.".to_string());
    }

    get_reference_by_id(&app, &input.id)
}