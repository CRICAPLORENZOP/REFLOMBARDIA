// Videata 3 - Stato di fatto (cap. 5)

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { creaTabella } from '../../comune/tabelle.js';
import { leggi, scrivi } from '../../comune/stato.js';
import { leggiNumero, perCasella, formattaConUnita, somma } from '../../comune/numeri.js';
import { volumeDaAltezza } from '../../comune/calcoli.js';

montaLayout(2);

// Propone la lettera successiva per il nuovo fabbricato (A, B, C, ...)
function prossimaLettera() {
  const quanti = (leggi('statoFatto.fabbricati') || []).length;
  return String.fromCharCode(65 + (quanti % 26));
}

creaTabella(document.getElementById('tabella-fabbricati'), {
  percorso: 'statoFatto.fabbricati',
  colonne: [
    { chiave: 'fabbricato', titolo: 'Fabbricato' },
    { chiave: 'destinazione', titolo: 'Destinazione' },
    { chiave: 'slp', titolo: 'SLP', tipo: 'numero', unita: 'm²', totale: true, aiuto: 'col:slp' },
    { chiave: 'altezza', titolo: 'Altezza', tipo: 'numero', unita: 'm', aiuto: 'col:altezza' },
    { chiave: 'volume', titolo: 'Volume', unita: 'm³', totale: true, calcolo: volumeDaAltezza, aiuto: 'col:volume' },
    { chiave: 'stato', titolo: 'Stato', segnaposto: 'es. in disuso' },
  ],
  nuovaRiga: () => ({ fabbricato: prossimaLettera(), destinazione: '', slp: null, altezza: null, stato: '' }),
});

const DOCUMENTI_BONIFICA = [
  'Computo',
  'Preventivo',
  'Indagine ambientale',
  'Documentazione tecnica',
  'Documento contabile / fattura',
];

function rigaVuota() {
  return { descrizione: '', documentazione: '', importo: null };
}

function vociBonifica() {
  const voci = leggi('statoFatto.vociBonifiche');
  if (!Array.isArray(voci) || voci.length === 0) {
    const elenco = [rigaVuota()];
    scrivi('statoFatto.vociBonifiche', elenco);
    return elenco;
  }
  return voci;
}

function disegnaBonifiche() {
  const contenitore = document.getElementById('tabella-bonifiche');
  const voci = vociBonifica();
  const elenco = document.createElement('div');
  elenco.className = 'elenco-bonifiche';

  voci.forEach((riga, indice) => {
    const blocco = document.createElement('div');
    blocco.className = 'riga-bonifica';

    const campoDescrizione = document.createElement('label');
    campoDescrizione.className = 'campo';
    const etichettaDescrizione = document.createElement('span');
    etichettaDescrizione.textContent = 'Descrizione';
    const descrizione = document.createElement('input');
    descrizione.type = 'text';
    descrizione.placeholder = 'es. bonifica terreno area nord';
    descrizione.value = riga.descrizione || '';
    descrizione.addEventListener('input', () => {
      riga.descrizione = descrizione.value;
      scrivi('statoFatto.vociBonifiche', voci);
    });
    campoDescrizione.append(etichettaDescrizione, descrizione);

    const campoImporto = document.createElement('label');
    campoImporto.className = 'campo';
    const etichettaImporto = document.createElement('span');
    etichettaImporto.textContent = 'Importo stimato (€)';
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.className = 'numero';
    input.value = perCasella(riga.importo);
    input.addEventListener('input', () => {
      riga.importo = leggiNumero(input.value);
      scrivi('statoFatto.vociBonifiche', voci);
      aggiornaTotale();
    });
    campoImporto.append(etichettaImporto, input);

    const campoDocumento = document.createElement('label');
    campoDocumento.className = 'campo';
    const etichettaDocumento = document.createElement('span');
    etichettaDocumento.textContent = 'La stima è documentata mediante';
    const scelta = document.createElement('select');
    const vuota = document.createElement('option');
    vuota.value = '';
    vuota.textContent = '— scegli —';
    scelta.append(vuota);
    DOCUMENTI_BONIFICA.forEach((opzione) => {
      const elemento = document.createElement('option');
      elemento.value = opzione;
      elemento.textContent = opzione;
      scelta.append(elemento);
    });
    scelta.value = riga.documentazione || '';
    scelta.addEventListener('change', () => {
      riga.documentazione = scelta.value;
      scrivi('statoFatto.vociBonifiche', voci);
    });
    campoDocumento.append(etichettaDocumento, scelta);

    blocco.append(campoDescrizione, campoImporto, campoDocumento);

    if (voci.length > 1) {
      const elimina = document.createElement('button');
      elimina.type = 'button';
      elimina.className = 'bottone-icona';
      elimina.title = 'Elimina riga';
      elimina.textContent = '✕';
      elimina.addEventListener('click', () => {
        voci.splice(indice, 1);
        scrivi('statoFatto.vociBonifiche', voci);
        disegnaBonifiche();
      });
      blocco.append(elimina);
    }

    elenco.append(blocco);
  });

  const aggiungi = document.createElement('button');
  aggiungi.type = 'button';
  aggiungi.className = 'bottone secondario';
  aggiungi.textContent = '+ Aggiungi riga';
  aggiungi.addEventListener('click', () => {
    voci.push(rigaVuota());
    scrivi('statoFatto.vociBonifiche', voci);
    disegnaBonifiche();
  });

  const totale = document.createElement('p');
  totale.className = 'totale-bonifiche';

  function aggiornaTotale() {
    const testo = formattaConUnita(somma(voci, 'importo'), '€') || '€ 0';
    totale.textContent = `Totale: ${testo}`;
  }

  aggiornaTotale();
  contenitore.replaceChildren(elenco, aggiungi, totale);
}

disegnaBonifiche();

collegaCampi();
