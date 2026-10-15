// Collega automaticamente i campi delle pagine HTML ai dati del progetto.
//
// <input data-campo="frontespizio.comune">                -> casella da compilare
// <input data-campo="area.sf" data-tipo="numero">         -> casella numerica
// <span data-mostra="frontespizio.comune">                -> mostra un dato inserito altrove
// <span data-mostra="calc:totaleCatastale" data-unita="m²"> -> mostra un valore calcolato
// <div data-visibile-se="statoFatto.bonifiche=si">        -> visibile solo in certe condizioni

import { leggi, scrivi, onCambio, getProgetto } from './stato.js';
import { leggiNumero, perCasella, formattaConUnita } from './numeri.js';
import { calcola } from './calcoli.js';

function collegaCampo(elemento) {
  const percorso = elemento.dataset.campo;
  const valore = leggi(percorso);

  if (elemento.type === 'checkbox') {
    elemento.checked = !!valore;
    elemento.addEventListener('change', () => scrivi(percorso, elemento.checked));
  } else if (elemento.type === 'radio') {
    elemento.checked = valore === elemento.value;
    elemento.addEventListener('change', () => {
      if (elemento.checked) scrivi(percorso, elemento.value);
    });
  } else if (elemento.dataset.tipo === 'numero') {
    elemento.value = perCasella(valore);
    elemento.inputMode = 'decimal';
    elemento.addEventListener('input', () => scrivi(percorso, leggiNumero(elemento.value)));
  } else {
    elemento.value = valore ?? '';
    const evento = elemento.tagName === 'SELECT' ? 'change' : 'input';
    elemento.addEventListener(evento, () => scrivi(percorso, elemento.value));
  }
}

function valoreDaMostrare(origine) {
  if (origine.startsWith('calc:')) return calcola(origine.slice(5), getProgetto());
  return leggi(origine);
}

function aggiornaCollegati() {
  document.querySelectorAll('[data-mostra]').forEach((elemento) => {
    const valore = valoreDaMostrare(elemento.dataset.mostra);
    const testo = typeof valore === 'number' ? formattaConUnita(valore, elemento.dataset.unita) : valore;
    elemento.textContent = testo || '[da compilare]';
    elemento.classList.toggle('vuoto', !testo);
  });

  document.querySelectorAll('[data-visibile-se]').forEach((elemento) => {
    const [percorso, atteso] = elemento.dataset.visibileSe.split('=');
    const valore = leggi(percorso);
    const visibile = atteso === undefined ? !!valore : String(valore) === atteso;
    elemento.hidden = !visibile;
  });
}

export function collegaCampi(radice = document) {
  radice.querySelectorAll('[data-campo]').forEach(collegaCampo);
  aggiornaCollegati();
  onCambio(aggiornaCollegati);
}
