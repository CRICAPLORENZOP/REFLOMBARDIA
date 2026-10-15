// Videata 2 - Area e inquadramento urbanistico (cap. 3-4)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';
import { leggi, onCambio } from '../../comune/stato.js';

montaLayout(1);

creaTabella(document.getElementById('tabella-catasto'), {
  percorso: 'area.catastale',
  colonne: [
    { chiave: 'foglio', titolo: 'Foglio' },
    { chiave: 'mappale', titolo: 'Mappale' },
    { chiave: 'subalterno', titolo: 'Subalterno' },
    { chiave: 'superficie', titolo: 'Superficie', tipo: 'numero', unita: 'm²', totale: true },
  ],
  nuovaRiga: () => ({ foglio: '', mappale: '', subalterno: '', superficie: null }),
});

creaTabella(document.getElementById('tabella-convenzione'), {
  percorso: 'urbanistica.oggettiConvenzione',
  colonne: [{ chiave: 'testo', titolo: 'Oggetto della convenzione', segnaposto: 'es. cessione aree a standard' }],
  nuovaRiga: () => ({ testo: '' }),
});

collegaCampi();

// La ST si scrive a mano solo se NON si usa il totale catastale.
const stManuale = document.getElementById('st-manuale');
function aggiornaSt() {
  stManuale.hidden = !!leggi('area.stDaCatasto');
}
aggiornaSt();
onCambio(aggiornaSt);
