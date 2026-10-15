// Contiene TUTTI i dati della relazione in un unico oggetto ("progetto").
// Ogni videata legge e scrive qui: è questo che permette i collegamenti tra videate.
// I dati vengono tenuti anche nella memoria del programma (localStorage),
// così passando da una videata all'altra non si perde nulla.

const CHIAVE_PROGETTO = 'ref-lombardia-progetto';
const CHIAVE_PERCORSO = 'ref-lombardia-percorso-file';
const CHIAVE_MODIFICATO = 'ref-lombardia-modificato';

// Destinazioni d'uso usate nelle tabelle 6.2, 9.3, 10.1 e 12.2.
// L'"id" serve a ritrovare la stessa destinazione in tabelle diverse.
export const DESTINAZIONI = [
  { id: 'residenziale', destinazione: 'Residenziale' },
  { id: 'commerciale', destinazione: 'Commerciale' },
  { id: 'terziario', destinazione: 'Terziario' },
  { id: 'produttivo', destinazione: 'Produttivo' },
  { id: 'ricettivo', destinazione: 'Ricettivo' },
  { id: 'altro', destinazione: 'Altro' },
];

export function progettoVuoto() {
  return {
    versione: 1,
    frontespizio: {
      denominazione: '',
      comune: '',
      provincia: '',
      ambito: '',
      indirizzo: '',
      procedimento: '',
      procedimentoAltro: '',
      data: '',
    },
    soggetti: {
      proponente: { denominazione: '', sede: '', cfPiva: '', rappresentante: '' },
      proprieta: '',
      tecnico: { nome: '', qualifica: '', ordine: '', iscrizione: '' },
    },
    area: {
      catastale: [{ foglio: '', mappale: '', subalterno: '', superficie: null }],
      stDaCatasto: true,
      st: null,
      sf: null,
    },
    urbanistica: {
      descrizioneAmbito: '',
      destinazione: '',
      indice: '',
      slpAmmessa: null,
      altezzaMax: null,
      destinazioniAmmesse: '',
      dotazioneServizi: '',
      ambitoRigenerazione: '',
      motivazione: '',
      oggettiConvenzione: [{ testo: '' }],
    },
    statoFatto: {
      descrizione: '',
      fabbricati: [{ fabbricato: 'A', destinazione: '', slp: null, altezza: null, stato: '' }],
      condizioni: {
        degrado: false,
        abbandono: false,
        dismissione: false,
        ambientali: false,
        infrastrutturali: false,
        altro: false,
      },
      condizioniAltro: '',
      bonifiche: '',
      // Ogni riga è un importo con il documento che lo giustifica (cap. 5.4)
      vociBonifiche: [{ importo: null, documentazione: '' }],
    },
    statoProgetto: {
      descrizione: '',
      interventi: {
        demolizione: '',
        realizzazione: '',
        recupero: '',
        nuovaCostruzione: '',
        cambioDestinazione: '',
        spaziPubblici: false,
        urbanizzazioni: false,
        interessePubblico: false,
      },
      destinazioni: DESTINAZIONI.map((d) => ({ ...d, slp: null, superficieCommerciale: null, altezza: null, unita: null })),
      pertinenze: [
        { id: 'box', tipologia: 'Box', quantita: null, superficie: null, valoreUnitario: null },
        { id: 'postiAuto', tipologia: 'Posti auto', quantita: null, superficie: null, valoreUnitario: null },
        { id: 'cantine', tipologia: 'Cantine', quantita: null, superficie: null, valoreUnitario: null },
        { id: 'altro', tipologia: 'Altro', quantita: null, superficie: null, valoreUnitario: null },
      ],
    },
    mercato: {
      fonti: { omi: false, osmi: false, comparabili: false, pubblicazioni: false, offerte: false, perizie: false },
      quotazioni: [
        { fonte: 'OMI', zona: '', destinazione: 'Residenziale', minimo: null, massimo: null },
        { fonte: 'OMI', zona: '', destinazione: 'Commerciale', minimo: null, massimo: null },
      ],
      valoriAdottati: DESTINAZIONI.map((d) => ({ ...d, valore: null })),
      valoreBox: null,
      fattori: {
        localizzazione: false,
        accessibilita: false,
        qualitaUrbana: false,
        caratteristicheProgettuali: false,
        statoManutentivo: false,
        piano: false,
        esposizione: false,
        dotazionePertinenziale: false,
        qualitaEnergetica: false,
        nuovoIntervento: false,
        mercatoLocale: false,
      },
      motivazione: '',
    },
    ricavi: {
      altriRicavi: null,
      descrizioneAltri: '',
    },
    opere: {
      primaria: [
        { id: 'strade', opera: 'Strade', importo: null },
        { id: 'parcheggi', opera: 'Parcheggi', importo: null },
        { id: 'fognatura', opera: 'Fognatura', importo: null },
        { id: 'illuminazione', opera: 'Illuminazione', importo: null },
        { id: 'sottoservizi', opera: 'Sottoservizi', importo: null },
        { id: 'verde', opera: 'Verde', importo: null },
        { id: 'altre', opera: 'Altre', importo: null },
      ],
      secondaria: [{ opera: '', importo: null }],
      aggiuntive: [{ opera: '', importo: null }],
      standard: [{ intervento: '', valore: null }],
    },
    cessioni: {
      aree: [{ area: '', superficie: null, valoreUnitario: null }],
      monetizzazioni: [{ destinazione: '', standard: '', quantita: null, valoreUnitario: null }],
    },
    costoArea: {
      metodo: '',
      voci: [
        { id: 'area', voce: 'Area', importo: null },
        { id: 'fabbricati', voce: 'Fabbricati esistenti', importo: null },
        { id: 'accessori', voce: 'Costi accessori', importo: null },
      ],
    },
    trasformazione: {
      demolizioni: [
        { id: 'demolizione', voce: 'Demolizione', unita: 'm³', quantita: null, prezzo: null },
        { id: 'smaltimento', voce: 'Smaltimento', unita: 't', quantita: null, prezzo: null },
      ],
      costruzione: DESTINAZIONI.map((d) => ({ ...d, superficie: null, prezzo: null })),
      fonteCostruzione: '',
    },
    costiGenerali: {
      oneriU1: null,
      oneriU2: null,
      // facoltativo: se resta vuoto vale zero (oneri già scritti al netto)
      scomputo: null,
      contributoCC: null,
      altriOneri: null,
    },
    softCosts: [
      { id: 'progettazione', voce: 'Progettazione', percentuale: null, importo: null },
      { id: 'direzioneLavori', voce: 'Direzione lavori', percentuale: null, importo: null },
      { id: 'sicurezza', voce: 'Sicurezza', percentuale: null, importo: null },
      { id: 'collaudi', voce: 'Collaudi', percentuale: null, importo: null },
      { id: 'consulenze', voce: 'Consulenze', percentuale: null, importo: null },
      { id: 'projectManagement', voce: 'Project management', percentuale: null, importo: null },
      { id: 'autorizzative', voce: 'Spese autorizzative', percentuale: null, importo: null },
      { id: 'imprevisti', voce: 'Imprevisti', percentuale: null, importo: null },
    ],
    commercializzazione: [
      { id: 'intermediazione', voce: 'Intermediazione', base: null, percentuale: null },
      { id: 'marketing', voce: 'Marketing', base: null, percentuale: null },
      { id: 'pubblicita', voce: 'Pubblicità', base: null, percentuale: null },
      { id: 'altri', voce: 'Altri', base: null, percentuale: null },
    ],
    valutazione: {
      durata: null,
      modello: '',
      motivazione: '',
      altriCosti: null,
      descrizioneAltriCosti: '',
      metodoMargine: 'costi',
      percentualeMargine: null,
      oneriFinanziari: null,
      tasso: null,
      wacc: null,
      motivazioneTasso: '',
      // percentuali per anno di ogni voce, es. { ricavi: [0, 0, 30, 70] }
      distribuzione: {},
    },
    contributo: {
      riduzionePercentuale: null,
      motivazioneRiduzione: '',
    },
    pubblicoPrivato: {
      altriBenefici: null,
    },
    sensitivita: {
      // percentuali di variazione per scenari e matrice (vuote = 10%)
      variazionePrezzi: null,
      variazioneCosti: null,
      // usato solo nel modello mono-periodale: il ritardo di 12 mesi si stima a mano
      ritardoMono: null,
      motivazioneRitardo: '',
      commento: '',
    },
    conclusioni: {
      considerazioni: '',
    },
    riepilogo: {
      // fonte scritta a mano per ogni input del cap. 26 (vuota = fonte suggerita dal modello)
      fonti: {},
    },
    // allegati spuntati al cap. 27, es. { A: true, B: false }
    allegati: {},
    sottoscrizione: {
      // vuoti = comune e data del frontespizio
      luogo: '',
      data: '',
    },
  };
}

// Unisce i dati salvati con la struttura vuota: se in futuro aggiungiamo
// nuovi campi, i progetti vecchi si aprono comunque senza errori.
function unisci(base, dati) {
  if (Array.isArray(base)) return Array.isArray(dati) ? dati : base;
  if (base && typeof base === 'object') {
    const risultato = { ...base };
    if (dati && typeof dati === 'object') {
      for (const chiave of Object.keys(dati)) {
        risultato[chiave] = chiave in base ? unisci(base[chiave], dati[chiave]) : dati[chiave];
      }
    }
    return risultato;
  }
  return dati === undefined ? base : dati;
}

// I progetti salvati prima delle righe multiple avevano un solo importo.
// Lo trasformiamo in una riga della nuova tabella, così non si perde.
function adattaDatiVecchi(unito, originale) {
  const stato = unito.statoFatto;
  if (!stato) return;
  const salvato = originale?.statoFatto || {};
  const voci = stato.vociBonifiche;
  const senzaRighe = !Array.isArray(voci) || voci.length === 0;
  if (senzaRighe) {
    const importo = salvato.importoBonifiche ?? null;
    const documentazione = salvato.documentazioneBonifiche || '';
    stato.vociBonifiche = [{ importo, documentazione }];
  }
  delete stato.importoBonifiche;
  delete stato.documentazioneBonifiche;
}

function prepara(dati) {
  const unito = unisci(progettoVuoto(), dati || {});
  adattaDatiVecchi(unito, dati || {});
  return unito;
}

function caricaDaMemoria() {
  try {
    const testo = localStorage.getItem(CHIAVE_PROGETTO);
    return testo ? prepara(JSON.parse(testo)) : progettoVuoto();
  } catch {
    return progettoVuoto();
  }
}

let progetto = caricaDaMemoria();
const ascoltatori = [];

function salvaInMemoria() {
  localStorage.setItem(CHIAVE_PROGETTO, JSON.stringify(progetto));
}

function avvisaAscoltatori() {
  ascoltatori.forEach((funzione) => funzione(progetto));
}

export function getProgetto() {
  return progetto;
}

// Legge un valore indicando il "percorso", es. leggi('frontespizio.comune')
export function leggi(percorso) {
  return percorso.split('.').reduce((oggetto, chiave) => (oggetto == null ? undefined : oggetto[chiave]), progetto);
}

// Scrive un valore, es. scrivi('frontespizio.comune', 'Milano')
export function scrivi(percorso, valore) {
  const chiavi = percorso.split('.');
  const ultima = chiavi.pop();
  let oggetto = progetto;
  for (const chiave of chiavi) {
    if (oggetto[chiave] == null) oggetto[chiave] = {};
    oggetto = oggetto[chiave];
  }
  oggetto[ultima] = valore;
  salvaInMemoria();
  localStorage.setItem(CHIAVE_MODIFICATO, '1');
  avvisaAscoltatori();
}

// Registra una funzione da chiamare ogni volta che un dato cambia.
export function onCambio(funzione) {
  ascoltatori.push(funzione);
}

export function esisteProgetto() {
  return localStorage.getItem(CHIAVE_PROGETTO) !== null;
}

export function nuovoProgetto() {
  progetto = progettoVuoto();
  salvaInMemoria();
  localStorage.removeItem(CHIAVE_PERCORSO);
  localStorage.removeItem(CHIAVE_MODIFICATO);
  avvisaAscoltatori();
}

export function esportaTesto() {
  return JSON.stringify(progetto, null, 2);
}

export function caricaDaTesto(testo) {
  progetto = prepara(JSON.parse(testo));
  salvaInMemoria();
  localStorage.removeItem(CHIAVE_MODIFICATO);
  avvisaAscoltatori();
}

export function getPercorsoFile() {
  return localStorage.getItem(CHIAVE_PERCORSO);
}

export function setPercorsoFile(percorso) {
  localStorage.setItem(CHIAVE_PERCORSO, percorso);
}

export function haModifiche() {
  return localStorage.getItem(CHIAVE_MODIFICATO) === '1';
}

export function segnaSalvato() {
  localStorage.removeItem(CHIAVE_MODIFICATO);
  avvisaAscoltatori();
}
