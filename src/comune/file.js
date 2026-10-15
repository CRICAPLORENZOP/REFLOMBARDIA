// Salvataggio e apertura dei progetti su file.
// Dentro Tauri usa le finestre di Windows "Salva con nome" / "Apri".
// Aprendo le pagine in un normale browser (per prove) usa download/upload.

import { esportaTesto, caricaDaTesto, getPercorsoFile, setPercorsoFile, segnaSalvato, leggi } from './stato.js';

const tauri = window.__TAURI__;
export const inTauri = !!(tauri && tauri.core);

const FILTRI = [{ name: 'Progetto REF', extensions: ['json'] }];

function nomeSuggerito(estensione = 'json', prefisso = '') {
  const nome = (leggi('frontespizio.denominazione') || 'Progetto REF').replace(/[\\/:*?"<>|]/g, '').trim();
  return `${prefisso}${nome || 'Progetto REF'}.${estensione}`;
}

// Salva un file esportato (es. Word). contenuto = Uint8Array.
// Restituisce il percorso scelto, oppure null se l'utente annulla.
export async function salvaEsportazione(contenuto, { estensione, descrizione, tipoMime }) {
  const nome = nomeSuggerito(estensione, 'REF - ');
  if (!inTauri) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([contenuto], { type: tipoMime }));
    link.download = nome;
    link.click();
    return nome;
  }
  const percorso = await tauri.core.invoke('plugin:dialog|save', {
    options: { title: `Esporta ${descrizione}`, defaultPath: nome, filters: [{ name: descrizione, extensions: [estensione] }] },
  });
  if (!percorso) return null;
  await tauri.core.invoke('salva_file_binario', { percorso, contenuto: Array.from(contenuto) });
  return percorso;
}

export function nomeFile(percorso) {
  return percorso ? percorso.split(/[\\/]/).pop() : '';
}

export async function salvaProgetto(conNome = false) {
  if (!inTauri) {
    const blob = new Blob([esportaTesto()], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeSuggerito();
    link.click();
    segnaSalvato();
    return true;
  }

  let percorso = getPercorsoFile();
  if (!percorso || conNome) {
    percorso = await tauri.core.invoke('plugin:dialog|save', {
      options: { title: 'Salva progetto REF', defaultPath: nomeSuggerito(), filters: FILTRI },
    });
    if (!percorso) return false;
  }

  await tauri.core.invoke('salva_file', { percorso, contenuto: esportaTesto() });
  setPercorsoFile(percorso);
  segnaSalvato();
  return true;
}

function scegliFileNelBrowser() {
  return new Promise((risolvi) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async () => {
      const file = input.files[0];
      risolvi(file ? await file.text() : null);
    });
    input.click();
  });
}

export async function apriProgetto() {
  if (!inTauri) {
    const testo = await scegliFileNelBrowser();
    if (!testo) return false;
    caricaDaTesto(testo);
    return true;
  }

  const percorso = await tauri.core.invoke('plugin:dialog|open', {
    options: { title: 'Apri progetto REF', multiple: false, directory: false, filters: FILTRI },
  });
  if (!percorso) return false;

  const testo = await tauri.core.invoke('leggi_file', { percorso });
  caricaDaTesto(testo);
  setPercorsoFile(percorso);
  return true;
}
