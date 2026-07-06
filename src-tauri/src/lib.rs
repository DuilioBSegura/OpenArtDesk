mod database;
mod db;
mod preferences;
mod storage;
mod library;
mod backup;
mod studies;
mod activities;
mod references;
mod dashboard;

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
            library::open_library_item_file,
            backup::create_full_backup,
            backup::open_backups_folder,
            studies::create_study,
            studies::list_studies,
            activities::create_activity,
            activities::list_activities,
            references::create_reference,
            references::list_references,
            references::open_reference_url,
            dashboard::get_dashboard_summary,
            library::delete_library_item,
            studies::delete_study,
            activities::delete_activity,
            references::delete_reference,
            library::update_library_item,
            studies::update_study,
            activities::update_activity,
            references::update_reference,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
