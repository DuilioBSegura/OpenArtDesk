use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateStudyInput {
    pub title: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub original_image_name: Option<String>,
    pub image_bytes: Option<Vec<u8>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Study {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub image_path: Option<String>,
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

fn study_images_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    let images_dir = app_data_dir.join("files").join("studies").join("images");

    fs::create_dir_all(&images_dir)
        .map_err(|error| format!("Could not create study images directory: {error}"))?;

    Ok(images_dir)
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
            if character.is_ascii_alphanumeric()
                || character == '.'
                || character == '-'
                || character == '_'
            {
                character
            } else {
                '_'
            }
        })
        .collect()
}

fn is_supported_image_file(file_name: &str) -> bool {
    let lower_name = file_name.to_lowercase();

    lower_name.ends_with(".png")
        || lower_name.ends_with(".jpg")
        || lower_name.ends_with(".jpeg")
        || lower_name.ends_with(".webp")
}

#[tauri::command]
pub fn create_study(app: tauri::AppHandle, input: CreateStudyInput) -> Result<Study, String> {
    if input.title.trim().is_empty() {
        return Err("Title is required.".to_string());
    }

    let id = create_id();
    let now = now_string();

    let image_path = match (&input.original_image_name, &input.image_bytes) {
        (Some(original_image_name), Some(image_bytes)) => {
            if !is_supported_image_file(original_image_name) {
                return Err("Only PNG, JPG, JPEG and WEBP images are supported.".to_string());
            }

            let safe_original_name = sanitize_file_name(original_image_name);
            let internal_file_name = format!("{id}-{safe_original_name}");
            let relative_image_path = format!("files/studies/images/{internal_file_name}");
            let destination_path = study_images_dir(&app)?.join(&internal_file_name);

            fs::write(&destination_path, image_bytes)
                .map_err(|error| format!("Could not save study image: {error}"))?;

            Some(relative_image_path)
        }
        _ => None,
    };

    let connection = open_connection(&app)?;

    connection
        .execute(
            r#"
            INSERT INTO studies (
              id,
              title,
              description,
              category,
              difficulty,
              image_path,
              created_at,
              updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
            params![
                id,
                input.title.trim(),
                input.description.as_deref(),
                input.category.as_deref(),
                input.difficulty.as_deref(),
                image_path.as_deref(),
                now,
                now,
            ],
        )
        .map_err(|error| format!("Could not insert study: {error}"))?;

    get_study_by_id(&app, &id)
}

fn get_study_by_id(app: &tauri::AppHandle, id: &str) -> Result<Study, String> {
    let connection = open_connection(app)?;

    connection
        .query_row(
            r#"
            SELECT
              id,
              title,
              description,
              category,
              difficulty,
              image_path,
              created_at,
              updated_at
            FROM studies
            WHERE id = ?1
            "#,
            params![id],
            |row| {
                Ok(Study {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    category: row.get(3)?,
                    difficulty: row.get(4)?,
                    image_path: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .map_err(|error| format!("Could not load study: {error}"))
}

#[tauri::command]
pub fn list_studies(app: tauri::AppHandle) -> Result<Vec<Study>, String> {
    let connection = open_connection(&app)?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              id,
              title,
              description,
              category,
              difficulty,
              image_path,
              created_at,
              updated_at
            FROM studies
            ORDER BY updated_at DESC
            "#,
        )
        .map_err(|error| format!("Could not prepare studies query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(Study {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                category: row.get(3)?,
                difficulty: row.get(4)?,
                image_path: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|error| format!("Could not query studies: {error}"))?;

    let mut studies = Vec::new();

    for row in rows {
        studies.push(row.map_err(|error| format!("Could not read study: {error}"))?);
    }

    Ok(studies)
}