// Costruisce le parti comuni a tutte le videate:
// barra in alto (salva/apri), elenco dei passi a sinistra, pulsanti Indietro/Avanti in basso.

import { leggi, onCambio, haModifiche, getPercorsoFile, nuovoProgetto } from './stato.js';
import { salvaProgetto, apriProgetto, nomeFile } from './file.js';
import { montaAiuti } from './tooltip.js';

// Elenco delle videate. "pronto: false" = videata non ancora realizzata.
export const PASSI = [
  { titolo: 'Frontespizio e soggetti', capitoli: 'Cap. 1–2', file: '01-frontespizio/frontespizio.html', pronto: true },
  { titolo: 'Area e urbanistica', capitoli: 'Cap. 3–4', file: '02-area/area.html', pronto: true },
  { titolo: 'Stato di fatto', capitoli: 'Cap. 5', file: '03-stato-fatto/stato-fatto.html', pronto: true },
  { titolo: 'Stato di progetto', capitoli: 'Cap. 6', file: '04-stato-progetto/stato-progetto.html', pronto: true },
  { titolo: 'Opere pubbliche e cessioni', capitoli: 'Cap. 7–8', file: '05-opere/opere.html', pronto: true },
  { titolo: 'Mercato immobiliare', capitoli: 'Cap. 9', file: '06-mercato/mercato.html', pronto: true },
  { titolo: 'Ricavi', capitoli: 'Cap. 10', file: '07-ricavi/ricavi.html', pronto: true },
  { titolo: 'Costo area e trasformazione', capitoli: 'Cap. 11–12', file: '08-costi-trasformazione/costi-trasformazione.html', pronto: true },
  { titolo: 'Costi generali e commerciali', capitoli: 'Cap. 13–15', file: '09-costi-generali/costi-generali.html', pronto: true },
  { titolo: 'Modello di valutazione', capitoli: 'Cap. 16–20', file: '10-valutazione/valutazione.html', pronto: true },
  { titolo: 'Quadro economico e contributo', capitoli: 'Cap. 21–23', file: '11-quadro-economico/quadro-economico.html', pronto: true },
  { titolo: 'Sensitività e conclusioni', capitoli: 'Cap. 24–25', file: '12-sensitivita/sensitivita.html', pronto: true },
  { titolo: 'Riepilogo ed esportazione', capitoli: 'Cap. 26–28', file: '13-riepilogo/riepilogo.html', pronto: true },
];

// Le videate stanno tutte in src/pagine/<cartella>/, quindi i collegamenti sono relativi a lì.
const percorsoPasso = (passo) => `../${passo.file}`;
const PAGINA_INIZIALE = '../../index.html';

function disegnaIntestazione() {
  const intestazione = document.getElementById('intestazione');
  intestazione.innerHTML = `
    <a class="marchio" href="${PAGINA_INIZIALE}" title="Torna alla pagina iniziale">REF <span>Lombardia</span></a>
    <div class="info-progetto">
      <span class="nome-progetto"></span>
      <span class="nome-file"></span>
    </div>
    <div class="azioni-file">
      <button type="button" class="bottone secondario" data-azione="nuovo">Nuovo</button>
      <button type="button" class="bottone secondario" data-azione="apri">Apri…</button>
      <button type="button" class="bottone secondario" data-azione="salva-nome">Salva con nome…</button>
      <button type="button" class="bottone" data-azione="salva">Salva</button>
    </div>`;

  intestazione.querySelector('[data-azione="nuovo"]').addEventListener('click', () => {
    if (haModifiche() && !confirm('Ci sono modifiche non salvate. Vuoi davvero iniziare un nuovo progetto?')) return;
    nuovoProgetto();
    location.href = percorsoPasso(PASSI[0]);
  });
  intestazione.querySelector('[data-azione="apri"]').addEventListener('click', async () => {
    if (haModifiche() && !confirm('Ci sono modifiche non salvate. Vuoi davvero aprire un altro progetto?')) return;
    if (await esegui(apriProgetto)) location.reload();
  });
  intestazione.querySelector('[data-azione="salva"]').addEventListener('click', () => esegui(() => salvaProgetto(false)));
  intestazione.querySelector('[data-azione="salva-nome"]').addEventListener('click', () => esegui(() => salvaProgetto(true)));

  aggiornaIntestazione();
  onCambio(aggiornaIntestazione);
}

async function esegui(azione) {
  try {
    return await azione();
  } catch (errore) {
    alert(`Si è verificato un errore:\n${errore}`);
    return false;
  }
}

function aggiornaIntestazione() {
  const intestazione = document.getElementById('intestazione');
  const denominazione = leggi('frontespizio.denominazione');
  intestazione.querySelector('.nome-progetto').textContent = denominazione || 'Nuovo progetto';
  const file = nomeFile(getPercorsoFile()) || 'non ancora salvato';
  intestazione.querySelector('.nome-file').textContent = `${file}${haModifiche() ? ' • modifiche non salvate' : ''}`;
  intestazione.classList.toggle('modificato', haModifiche());
}

function disegnaPassi(indiceCorrente) {
  const elenco = PASSI.map((passo, indice) => {
    const classi = ['passo'];
    if (indice === indiceCorrente) classi.push('attivo');
    if (!passo.pronto) classi.push('non-pronto');
    const contenuto = `<span class="numero-passo">${indice + 1}</span>
      <span class="testo-passo"><strong>${passo.titolo}</strong><small>${passo.pronto ? passo.capitoli : `${passo.capitoli} · in arrivo`}</small></span>`;
    return passo.pronto
      ? `<li><a class="${classi.join(' ')}" href="${percorsoPasso(passo)}">${contenuto}</a></li>`
      : `<li><span class="${classi.join(' ')}">${contenuto}</span></li>`;
  }).join('');
  document.getElementById('passi').innerHTML = `<ol>${elenco}</ol>`;
  disegnaDocumenti();
}

// PDF della normativa, aperti dal fondo della barra laterale.
const DOCUMENTI = [
  { nome: 'delibera', titolo: 'Delibera D.G.R. XI/7729', file: 'delibera-dgr-xi-7729.pdf' },
  { nome: 'allegato-a', titolo: 'Allegato A', file: 'allegato-a.pdf' },
];

function disegnaDocumenti() {
  const pulsanti = DOCUMENTI.map(
    (documento) =>
      `<button type="button" class="documento" data-documento="${documento.nome}" data-file="${documento.file}">${documento.titolo}</button>`,
  ).join('');
  document.getElementById('passi').insertAdjacentHTML(
    'beforeend',
    `<div class="documenti"><p>Normativa</p>${pulsanti}</div>`,
  );
  document.querySelectorAll('.documento').forEach((pulsante) => {
    pulsante.addEventListener('click', () => apriDocumento(pulsante.dataset.documento, pulsante.dataset.file));
  });
}

// Nell'app si apre il programma PDF del computer. Nel browser si apre una nuova scheda.
async function apriDocumento(nome, file) {
  const tauri = window.__TAURI__;
  if (tauri?.core?.invoke) {
    try {
      await tauri.core.invoke('apri_documento', { nome });
    } catch (errore) {
      alert(`Non riesco ad aprire il documento:\n${errore}`);
    }
    return;
  }
  window.open(`../../documenti/${file}`, '_blank', 'noopener');
}

function disegnaPiede(indiceCorrente) {
  // Indietro/Avanti saltano le videate non ancora realizzate.
  const precedente = PASSI.slice(0, indiceCorrente).reverse().find((passo) => passo.pronto);
  const successivo = PASSI.slice(indiceCorrente + 1).find((passo) => passo.pronto);
  const bottone = (passo, testo, classe) =>
    passo && passo.pronto
      ? `<a class="bottone ${classe}" href="${percorsoPasso(passo)}">${testo}</a>`
      : `<span class="bottone ${classe} disabilitato">${testo}</span>`;

  document.getElementById('piede').innerHTML = `
    ${bottone(precedente, '← Indietro', 'secondario')}
    <span class="contatore">Passo ${indiceCorrente + 1} di ${PASSI.length}</span>
    ${bottone(successivo, 'Avanti →', '')}`;
}

// Da chiamare in ogni videata: montaLayout(0) per il passo 1, montaLayout(1) per il passo 2, ecc.
export function montaLayout(indicePasso) {
  disegnaIntestazione();
  disegnaPassi(indicePasso);
  disegnaPiede(indicePasso);
  montaAiuti();

  // Ctrl+S per salvare
  document.addEventListener('keydown', (evento) => {
    if (evento.ctrlKey && evento.key.toLowerCase() === 's') {
      evento.preventDefault();
      esegui(() => salvaProgetto(false));
    }
  });
}
