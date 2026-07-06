use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateActivityInput {
    pub title: String,
    pub description: Option<String>,
    pub activity_date: Option<String>,
    pub duration_minutes: Option<i64>,
    pub focus_area: Option<String>,
    pub energy_level: Option<String>,
    pub status: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub activity_date: Option<String>,
    pub duration_minutes: Option<i64>,
    pub focus_area: Option<String>,
    pub energy_level: Option<String>,
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

#[tauri::command]
pub fn create_activity(
    app: tauri::AppHandle,
    input: CreateActivityInput,
) -> Result<Activity, String> {
    if input.title.trim().is_empty() {
        return Err("Title is required.".to_string());
    }

    if let Some(duration_minutes) = input.duration_minutes {
        if duration_minutes < 0 {
            return Err("Duration cannot be negative.".to_string());
        }
    }

    let id = create_id();
    let now = now_string();

    let connection = open_connection(&app)?;

    connection
        .execute(
            r#"
            INSERT INTO activities (
              id,
              title,
              description,
              activity_date,
              duration_minutes,
              focus_area,
              energy_level,
              status,
              created_at,
              updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            "#,
            params![
                id,
                input.title.trim(),
                input.description.as_deref(),
                input.activity_date.as_deref(),
                input.duration_minutes,
                input.focus_area.as_deref(),
                input.energy_level.as_deref(),
                input.status,
                now,
                now,
            ],
        )
        .map_err(|error| format!("Could not insert activity: {error}"))?;

    get_activity_by_id(&app, &id)
}

fn get_activity_by_id(app: &tauri::AppHandle, id: &str) -> Result<Activity, String> {
    let connection = open_connection(app)?;

    connection
        .query_row(
            r#"
            SELECT
              id,
              title,
              description,
              activity_date,
              duration_minutes,
              focus_area,
              energy_level,
              status,
              created_at,
              updated_at
            FROM activities
            WHERE id = ?1
            "#,
            params![id],
            |row| {
                Ok(Activity {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    activity_date: row.get(3)?,
                    duration_minutes: row.get(4)?,
                    focus_area: row.get(5)?,
                    energy_level: row.get(6)?,
                    status: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            },
        )
        .map_err(|error| format!("Could not load activity: {error}"))
}

#[tauri::command]
pub fn list_activities(app: tauri::AppHandle) -> Result<Vec<Activity>, String> {
    let connection = open_connection(&app)?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              id,
              title,
              description,
              activity_date,
              duration_minutes,
              focus_area,
              energy_level,
              status,
              created_at,
              updated_at
            FROM activities
            ORDER BY COALESCE(activity_date, created_at) DESC, updated_at DESC
            "#,
        )
        .map_err(|error| format!("Could not prepare activities query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(Activity {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                activity_date: row.get(3)?,
                duration_minutes: row.get(4)?,
                focus_area: row.get(5)?,
                energy_level: row.get(6)?,
                status: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|error| format!("Could not query activities: {error}"))?;

    let mut activities = Vec::new();

    for row in rows {
        activities.push(row.map_err(|error| format!("Could not read activity: {error}"))?);
    }

    Ok(activities)
}

#[tauri::command]
pub fn delete_activity(app: tauri::AppHandle, activity_id: String) -> Result<(), String> {
    let connection = open_connection(&app)?;

    let affected_rows = connection
        .execute(
            "DELETE FROM activities WHERE id = ?1",
            params![activity_id],
        )
        .map_err(|error| format!("Could not delete activity: {error}"))?;

    if affected_rows == 0 {
        return Err("Activity was not found.".to_string());
    }

    Ok(())
}