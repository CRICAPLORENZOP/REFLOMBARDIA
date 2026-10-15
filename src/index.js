// Pagina iniziale: nuovo progetto, apri da file, oppure continua l'ultimo lavoro.

import { esisteProgetto, nuovoProgetto, leggi, haModifiche } from './comune/stato.js';
import { apriProgetto } from './comune/file.js';

const PRIMA_VIDEATA = 'pagine/01-frontespizio/frontespizio.html';

const bottoneContinua = document.getElementById('continua');
if (esisteProgetto()) {
  bottoneContinua.hidden = false;
  document.getElementById('nome-ultimo').textContent = leggi('frontespizio.denominazione') || 'progetto senza nome';
}

document.getElementById('nuovo').addEventListener('click', () => {
  if (haModifiche() && !confirm('Il progetto in corso ha modifiche non salvate. Vuoi davvero iniziarne uno nuovo?')) return;
  nuovoProgetto();
  location.href = PRIMA_VIDEATA;
});

document.getElementById('apri').addEventListener('click', async () => {
  try {
    if (await apriProgetto()) location.href = PRIMA_VIDEATA;
  } catch (errore) {
    alert(`Impossibile aprire il progetto:\n${errore}`);
  }
});

bottoneContinua.addEventListener('click', () => {
  location.href = PRIMA_VIDEATA;
});
