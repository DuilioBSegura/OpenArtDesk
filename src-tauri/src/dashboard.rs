use crate::db::open_connection;
use rusqlite::Connection;
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardSummary {
    pub totals: DashboardTotals,
    pub recent_library_items: Vec<DashboardLibraryItem>,
    pub recent_studies: Vec<DashboardStudy>,
    pub recent_activities: Vec<DashboardActivity>,
    pub recent_references: Vec<DashboardReference>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardTotals {
    pub library_items: i64,
    pub studies: i64,
    pub activities: i64,
    pub references: i64,
    pub completed_activities: i64,
    pub total_completed_minutes: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardLibraryItem {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub status: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStudy {
    pub id: String,
    pub title: String,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardActivity {
    pub id: String,
    pub title: String,
    pub activity_date: Option<String>,
    pub duration_minutes: Option<i64>,
    pub focus_area: Option<String>,
    pub status: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardReference {
    pub id: String,
    pub title: String,
    pub url: Option<String>,
    pub category: Option<String>,
    pub status: String,
    pub updated_at: String,
}

fn count_table(connection: &Connection, table_name: &str) -> Result<i64, String> {
    let query = format!("SELECT COUNT(*) FROM {table_name}");

    connection
        .query_row(&query, [], |row| row.get::<_, i64>(0))
        .map_err(|error| format!("Could not count table {table_name}: {error}"))
}

fn count_completed_activities(connection: &Connection) -> Result<i64, String> {
    connection
        .query_row(
            "SELECT COUNT(*) FROM activities WHERE status = 'done'",
            [],
            |row| row.get::<_, i64>(0),
        )
        .map_err(|error| format!("Could not count completed activities: {error}"))
}

fn sum_completed_minutes(connection: &Connection) -> Result<i64, String> {
    connection
        .query_row(
            r#"
            SELECT COALESCE(SUM(duration_minutes), 0)
            FROM activities
            WHERE status = 'done'
            "#,
            [],
            |row| row.get::<_, i64>(0),
        )
        .map_err(|error| format!("Could not sum completed activity minutes: {error}"))
}

fn get_recent_library_items(
    connection: &Connection,
) -> Result<Vec<DashboardLibraryItem>, String> {
    let mut statement = connection
        .prepare(
            r#"
            SELECT id, title, author, status, updated_at
            FROM library_items
            ORDER BY updated_at DESC
            LIMIT 5
            "#,
        )
        .map_err(|error| format!("Could not prepare recent library query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(DashboardLibraryItem {
                id: row.get(0)?,
                title: row.get(1)?,
                author: row.get(2)?,
                status: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| format!("Could not query recent library items: {error}"))?;

    let mut items = Vec::new();

    for row in rows {
        items.push(row.map_err(|error| format!("Could not read recent library item: {error}"))?);
    }

    Ok(items)
}

fn get_recent_studies(connection: &Connection) -> Result<Vec<DashboardStudy>, String> {
    let mut statement = connection
        .prepare(
            r#"
            SELECT id, title, category, difficulty, updated_at
            FROM studies
            ORDER BY updated_at DESC
            LIMIT 5
            "#,
        )
        .map_err(|error| format!("Could not prepare recent studies query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(DashboardStudy {
                id: row.get(0)?,
                title: row.get(1)?,
                category: row.get(2)?,
                difficulty: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| format!("Could not query recent studies: {error}"))?;

    let mut studies = Vec::new();

    for row in rows {
        studies.push(row.map_err(|error| format!("Could not read recent study: {error}"))?);
    }

    Ok(studies)
}

fn get_recent_activities(connection: &Connection) -> Result<Vec<DashboardActivity>, String> {
    let mut statement = connection
        .prepare(
            r#"
            SELECT
              id,
              title,
              activity_date,
              duration_minutes,
              focus_area,
              status,
              updated_at
            FROM activities
            ORDER BY COALESCE(activity_date, created_at) DESC, updated_at DESC
            LIMIT 5
            "#,
        )
        .map_err(|error| format!("Could not prepare recent activities query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(DashboardActivity {
                id: row.get(0)?,
                title: row.get(1)?,
                activity_date: row.get(2)?,
                duration_minutes: row.get(3)?,
                focus_area: row.get(4)?,
                status: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|error| format!("Could not query recent activities: {error}"))?;

    let mut activities = Vec::new();

    for row in rows {
        activities.push(row.map_err(|error| format!("Could not read recent activity: {error}"))?);
    }

    Ok(activities)
}

fn get_recent_references(connection: &Connection) -> Result<Vec<DashboardReference>, String> {
    let mut statement = connection
        .prepare(
            r#"
            SELECT id, title, url, category, status, updated_at
            FROM reference_items
            ORDER BY updated_at DESC
            LIMIT 5
            "#,
        )
        .map_err(|error| format!("Could not prepare recent references query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(DashboardReference {
                id: row.get(0)?,
                title: row.get(1)?,
                url: row.get(2)?,
                category: row.get(3)?,
                status: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|error| format!("Could not query recent references: {error}"))?;

    let mut references = Vec::new();

    for row in rows {
        references.push(row.map_err(|error| format!("Could not read recent reference: {error}"))?);
    }

    Ok(references)
}

#[tauri::command]
pub fn get_dashboard_summary(app: tauri::AppHandle) -> Result<DashboardSummary, String> {
    let connection = open_connection(&app)?;

    let totals = DashboardTotals {
        library_items: count_table(&connection, "library_items")?,
        studies: count_table(&connection, "studies")?,
        activities: count_table(&connection, "activities")?,
        references: count_table(&connection, "reference_items")?,
        completed_activities: count_completed_activities(&connection)?,
        total_completed_minutes: sum_completed_minutes(&connection)?,
    };

    Ok(DashboardSummary {
        totals,
        recent_library_items: get_recent_library_items(&connection)?,
        recent_studies: get_recent_studies(&connection)?,
        recent_activities: get_recent_activities(&connection)?,
        recent_references: get_recent_references(&connection)?,
    })
}
