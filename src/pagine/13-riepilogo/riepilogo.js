// Videata 13 - Quadro finale degli input (cap. 26), allegati (cap. 27), sottoscrizione (cap. 28)
// ed esportazione della relazione completa in Word e PDF.

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { getProgetto, onCambio, scrivi } from '../../comune/stato.js';
import { CALCOLI, isPluri } from '../../comune/calcoli.js';
import {
  ALLEGATI,
  VOCI_INPUT,
  costruisciRelazione,
  contaMancanti,
  fontePredefinita,
  valoreInput,
} from '../../comune/relazione.js';
import { relazioneInHtml } from '../../comune/esporta-html.js';
import { creaDocx } from '../../comune/esporta-docx.js';
import { salvaEsportazione } from '../../comune/file.js';

montaLayout(12);

// ---------- Cap. 26: la tabella viene disegnata una volta; poi si aggiornano solo i valori ----------
function disegnaTabellaInput() {
  const p = getProgetto();
  const righe = VOCI_INPUT.map(
    (voce) => `
      <tr data-id="${voce.id}">
        <td class="fissa">${voce.input}</td>
        <td class="numero calcolato valore"></td>
        <td class="unita">${voce.unita}</td>
        <td><input type="text" class="fonte" value="${(p.riepilogo.fonti[voce.id] || '').replace(/"/g, '&quot;')}" /></td>
      </tr>`,
  ).join('');
  const contenitore = document.getElementById('tabella-input');
  contenitore.innerHTML = `
    <table class="tabella-dati quadro-input">
      <thead><tr><th>Input</th><th class="numero">Valore</th><th>Unità</th><th>Fonte</th></tr></thead>
      <tbody>${righe}</tbody>
    </table>`;
  contenitore.querySelectorAll('tr[data-id]').forEach((tr) => {
    tr.querySelector('.fonte').addEventListener('input', (evento) => {
      scrivi(`riepilogo.fonti.${tr.dataset.id}`, evento.target.value.trim());
    });
  });
}

function aggiornaTabellaInput(p) {
  document.querySelectorAll('#tabella-input tr[data-id]').forEach((tr) => {
    const voce = VOCI_INPUT.find((v) => v.id === tr.dataset.id);
    const valore = valoreInput(p, voce);
    const cella = tr.querySelector('.valore');
    cella.textContent = valore;
    cella.classList.toggle('vuoto', valore === '[●]');
    tr.querySelector('.fonte').placeholder = fontePredefinita(p, voce);
  });
}

// ---------- Cap. 27: allegati ----------
function allegatiSuggeriti(p) {
  const suggeriti = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'P', 'Q'];
  if (CALCOLI.opereAggiuntive(p) + CALCOLI.standardQualitativi(p) + CALCOLI.urbanizzazioni(p) > 0) suggeriti.push('O');
  if (isPluri(p)) suggeriti.push('R');
  if (p.statoFatto.bonifiche === 'si') suggeriti.push('S');
  return suggeriti;
}

function disegnaAllegati() {
  document.getElementById('elenco-allegati').innerHTML = ALLEGATI.map(
    (a) => `<label><input type="checkbox" data-campo="allegati.${a.id}" /> <strong>${a.id}.</strong> ${a.testo}</label>`,
  ).join('');

  document.getElementById('spunta-suggeriti').addEventListener('click', () => {
    allegatiSuggeriti(getProgetto()).forEach((id) => {
      scrivi(`allegati.${id}`, true);
      document.querySelector(`[data-campo="allegati.${id}"]`).checked = true;
    });
  });
}

function aggiornaSuggeriti(p) {
  const extra = allegatiSuggeriti(p).filter((id) => ['O', 'R', 'S'].includes(id));
  document.getElementById('testo-suggeriti').textContent = extra.length
    ? `In base ai tuoi dati sono suggeriti anche: ${extra.join(', ')}.`
    : '';
}

// ---------- Esportazione e anteprima ----------
function aggiornaRelazione() {
  const p = getProgetto();
  const blocchi = costruisciRelazione(p);
  document.getElementById('anteprima').innerHTML = relazioneInHtml(blocchi);

  const mancanti = contaMancanti(blocchi);
  const controllo = document.getElementById('controllo-mancanti');
  controllo.className = `controllo ${mancanti ? 'attenzione' : 'ok'}`;
  controllo.textContent = mancanti
    ? `Nella relazione ci sono ancora ${mancanti} dati da compilare: nell'anteprima qui sotto sono evidenziati in giallo [●]. Puoi esportare lo stesso e completarli dopo in Word.`
    : 'La relazione è completa: non ci sono dati mancanti.';
  return blocchi;
}

function mostraEsito(testo) {
  const esito = document.getElementById('esito-esportazione');
  esito.textContent = testo;
  esito.hidden = false;
}

async function esportaWord() {
  try {
    const percorso = await salvaEsportazione(creaDocx(aggiornaRelazione()), {
      estensione: 'docx',
      descrizione: 'documento Word',
      tipoMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    if (percorso) mostraEsito(`Documento Word creato: ${percorso}`);
  } catch (errore) {
    alert(`Non è stato possibile creare il documento Word:\n${errore}`);
  }
}

function esportaPdf() {
  aggiornaRelazione();
  // Il titolo della pagina diventa il nome proposto per il file PDF
  const titoloOriginale = document.title;
  const nome = (getProgetto().frontespizio.denominazione || 'Progetto REF').replace(/[\\/:*?"<>|]/g, '').trim();
  document.title = `REF - ${nome}`;
  window.print();
  document.title = titoloOriginale;
}

// L'anteprima si ricalcola poco dopo l'ultima modifica, così la scrittura resta fluida
let attesa = null;
function aggiornaTutto() {
  const p = getProgetto();
  aggiornaTabellaInput(p);
  aggiornaSuggeriti(p);
  document.getElementById('luogo-firma').placeholder = p.frontespizio.comune || '';
  clearTimeout(attesa);
  attesa = setTimeout(aggiornaRelazione, 300);
}

disegnaTabellaInput();
disegnaAllegati();
collegaCampi();
document.getElementById('esporta-word').addEventListener('click', esportaWord);
document.getElementById('esporta-pdf').addEventListener('click', esportaPdf);
aggiornaTutto();
aggiornaRelazione();
onCambio(aggiornaTutto);
