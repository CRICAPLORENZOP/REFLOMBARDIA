// Videata 12 - Analisi di sensitività (cap. 24) e conclusioni (cap. 25).
// Gli scenari sono calcolati in comune/calcoli.js, così li riusa anche l'esportazione.

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { getProgetto, onCambio } from '../../comune/stato.js';
import { formattaConUnita, formatta } from '../../comune/numeri.js';
import {
  CALCOLI,
  SCENARI,
  righeMatrice,
  colonneMatrice,
  isPluri,
  risultatoScenario,
} from '../../comune/calcoli.js';

montaLayout(11);

const euro = (valore) => formattaConUnita(valore, '€');
const classeSegno = (valore) => (valore < 0 ? 'negativo' : '');

function cellaRisultato(valore) {
  if (valore == null) return '<td class="numero vuoto">[da compilare]</td>';
  return `<td class="numero ${classeSegno(valore)}">${euro(valore)}</td>`;
}

function disegnaScenari(p, etichetta) {
  const base = CALCOLI.risultato(p);
  const righe = SCENARI.map((scenario) => {
    const valore = scenario.valore(p);
    const differenza = valore == null ? null : valore - base;
    const variazione = differenza == null || !base ? null : (differenza / Math.abs(base)) * 100;
    const nota = scenario.id === 'ritardo' ? `<small class="origine-riga">${isPluri(p) ? 'ricavi spostati di un anno' : 'stima a mano, qui sotto'}</small>` : '';
    return `
      <tr class="${scenario.id === 'base' ? 'base' : ''}">
        <td class="fissa"><span class="numero-capitolo">${scenario.capitolo}</span>${scenario.titolo(p)}${nota}</td>
        ${cellaRisultato(valore)}
        <td class="numero">${scenario.id === 'base' || differenza == null ? '—' : euro(differenza)}</td>
        <td class="numero">${variazione == null || scenario.id === 'base' ? '—' : `${formatta(variazione, 1)} %`}</td>
      </tr>`;
  }).join('');

  document.getElementById('tabella-scenari').innerHTML = `
    <table class="tabella-dati scenari">
      <thead>
        <tr>
          <th>Scenario</th>
          <th class="numero">${etichetta} <small>(€)</small></th>
          <th class="numero">Differenza dal base</th>
          <th class="numero">Variazione</th>
        </tr>
      </thead>
      <tbody>${righe}</tbody>
    </table>`;
}

function disegnaMatrice(p) {
  const colonne = colonneMatrice(p);
  const intestazione = colonne.map((colonna) => `<th class="numero">${colonna.etichetta}</th>`).join('');
  const righe = righeMatrice(p).map((riga) => {
    const celle = colonne.map((colonna) => {
      const valore = risultatoScenario(p, { ricavi: riga.fattore, costi: colonna.fattore });
      const centro = riga.fattore === 1 && colonna.fattore === 1 ? ' centro' : '';
      return `<td class="numero${centro} ${classeSegno(valore)}">${euro(valore)}</td>`;
    }).join('');
    return `<tr><th class="fissa">${riga.etichetta}</th>${celle}</tr>`;
  }).join('');

  document.getElementById('matrice').innerHTML = `
    <table class="tabella-dati matrice">
      <thead><tr><th></th>${intestazione}</tr></thead>
      <tbody>${righe}</tbody>
    </table>`;
}

function disegnaConclusioni(p) {
  const pluri = isPluri(p);
  const riga = (voce, valore, classe = '') => `<tr class="${classe}"><td>${voce}</td><td class="numero">${valore}</td></tr>`;
  const percentuale = (valore) => (valore == null ? '—' : `${formatta(valore)} %`);

  const risultati = pluri
    ? riga('VAN', euro(CALCOLI.van(p)), `forte ${classeSegno(CALCOLI.van(p))}`) +
      riga('TIR', CALCOLI.tir(p) == null ? 'non calcolabile' : percentuale(CALCOLI.tir(p)))
    : riga('Saldo economico', euro(CALCOLI.saldoMono(p)), `forte ${classeSegno(CALCOLI.saldoMono(p))}`) +
      riga('Margine', percentuale(CALCOLI.marginePercentuale(p)));

  document.getElementById('riepilogo-conclusioni').innerHTML = `
    <table class="riepilogo">
      ${riga('Ricavi complessivi', euro(CALCOLI.ricaviComplessivi(p)))}
      ${riga('Costi complessivi', euro(CALCOLI.costiComplessivi(p)))}
      ${risultati}
    </table>`;

  // Frase automatica sull'esito della sensitività (scenari 24.2-24.5)
  const tutti = SCENARI.filter((s) => s.id !== 'base').map((s) => s.valore(p));
  const valori = tutti.filter((v) => v != null);
  const negativi = valori.filter((v) => v < 0).length;
  const mancanti = tutti.length - valori.length;
  const esito = document.getElementById('esito-sensitivita');
  const nome = pluri ? 'Il VAN' : 'Il saldo';
  const avvisoMancanti = mancanti ? ' Manca ancora il valore del ritardo di 12 mesi (24.5).' : '';
  if (CALCOLI.risultato(p) < 0) {
    esito.textContent = `${nome} dello scenario base è negativo: l'operazione non risulta sostenibile alle condizioni indicate.`;
  } else if (negativi === 0) {
    esito.textContent = `${nome} resta positivo in tutti gli scenari di sensitività calcolati.${avvisoMancanti}`;
  } else {
    esito.textContent = `${nome} diventa negativo in ${negativi} ${negativi === 1 ? 'scenario' : 'scenari'} su ${valori.length}: il risultato è sensibile alle variazioni dei parametri.${avvisoMancanti}`;
  }
  esito.className = `controllo ${CALCOLI.risultato(p) >= 0 && negativi === 0 && !mancanti ? 'ok' : 'attenzione'}`;
}

function aggiornaTutto() {
  const p = getProgetto();
  const pluri = isPluri(p);
  const etichetta = pluri ? 'VAN' : 'Saldo';

  document.getElementById('avviso-modello').hidden = !!p.valutazione.modello;
  document.getElementById('scheda-ritardo-mono').hidden = pluri;
  document.getElementById('spiegazione-risultato').textContent = pluri
    ? 'Risultato = VAN (modello pluri-periodale, tasso del passo 10).'
    : 'Risultato = saldo A – B (modello mono-periodale).';

  disegnaScenari(p, etichetta);
  disegnaMatrice(p);
  disegnaConclusioni(p);
}

collegaCampi();
aggiornaTutto();
onCambio(aggiornaTutto);
