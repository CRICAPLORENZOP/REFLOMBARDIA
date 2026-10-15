// Videata 7 - Determinazione dei ricavi (cap. 10)
// La tabella 10.1 è interamente calcolata da 6.2 (superfici) e 9.3 (valori).

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabellaCalcolata } from '../../comune/tabelle.js';
import { getProgetto, onCambio } from '../../comune/stato.js';
import { righeRicavi } from '../../comune/calcoli.js';

montaLayout(6);

creaTabellaCalcolata(document.getElementById('tabella-ricavi'), {
  righe: righeRicavi,
  colonne: [
    { chiave: 'destinazione', titolo: 'Destinazione', testo: true },
    { chiave: 'superficie', titolo: 'Superficie', tipo: 'numero', unita: 'm²', totale: true },
    { chiave: 'valore', titolo: 'Valore', tipo: 'numero', unita: '€/m²' },
    { chiave: 'ricavo', titolo: 'Ricavo', tipo: 'numero', unita: '€', totale: true, classe: 'calcolato' },
  ],
});

collegaCampi();

// Avvisa se una destinazione ha la superficie ma non il valore (o viceversa): il ricavo resterebbe vuoto.
const controllo = document.getElementById('controllo-ricavi');
function aggiornaControllo() {
  const incomplete = righeRicavi(getProgetto()).filter((r) => (r.superficie != null) !== (r.valore != null));
  controllo.hidden = incomplete.length === 0;
  controllo.textContent = incomplete
    .map((r) =>
      r.valore == null
        ? `⚠ ${r.destinazione}: manca il valore adottato (passo 6, cap. 9.3).`
        : `⚠ ${r.destinazione}: manca la superficie commerciale (passo 4, cap. 6.2).`,
    )
    .join('  ');
}
aggiornaControllo();
onCambio(aggiornaControllo);
