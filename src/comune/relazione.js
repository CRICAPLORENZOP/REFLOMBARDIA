// Costruisce il testo completo della REF (capitoli 1-28) a partire dai dati del progetto.
// Il risultato è un elenco di "blocchi" (titoli, paragrafi, elenchi, tabelle) che viene poi
// trasformato in anteprima/PDF (esporta-html.js) e in Word (esporta-docx.js):
// così i due documenti hanno sempre lo stesso contenuto.
//
// Regole: i dati mancanti compaiono come [●] (come nel modello);
// nelle tabelle le righe completamente vuote vengono omesse.

import { formatta, formattaConUnita } from './numeri.js';
import {
  CALCOLI,
  VOCI_COSTO,
  SCENARI,
  righeMatrice,
  colonneMatrice,
  risultatoScenario,
  righeRicavi,
  valoreUnitarioPertinenza,
  valorePertinenza,
  valoreAreaCeduta,
  importoMonetizzazione,
  volumeDaAltezza,
  importoDemolizione,
  superficieCostruzione,
  importoCostruzione,
  importoSoftCost,
  baseCommercializzazione,
  importoCommercializzazione,
  isPluri,
  numeroAnni,
  importiPerAnno,
  flussiNetti,
} from './calcoli.js';

export const MANCA = '[●]';

// ---------------------------------------------------------------------------
// Elenchi usati anche dalla videata 13

export const ALLEGATI = [
  { id: 'A', testo: 'Estratto PGT e disciplina urbanistica' },
  { id: 'B', testo: 'Visure e planimetrie catastali' },
  { id: 'C', testo: 'Elaborati progettuali' },
  { id: 'D', testo: 'Quadro delle superfici' },
  { id: 'E', testo: 'Computo metrico estimativo' },
  { id: 'F', testo: 'Cronoprogramma' },
  { id: 'G', testo: 'Analisi dei valori immobiliari' },
  { id: 'H', testo: 'Quotazioni OMI' },
  { id: 'I', testo: 'Comparabili di mercato' },
  { id: 'L', testo: 'Fonti dei costi di costruzione' },
  { id: 'M', testo: 'Calcolo degli oneri di urbanizzazione' },
  { id: 'N', testo: 'Calcolo del contributo di costruzione' },
  { id: 'O', testo: 'Quadro delle opere pubbliche e degli standard qualitativi' },
  { id: 'P', testo: 'Modello di calcolo economico-finanziario' },
  { id: 'Q', testo: 'Analisi di sensitività' },
  { id: 'R', testo: 'Eventuale modello pluri-periodale' },
  { id: 'S', testo: 'Eventuale documentazione relativa a bonifiche e costi ambientali' },
];

const valoreAdottato = (p, id) => p.mercato.valoriAdottati.find((riga) => riga.id === id)?.valore ?? null;

// Costo di costruzione medio al m² = totale cap. 12.2 / superfici con un prezzo
export function costoCostruzioneMedio(p) {
  const superficie = p.trasformazione.costruzione
    .filter((riga) => riga.prezzo != null)
    .reduce((totale, riga) => totale + (superficieCostruzione(p, riga) ?? 0), 0);
  return superficie ? CALCOLI.costoCostruzione(p) / superficie : null;
}

// Cap. 26 - quadro finale degli input
export const VOCI_INPUT = [
  { id: 'st', input: 'Superficie territoriale', unita: 'm²', fonte: 'PGT/progetto', valore: (p) => CALCOLI.stEffettiva(p) },
  { id: 'slp', input: 'SLP progetto', unita: 'm²', fonte: 'progetto', valore: (p) => CALCOLI.slpProgetto(p) },
  { id: 'sc', input: 'Superficie commerciale', unita: 'm²', fonte: 'progetto', valore: (p) => CALCOLI.superficieCommercialeProgetto(p) },
  { id: 'vRes', input: 'Valore residenziale', unita: '€/m²', fonte: 'OMI/comparabili', valore: (p) => valoreAdottato(p, 'residenziale') },
  { id: 'vComm', input: 'Valore commerciale', unita: '€/m²', fonte: 'OMI/comparabili', valore: (p) => valoreAdottato(p, 'commerciale') },
  { id: 'vTerz', input: 'Valore terziario', unita: '€/m²', fonte: 'OMI/comparabili', valore: (p) => valoreAdottato(p, 'terziario') },
  { id: 'area', input: 'Costo area', unita: '€', fonte: 'stima/atto', valore: (p) => CALCOLI.costoArea(p) },
  {
    id: 'costruzione',
    input: 'Costo costruzione',
    unita: '€/m²',
    fonte: (p) => p.trasformazione.fonteCostruzione || 'DEI/prezzario',
    valore: costoCostruzioneMedio,
  },
  { id: 'demolizione', input: 'Demolizione', unita: '€', fonte: 'computo', valore: (p) => CALCOLI.demolizioni(p) },
  { id: 'bonifica', input: 'Bonifica', unita: '€', fonte: 'indagine/preventivo', valore: (p) => CALCOLI.bonifiche(p) },
  { id: 'urbanizzazioni', input: 'Urbanizzazioni', unita: '€', fonte: 'computo', valore: (p) => CALCOLI.urbanizzazioni(p) },
  {
    id: 'opere',
    input: 'Opere pubbliche',
    unita: '€',
    fonte: 'computo',
    valore: (p) => CALCOLI.opereAggiuntive(p) + CALCOLI.standardQualitativi(p),
  },
  { id: 'speseTecniche', input: 'Spese tecniche', unita: '€', fonte: 'calcolo', valore: (p) => CALCOLI.softCosts(p) },
  { id: 'commercializzazione', input: 'Commercializzazione', unita: '€', fonte: 'stima', valore: (p) => CALCOLI.commercializzazione(p) },
  { id: 'imprevisti', input: 'Imprevisti', unita: '€', fonte: 'stima', valore: (p) => CALCOLI.imprevisti(p) },
  { id: 'durata', input: 'Durata intervento', unita: 'anni', fonte: 'cronoprogramma', valore: (p) => p.valutazione.durata },
  {
    id: 'tasso',
    input: 'Tasso attualizzazione',
    unita: '%',
    fonte: 'analisi finanziaria',
    valore: (p) => (isPluri(p) ? p.valutazione.tasso : null),
    nonApplicabile: (p) => !isPluri(p),
  },
  {
    id: 'margine',
    input: 'Margine promotore',
    unita: '%',
    fonte: 'metodologia',
    valore: (p) => (isPluri(p) ? null : p.valutazione.percentualeMargine),
    nonApplicabile: (p) => isPluri(p),
  },
  { id: 'ricavi', input: 'Ricavi complessivi', unita: '€', fonte: 'calcolo', valore: (p) => CALCOLI.ricaviComplessivi(p) },
  { id: 'costi', input: 'Costi complessivi', unita: '€', fonte: 'calcolo', valore: (p) => CALCOLI.costiComplessivi(p) },
  { id: 'risultato', input: 'Saldo/VAN', unita: '€', fonte: 'calcolo', valore: (p) => CALCOLI.risultato(p) },
];

export const fontePredefinita = (p, voce) => (typeof voce.fonte === 'function' ? voce.fonte(p) : voce.fonte);
export const fonteInput = (p, voce) => p.riepilogo.fonti[voce.id] || fontePredefinita(p, voce);

// Luogo e data della firma: se non scritti, comune e data del frontespizio
export const luogoFirma = (p) => p.sottoscrizione.luogo || p.frontespizio.comune;
export const dataFirma = (p) => p.sottoscrizione.data || p.frontespizio.data;

// ---------------------------------------------------------------------------
// Piccoli aiuti per scrivere i testi

const testo = (valore) => (valore == null || String(valore).trim() === '' ? MANCA : String(valore).trim());
const euro = (n) => (n == null ? MANCA : formattaConUnita(n, '€'));
const conUnita = (n, unita) => (n == null ? MANCA : `${formatta(n)} ${unita}`);
const percento = (n) => (n == null ? MANCA : `${formatta(n)} %`);

// Celle delle tabelle: vuote se il dato manca (servono a riconoscere le righe vuote)
const cEuro = (n) => (n == null ? '' : formattaConUnita(n, '€'));
const cNum = (n, unita = '') => (n == null ? '' : `${formatta(n)}${unita ? ` ${unita}` : ''}`);
// Totali in fondo alle tabelle: vuoti se zero
const tNum = (n, unita = '') => cNum(n || null, unita);
const cTesto = (valore) => (valore == null ? '' : String(valore).trim());

export function formattaData(data) {
  if (!data) return '';
  const [anno, mese, giorno] = String(data).split('-');
  return giorno ? `${giorno}/${mese}/${anno}` : String(data);
}

const titolo = (testoTitolo) => ({ tipo: 'titolo', livello: 1, testo: testoTitolo });
const sottotitolo = (testoTitolo) => ({ tipo: 'titolo', livello: 2, testo: testoTitolo });
const paragrafo = (testoParagrafo, stile = '') => ({ tipo: 'paragrafo', testo: testoParagrafo, stile });
const campo = (etichetta, valore) => ({ tipo: 'campo', etichetta, valore: testo(valore) });
const elenco = (voci) => ({ tipo: 'elenco', voci: voci.length ? voci : [MANCA] });
const interruzione = () => ({ tipo: 'interruzione' });

// colonne: [{ titolo, numero }]. righe: array di array di testi.
// etichettaFissa = la prima colonna è sempre compilata (voci fisse): la riga è vuota se lo sono le altre.
function tabella(colonne, righe, { totale = null, etichettaFissa = true, piccola = false } = {}) {
  const daControllare = (riga) => (etichettaFissa ? riga.slice(1) : riga);
  const piene = righe.filter((riga) => daControllare(riga).some((cella) => cella !== '' && cella != null));
  if (!piene.length) return paragrafo('Nessuna voce indicata.', 'nota');
  return { tipo: 'tabella', colonne, righe: piene, totale, piccola };
}

const col = (titoloColonna, numero = false) => ({ titolo: titoloColonna, numero });

// ---------------------------------------------------------------------------

function copertina(p) {
  const f = p.frontespizio;
  return [
    paragrafo('RELAZIONE ECONOMICO-FINANZIARIA', 'copertina-titolo'),
    paragrafo("ai sensi dell'art. 43, comma 2-quater, della L.R. 12/2005", 'centrato'),
    paragrafo('e della D.G.R. Lombardia 28 dicembre 2022, n. XI/7729', 'centrato'),
    paragrafo('INTERVENTO DI RIGENERAZIONE URBANA', 'copertina-sottotitolo'),
    paragrafo(`"${testo(f.denominazione)}"`, 'centrato'),
    campo('Comune di', f.comune),
    campo('Provincia', f.provincia),
    campo('Ambito', f.ambito),
    campo('Indirizzo', f.indirizzo),
    campo('Procedimento', CALCOLI.procedimentoTesto(p)),
    campo('Proponente', p.soggetti.proponente.denominazione),
    campo('Proprietà', p.soggetti.proprieta),
    campo('Tecnico incaricato', p.soggetti.tecnico.nome),
    campo('Data', formattaData(f.data)),
    interruzione(),
  ];
}

function capitolo1(p) {
  const f = p.frontespizio;
  return [
    titolo('1. OGGETTO E FINALITÀ DELLA RELAZIONE'),
    paragrafo(
      'La presente Relazione Economico-Finanziaria (di seguito anche "REF") riguarda l\'intervento di rigenerazione urbana denominato:',
    ),
    paragrafo(`"${testo(f.denominazione)}"`, 'centrato'),
    paragrafo(`localizzato nel Comune di ${testo(f.comune)}, in ${testo(f.indirizzo)}.`),
    paragrafo(
      "La relazione è redatta ai sensi dell'art. 43, comma 2-quater, della L.R. 12 marzo 2005, n. 12 e secondo le modalità e i requisiti stabiliti dalla D.G.R. Lombardia 28 dicembre 2022, n. XI/7729.",
    ),
    paragrafo(
      "La finalità della REF è rappresentare, in modo trasparente e verificabile, la struttura economica dell'operazione urbanistica, evidenziando:",
    ),
    elenco([
      "i valori economici generati dall'intervento;",
      'i costi necessari alla trasformazione;',
      'gli investimenti previsti;',
      'le opere pubbliche e di interesse pubblico;',
      "il margine economico dell'operazione;",
      'gli eventuali elementi che incidono sulla sostenibilità economico-finanziaria;',
      "gli elementi utili alle determinazioni dell'Amministrazione comunale in materia di contributo di costruzione.",
    ]),
    paragrafo('La D.G.R. XI/7729/2022 individua due possibili approcci:'),
    paragrafo('1. modello mono-periodale, basato sul criterio economico/margine;'),
    paragrafo('2. modello pluri-periodale, basato sul criterio finanziario e sulla distribuzione temporale dei flussi.'),
    paragrafo("La scelta del modello è effettuata in relazione alla durata e alla complessità dell'intervento."),
  ];
}

function capitolo2(p) {
  const s = p.soggetti;
  return [
    titolo('2. SOGGETTI COINVOLTI'),
    sottotitolo('2.1 Soggetto proponente'),
    campo('Denominazione', s.proponente.denominazione),
    campo('Sede', s.proponente.sede),
    campo('C.F./P.IVA', s.proponente.cfPiva),
    campo('Rappresentante legale', s.proponente.rappresentante),
    sottotitolo('2.2 Proprietà'),
    campo('Proprietario/i', s.proprieta),
    sottotitolo('2.3 Tecnico incaricato della REF'),
    campo('Nome e cognome', s.tecnico.nome),
    campo('Qualifica', s.tecnico.qualifica),
    campo('Ordine/Collegio', s.tecnico.ordine),
    campo('Numero di iscrizione', s.tecnico.iscrizione),
  ];
}

function capitolo3(p) {
  return [
    titolo("3. IDENTIFICAZIONE DELL'AREA"),
    sottotitolo('3.1 Localizzazione'),
    paragrafo("L'area oggetto dell'intervento è ubicata in:"),
    paragrafo(`Comune di ${testo(p.frontespizio.comune)}, ${testo(p.frontespizio.indirizzo)}.`),
    sottotitolo('3.2 Identificazione catastale'),
    tabella(
      [col('Foglio'), col('Mappale'), col('Subalterno'), col('Superficie', true)],
      p.area.catastale.map((r) => [cTesto(r.foglio), cTesto(r.mappale), cTesto(r.subalterno), cNum(r.superficie, 'm²')]),
      { etichettaFissa: false, totale: ['Totale', '', '', tNum(CALCOLI.totaleCatastale(p), 'm²')] },
    ),
    sottotitolo('3.3 Superficie territoriale'),
    paragrafo(`ST = ${conUnita(CALCOLI.stEffettiva(p), 'm²')}`),
    sottotitolo('3.4 Superficie fondiaria'),
    paragrafo(`SF = ${conUnita(p.area.sf, 'm²')}`),
  ];
}

function capitolo4(p) {
  const u = p.urbanistica;
  const oggetti = u.oggettiConvenzione.map((r) => cTesto(r.testo)).filter(Boolean);
  const blocchi = [
    titolo('4. INQUADRAMENTO URBANISTICO'),
    sottotitolo('4.1 Strumento urbanistico vigente'),
    paragrafo(`Secondo il vigente PGT del Comune di ${testo(p.frontespizio.comune)}, l'area ricade in:`),
    paragrafo(testo(u.descrizioneAmbito)),
    paragrafo('La relativa disciplina prevede:'),
    elenco([
      `destinazione urbanistica: ${testo(u.destinazione)};`,
      `indice edificatorio: ${testo(u.indice)};`,
      `SLP/SUL ammessa: ${conUnita(u.slpAmmessa, 'm²')};`,
      `altezza massima: ${conUnita(u.altezzaMax, 'm')};`,
      `destinazioni d'uso ammesse: ${testo(u.destinazioniAmmesse)};`,
      `dotazione di servizi: ${testo(u.dotazioneServizi)}.`,
    ]),
    sottotitolo('4.2 Ambito di rigenerazione'),
  ];
  if (u.ambitoRigenerazione === 'si') {
    blocchi.push(paragrafo("L'area è ricompresa negli ambiti di rigenerazione individuati dal Comune."));
  } else if (u.ambitoRigenerazione === 'no') {
    blocchi.push(
      paragrafo(
        "L'area non è ricompresa negli ambiti di rigenerazione e l'applicabilità della disciplina viene motivata come segue:",
      ),
      paragrafo(testo(u.motivazione)),
    );
  } else {
    blocchi.push(paragrafo(`L'area ${MANCA} è ricompresa negli ambiti di rigenerazione individuati dal Comune.`));
  }
  blocchi.push(
    sottotitolo('4.3 Procedimento urbanistico'),
    paragrafo("L'intervento viene attuato mediante:"),
    paragrafo(testo(CALCOLI.procedimentoTesto(p))),
  );
  if (oggetti.length) {
    blocchi.push(paragrafo('con convenzione urbanistica avente ad oggetto:'), elenco(oggetti.map((o) => `${o};`)));
  }
  return blocchi;
}

const CONDIZIONI = [
  { id: 'degrado', testo: 'degrado edilizio' },
  { id: 'abbandono', testo: 'abbandono' },
  { id: 'dismissione', testo: 'dismissione' },
  { id: 'ambientali', testo: 'criticità ambientali' },
  { id: 'infrastrutturali', testo: 'criticità infrastrutturali' },
];

function capitolo5(p) {
  const s = p.statoFatto;
  const condizioni = CONDIZIONI.filter((c) => s.condizioni[c.id]).map((c) => `${c.testo};`);
  if (s.condizioni.altro) condizioni.push(`${testo(s.condizioniAltro)};`);

  const blocchi = [
    titolo('5. STATO DI FATTO'),
    sottotitolo('5.1 Descrizione'),
    paragrafo("L'area si presenta attualmente come:"),
    paragrafo(testo(s.descrizione)),
    sottotitolo('5.2 Consistenza edilizia esistente'),
    tabella(
      [col('Fabbricato'), col('Destinazione'), col('SLP', true), col('Altezza', true), col('Volume', true), col('Stato')],
      s.fabbricati.map((r) => [
        cTesto(r.fabbricato),
        cTesto(r.destinazione),
        cNum(r.slp, 'm²'),
        cNum(r.altezza, 'm'),
        cNum(volumeDaAltezza(r), 'm³'),
        cTesto(r.stato),
      ]),
      {
        etichettaFissa: true,
        totale: ['Totale', '', tNum(CALCOLI.slpEsistente(p), 'm²'), '', tNum(CALCOLI.volumeEsistente(p), 'm³'), ''],
      },
    ),
    sottotitolo("5.3 Condizioni dell'area"),
    paragrafo('Sono state rilevate le seguenti condizioni:'),
    elenco(condizioni),
    sottotitolo('5.4 Costi di risanamento/bonifica'),
  ];
  if (s.bonifiche === 'si') {
    const voci = Array.isArray(s.vociBonifiche)
      ? s.vociBonifiche
      : [{ descrizione: '', importo: s.importoBonifiche ?? null, documentazione: s.documentazioneBonifiche || '' }];
    const compilate = voci.filter(
      (r) => r.importo != null || String(r.documentazione || '').trim() !== '' || String(r.descrizione || '').trim() !== '',
    );
    if (compilate.length > 1) {
      blocchi.push(
        paragrafo('Sono previste bonifiche, così documentate:'),
        tabella(
          [col('Descrizione'), col('Importo stimato', true), col('La stima è documentata mediante')],
          compilate.map((r) => [cTesto(r.descrizione), cEuro(r.importo), cTesto(r.documentazione)]),
          { etichettaFissa: false, totale: ['Totale', cEuro(CALCOLI.bonifiche(p) || null), ''] },
        ),
      );
    } else {
      const voce = compilate[0] || {};
      blocchi.push(
        paragrafo(`Descrizione: ${testo(voce.descrizione)}.`),
        paragrafo(`Sono previste bonifiche per un importo stimato pari a: ${euro(voce.importo ?? null)}`),
        paragrafo(`La stima è documentata mediante: ${testo(voce.documentazione)}.`),
      );
    }
  } else if (s.bonifiche === 'no') {
    blocchi.push(paragrafo('Non sono previste bonifiche.'));
  } else {
    blocchi.push(paragrafo(`Bonifiche: ${MANCA}`));
  }
  return blocchi;
}

function capitolo6(p) {
  const s = p.statoProgetto;
  const i = s.interventi;
  const interventi = [
    i.demolizione && `demolizione di ${i.demolizione};`,
    i.realizzazione && `realizzazione di ${i.realizzazione};`,
    i.recupero && `recupero di ${i.recupero};`,
    i.nuovaCostruzione && `nuova costruzione di ${i.nuovaCostruzione};`,
    i.cambioDestinazione && `modifica della destinazione d'uso di ${i.cambioDestinazione};`,
    i.spaziPubblici && 'realizzazione di spazi pubblici;',
    i.urbanizzazioni && 'realizzazione di opere di urbanizzazione;',
    i.interessePubblico && 'realizzazione di opere di interesse pubblico;',
  ].filter(Boolean);

  return [
    titolo('6. STATO DI PROGETTO'),
    sottotitolo("6.1 Descrizione dell'intervento"),
    paragrafo('Il progetto prevede:'),
    paragrafo(testo(s.descrizione)),
    ...(interventi.length ? [paragrafo('In particolare:'), elenco(interventi)] : []),
    sottotitolo('6.2 Consistenza di progetto'),
    tabella(
      [
        col('Destinazione'),
        col('SLP/SUL', true),
        col('Superficie commerciale', true),
        col('Altezza', true),
        col('Volume', true),
        col('n. unità', true),
      ],
      s.destinazioni.map((r) => [
        r.destinazione,
        cNum(r.slp, 'm²'),
        cNum(r.superficieCommerciale, 'm²'),
        cNum(r.altezza, 'm'),
        cNum(volumeDaAltezza(r), 'm³'),
        cNum(r.unita),
      ]),
      {
        totale: [
          'Totale',
          tNum(CALCOLI.slpProgetto(p), 'm²'),
          tNum(CALCOLI.superficieCommercialeProgetto(p), 'm²'),
          '',
          tNum(CALCOLI.volumeProgetto(p), 'm³'),
          '',
        ],
      },
    ),
    sottotitolo('6.3 Box, autorimesse e pertinenze'),
    tabella(
      [col('Tipologia'), col('Quantità', true), col('Superficie', true), col('Valore unitario', true), col('Valore totale', true)],
      s.pertinenze.map((r) => [
        r.tipologia,
        cNum(r.quantita),
        cNum(r.superficie, 'm²'),
        cEuro(valoreUnitarioPertinenza(p, r)),
        cEuro(valorePertinenza(p, r)),
      ]),
      { totale: ['Totale', '', '', '', cEuro(CALCOLI.ricaviPertinenze(p))] },
    ),
  ];
}

function tabellaImporti(intestazione, righe, campoTesto, campoImporto, totaleImporto, etichettaFissa = true) {
  return tabella(
    [col(intestazione), col('Importo', true)],
    righe.map((r) => [cTesto(r[campoTesto]), cEuro(r[campoImporto])]),
    { etichettaFissa, totale: ['Totale', cEuro(totaleImporto)] },
  );
}

function capitolo7(p) {
  const o = p.opere;
  return [
    titolo('7. OPERE DI URBANIZZAZIONE E OPERE PUBBLICHE'),
    sottotitolo('7.1 Opere di urbanizzazione primaria'),
    tabellaImporti('Opera', o.primaria, 'opera', 'importo', CALCOLI.urbanizzazionePrimaria(p)),
    sottotitolo('7.2 Opere di urbanizzazione secondaria'),
    tabellaImporti('Opera', o.secondaria, 'opera', 'importo', CALCOLI.urbanizzazioneSecondaria(p), false),
    sottotitolo('7.3 Opere pubbliche aggiuntive'),
    tabellaImporti('Opera', o.aggiuntive, 'opera', 'importo', CALCOLI.opereAggiuntive(p), false),
    sottotitolo('7.4 Standard qualitativi'),
    tabella(
      [col('Intervento'), col('Valore', true)],
      o.standard.map((r) => [cTesto(r.intervento), cEuro(r.valore)]),
      { etichettaFissa: false, totale: ['Totale standard qualitativi', cEuro(CALCOLI.standardQualitativi(p))] },
    ),
  ];
}

function capitolo8(p) {
  const c = p.cessioni;
  return [
    titolo('8. CESSIONI E MONETIZZAZIONI'),
    sottotitolo('8.1 Aree cedute'),
    tabella(
      [col('Area'), col('Superficie', true), col('Valore €/m²', true), col('Valore', true)],
      c.aree.map((r) => [cTesto(r.area), cNum(r.superficie, 'm²'), cEuro(r.valoreUnitario), cEuro(valoreAreaCeduta(r))]),
      { etichettaFissa: false, totale: ['Totale', tNum(CALCOLI.superficieAreeCedute(p), 'm²'), '', cEuro(CALCOLI.areeCedute(p))] },
    ),
    sottotitolo('8.2 Monetizzazioni'),
    tabella(
      [col("Destinazione d'uso"), col('Tipo standard'), col('Quantità', true), col('Valore unitario', true), col('Importo', true)],
      c.monetizzazioni.map((r) => [
        cTesto(r.destinazione),
        cTesto(r.standard),
        cNum(r.quantita, 'm²'),
        cEuro(r.valoreUnitario),
        cEuro(importoMonetizzazione(r)),
      ]),
      { etichettaFissa: false, totale: ['Totale', '', '', '', cEuro(CALCOLI.monetizzazioni(p))] },
    ),
  ];
}

const FONTI_MERCATO = [
  { id: 'omi', testo: 'quotazioni OMI;' },
  { id: 'osmi', testo: 'fonti camerali/OSMI, ove disponibili;' },
  { id: 'comparabili', testo: 'comparabili di mercato;' },
  { id: 'pubblicazioni', testo: 'pubblicazioni specialistiche;' },
  { id: 'offerte', testo: 'offerte immobiliari opportunamente normalizzate;' },
  { id: 'perizie', testo: 'eventuali perizie/stime disponibili.' },
];

const FATTORI_MERCATO = [
  { id: 'localizzazione', testo: 'localizzazione;' },
  { id: 'accessibilita', testo: 'accessibilità;' },
  { id: 'qualitaUrbana', testo: 'qualità urbana;' },
  { id: 'caratteristicheProgettuali', testo: 'caratteristiche progettuali;' },
  { id: 'statoManutentivo', testo: 'stato manutentivo;' },
  { id: 'piano', testo: 'piano;' },
  { id: 'esposizione', testo: 'esposizione;' },
  { id: 'dotazionePertinenziale', testo: 'dotazione pertinenziale;' },
  { id: 'qualitaEnergetica', testo: 'qualità energetica;' },
  { id: 'nuovoIntervento', testo: 'caratteristiche del nuovo intervento;' },
  { id: 'mercatoLocale', testo: 'condizioni del mercato locale.' },
];

function capitolo9(p) {
  const m = p.mercato;
  const valori = m.valoriAdottati.map((r) => [r.destinazione, r.valore == null ? '' : `${cEuro(r.valore)}/m²`]);
  valori.push(['Box', m.valoreBox == null ? '' : `${cEuro(m.valoreBox)}/cad.`]);
  return [
    titolo('9. MERCATO IMMOBILIARE DI RIFERIMENTO'),
    sottotitolo('9.1 Fonti'),
    paragrafo('La determinazione dei valori immobiliari viene effettuata mediante confronto tra:'),
    elenco(FONTI_MERCATO.filter((f) => m.fonti[f.id]).map((f) => f.testo)),
    sottotitolo('9.2 Quotazioni di riferimento'),
    tabella(
      [col('Fonte'), col('Zona'), col('Destinazione'), col('Valore min.', true), col('Valore max', true)],
      m.quotazioni.map((r) => [cTesto(r.fonte), cTesto(r.zona), cTesto(r.destinazione), cEuro(r.minimo), cEuro(r.massimo)]),
      { etichettaFissa: false },
    ),
    sottotitolo('9.3 Valori adottati'),
    tabella([col('Destinazione'), col('Valore adottato', true)], valori),
    sottotitolo('9.4 Motivazione'),
    paragrafo('I valori adottati sono stati determinati tenendo conto di:'),
    elenco(FATTORI_MERCATO.filter((f) => m.fattori[f.id]).map((f) => f.testo)),
    ...(m.motivazione ? [paragrafo(m.motivazione)] : []),
  ];
}

function capitolo10(p) {
  return [
    titolo('10. DETERMINAZIONE DEI RICAVI'),
    sottotitolo('10.1 Ricavi da vendita'),
    paragrafo('La stima viene effettuata mediante:'),
    paragrafo('Ricavo = superficie commerciale × valore unitario', 'centrato'),
    tabella(
      [col('Destinazione'), col('Superficie', true), col('€/m²', true), col('Ricavo', true)],
      righeRicavi(p).map((r) => [r.destinazione, cNum(r.superficie, 'm²'), cEuro(r.valore), cEuro(r.ricavo)]),
      { totale: ['Totale', '', '', cEuro(CALCOLI.ricaviVendita(p))] },
    ),
    sottotitolo('10.2 Box e pertinenze'),
    paragrafo(euro(CALCOLI.ricaviPertinenze(p))),
    sottotitolo('10.3 Altri ricavi'),
    paragrafo(euro(CALCOLI.altriRicavi(p))),
    ...(p.ricavi.descrizioneAltri ? [paragrafo(p.ricavi.descrizioneAltri)] : []),
    sottotitolo('10.4 RICAVI COMPLESSIVI'),
    paragrafo(euro(CALCOLI.ricaviComplessivi(p)), 'evidenza'),
  ];
}

function capitolo11(p) {
  return [
    titolo("11. COSTO DELL'AREA/IMMOBILE"),
    paragrafo(`Il valore dell'area/immobile viene determinato sulla base di: ${testo(p.costoArea.metodo)}.`),
    tabella(
      [col('Voce'), col('Importo', true)],
      p.costoArea.voci.map((r) => [r.voce, cEuro(r.importo)]),
      { totale: ['Totale costo iniziale', cEuro(CALCOLI.costoArea(p))] },
    ),
  ];
}

function capitolo12(p) {
  const t = p.trasformazione;
  return [
    titolo('12. COSTI DI TRASFORMAZIONE'),
    sottotitolo('12.1 Demolizioni'),
    tabella(
      [col('Voce'), col('Quantità', true), col('€/unità', true), col('Totale', true)],
      t.demolizioni.map((r) => [r.voce, cNum(r.quantita, r.unita), cEuro(r.prezzo), cEuro(importoDemolizione(r))]),
      { totale: ['Totale', '', '', cEuro(CALCOLI.demolizioni(p))] },
    ),
    sottotitolo('12.2 Costi di costruzione'),
    tabella(
      [col('Destinazione'), col('Superficie', true), col('€/m²', true), col('Totale', true)],
      t.costruzione
        .filter((r) => r.prezzo != null || r.superficie != null)
        .map((r) => [r.destinazione, cNum(superficieCostruzione(p, r), 'm²'), cEuro(r.prezzo), cEuro(importoCostruzione(p, r))]),
      { totale: ['Totale', '', '', cEuro(CALCOLI.costoCostruzione(p))] },
    ),
    paragrafo(`Fonte: ${testo(t.fonteCostruzione)}.`),
  ];
}

function capitolo13(p) {
  const g = p.costiGenerali;
  const righe = [
    ['Oneri urbanizzazione primaria', cEuro(g.oneriU1)],
    ['Oneri urbanizzazione secondaria', cEuro(g.oneriU2)],
  ];
  if (CALCOLI.scomputoOneri(p)) righe.push(['– Scomputo per opere di urbanizzazione', cEuro(-CALCOLI.scomputoOneri(p))]);
  righe.push(
    ['Contributo sul costo di costruzione', cEuro(g.contributoCC)],
    ['Monetizzazioni', cEuro(CALCOLI.monetizzazioni(p) || null)],
    ['Opere pubbliche', cEuro(CALCOLI.opereAggiuntive(p) || null)],
    ['Standard qualitativi', cEuro(CALCOLI.standardQualitativi(p) || null)],
    ['Altri oneri', cEuro(g.altriOneri)],
  );
  return [
    titolo('13. COSTI GENERALI'),
    tabella([col('Voce'), col('Importo', true)], righe, { totale: ['Totale', cEuro(CALCOLI.costiGenerali(p))] }),
  ];
}

function capitolo14e15(p) {
  return [
    titolo('14. SOFT COSTS'),
    tabella(
      [col('Voce'), col('Importo', true)],
      p.softCosts.map((r) => [r.voce, cEuro(importoSoftCost(p, r))]),
      { totale: ['Totale', cEuro(CALCOLI.softCosts(p))] },
    ),
    titolo('15. COSTI DI COMMERCIALIZZAZIONE'),
    tabella(
      [col('Voce'), col('Base', true), col('%', true), col('Importo', true)],
      p.commercializzazione
        .filter((r) => r.percentuale != null)
        .map((r) => [r.voce, cEuro(baseCommercializzazione(p, r)), cNum(r.percentuale, '%'), cEuro(importoCommercializzazione(p, r))]),
      { totale: ['Totale', '', '', cEuro(CALCOLI.commercializzazione(p))] },
    ),
  ];
}

function capitolo16(p) {
  const v = p.valutazione;
  const modello = v.modello === 'pluri' ? 'MODELLO PLURI-PERIODALE' : v.modello === 'mono' ? 'MODELLO MONO-PERIODALE' : MANCA;
  return [
    titolo('16. SCELTA DEL MODELLO DI VALUTAZIONE'),
    paragrafo(
      `Considerata la durata prevista dell'intervento, pari a circa ${v.durata == null ? MANCA : formatta(v.durata)} anni, e la distribuzione temporale degli investimenti e dei ricavi, viene adottato:`,
    ),
    paragrafo(modello, 'evidenza'),
    sottotitolo('Motivazione'),
    paragrafo(testo(v.motivazione)),
    paragrafo(
      'La scelta è coerente con le indicazioni della D.G.R. XI/7729/2022: per interventi semplici e con orizzonte temporale contenuto può essere utilizzato il modello mono-periodale; per operazioni complesse e pluriennali è più appropriato il modello pluri-periodale.',
    ),
  ];
}

const tabellaVociCosto = (p, etichettaTotale) =>
  tabella(
    [col('Voce'), col('Importo', true)],
    VOCI_COSTO.map((voce) => [voce.voce, cEuro(voce.valore(p) || 0)]),
    { totale: [etichettaTotale, cEuro(CALCOLI.subtotaleCosti(p))] },
  );

function capitolo17(p) {
  const blocchi = [titolo('17. MODELLO MONO-PERIODALE')];
  if (isPluri(p)) {
    blocchi.push(paragrafo('Non applicabile: per l\'intervento è stato adottato il modello pluri-periodale (capitoli 18–20).'));
    return blocchi;
  }
  const v = p.valutazione;
  blocchi.push(
    sottotitolo('17.1 Ricavi'),
    paragrafo(`A = ${euro(CALCOLI.ricaviComplessivi(p))}`),
    sottotitolo('17.2 Costi'),
    tabellaVociCosto(p, 'Subtotale'),
    sottotitolo('17.3 Margine ordinario del promotore'),
    campo('Metodo', v.metodoMargine === 'ricavi' ? 'percentuale dei ricavi' : 'percentuale dei costi'),
    campo('Parametro', v.percentualeMargine == null ? null : `${formatta(v.percentualeMargine)} %`),
    campo('Margine', euro(CALCOLI.marginePromotore(p))),
    sottotitolo('17.4 Oneri finanziari'),
    paragrafo(euro(CALCOLI.oneriFinanziari(p))),
    sottotitolo('17.5 Costi complessivi'),
    paragrafo(`B = ${euro(CALCOLI.costiComplessiviMono(p))}`),
    sottotitolo('17.6 Risultato'),
    paragrafo(`SALDO = A – B = ${euro(CALCOLI.saldoMono(p))}`, 'evidenza'),
    sottotitolo('17.7 Margine percentuale'),
    paragrafo(`Saldo / Ricavi × 100 = ${percento(CALCOLI.marginePercentuale(p))}`),
  );
  return blocchi;
}

function capitoli18a20(p) {
  const blocchi = [titolo('18. MODELLO PLURI-PERIODALE')];
  if (!isPluri(p)) {
    blocchi.push(
      paragrafo('Non applicabile: per l\'intervento è stato adottato il modello mono-periodale (capitolo 17).'),
      titolo('19. TASSO DI ATTUALIZZAZIONE'),
      paragrafo('Non applicabile al modello mono-periodale.'),
      titolo('20. VALORE ATTUALE NETTO'),
      paragrafo('Non applicabile al modello mono-periodale.'),
    );
    return blocchi;
  }
  const v = p.valutazione;
  const n = numeroAnni(p);
  const anni = Array.from({ length: n + 1 }, (_, anno) => col(`Anno ${anno}`, true));
  const cella = (importo) => (importo ? formatta(importo, 0) : '–');
  const righe = [
    ['Ricavi', ...importiPerAnno(p, 'ricavi', CALCOLI.ricaviComplessivi(p)).map(cella)],
    ...VOCI_COSTO.map((voce) => [voce.voce, ...importiPerAnno(p, voce.id, voce.valore(p) || 0).map((importo) => cella(-importo))]),
  ].filter((riga) => riga.slice(1).some((c) => c !== '–'));
  const tir = CALCOLI.tir(p);

  blocchi.push(
    paragrafo('I flussi vengono distribuiti temporalmente come segue (importi in euro):'),
    {
      tipo: 'tabella',
      colonne: [col('Voce'), ...anni],
      righe,
      totale: ['Flusso netto', ...flussiNetti(p).map((f) => formatta(f, 0))],
      piccola: true,
    },
    titolo('19. TASSO DI ATTUALIZZAZIONE'),
    paragrafo(`Tasso adottato: ${percento(v.tasso)}`, 'evidenza'),
    paragrafo(testo(v.motivazioneTasso)),
    ...(v.wacc != null ? [paragrafo(`WACC = ${percento(v.wacc)}`)] : []),
    titolo('20. VALORE ATTUALE NETTO'),
    paragrafo('Per ciascun periodo viene applicata la formula:'),
    paragrafo('PVₜ = FCₜ / (1+r)ᵗ', 'centrato'),
    paragrafo("Il valore attuale netto dell'operazione è:"),
    paragrafo('VAN = Σ FCₜ/(1+r)ᵗ', 'centrato'),
    paragrafo(`Risultato: VAN = ${euro(CALCOLI.van(p))}`, 'evidenza'),
    ...(tir != null ? [paragrafo(`TIR = ${percento(tir)}`)] : []),
  );
  return blocchi;
}

function capitolo21(p) {
  const pluri = isPluri(p);
  const nonApplicabile = 'non applicabile*';
  const righe = [
    ['RICAVI', ''],
    ['Vendita immobili', cEuro(CALCOLI.ricaviVendita(p))],
    ['Box/pertinenze', cEuro(CALCOLI.ricaviPertinenze(p))],
    ['Altri ricavi', cEuro(CALCOLI.altriRicavi(p))],
    ['TOTALE RICAVI', cEuro(CALCOLI.ricaviComplessivi(p))],
    ['COSTI', ''],
    ...VOCI_COSTO.map((voce) => [voce.voce, cEuro(voce.valore(p) || 0)]),
    ['Margine promotore', pluri ? nonApplicabile : cEuro(CALCOLI.marginePromotore(p))],
    ['Oneri finanziari*', pluri ? nonApplicabile : cEuro(CALCOLI.oneriFinanziari(p))],
    ['TOTALE COSTI', cEuro(CALCOLI.costiComplessivi(p))],
  ];
  const saldo = pluri ? CALCOLI.saldoPluri(p) : CALCOLI.saldoMono(p);
  return [
    titolo('21. QUADRO ECONOMICO COMPLESSIVO'),
    { tipo: 'tabella', colonne: [col('COMPONENTE'), col('IMPORTO', true)], righe, totale: [pluri ? 'SALDO (non attualizzato)' : 'SALDO', cEuro(saldo)] },
    ...(pluri ? [paragrafo(`VAN = ${euro(CALCOLI.van(p))}`, 'evidenza')] : []),
    paragrafo(
      '* Nel modello pluri-periodale la componente finanziaria deve essere trattata coerentemente con il metodo finanziario e con il tasso di attualizzazione adottato.',
      'nota',
    ),
  ];
}

function capitolo22(p) {
  const righe = [
    ['Oneri U1', cEuro(CALCOLI.oneriU1(p))],
    ['Oneri U2', cEuro(CALCOLI.oneriU2(p))],
  ];
  if (CALCOLI.scomputoOneri(p)) righe.push(['– Scomputo opere di urbanizzazione', cEuro(-CALCOLI.scomputoOneri(p))]);
  righe.push(['Costo di costruzione', cEuro(CALCOLI.contributoCostoCostruzione(p))]);
  const riduzione = p.contributo.riduzionePercentuale;
  return [
    titolo('22. CONTRIBUTO DI COSTRUZIONE'),
    sottotitolo('22.1 Contributo teorico'),
    { tipo: 'tabella', colonne: [col('Componente'), col('Importo', true)], righe, totale: ['Totale', cEuro(CALCOLI.contributoTeorico(p))] },
    sottotitolo('22.2 Riduzione prevista dalla normativa'),
    campo('Contributo teorico', euro(CALCOLI.contributoTeorico(p))),
    campo('Riduzione', `${euro(CALCOLI.riduzioneContributo(p))}${riduzione ? ` (${formatta(riduzione)} %)` : ''}`),
    ...(p.contributo.motivazioneRiduzione ? [campo('Riferimento normativo', p.contributo.motivazioneRiduzione)] : []),
    campo('Contributo dopo riduzione', euro(CALCOLI.contributoDopoRiduzione(p))),
    sottotitolo('22.3 Eventuale rimodulazione'),
    paragrafo('Il risultato della REF evidenzia:'),
    paragrafo(
      `${isPluri(p) ? "VAN dell'operazione" : "Saldo economico dell'operazione"} = ${euro(CALCOLI.risultato(p))}`,
      'evidenza',
    ),
    paragrafo(
      "L'Amministrazione comunale potrà utilizzare tale risultato nell'ambito delle proprie determinazioni in merito alla rimodulazione del contributo di costruzione, nei limiti e secondo le modalità previste dalla normativa.",
    ),
  ];
}

function capitolo23(p) {
  const privato = CALCOLI.totaleInvestimentoPrivato(p);
  const rapporto = privato ? (CALCOLI.totaleBeneficiPubblici(p) / privato) * 100 : null;
  return [
    titolo('23. RAPPORTO ECONOMICO PUBBLICO/PRIVATO'),
    paragrafo(
      'La seguente tabella costituisce il quadro di sintesi del rapporto economico tra intervento privato e benefici pubblici.',
    ),
    {
      tipo: 'tabella',
      colonne: [col('COMPONENTE PUBBLICA'), col('VALORE', true)],
      righe: [
        ['Aree cedute', cEuro(CALCOLI.areeCedute(p))],
        ['Monetizzazioni', cEuro(CALCOLI.monetizzazioni(p))],
        ['Oneri urbanizzazione', cEuro(CALCOLI.beneficioOneriUrbanizzazione(p))],
        ['Contributo di costruzione', cEuro(CALCOLI.beneficioContributoCostruzione(p))],
        ['Opere pubbliche', cEuro(CALCOLI.opereAggiuntive(p))],
        ['Standard qualitativi', cEuro(CALCOLI.standardQualitativi(p))],
        ['Altri benefici', cEuro(CALCOLI.altriBenefici(p))],
      ],
      totale: ['TOTALE BENEFICI PUBBLICI', cEuro(CALCOLI.totaleBeneficiPubblici(p))],
    },
    {
      tipo: 'tabella',
      colonne: [col('COMPONENTE PRIVATA'), col('VALORE', true)],
      righe: [
        ['Costo area', cEuro(CALCOLI.costoArea(p))],
        ['Costi costruzione', cEuro(CALCOLI.costoCostruzione(p))],
        ['Demolizioni', cEuro(CALCOLI.demolizioni(p))],
        ['Bonifiche', cEuro(CALCOLI.bonifiche(p))],
        ['Spese tecniche', cEuro(CALCOLI.softCosts(p))],
        ['Commercializzazione', cEuro(CALCOLI.commercializzazione(p))],
        ['Altri costi', cEuro(CALCOLI.altriCosti(p))],
      ],
      totale: ['TOTALE INVESTIMENTO PRIVATO', cEuro(privato)],
    },
    paragrafo(`Rapporto benefici pubblici / investimento privato = ${percento(rapporto)}`),
  ];
}

function capitolo24(p) {
  const etichetta = isPluri(p) ? 'VAN' : 'Saldo';
  const scenari = SCENARI.flatMap((scenario) => [
    sottotitolo(`${scenario.capitolo} ${scenario.titolo(p)}`),
    paragrafo(`${etichetta} = ${euro(scenario.valore(p))}`),
  ]);
  if (!isPluri(p) && p.sensitivita.motivazioneRitardo) {
    scenari.push(paragrafo(`Stima del ritardo: ${p.sensitivita.motivazioneRitardo}`, 'nota'));
  }
  const colonne = colonneMatrice(p);
  return [
    titolo('24. ANALISI DI SENSITIVITÀ'),
    paragrafo("Per verificare la stabilità del risultato vengono modificati i principali parametri dell'operazione."),
    ...scenari,
    sottotitolo('24.6 Matrice'),
    {
      tipo: 'tabella',
      colonne: [col(''), ...colonne.map((c) => col(c.etichetta, true))],
      righe: righeMatrice(p).map((riga) => [
        riga.etichetta,
        ...colonne.map((c) => cEuro(risultatoScenario(p, { ricavi: riga.fattore, costi: c.fattore }))),
      ]),
    },
    ...(p.sensitivita.commento ? [paragrafo(p.sensitivita.commento)] : []),
  ];
}

function capitolo25(p) {
  const pluri = isPluri(p);
  const tir = CALCOLI.tir(p);
  const risultati = pluri
    ? [campo('VAN', euro(CALCOLI.van(p))), campo('TIR', tir == null ? 'non calcolabile' : percento(tir))]
    : [campo('Saldo economico', euro(CALCOLI.saldoMono(p))), campo('Margine', percento(CALCOLI.marginePercentuale(p)))];
  return [
    titolo('25. CONCLUSIONI'),
    paragrafo("Dall'analisi effettuata risulta che:"),
    campo('Ricavi complessivi', euro(CALCOLI.ricaviComplessivi(p))),
    campo('Costi complessivi', euro(CALCOLI.costiComplessivi(p))),
    ...risultati,
    paragrafo("L'operazione presenta pertanto le caratteristiche economico-finanziarie descritte nella presente relazione."),
    paragrafo(
      'Le risultanze sono strettamente correlate alle ipotesi progettuali, urbanistiche, economiche e temporali indicate.',
    ),
    ...(p.conclusioni.considerazioni ? [paragrafo(p.conclusioni.considerazioni)] : []),
    paragrafo(
      "La presente REF costituisce documento tecnico di supporto alle determinazioni dell'Amministrazione comunale e non sostituisce le ulteriori valutazioni urbanistiche, ambientali, sociali e amministrative necessarie ai fini dell'approvazione dell'intervento.",
    ),
    paragrafo(
      "La stessa D.G.R. chiarisce che la sostenibilità economico-finanziaria costituisce soltanto uno degli elementi della valutazione pubblica e che i modelli non internalizzano automaticamente gli effetti ambientali e sociali dell'intervento.",
    ),
  ];
}

export function valoreInput(p, voce) {
  if (voce.nonApplicabile?.(p)) return 'n.a.';
  const valore = voce.valore(p);
  if (valore == null) return MANCA;
  return voce.unita === '€' ? formatta(valore, 2) : formatta(valore);
}

function capitolo26(p) {
  return [
    titolo('26. QUADRO FINALE DEGLI INPUT'),
    {
      tipo: 'tabella',
      colonne: [col('INPUT'), col('VALORE', true), col('UNITÀ'), col('FONTE')],
      righe: VOCI_INPUT.map((voce) => [voce.input, valoreInput(p, voce), voce.unita, fonteInput(p, voce)]),
    },
  ];
}

function capitolo27(p) {
  const scelti = ALLEGATI.filter((a) => p.allegati[a.id]).map((a) => `${a.id}. ${a.testo}`);
  return [titolo('27. DOCUMENTAZIONE A SUPPORTO'), paragrafo('Alla presente REF vengono allegati:'), elenco(scelti)];
}

function capitolo28(p) {
  const t = p.soggetti.tecnico;
  return [
    titolo('28. SOTTOSCRIZIONE'),
    paragrafo(`${testo(luogoFirma(p))}, ${testo(formattaData(dataFirma(p)))}`),
    paragrafo('Il tecnico incaricato', 'firma'),
    paragrafo(testo(t.nome), 'firma'),
    paragrafo(testo(t.qualifica), 'firma'),
    paragrafo('_______________________________', 'firma'),
  ];
}

export function costruisciRelazione(p) {
  return [
    ...copertina(p),
    ...capitolo1(p),
    ...capitolo2(p),
    ...capitolo3(p),
    ...capitolo4(p),
    ...capitolo5(p),
    ...capitolo6(p),
    ...capitolo7(p),
    ...capitolo8(p),
    ...capitolo9(p),
    ...capitolo10(p),
    ...capitolo11(p),
    ...capitolo12(p),
    ...capitolo13(p),
    ...capitolo14e15(p),
    ...capitolo16(p),
    ...capitolo17(p),
    ...capitoli18a20(p),
    ...capitolo21(p),
    ...capitolo22(p),
    ...capitolo23(p),
    ...capitolo24(p),
    ...capitolo25(p),
    ...capitolo26(p),
    ...capitolo27(p),
    ...capitolo28(p),
  ];
}

// Quanti dati mancano ([●]) nella relazione: serve per l'avviso nella videata 13
export function contaMancanti(blocchi) {
  const conta = (s) => (String(s).match(/\[●\]/g) || []).length;
  return blocchi.reduce((totale, b) => {
    if (b.tipo === 'paragrafo' || b.tipo === 'titolo') return totale + conta(b.testo);
    if (b.tipo === 'campo') return totale + conta(b.valore);
    if (b.tipo === 'elenco') return totale + b.voci.reduce((t, v) => t + conta(v), 0);
    if (b.tipo === 'tabella') return totale + b.righe.flat().reduce((t, c) => t + conta(c), 0);
    return totale;
  }, 0);
}
