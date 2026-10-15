// Videata 5 - Opere pubbliche (cap. 7), cessioni e monetizzazioni (cap. 8)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';
import { valoreAreaCeduta, importoMonetizzazione } from '../../comune/calcoli.js';
import { DESTINAZIONI } from '../../comune/stato.js';

montaLayout(4);

const colonnaImporto = { chiave: 'importo', titolo: 'Importo', tipo: 'numero', unita: '€', totale: true };

creaTabella(document.getElementById('tabella-primaria'), {
  percorso: 'opere.primaria',
  righeFisse: true,
  colonne: [{ chiave: 'opera', titolo: 'Opera', fissa: true }, colonnaImporto],
});

creaTabella(document.getElementById('tabella-secondaria'), {
  percorso: 'opere.secondaria',
  colonne: [{ chiave: 'opera', titolo: 'Opera', segnaposto: 'es. scuola, centro civico' }, colonnaImporto],
  nuovaRiga: () => ({ opera: '', importo: null }),
});

creaTabella(document.getElementById('tabella-aggiuntive'), {
  percorso: 'opere.aggiuntive',
  colonne: [{ chiave: 'opera', titolo: 'Opera', segnaposto: 'es. piazza, pista ciclabile' }, colonnaImporto],
  nuovaRiga: () => ({ opera: '', importo: null }),
});

creaTabella(document.getElementById('tabella-standard'), {
  percorso: 'opere.standard',
  colonne: [
    { chiave: 'intervento', titolo: 'Intervento' },
    { chiave: 'valore', titolo: 'Valore', tipo: 'numero', unita: '€', totale: true },
  ],
  nuovaRiga: () => ({ intervento: '', valore: null }),
});

creaTabella(document.getElementById('tabella-aree'), {
  percorso: 'cessioni.aree',
  colonne: [
    { chiave: 'area', titolo: 'Area', segnaposto: 'es. area a verde pubblico' },
    { chiave: 'superficie', titolo: 'Superficie', tipo: 'numero', unita: 'm²', totale: true },
    { chiave: 'valoreUnitario', titolo: 'Valore', tipo: 'numero', unita: '€/m²' },
    { chiave: 'valore', titolo: 'Valore', unita: '€', totale: true, calcolo: valoreAreaCeduta },
  ],
  nuovaRiga: () => ({ area: '', superficie: null, valoreUnitario: null }),
});

const TIPI_STANDARD = ['Verde', 'Parcheggi', 'Altri servizi'];

creaTabella(document.getElementById('tabella-monetizzazioni'), {
  percorso: 'cessioni.monetizzazioni',
  colonne: [
    {
      chiave: 'destinazione',
      titolo: "Destinazione d'uso",
      tipo: 'scelta',
      opzioni: DESTINAZIONI.map((d) => d.destinazione),
    },
    { chiave: 'standard', titolo: 'Tipo standard', tipo: 'scelta', opzioni: TIPI_STANDARD, aiuto: 'col:tipoStandard' },
    { chiave: 'quantita', titolo: 'Quantità', tipo: 'numero', unita: 'm²', totale: true },
    { chiave: 'valoreUnitario', titolo: 'Valore unitario', tipo: 'numero', unita: '€/m²' },
    { chiave: 'importo', titolo: 'Importo', unita: '€', totale: true, calcolo: importoMonetizzazione, aiuto: 'col:importoMonetizzazione' },
  ],
  nuovaRiga: () => ({ destinazione: '', standard: '', quantita: null, valoreUnitario: null }),
});

collegaCampi();
