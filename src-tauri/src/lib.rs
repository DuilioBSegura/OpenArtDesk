mod database;
mod preferences;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if let Err(error) = database::initialize_database(app.handle()) {
                eprintln!("Failed to initialize database: {error}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            database::get_database_status,
            preferences::get_app_preferences,
            preferences::save_app_preferences
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}