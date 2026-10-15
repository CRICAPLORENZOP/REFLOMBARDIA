use std::fs;
use std::path::PathBuf;

use tauri::Manager;

/// Scrive il progetto (testo JSON) nel file scelto dall'utente.
#[tauri::command]
fn salva_file(percorso: String, contenuto: String) -> Result<(), String> {
    fs::write(&percorso, contenuto).map_err(|e| format!("Impossibile salvare il file: {e}"))
}

/// Scrive un file binario (es. il documento Word esportato).
#[tauri::command]
fn salva_file_binario(percorso: String, contenuto: Vec<u8>) -> Result<(), String> {
    fs::write(&percorso, contenuto).map_err(|e| format!("Impossibile salvare il file: {e}"))
}

/// Legge un progetto salvato in precedenza.
#[tauri::command]
fn leggi_file(percorso: String) -> Result<String, String> {
    fs::read_to_string(&percorso).map_err(|e| format!("Impossibile aprire il file: {e}"))
}

/// Apre la delibera o l'Allegato A con il programma PDF del computer.
#[tauri::command]
fn apri_documento(app: tauri::AppHandle, nome: String) -> Result<(), String> {
    let file = match nome.as_str() {
        "delibera" => "delibera-dgr-xi-7729.pdf",
        "allegato-a" => "allegato-a.pdf",
        _ => return Err("Documento non previsto".into()),
    };
    let percorso = percorso_documento(&app, file)?;
    open::that(&percorso).map_err(|e| format!("Impossibile aprire il documento: {e}"))
}

// In sviluppo i PDF stanno in src/documenti. Nell'app installata sono tra le risorse.
fn percorso_documento(app: &tauri::AppHandle, file: &str) -> Result<PathBuf, String> {
    let in_sviluppo = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../src/documenti")
        .join(file);
    if in_sviluppo.exists() {
        return Ok(in_sviluppo);
    }

    let risorse = app.path().resource_dir().map_err(|e| e.to_string())?;
    let nelle_risorse = risorse.join("documenti").join(file);
    if nelle_risorse.exists() {
        return Ok(nelle_risorse);
    }

    Err(format!("Documento non trovato: {file}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            salva_file,
            salva_file_binario,
            leggi_file,
            apri_documento
        ])
        .run(tauri::generate_context!())
        .expect("errore durante l'avvio dell'applicazione");
}
