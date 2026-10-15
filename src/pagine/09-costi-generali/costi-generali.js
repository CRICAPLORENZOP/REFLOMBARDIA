// Videata 9 - Costi generali (cap. 13), soft costs (cap. 14), commercializzazione (cap. 15)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';
import { getProgetto, onCambio } from '../../comune/stato.js';
import {
  CALCOLI,
  importoSoftCostAutomatico,
  baseCommercializzazione,
  importoCommercializzazione,
} from '../../comune/calcoli.js';

montaLayout(8);

creaTabella(document.getElementById('tabella-soft-costs'), {
  percorso: 'softCosts',
  righeFisse: true,
  colonne: [
    { chiave: 'voce', titolo: 'Voce', fissa: true },
    { chiave: 'percentuale', titolo: '% su costruzione', tipo: 'numero', unita: '%' },
    {
      chiave: 'importo',
      titolo: 'Importo',
      tipo: 'numero',
      unita: '€',
      totale: true,
      predefinito: (riga) => importoSoftCostAutomatico(getProgetto(), riga),
    },
  ],
});

creaTabella(document.getElementById('tabella-commercializzazione'), {
  percorso: 'commercializzazione',
  righeFisse: true,
  colonne: [
    { chiave: 'voce', titolo: 'Voce', fissa: true },
    {
      chiave: 'base',
      titolo: 'Base',
      tipo: 'numero',
      unita: '€',
      predefinito: (riga) => baseCommercializzazione(getProgetto(), riga),
    },
    { chiave: 'percentuale', titolo: '%', tipo: 'numero', unita: '%' },
    { chiave: 'importo', titolo: 'Importo', unita: '€', totale: true, calcolo: (riga) => importoCommercializzazione(getProgetto(), riga) },
  ],
});

function aggiornaAvvisoScomputo(p) {
  document.getElementById('avviso-scomputo').hidden = !CALCOLI.scomputoEccedente(p);
}

collegaCampi();
aggiornaAvvisoScomputo(getProgetto());
onCambio(aggiornaAvvisoScomputo);
