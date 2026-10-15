// Tabelle collegate ai dati del progetto.
//
// 1) creaTabella: tabella da compilare.
//    creaTabella(document.getElementById('tabella-catasto'), {
//      percorso: 'area.catastale',
//      colonne: [
//        { chiave: 'foglio', titolo: 'Foglio' },
//        { chiave: 'superficie', titolo: 'Superficie', tipo: 'numero', unita: 'm²', totale: true },
//      ],
//      nuovaRiga: () => ({ foglio: '', superficie: null }),
//    });
//
//    Tipi di colonna:
//    - normale:                 casella da compilare
//    - tipo: 'scelta'           menu a tendina; le voci stanno in opzioni: ['A', 'B']
//    - fissa: true              testo fisso (es. "Residenziale")
//    - calcolo: (riga) => ...   valore calcolato, non si compila
//    - collegato: (riga) => ... valore preso da un'altra videata; se restituisce
//                               undefined la cella torna una casella normale
//    - predefinito: (riga) => . valore proposto automaticamente: si vede in grigio
//                               nella casella e vale finché la casella resta vuota
//
// 2) creaTabellaCalcolata: tabella di sola lettura, interamente calcolata.

import { leggi, scrivi, onCambio, getProgetto } from './stato.js';
import { leggiNumero, perCasella, formatta, formattaConUnita, somma } from './numeri.js';

const isNumerica = (colonna) => colonna.tipo === 'numero' || !!colonna.calcolo || !!colonna.collegato;

function intestazioneColonne(colonne, conAzioni) {
  const celle = colonne
    .map((colonna) => {
      const unita = colonna.unita ? ` <small>(${colonna.unita})</small>` : '';
      const aiuto = colonna.aiuto ? ` data-aiuto="${colonna.aiuto}"` : '';
      return `<th class="${isNumerica(colonna) ? 'numero' : ''}"${aiuto}>${colonna.titolo}${unita}</th>`;
    })
    .join('');
  return `<thead><tr>${celle}${conAzioni ? '<th></th>' : ''}</tr></thead>`;
}

function rigaTotali(colonne, etichetta, conAzioni) {
  const celle = colonne
    .map((colonna, c) => {
      if (c === 0) return `<td><strong>${etichetta}</strong></td>`;
      return colonna.totale ? `<td class="numero" data-totale="${c}"></td>` : '<td></td>';
    })
    .join('');
  return `<tfoot><tr>${celle}${conAzioni ? '<td></td>' : ''}</tr></tfoot>`;
}

function testoCella(valore, unita) {
  return valore == null ? '—' : formattaConUnita(valore, unita);
}

export function creaTabella(contenitore, opzioni) {
  const { percorso, colonne, nuovaRiga, righeFisse = false, etichettaTotale = 'Totale' } = opzioni;
  const haTotali = colonne.some((colonna) => colonna.totale);

  function righe() {
    return leggi(percorso) || [];
  }

  function salva() {
    scrivi(percorso, righe());
  }

  function valoreCollegato(riga, colonna) {
    return colonna.collegato ? colonna.collegato(riga) : undefined;
  }

  function valoreCella(riga, colonna) {
    if (colonna.calcolo) return colonna.calcolo(riga);
    const collegato = valoreCollegato(riga, colonna);
    if (collegato !== undefined) return collegato;
    return riga[colonna.chiave] ?? (colonna.predefinito ? colonna.predefinito(riga) : null);
  }

  function aggiornaPredefinito(casella, riga, colonna) {
    const proposto = colonna.predefinito(riga);
    casella.placeholder = proposto != null ? `${formatta(proposto)} (auto)` : colonna.segnaposto || '';
  }

  function aggiornaCalcolati() {
    contenitore.querySelectorAll('tbody tr').forEach((tr, indice) => {
      const riga = righe()[indice];
      colonne.forEach((colonna, c) => {
        const cella = tr.children[c];
        const casella = cella.querySelector('input');
        if (casella && colonna.predefinito) aggiornaPredefinito(casella, riga, colonna);
        if (cella.classList.contains('calcolato') || cella.classList.contains('collegata')) {
          const valore = valoreCella(riga, colonna);
          cella.textContent = testoCella(valore, colonna.unita);
          cella.classList.toggle('vuoto', valore == null);
        }
      });
    });
    contenitore.querySelectorAll('tfoot [data-totale]').forEach((cella) => {
      const colonna = colonne[Number(cella.dataset.totale)];
      const valori = righe().map((riga) => ({ v: valoreCella(riga, colonna) }));
      cella.textContent = formattaConUnita(somma(valori, 'v'), colonna.unita);
    });
  }

  function creaScelta(riga, colonna) {
    const scelta = document.createElement('select');
    const vuota = document.createElement('option');
    vuota.value = '';
    vuota.textContent = colonna.segnaposto || '— scegli —';
    scelta.appendChild(vuota);
    (colonna.opzioni || []).forEach((opzione) => {
      const elemento = document.createElement('option');
      elemento.value = opzione;
      elemento.textContent = opzione;
      scelta.appendChild(elemento);
    });
    scelta.value = riga[colonna.chiave] ?? '';
    scelta.addEventListener('change', () => {
      riga[colonna.chiave] = scelta.value;
      salva();
      aggiornaCalcolati();
    });
    return scelta;
  }

  function creaCasella(riga, colonna) {
    const casella = document.createElement('input');
    casella.type = 'text';
    if (colonna.tipo === 'numero') {
      casella.inputMode = 'decimal';
      casella.classList.add('numero');
      casella.value = perCasella(riga[colonna.chiave]);
    } else {
      casella.value = riga[colonna.chiave] ?? '';
    }
    if (colonna.segnaposto) casella.placeholder = colonna.segnaposto;
    casella.addEventListener('input', () => {
      riga[colonna.chiave] = colonna.tipo === 'numero' ? leggiNumero(casella.value) : casella.value;
      salva();
      aggiornaCalcolati();
    });
    return casella;
  }

  function creaCella(riga, colonna) {
    const td = document.createElement('td');
    if (colonna.calcolo) {
      td.className = 'numero calcolato';
    } else if (valoreCollegato(riga, colonna) !== undefined) {
      td.className = 'numero collegata';
      if (colonna.titoloCollegato) td.title = colonna.titoloCollegato;
    } else if (colonna.tipo === 'scelta') {
      td.appendChild(creaScelta(riga, colonna));
    } else if (colonna.fissa) {
      td.className = 'fissa';
      td.textContent = riga[colonna.chiave];
    } else {
      td.appendChild(creaCasella(riga, colonna));
    }
    return td;
  }

  function creaBottoneElimina(indice) {
    const td = document.createElement('td');
    td.className = 'azioni';
    const elimina = document.createElement('button');
    elimina.type = 'button';
    elimina.className = 'bottone-icona';
    elimina.title = 'Elimina riga';
    elimina.textContent = '✕';
    elimina.addEventListener('click', () => {
      righe().splice(indice, 1);
      salva();
      disegna();
    });
    td.appendChild(elimina);
    return td;
  }

  function disegna() {
    const tabella = document.createElement('table');
    tabella.className = 'tabella-dati';
    tabella.innerHTML = `${intestazioneColonne(colonne, !righeFisse)}<tbody></tbody>`;

    const corpo = tabella.querySelector('tbody');
    righe().forEach((riga, indice) => {
      const tr = document.createElement('tr');
      colonne.forEach((colonna) => tr.appendChild(creaCella(riga, colonna)));
      if (!righeFisse) tr.appendChild(creaBottoneElimina(indice));
      corpo.appendChild(tr);
    });

    if (haTotali) tabella.insertAdjacentHTML('beforeend', rigaTotali(colonne, etichettaTotale, !righeFisse));

    contenitore.replaceChildren(tabella);

    if (!righeFisse) {
      const aggiungi = document.createElement('button');
      aggiungi.type = 'button';
      aggiungi.className = 'bottone secondario';
      aggiungi.textContent = '+ Aggiungi riga';
      aggiungi.addEventListener('click', () => {
        righe().push(nuovaRiga());
        salva();
        disegna();
      });
      contenitore.appendChild(aggiungi);
    }

    aggiornaCalcolati();
  }

  disegna();
}

// Tabella di sola lettura: le righe vengono da una funzione che le calcola dal progetto.
// creaTabellaCalcolata(contenitore, {
//   righe: (p) => [...],
//   colonne: [{ chiave: 'destinazione', titolo: 'Destinazione', testo: true }, { chiave: 'ricavo', titolo: 'Ricavo', unita: '€', totale: true }],
// });
export function creaTabellaCalcolata(contenitore, opzioni) {
  const { righe, colonne, etichettaTotale = 'Totale' } = opzioni;
  const haTotali = colonne.some((colonna) => colonna.totale);

  function disegna() {
    const elenco = righe(getProgetto());
    const corpo = elenco
      .map((riga) => {
        const celle = colonne
          .map((colonna) => {
            const valore = riga[colonna.chiave];
            if (colonna.testo) return `<td class="fissa">${valore ?? ''}</td>`;
            const classe = `numero ${colonna.classe || 'collegata'}${valore == null ? ' vuoto' : ''}`;
            return `<td class="${classe}">${testoCella(valore, colonna.unita)}</td>`;
          })
          .join('');
        return `<tr>${celle}</tr>`;
      })
      .join('');

    let piede = '';
    if (haTotali) {
      const celle = colonne
        .map((colonna, c) => {
          if (c === 0) return `<td><strong>${etichettaTotale}</strong></td>`;
          return colonna.totale ? `<td class="numero">${formattaConUnita(somma(elenco, colonna.chiave), colonna.unita)}</td>` : '<td></td>';
        })
        .join('');
      piede = `<tfoot><tr>${celle}</tr></tfoot>`;
    }

    contenitore.innerHTML = `<table class="tabella-dati">${intestazioneColonne(colonne, false)}<tbody>${corpo}</tbody>${piede}</table>`;
  }

  disegna();
  onCambio(disegna);
}
