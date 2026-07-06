mod database;
mod preferences;
mod storage;
mod library;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if let Err(error) = database::initialize_database(app.handle()) {
                eprintln!("Failed to initialize database: {error}");
            }
            if let Err(error) = storage::initialize_storage(app.handle()) {
                eprintln!("Failed to initialize storage: {error}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            database::get_database_status,
            preferences::get_app_preferences,
            preferences::save_app_preferences,
            storage::get_storage_status,
            library::create_library_item,
            library::list_library_items,
            library::open_library_item_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}