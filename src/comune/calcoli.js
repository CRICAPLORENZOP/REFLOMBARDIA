// Qui stanno TUTTI i valori calcolati automaticamente e i collegamenti tra videate.
// Ogni calcolo riceve l'intero progetto e restituisce un valore.
// Nelle pagine HTML si usano così: <span data-mostra="calc:totaleCatastale" data-unita="m²">

import { somma, formatta } from './numeri.js';

const perId = (righe, id) => (righe || []).find((riga) => riga.id === id);
const oZero = (valore) => (Number.isFinite(valore) ? valore : 0);

// Cap. 6.3 - il valore unitario dei box è quello adottato al cap. 9.3
export function valoreUnitarioPertinenza(p, riga) {
  return riga.id === 'box' ? p.mercato.valoreBox : riga.valoreUnitario;
}

// Cap. 6.3 - valore totale = quantità × valore unitario
export function valorePertinenza(p, riga) {
  const unitario = valoreUnitarioPertinenza(p, riga);
  if (riga.quantita == null || unitario == null) return null;
  return riga.quantita * unitario;
}

// Cap. 10.1 - per ogni destinazione: superficie commerciale (6.2) × valore adottato (9.3)
export function righeRicavi(p) {
  return p.statoProgetto.destinazioni.map((d) => {
    const valore = perId(p.mercato.valoriAdottati, d.id)?.valore ?? null;
    const superficie = d.superficieCommerciale;
    const ricavo = superficie != null && valore != null ? superficie * valore : null;
    return { id: d.id, destinazione: d.destinazione, superficie, valore, ricavo };
  });
}

const prodotto = (a, b) => (a != null && b != null ? a * b : null);

// Cap. 8.1 / 8.2 - valore = quantità (o superficie) × valore unitario
export const valoreAreaCeduta = (riga) => prodotto(riga.superficie, riga.valoreUnitario);
export const importoMonetizzazione = (riga) => prodotto(riga.quantita, riga.valoreUnitario);

// Cap. 5.2 / 6.2 - volume = SLP × altezza. Nei progetti salvati prima dell'altezza resta il volume scritto a mano.
export const volumeDaAltezza = (riga) =>
  riga.altezza != null ? prodotto(riga.slp, riga.altezza) : (riga.volume ?? null);

// Cap. 12.1 - totale = quantità × prezzo unitario
export const importoDemolizione = (riga) => prodotto(riga.quantita, riga.prezzo);

// Cap. 12.2 - se la superficie non è scritta a mano si usa la SLP della stessa destinazione (cap. 6.2)
export function slpDestinazione(p, id) {
  return perId(p.statoProgetto.destinazioni, id)?.slp ?? null;
}
export function superficieCostruzione(p, riga) {
  return riga.superficie ?? slpDestinazione(p, riga.id);
}
export function importoCostruzione(p, riga) {
  return prodotto(superficieCostruzione(p, riga), riga.prezzo);
}

// Cap. 14 - se l'importo non è scritto a mano si calcola come % del costo di costruzione (cap. 12.2)
export function importoSoftCostAutomatico(p, riga) {
  return riga.percentuale != null ? (riga.percentuale / 100) * CALCOLI.costoCostruzione(p) : null;
}
export function importoSoftCost(p, riga) {
  return riga.importo ?? importoSoftCostAutomatico(p, riga);
}

// Cap. 15 - la base, se non scritta a mano, sono i ricavi complessivi (cap. 10.4)
export function baseCommercializzazione(p, riga) {
  return riga.base ?? CALCOLI.ricaviComplessivi(p);
}
export function importoCommercializzazione(p, riga) {
  return riga.percentuale != null ? (baseCommercializzazione(p, riga) * riga.percentuale) / 100 : null;
}

const sommaCon = (righe, funzione) => (righe || []).reduce((totale, riga) => totale + oZero(funzione(riga)), 0);

export const CALCOLI = {
  // Cap. 3.2 - totale delle superfici catastali
  totaleCatastale: (p) => somma(p.area.catastale, 'superficie'),

  // Cap. 3.3 - la ST è il totale catastale, a meno che l'utente non la scriva a mano
  stEffettiva: (p) => (p.area.stDaCatasto ? CALCOLI.totaleCatastale(p) : p.area.st),

  // Cap. 4.3 - il procedimento scelto nel frontespizio
  procedimentoTesto: (p) =>
    p.frontespizio.procedimento === 'Altro' ? p.frontespizio.procedimentoAltro : p.frontespizio.procedimento,

  // Cap. 5.2 - totali della consistenza edilizia esistente
  slpEsistente: (p) => somma(p.statoFatto.fabbricati, 'slp'),
  volumeEsistente: (p) => sommaCon(p.statoFatto.fabbricati, volumeDaAltezza),

  // Cap. 5.4 - somma degli importi di bonifica (zero se non previste); servirà nei cap. 17, 21, 23, 26
  bonifiche: (p) => {
    if (p.statoFatto.bonifiche !== 'si') return 0;
    const voci = p.statoFatto.vociBonifiche;
    if (Array.isArray(voci)) return somma(voci, 'importo');
    return oZero(p.statoFatto.importoBonifiche);
  },

  // Cap. 6.2 - totali della consistenza di progetto
  slpProgetto: (p) => somma(p.statoProgetto.destinazioni, 'slp'),
  superficieCommercialeProgetto: (p) => somma(p.statoProgetto.destinazioni, 'superficieCommerciale'),
  volumeProgetto: (p) => sommaCon(p.statoProgetto.destinazioni, volumeDaAltezza),

  // Cap. 4.1 - SLP ammessa dal PGT (per il controllo sulla SLP di progetto)
  slpAmmessa: (p) => p.urbanistica.slpAmmessa,

  // Cap. 9.3 - valore adottato per i box
  valoreBox: (p) => p.mercato.valoreBox,

  // Cap. 10.1 - ricavi da vendita
  ricaviVendita: (p) => somma(righeRicavi(p), 'ricavo'),

  // Cap. 10.2 - box e pertinenze (totale della tabella 6.3)
  ricaviPertinenze: (p) => p.statoProgetto.pertinenze.reduce((totale, riga) => totale + oZero(valorePertinenza(p, riga)), 0),

  // Cap. 10.3 - altri ricavi
  altriRicavi: (p) => oZero(p.ricavi.altriRicavi),

  // Cap. 10.4 - ricavi complessivi; servirà nei cap. 15, 17, 21, 25, 26
  ricaviComplessivi: (p) => CALCOLI.ricaviVendita(p) + CALCOLI.ricaviPertinenze(p) + CALCOLI.altriRicavi(p),

  // Cap. 7 - opere di urbanizzazione e opere pubbliche
  urbanizzazionePrimaria: (p) => somma(p.opere.primaria, 'importo'),
  urbanizzazioneSecondaria: (p) => somma(p.opere.secondaria, 'importo'),
  urbanizzazioni: (p) => CALCOLI.urbanizzazionePrimaria(p) + CALCOLI.urbanizzazioneSecondaria(p),
  opereAggiuntive: (p) => somma(p.opere.aggiuntive, 'importo'),
  standardQualitativi: (p) => somma(p.opere.standard, 'valore'),

  // Cap. 8 - cessioni e monetizzazioni
  areeCedute: (p) => sommaCon(p.cessioni.aree, valoreAreaCeduta),
  superficieAreeCedute: (p) => somma(p.cessioni.aree, 'superficie'),
  monetizzazioni: (p) => sommaCon(p.cessioni.monetizzazioni, importoMonetizzazione),

  // Cap. 11 - costo dell'area/immobile
  costoArea: (p) => somma(p.costoArea.voci, 'importo'),

  // Cap. 12 - costi di trasformazione
  volumeDemolizione: (p) => perId(p.trasformazione.demolizioni, 'demolizione')?.quantita ?? null,
  demolizioni: (p) => sommaCon(p.trasformazione.demolizioni, importoDemolizione),
  costoCostruzione: (p) => sommaCon(p.trasformazione.costruzione, (riga) => importoCostruzione(p, riga)),

  // Cap. 13 - costi generali. Monetizzazioni, opere pubbliche e standard arrivano dai cap. 7-8:
  // si scrivono una sola volta e qui vengono solo riportati.
  oneriU1: (p) => oZero(p.costiGenerali.oneriU1),
  oneriU2: (p) => oZero(p.costiGenerali.oneriU2),
  // Scomputo: opere di urbanizzazione realizzate al posto del pagamento degli oneri.
  // Campo facoltativo (vuoto = 0) e mai superiore a U1 + U2.
  scomputoScritto: (p) => oZero(p.costiGenerali.scomputo),
  scomputoOneri: (p) => Math.min(CALCOLI.scomputoScritto(p), CALCOLI.oneriU1(p) + CALCOLI.oneriU2(p)),
  scomputoEccedente: (p) => CALCOLI.scomputoScritto(p) > CALCOLI.oneriU1(p) + CALCOLI.oneriU2(p),
  oneriUrbanizzazioneNetti: (p) => CALCOLI.oneriU1(p) + CALCOLI.oneriU2(p) - CALCOLI.scomputoOneri(p),
  contributoCostoCostruzione: (p) => oZero(p.costiGenerali.contributoCC),
  altriOneri: (p) => oZero(p.costiGenerali.altriOneri),
  // Cap. 22.1 - contributo di costruzione teorico = U1 + U2 - scomputo + costo di costruzione
  contributoTeorico: (p) => CALCOLI.oneriUrbanizzazioneNetti(p) + CALCOLI.contributoCostoCostruzione(p),
  costiGenerali: (p) =>
    CALCOLI.contributoTeorico(p) +
    CALCOLI.monetizzazioni(p) +
    CALCOLI.opereAggiuntive(p) +
    CALCOLI.standardQualitativi(p) +
    CALCOLI.altriOneri(p),

  // Cap. 14 - soft costs (spese tecniche)
  softCosts: (p) => sommaCon(p.softCosts, (riga) => importoSoftCost(p, riga)),
  imprevisti: (p) => oZero(importoSoftCost(p, perId(p.softCosts, 'imprevisti') || {})),

  // Cap. 15 - costi di commercializzazione
  commercializzazione: (p) => sommaCon(p.commercializzazione, (riga) => importoCommercializzazione(p, riga)),

  // Cap. 22.2 - riduzione del contributo prevista dalla normativa
  riduzioneContributo: (p) => (CALCOLI.contributoTeorico(p) * oZero(p.contributo.riduzionePercentuale)) / 100,
  contributoDopoRiduzione: (p) => CALCOLI.contributoTeorico(p) - CALCOLI.riduzioneContributo(p),

  // Cap. 17.2 - subtotale dei costi (somma di VOCI_COSTO)
  subtotaleCosti: (p) => VOCI_COSTO.reduce((totale, voce) => totale + oZero(voce.valore(p)), 0),

  // Cap. 17.3 - margine ordinario del promotore
  marginePromotore: (p) => {
    const base = p.valutazione.metodoMargine === 'ricavi' ? CALCOLI.ricaviComplessivi(p) : CALCOLI.subtotaleCosti(p);
    return (base * oZero(p.valutazione.percentualeMargine)) / 100;
  },

  // Cap. 17.4 - oneri finanziari
  oneriFinanziari: (p) => oZero(p.valutazione.oneriFinanziari),

  // Cap. 17.5 - B = costi + margine + oneri finanziari
  costiComplessiviMono: (p) => CALCOLI.subtotaleCosti(p) + CALCOLI.marginePromotore(p) + CALCOLI.oneriFinanziari(p),

  // Cap. 17.6 - SALDO = A - B
  saldoMono: (p) => CALCOLI.ricaviComplessivi(p) - CALCOLI.costiComplessiviMono(p),

  // Cap. 17.7 - margine % = saldo / ricavi × 100
  marginePercentuale: (p) => {
    const ricavi = CALCOLI.ricaviComplessivi(p);
    return ricavi ? (CALCOLI.saldoMono(p) / ricavi) * 100 : null;
  },

  // Cap. 20 - VAN e TIR (modello pluri-periodale)
  van: (p) => valoreAttualeNetto(flussiNetti(p), oZero(p.valutazione.tasso) / 100),
  tir: (p) => tassoInternoRendimento(flussiNetti(p)),

  // Totale costi nel modello pluri-periodale (non attualizzato)
  costiComplessiviPluri: (p) => CALCOLI.subtotaleCosti(p),
  saldoPluri: (p) => CALCOLI.ricaviComplessivi(p) - CALCOLI.subtotaleCosti(p),

  // Risultato della REF: saldo (mono) oppure VAN (pluri)
  risultato: (p) => (isPluri(p) ? CALCOLI.van(p) : CALCOLI.saldoMono(p)),
  costiComplessivi: (p) => (isPluri(p) ? CALCOLI.costiComplessiviPluri(p) : CALCOLI.costiComplessiviMono(p)),

  // Cap. 23 - rapporto pubblico/privato.
  // La riduzione del contributo (22.2) si applica in proporzione a oneri e costo di costruzione.
  fattoreRiduzione: (p) => {
    const teorico = CALCOLI.contributoTeorico(p);
    return teorico ? CALCOLI.contributoDopoRiduzione(p) / teorico : 1;
  },
  beneficioOneriUrbanizzazione: (p) =>
    CALCOLI.oneriUrbanizzazioneNetti(p) * CALCOLI.fattoreRiduzione(p) + CALCOLI.urbanizzazioni(p),
  beneficioContributoCostruzione: (p) => CALCOLI.contributoCostoCostruzione(p) * CALCOLI.fattoreRiduzione(p),
  altriBenefici: (p) => oZero(p.pubblicoPrivato.altriBenefici),
  totaleBeneficiPubblici: (p) =>
    CALCOLI.areeCedute(p) +
    CALCOLI.monetizzazioni(p) +
    CALCOLI.beneficioOneriUrbanizzazione(p) +
    CALCOLI.beneficioContributoCostruzione(p) +
    CALCOLI.opereAggiuntive(p) +
    CALCOLI.standardQualitativi(p) +
    CALCOLI.altriBenefici(p),
  altriCosti: (p) => oZero(p.valutazione.altriCosti),
  totaleInvestimentoPrivato: (p) =>
    CALCOLI.costoArea(p) +
    CALCOLI.costoCostruzione(p) +
    CALCOLI.demolizioni(p) +
    CALCOLI.bonifiche(p) +
    CALCOLI.softCosts(p) +
    CALCOLI.commercializzazione(p) +
    CALCOLI.altriCosti(p),
};

// ---------------------------------------------------------------------------
// Voci di costo del modello di valutazione (cap. 17.2, 18, 21).
// Ogni importo inserito nelle videate precedenti finisce in UNA sola voce.
export const VOCI_COSTO = [
  { id: 'area', voce: 'Costo area/immobile', origine: 'cap. 11', valore: (p) => CALCOLI.costoArea(p) },
  { id: 'bonifiche', voce: 'Bonifiche', origine: 'cap. 5.4', valore: (p) => CALCOLI.bonifiche(p) },
  { id: 'demolizioni', voce: 'Demolizioni', origine: 'cap. 12.1', valore: (p) => CALCOLI.demolizioni(p) },
  { id: 'costruzione', voce: 'Costruzione', origine: 'cap. 12.2', valore: (p) => CALCOLI.costoCostruzione(p) },
  { id: 'urbanizzazioni', voce: 'Urbanizzazioni', origine: 'cap. 7.1 + 7.2', valore: (p) => CALCOLI.urbanizzazioni(p) },
  {
    id: 'operePubbliche',
    voce: 'Opere pubbliche',
    origine: 'cap. 7.3 + 7.4',
    valore: (p) => CALCOLI.opereAggiuntive(p) + CALCOLI.standardQualitativi(p),
  },
  {
    id: 'oneri',
    voce: 'Contributo costruzione e oneri',
    origine: 'cap. 22.2 + 8.2 + altri oneri',
    valore: (p) => CALCOLI.contributoDopoRiduzione(p) + CALCOLI.monetizzazioni(p) + CALCOLI.altriOneri(p),
  },
  { id: 'speseTecniche', voce: 'Spese tecniche', origine: 'cap. 14', valore: (p) => CALCOLI.softCosts(p) },
  { id: 'commercializzazione', voce: 'Commercializzazione', origine: 'cap. 15', valore: (p) => CALCOLI.commercializzazione(p) },
  { id: 'altri', voce: 'Altri costi', origine: 'scritti in questa videata', valore: (p) => CALCOLI.altriCosti(p) },
];

export const isPluri = (p) => p.valutazione.modello === 'pluri';

// ---------------------------------------------------------------------------
// Modello pluri-periodale (cap. 18-20)

// Numero di anni dopo l'anno 0 (se la durata non è indicata si usano 5 anni, come nel modello).
export function numeroAnni(p) {
  const durata = Math.round(p.valutazione.durata ?? 0);
  return durata >= 1 ? Math.min(durata, 20) : 5;
}

export function percentualiVoce(p, id) {
  const salvate = p.valutazione.distribuzione[id] || [];
  return Array.from({ length: numeroAnni(p) + 1 }, (_, anno) => salvate[anno] ?? null);
}

export function sommaPercentuali(p, id) {
  return percentualiVoce(p, id).reduce((totale, valore) => totale + oZero(valore), 0);
}

// Importo di una voce anno per anno = totale della voce × % dell'anno
export function importiPerAnno(p, id, totale) {
  return percentualiVoce(p, id).map((percentuale) => (totale * oZero(percentuale)) / 100);
}

const allunga = (valori, lunghezza) => [...valori, ...Array(Math.max(0, lunghezza - valori.length)).fill(0)];

// Flusso netto di ogni anno. "ritardoRicavi" sposta in avanti i ricavi di quel numero di anni (cap. 24.5).
export function flussiNetti(p, ritardoRicavi = 0) {
  const lunghezza = numeroAnni(p) + 1 + ritardoRicavi;
  const ricavi = allunga(
    [...Array(ritardoRicavi).fill(0), ...importiPerAnno(p, 'ricavi', CALCOLI.ricaviComplessivi(p))],
    lunghezza,
  );
  const costi = VOCI_COSTO.map((voce) => allunga(importiPerAnno(p, voce.id, oZero(voce.valore(p))), lunghezza));
  return ricavi.map((ricavo, anno) => ricavo - costi.reduce((totale, voce) => totale + voce[anno], 0));
}

// VAN = Σ FCₜ / (1+r)ᵗ
export function valoreAttualeNetto(flussi, tasso) {
  return flussi.reduce((totale, flusso, anno) => totale + flusso / (1 + tasso) ** anno, 0);
}

// TIR = tasso che rende il VAN uguale a zero (ricerca per bisezione)
export function tassoInternoRendimento(flussi) {
  if (!flussi.some((f) => f > 0) || !flussi.some((f) => f < 0)) return null;
  let basso = -0.99;
  let alto = 10;
  let vanBasso = valoreAttualeNetto(flussi, basso);
  if (vanBasso * valoreAttualeNetto(flussi, alto) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const medio = (basso + alto) / 2;
    const vanMedio = valoreAttualeNetto(flussi, medio);
    if (Math.abs(vanMedio) < 0.01) return medio * 100;
    if (vanBasso * vanMedio < 0) {
      alto = medio;
    } else {
      basso = medio;
      vanBasso = vanMedio;
    }
  }
  return ((basso + alto) / 2) * 100;
}

// ---------------------------------------------------------------------------
// Analisi di sensitività (cap. 24)

const perFattore = (valore, fattore) => (valore == null ? valore : valore * fattore);

// Copia del progetto con prezzi di vendita e costi di costruzione moltiplicati per un fattore
// (es. 0.9 = -10%). Tutto ciò che ne dipende (commercializzazione, spese tecniche in %, margine)
// viene ricalcolato di conseguenza. Gli "altri ricavi" non cambiano perché non sono prezzi di vendita.
export function progettoScenario(p, { ricavi = 1, costi = 1 } = {}) {
  const copia = structuredClone(p);
  copia.mercato.valoriAdottati.forEach((riga) => (riga.valore = perFattore(riga.valore, ricavi)));
  copia.mercato.valoreBox = perFattore(copia.mercato.valoreBox, ricavi);
  copia.statoProgetto.pertinenze.forEach((riga) => (riga.valoreUnitario = perFattore(riga.valoreUnitario, ricavi)));
  copia.trasformazione.costruzione.forEach((riga) => (riga.prezzo = perFattore(riga.prezzo, costi)));
  return copia;
}

// Saldo (mono) o VAN (pluri) dello scenario
export const risultatoScenario = (p, fattori) => CALCOLI.risultato(progettoScenario(p, fattori));

// Ritardo di 12 mesi: nel pluri i ricavi slittano di un anno; nel mono il valore si scrive a mano.
export function risultatoRitardo(p) {
  if (isPluri(p)) return valoreAttualeNetto(flussiNetti(p, 1), oZero(p.valutazione.tasso) / 100);
  return p.sensitivita.ritardoMono ?? null;
}

// Percentuali di variazione scelte dall'utente (vuote = 10%, come nel modello)
export const variazionePrezzi = (p) => p.sensitivita.variazionePrezzi ?? 10;
export const variazioneCosti = (p) => p.sensitivita.variazioneCosti ?? 10;
const meno = (percentuale) => 1 - percentuale / 100;
const piu = (percentuale) => 1 + percentuale / 100;
const testoPercentuale = (percentuale) => `${formatta(percentuale)}%`;

export const SCENARI = [
  { id: 'base', capitolo: '24.1', titolo: () => 'Scenario base', valore: (p) => CALCOLI.risultato(p) },
  {
    id: 'prezzi',
    capitolo: '24.2',
    titolo: (p) => `Riduzione prezzi di vendita −${testoPercentuale(variazionePrezzi(p))}`,
    valore: (p) => risultatoScenario(p, { ricavi: meno(variazionePrezzi(p)) }),
  },
  {
    id: 'costi',
    capitolo: '24.3',
    titolo: (p) => `Incremento costi di costruzione +${testoPercentuale(variazioneCosti(p))}`,
    valore: (p) => risultatoScenario(p, { costi: piu(variazioneCosti(p)) }),
  },
  {
    id: 'combinato',
    capitolo: '24.4',
    titolo: (p) =>
      `Riduzione prezzi −${testoPercentuale(variazionePrezzi(p))} e incremento costi +${testoPercentuale(variazioneCosti(p))}`,
    valore: (p) => risultatoScenario(p, { ricavi: meno(variazionePrezzi(p)), costi: piu(variazioneCosti(p)) }),
  },
  { id: 'ritardo', capitolo: '24.5', titolo: () => 'Ritardo di 12 mesi', valore: risultatoRitardo },
];

// Cap. 24.6 - righe: ricavi + / base / -; colonne: costi - / base / +
export function righeMatrice(p) {
  const v = variazionePrezzi(p);
  return [
    { etichetta: `Ricavi +${testoPercentuale(v)}`, fattore: piu(v) },
    { etichetta: 'Ricavi base', fattore: 1 },
    { etichetta: `Ricavi −${testoPercentuale(v)}`, fattore: meno(v) },
  ];
}
export function colonneMatrice(p) {
  const v = variazioneCosti(p);
  return [
    { etichetta: `Costi −${testoPercentuale(v)}`, fattore: meno(v) },
    { etichetta: 'Costi base', fattore: 1 },
    { etichetta: `Costi +${testoPercentuale(v)}`, fattore: piu(v) },
  ];
}

export function calcola(nome, progetto) {
  const funzione = CALCOLI[nome];
  if (!funzione) {
    console.warn(`Calcolo sconosciuto: ${nome}`);
    return null;
  }
  return funzione(progetto);
}
