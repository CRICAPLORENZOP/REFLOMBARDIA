// Videata 6 - Mercato immobiliare di riferimento (cap. 9)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';

montaLayout(5);

creaTabella(document.getElementById('tabella-quotazioni'), {
  percorso: 'mercato.quotazioni',
  colonne: [
    { chiave: 'fonte', titolo: 'Fonte', segnaposto: 'es. OMI' },
    { chiave: 'zona', titolo: 'Zona', segnaposto: 'es. C1' },
    { chiave: 'destinazione', titolo: 'Destinazione' },
    { chiave: 'minimo', titolo: 'Valore min.', tipo: 'numero', unita: '€/m²' },
    { chiave: 'massimo', titolo: 'Valore max', tipo: 'numero', unita: '€/m²' },
    {
      chiave: 'medio',
      titolo: 'Valore medio',
      unita: '€/m²',
      calcolo: (riga) => (riga.minimo != null && riga.massimo != null ? (riga.minimo + riga.massimo) / 2 : null),
    },
  ],
  nuovaRiga: () => ({ fonte: '', zona: '', destinazione: '', minimo: null, massimo: null }),
});

creaTabella(document.getElementById('tabella-valori'), {
  percorso: 'mercato.valoriAdottati',
  righeFisse: true,
  colonne: [
    { chiave: 'destinazione', titolo: 'Destinazione', fissa: true },
    { chiave: 'valore', titolo: 'Valore adottato', tipo: 'numero', unita: '€/m²' },
  ],
});

collegaCampi();
