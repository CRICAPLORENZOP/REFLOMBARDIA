// Videata 4 - Stato di progetto (cap. 6)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';
import { getProgetto, onCambio } from '../../comune/stato.js';
import { CALCOLI, valorePertinenza, volumeDaAltezza } from '../../comune/calcoli.js';
import { formattaConUnita } from '../../comune/numeri.js';

montaLayout(3);

creaTabella(document.getElementById('tabella-destinazioni'), {
  percorso: 'statoProgetto.destinazioni',
  righeFisse: true,
  colonne: [
    { chiave: 'destinazione', titolo: 'Destinazione', fissa: true },
    { chiave: 'slp', titolo: 'SLP/SUL', tipo: 'numero', unita: 'm²', totale: true, aiuto: 'col:slp' },
    { chiave: 'superficieCommerciale', titolo: 'Superficie commerciale', tipo: 'numero', unita: 'm²', totale: true, aiuto: 'col:superficieCommerciale' },
    { chiave: 'altezza', titolo: 'Altezza', tipo: 'numero', unita: 'm', aiuto: 'col:altezza' },
    { chiave: 'volume', titolo: 'Volume', unita: 'm³', totale: true, calcolo: volumeDaAltezza, aiuto: 'col:volume' },
    { chiave: 'unita', titolo: 'N. unità', tipo: 'numero', totale: true },
  ],
});

creaTabella(document.getElementById('tabella-pertinenze'), {
  percorso: 'statoProgetto.pertinenze',
  righeFisse: true,
  colonne: [
    { chiave: 'tipologia', titolo: 'Tipologia', fissa: true },
    { chiave: 'quantita', titolo: 'Quantità', tipo: 'numero', totale: true },
    { chiave: 'superficie', titolo: 'Superficie', tipo: 'numero', unita: 'm²', totale: true },
    {
      chiave: 'valoreUnitario',
      titolo: 'Valore unitario',
      tipo: 'numero',
      unita: '€',
      collegato: (riga) => (riga.id === 'box' ? getProgetto().mercato.valoreBox : undefined),
      titoloCollegato: 'Valore adottato al cap. 9.3 (passo 6 – Mercato immobiliare)',
      aiuto: 'col:valoreBox',
    },
    { chiave: 'valoreTotale', titolo: 'Valore totale', unita: '€', totale: true, calcolo: (riga) => valorePertinenza(getProgetto(), riga) },
  ],
});

collegaCampi();

// Controllo: la SLP di progetto non dovrebbe superare quella ammessa dal PGT (cap. 4.1)
const controlloSlp = document.getElementById('controllo-slp');
function aggiornaControlloSlp() {
  const progetto = getProgetto();
  const ammessa = CALCOLI.slpAmmessa(progetto);
  const diProgetto = CALCOLI.slpProgetto(progetto);
  if (ammessa == null || !diProgetto) {
    controlloSlp.hidden = true;
    return;
  }
  const supera = diProgetto > ammessa;
  controlloSlp.hidden = false;
  controlloSlp.className = `controllo ${supera ? 'attenzione' : 'ok'}`;
  controlloSlp.textContent = supera
    ? `⚠ La SLP di progetto (${formattaConUnita(diProgetto, 'm²')}) supera la SLP ammessa dal PGT (${formattaConUnita(ammessa, 'm²')}, cap. 4.1).`
    : `✓ SLP di progetto ${formattaConUnita(diProgetto, 'm²')} entro la SLP ammessa dal PGT (${formattaConUnita(ammessa, 'm²')}).`;
}
aggiornaControlloSlp();
onCambio(aggiornaControlloSlp);
