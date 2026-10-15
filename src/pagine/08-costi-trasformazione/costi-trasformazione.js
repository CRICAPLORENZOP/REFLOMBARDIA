// Videata 8 - Costo dell'area (cap. 11) e costi di trasformazione (cap. 12)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';
import { getProgetto, leggi, scrivi } from '../../comune/stato.js';
import { CALCOLI, importoDemolizione, importoCostruzione, slpDestinazione } from '../../comune/calcoli.js';

montaLayout(7);

creaTabella(document.getElementById('tabella-costo-area'), {
  percorso: 'costoArea.voci',
  righeFisse: true,
  etichettaTotale: 'Totale costo iniziale',
  colonne: [
    { chiave: 'voce', titolo: 'Voce', fissa: true },
    { chiave: 'importo', titolo: 'Importo', tipo: 'numero', unita: '€', totale: true },
  ],
});

const opzioniDemolizioni = {
  percorso: 'trasformazione.demolizioni',
  righeFisse: true,
  colonne: [
    { chiave: 'voce', titolo: 'Voce', fissa: true },
    { chiave: 'unita', titolo: 'Unità', segnaposto: 'm³, t…' },
    { chiave: 'quantita', titolo: 'Quantità', tipo: 'numero' },
    { chiave: 'prezzo', titolo: 'Prezzo unitario', tipo: 'numero', unita: '€' },
    { chiave: 'totale', titolo: 'Totale', unita: '€', totale: true, calcolo: importoDemolizione },
  ],
};
const contenitoreDemolizioni = document.getElementById('tabella-demolizioni');
creaTabella(contenitoreDemolizioni, opzioniDemolizioni);

creaTabella(document.getElementById('tabella-costruzione'), {
  percorso: 'trasformazione.costruzione',
  righeFisse: true,
  colonne: [
    { chiave: 'destinazione', titolo: 'Destinazione', fissa: true },
    {
      chiave: 'superficie',
      titolo: 'Superficie',
      tipo: 'numero',
      unita: 'm²',
      totale: true,
      predefinito: (riga) => slpDestinazione(getProgetto(), riga.id),
    },
    { chiave: 'prezzo', titolo: 'Costo unitario', tipo: 'numero', unita: '€/m²' },
    { chiave: 'totale', titolo: 'Totale', unita: '€', totale: true, calcolo: (riga) => importoCostruzione(getProgetto(), riga) },
  ],
});

collegaCampi();

// Pulsante: copia il volume esistente (cap. 5.2) nella quantità da demolire.
const volumeEsistente = CALCOLI.volumeEsistente(getProgetto());
document.getElementById('proposta-volume').hidden = !volumeEsistente;
document.getElementById('usa-volume').addEventListener('click', () => {
  const righe = leggi('trasformazione.demolizioni');
  const demolizione = righe.find((riga) => riga.id === 'demolizione');
  demolizione.quantita = volumeEsistente;
  demolizione.unita = 'm³';
  scrivi('trasformazione.demolizioni', righe);
  creaTabella(contenitoreDemolizioni, opzioniDemolizioni);
});
