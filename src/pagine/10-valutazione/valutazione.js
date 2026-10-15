// Videata 10 - Modello di valutazione (cap. 16-20)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { getProgetto, leggi, scrivi, onCambio } from '../../comune/stato.js';
import { leggiNumero, perCasella, formattaConUnita } from '../../comune/numeri.js';
import {
  CALCOLI,
  VOCI_COSTO,
  numeroAnni,
  percentualiVoce,
  sommaPercentuali,
  importiPerAnno,
  flussiNetti,
} from '../../comune/calcoli.js';

montaLayout(9);

const euro = (valore) => formattaConUnita(valore, '€');

// Voci da distribuire negli anni: prima i ricavi, poi tutte le voci di costo.
function vociFlussi(p) {
  return [
    { id: 'ricavi', voce: 'Ricavi', totale: CALCOLI.ricaviComplessivi(p), ricavo: true },
    ...VOCI_COSTO.map((voce) => ({ id: voce.id, voce: voce.voce, origine: voce.origine, totale: voce.valore(p) })),
  ];
}

// ---------- Cap. 16: suggerimento sul modello ----------
function aggiornaSuggerimento() {
  const box = document.getElementById('suggerimento-modello');
  const durata = leggi('valutazione.durata');
  if (durata == null) {
    box.hidden = true;
    return;
  }
  const consigliato = durata > 3 ? 'pluri' : 'mono';
  const scelto = leggi('valutazione.modello');
  box.hidden = false;
  box.className = `controllo ${scelto && scelto !== consigliato ? 'attenzione' : 'ok'}`;
  box.textContent =
    consigliato === 'pluri'
      ? `Con una durata di ${durata} anni è più appropriato il modello pluri-periodale.`
      : `Con una durata di ${durata} anni può essere utilizzato il modello mono-periodale.`;
}

// ---------- Cap. 17.2: tabella dei costi (sola lettura) ----------
function disegnaCostiMono() {
  const p = getProgetto();
  const righe = VOCI_COSTO.map(
    (voce) => `<tr>
      <td class="fissa">${voce.voce} <small class="origine-riga">${voce.origine}</small></td>
      <td class="numero collegata">${euro(voce.valore(p))}</td>
    </tr>`,
  ).join('');
  document.getElementById('tabella-costi-mono').innerHTML = `
    <table class="tabella-dati">
      <thead><tr><th>Voce</th><th class="numero">Importo <small>(€)</small></th></tr></thead>
      <tbody>${righe}</tbody>
      <tfoot><tr><td><strong>Subtotale</strong></td><td class="numero">${euro(CALCOLI.subtotaleCosti(p))}</td></tr></tfoot>
    </table>`;
}

// ---------- Cap. 18: distribuzione percentuale negli anni ----------
let anniDisegnati = null;

function intestazioneAnni(n, prima, dopo) {
  const anni = Array.from({ length: n + 1 }, (_, anno) => `<th class="numero">Anno ${anno}</th>`).join('');
  return `<thead><tr><th>${prima}</th>${anni}${dopo}</tr></thead>`;
}

function salvaPercentuale(id, anno, valore) {
  const distribuzione = { ...leggi('valutazione.distribuzione') };
  const elenco = percentualiVoce(getProgetto(), id);
  elenco[anno] = valore;
  distribuzione[id] = elenco;
  scrivi('valutazione.distribuzione', distribuzione);
}

function dividiInPartiUguali(id) {
  const n = numeroAnni(getProgetto()) + 1;
  const quota = Math.floor((100 / n) * 100) / 100;
  const elenco = Array.from({ length: n }, (_, anno) => (anno === n - 1 ? Math.round((100 - quota * (n - 1)) * 100) / 100 : quota));
  scrivi('valutazione.distribuzione', { ...leggi('valutazione.distribuzione'), [id]: elenco });
  disegnaDistribuzione();
}

function disegnaDistribuzione() {
  const p = getProgetto();
  const n = numeroAnni(p);
  anniDisegnati = n;

  const tabella = document.createElement('table');
  tabella.className = 'tabella-dati tabella-anni';
  tabella.innerHTML = `${intestazioneAnni(n, 'Voce', '<th class="numero">Totale</th><th class="numero">Somma %</th><th></th>')}<tbody></tbody>`;
  const corpo = tabella.querySelector('tbody');

  vociFlussi(p).forEach((voce) => {
    const tr = document.createElement('tr');
    tr.dataset.voce = voce.id;
    tr.insertAdjacentHTML('beforeend', `<td class="fissa">${voce.voce}</td>`);

    percentualiVoce(p, voce.id).forEach((percentuale, anno) => {
      const td = document.createElement('td');
      const casella = document.createElement('input');
      casella.type = 'text';
      casella.inputMode = 'decimal';
      casella.placeholder = '%';
      casella.value = perCasella(percentuale);
      casella.addEventListener('input', () => salvaPercentuale(voce.id, anno, leggiNumero(casella.value)));
      td.appendChild(casella);
      tr.appendChild(td);
    });

    tr.insertAdjacentHTML('beforeend', '<td class="numero collegata totale-voce"></td><td class="numero somma-voce"></td>');
    const td = document.createElement('td');
    const dividi = document.createElement('button');
    dividi.type = 'button';
    dividi.className = 'bottone-icona';
    dividi.title = 'Dividi in parti uguali su tutti gli anni';
    dividi.textContent = '÷';
    dividi.addEventListener('click', () => dividiInPartiUguali(voce.id));
    td.appendChild(dividi);
    tr.appendChild(td);

    corpo.appendChild(tr);
  });

  document.getElementById('tabella-distribuzione').replaceChildren(tabella);
  aggiornaDistribuzione();
}

// Aggiorna solo i testi (totali e somme) senza ridisegnare le caselle.
function aggiornaDistribuzione() {
  const p = getProgetto();
  vociFlussi(p).forEach((voce) => {
    const tr = document.querySelector(`#tabella-distribuzione tr[data-voce="${voce.id}"]`);
    if (!tr) return;
    tr.querySelector('.totale-voce').textContent = euro(voce.totale);
    const somma = sommaPercentuali(p, voce.id);
    const cella = tr.querySelector('.somma-voce');
    const ok = Math.abs(somma - 100) < 0.01 || (!somma && !voce.totale);
    cella.textContent = `${formattaConUnita(somma, '%')}${ok ? ' ✓' : ' ⚠'}`;
    cella.className = `numero somma-voce ${ok ? 'somma-ok' : 'somma-errata'}`;
  });
}

// ---------- Cap. 18-20: importi anno per anno, flusso netto, valori attuali ----------
function disegnaFlussi() {
  const p = getProgetto();
  const n = numeroAnni(p);
  const tasso = (p.valutazione.tasso ?? 0) / 100;

  const cella = (valore) => `<td class="numero${valore < 0 ? ' negativo' : ''}">${euro(valore)}</td>`;
  const riga = (etichetta, valori, classe = '') =>
    `<tr class="${classe}"><td class="fissa">${etichetta}</td>${valori.map(cella).join('')}${cella(valori.reduce((a, b) => a + b, 0))}</tr>`;

  const voci = vociFlussi(p);
  const righeVoci = voci
    .map((voce) => {
      const importi = importiPerAnno(p, voce.id, voce.totale || 0).map((importo) => (voce.ricavo ? importo : -importo));
      return riga(voce.ricavo ? 'Ricavi' : `– ${voce.voce}`, importi);
    })
    .join('');

  const flussi = flussiNetti(p);
  const attuali = flussi.map((flusso, anno) => flusso / (1 + tasso) ** anno);
  const fattori = flussi.map((_, anno) => 1 / (1 + tasso) ** anno);

  document.getElementById('tabella-flussi').innerHTML = `
    <table class="tabella-dati tabella-anni">
      ${intestazioneAnni(n, 'Voce', '<th class="numero">Totale</th>')}
      <tbody>
        ${righeVoci}
        ${riga('Flusso netto FCₜ', flussi, 'flusso')}
        <tr class="secondaria"><td class="fissa">Fattore di sconto 1/(1+r)ᵗ</td>${fattori.map((f) => `<td class="numero">${f.toFixed(4).replace('.', ',')}</td>`).join('')}<td></td></tr>
        ${riga('Valore attuale PVₜ', attuali, 'flusso')}
      </tbody>
    </table>`;
}

// ---------- Colore del risultato: rosso se negativo ----------
function aggiornaColori() {
  const p = getProgetto();
  document.getElementById('box-saldo').classList.toggle('negativo', CALCOLI.saldoMono(p) < 0);
  document.getElementById('box-van').classList.toggle('negativo', CALCOLI.van(p) < 0);
}

collegaCampi();

function aggiornaTutto() {
  aggiornaSuggerimento();
  disegnaCostiMono();
  if (numeroAnni(getProgetto()) !== anniDisegnati) disegnaDistribuzione();
  else aggiornaDistribuzione();
  disegnaFlussi();
  aggiornaColori();
}

disegnaDistribuzione();
aggiornaTutto();
onCambio(aggiornaTutto);
