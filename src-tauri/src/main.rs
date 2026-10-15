// Nasconde la finestra nera del terminale nella versione finale (release) su Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ref_lombardia_lib::run()
}
