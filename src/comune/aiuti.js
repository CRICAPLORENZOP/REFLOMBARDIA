// Testi dei tooltip (icona ⓘ).
// La chiave è il numero di capitolo del titolo (es. '5.2') oppure il valore di data-aiuto
// (titoli senza numero e intestazioni di colonna, es. 'col:altezza').
//
// I testi con "rif" riportano solo quanto scritto nell'Allegato A alla D.G.R. XI/7729
// del 28/12/2022 ("Modalità e i requisiti per l'elaborazione della valutazione
// economico-finanziaria"). "testo" spiega cosa inserire e come il programma usa il dato.

const A = 'Allegato A alla D.G.R. XI/7729/2022';

export const AIUTI = {
  // ---------- Passo 1 ----------
  frontespizio: {
    titolo: 'Intervento di rigenerazione urbana',
    testo:
      'Dati che identificano la relazione: nome dell\'intervento, Comune, provincia, ambito, indirizzo, procedimento e data. ' +
      'Compaiono nella copertina della REF.',
    rif: `${A}, par. 5: la REF deve contenere tutti i dati necessari a comprendere la valutazione in modo autonomo rispetto agli altri elaborati. Il primo capitolo dell'articolazione-tipo riporta autore, committente e finalità.`,
  },
  2.1: {
    titolo: 'Soggetto proponente',
    testo: 'Chi presenta l\'intervento (il committente): denominazione, sede, codice fiscale/partita IVA e rappresentante legale.',
    rif: `${A}, par. 5: il committente è un contenuto minimo della REF.`,
  },
  2.2: {
    titolo: 'Proprietà',
    testo: 'Proprietari delle aree e degli immobili interessati, se diversi dal proponente.',
    rif: `${A}, par. 5: lo stato di fatto comprende l'identificazione proprietaria dei beni immobili.`,
  },
  2.3: {
    titolo: 'Tecnico incaricato',
    testo: 'Professionista (l\'autore) che redige e sottoscrive la REF, con ordine/collegio e numero di iscrizione. Nome e qualifica vengono ripresi nella sottoscrizione (cap. 28).',
    rif: `${A}, par. 5: l'autore è un contenuto minimo della REF.`,
  },

  // ---------- Passo 2 ----------
  3.1: {
    titolo: 'Localizzazione',
    testo: 'Si compila da sola con Comune e indirizzo scritti nel Frontespizio (passo 1).',
  },
  3.2: {
    titolo: 'Identificazione catastale',
    testo:
      'Elenca foglio, mappale e subalterno delle particelle interessate con la loro superficie. Il totale può diventare la superficie territoriale (3.3). ' +
      'Eventuali vincoli e servitù vanno descritti.',
    rif: `${A}, par. 5: lo stato di fatto comprende l'identificazione catastale dei beni immobili, inclusi vincoli e servitù.`,
  },
  3.3: {
    titolo: 'Superficie territoriale e fondiaria',
    testo:
      'ST = superficie complessiva dell\'area di intervento (puoi usare il totale catastale o scriverla a mano). ' +
      'SF = parte dell\'area destinata all\'edificazione privata, al netto delle aree pubbliche.',
    rif: `${A}, par. 7: le unità di misura delle consistenze urbanistiche sono quelle definite dalle norme urbanistiche.`,
  },
  4.1: {
    titolo: 'Strumento urbanistico vigente',
    testo:
      'Cosa prevede il PGT per l\'area: ambito, destinazione, indice, SLP ammessa, altezza massima, destinazioni ammesse e servizi. ' +
      'La SLP ammessa serve al controllo della SLP di progetto (cap. 6.2).',
    rif: `${A}, par. 6: se la proposta richiede una variante urbanistica, la valutazione calcola anche il contributo straordinario sul maggior valore generato.`,
  },
  4.2: {
    titolo: 'Ambito di rigenerazione',
    testo:
      'Indica se l\'area rientra negli ambiti di rigenerazione individuati dal Comune nel Documento di Piano. Se non rientra, spiega perché la disciplina è comunque applicabile.',
    rif: `${A}, par. 3 (art. 43, comma 2-quater, L.R. 12/2005): negli ambiti di rigenerazione urbana con interventi di ristrutturazione urbanistica il contributo di costruzione è ridotto del 50%, salva la facoltà dei Comuni di prevedere ulteriori riduzioni.`,
  },
  4.3: {
    titolo: 'Procedimento urbanistico',
    testo: 'Procedimento con cui si attua l\'intervento (scelto nel Frontespizio) ed eventuali oggetti della convenzione urbanistica.',
    rif: `${A}, par. 3: se il titolo abilitativo prevede un convenzionamento, il Comune può rimodulare in aumento o in riduzione il contributo di costruzione sulla base della valutazione economico-finanziaria. La REF è uno degli elaborati su cui si svolge il confronto tra proponente e Comune (par. 5).`,
  },

  // ---------- Passo 3 ----------
  5.1: {
    titolo: 'Descrizione dello stato di fatto',
    testo: 'Come si presenta oggi l\'area: edifici esistenti, utilizzo, stato di conservazione, eventuale degrado e situazione ambientale.',
    rif: `${A}, par. 5: lo stato di fatto descrive consistenze, utilizzazione e stati conservativi degli immobili e la situazione ambientale.`,
  },
  5.2: {
    titolo: 'Consistenza edilizia esistente',
    testo:
      'Una riga per fabbricato con destinazione, SLP, altezza e stato di conservazione. Il volume è calcolato come SLP × altezza. ' +
      'Il volume totale viene proposto come quantità da demolire (cap. 12.1).',
    rif: `${A}, par. 5: le consistenze dello stato di fatto sono un contenuto minimo della REF.`,
  },
  5.3: {
    titolo: 'Condizioni dell\'area',
    testo: 'Spunta le condizioni rilevate (degrado, abbandono, dismissione, criticità ambientali o infrastrutturali).',
    rif: `${A}, par. 10: fra i rischi da descrivere c'è il rischio ambientale, cioè la presenza nel sito di sostanze inquinanti.`,
  },
  5.4: {
    titolo: 'Costi di risanamento / bonifica',
    testo:
      'Se sono previste bonifiche, inserisci uno o più importi indicando il documento che li giustifica. ' +
      'Il totale entra nei costi (cap. 17), nel quadro economico (cap. 21), nella componente privata (cap. 23) e nel quadro degli input (cap. 26).',
    rif: `${A}, glossario ("Costi di idoneizzazione"): le bonifiche rientrano nei costi per rendere l'area idonea. Il par. 6 esclude però dal calcolo le bonifiche a carico del proprietario-inquinatore. Il tool regionale non giudica la congruità di questi costi: li rapporta alla superficie del sito contaminato (scheda tecnica, tool "Bonifiche").`,
  },

  // ---------- Passo 4 ----------
  6.1: {
    titolo: 'Descrizione dell\'intervento',
    testo:
      'Cosa prevede il progetto: demolizioni, nuove costruzioni, recuperi, cambi di destinazione e opere pubbliche, distinguendo opere private e opere pubbliche. ' +
      'Lascia vuote le voci che non interessano.',
    rif: `${A}, par. 5: lo stato di progetto indica consistenze e destinazioni, la distinzione tra opere private e pubbliche, il modello di gestione e il cronoprogramma (la distribuzione nel tempo si compila al cap. 18).`,
  },
  6.2: {
    titolo: 'Consistenza di progetto',
    testo:
      'Per ogni destinazione: SLP/SUL, superficie commerciale, altezza (il volume è SLP × altezza) e numero di unità. ' +
      'La superficie commerciale serve per i ricavi (cap. 10.1), la SLP per i costi di costruzione (cap. 12.2).',
    rif: `${A}, scheda tecnica: i ricavi si stimano sulla superficie commerciale (vendibile) e i costi di costruzione sul costo unitario per superficie lorda (tool "Ricavi" e "Costi di costruzione").`,
  },
  6.3: {
    titolo: 'Box, autorimesse e pertinenze',
    testo:
      'Quantità, superficie e valore unitario delle pertinenze. Il valore unitario dei box arriva dal cap. 9.3 e qui non si modifica. ' +
      'Il totale va nei ricavi (cap. 10.2).',
    rif: `${A}, glossario ("Costi di costruzione"): i costi sono differenziati per uso, compresi i parcheggi privati.`,
  },

  // ---------- Passo 5 ----------
  7.1: {
    titolo: 'Opere di urbanizzazione primaria',
    testo: 'Importi delle opere di urbanizzazione primaria realizzate dal proponente (strade, parcheggi, reti, illuminazione, verde...).',
    rif: `${A}, glossario ("Costi"): gli oneri di urbanizzazione primaria (OU1) fanno parte dei costi generali. Fonte indicata: deliberazioni comunali, con costo unitario (€/m²) e costo totale (scheda tecnica, tabella dei parametri).`,
  },
  7.2: {
    titolo: 'Opere di urbanizzazione secondaria',
    testo: 'Importi delle opere di urbanizzazione secondaria realizzate dal proponente (scuole, centri civici, attrezzature...).',
    rif: `${A}, glossario ("Costi"): gli oneri di urbanizzazione secondaria (OU2) fanno parte dei costi generali, con le stesse fonti degli oneri primari.`,
  },
  7.3: {
    titolo: 'Opere pubbliche aggiuntive',
    testo: 'Opere pubbliche ulteriori rispetto alle urbanizzazioni. Il totale entra nei costi generali (cap. 13) e nei benefici pubblici (cap. 23).',
    rif: `${A}, glossario ("Opere e servizi pubblici aggiuntivi"): costi delle opere e dei servizi pubblici in aggiunta a oneri di urbanizzazione e contributo sul costo di costruzione, quantificati nella trattativa con il Comune. Il Piano dei Servizi assicura la dotazione minima di 18 m²/abitante (art. 9, L.R. 12/2005).`,
  },
  7.4: {
    titolo: 'Standard qualitativi',
    testo: 'Valore degli interventi offerti come standard qualitativo. Entra nei costi generali (cap. 13) e nei benefici pubblici (cap. 23).',
    rif: `${A}, par. 1: lo standard qualitativo è l'impegno a realizzare infrastrutture e servizi di interesse generale, anche a gestione privata convenzionata. L'art. 90 della L.R. 12/2005 chiede ai PII una dotazione globale di aree e attrezzature pubbliche coerente con il Piano dei Servizi.`,
  },
  8.1: {
    titolo: 'Aree cedute',
    testo: 'Aree cedute al Comune con superficie e valore unitario. Il valore è un beneficio pubblico (cap. 23).',
    rif: `${A}, par. 1: fra i modi per soddisfare gli standard c'è la cessione di aree, anche esterne al perimetro del PII purché accessibili e fruibili.`,
  },
  8.2: {
    titolo: 'Monetizzazioni',
    testo:
      'Una riga per ogni standard monetizzato: destinazione d\'uso, tipo di standard, quantità e valore unitario. ' +
      'L\'importo è quantità × valore unitario; il totale entra nei costi generali (cap. 13) e nel quadro economico.',
    rif: `${A}, par. 1: la monetizzazione sostituisce la cessione delle aree a standard, con l'impegno del Comune a usare le somme per acquisire fabbricati o aree da destinare a infrastrutture e servizi pubblici.`,
  },
  destinazioniImporti: {
    titolo: 'Dove finiscono questi importi',
    testo: 'Riepilogo di come gli importi di questa pagina vengono usati nel quadro economico, contando ogni costo una sola volta.',
  },

  // ---------- Passo 6 ----------
  9.1: {
    titolo: 'Fonti',
    testo: 'Spunta le fonti usate per determinare i valori immobiliari.',
    rif: `${A}, scheda tecnica (tabella dei parametri): le fonti indicate per i ricavi sono OMI (Agenzia delle Entrate), OSMI (Camera di Commercio di Milano) e le quotazioni di riviste di settore o istituti di ricerca.`,
  },
  9.2: {
    titolo: 'Quotazioni di riferimento',
    testo: 'Valori minimi e massimi rilevati dalle fonti. Il valore medio è calcolato in automatico come riferimento.',
    rif: `${A}, scheda tecnica (tool "Ricavi"): il valore unitario di progetto si confronta con quello ricavato dalle quotazioni OMI della zona, per tipologia edilizia e stato di conservazione. Lo scostamento ritenuto accettabile è dell'ordine del ±10%.`,
  },
  9.3: {
    titolo: 'Valori adottati',
    testo: 'Valori unitari di vendita scelti per ogni destinazione (€/m² di superficie commerciale) e per i box. Sono la base dei ricavi (cap. 10) e dell\'analisi di sensitività (cap. 24).',
    rif: `${A}, glossario ("Ricavi da vendita"): esprimono il valore di mercato dei beni realizzabili, stimato nell'ipotesi di vendita e riferito alla superficie commerciale.`,
  },
  9.4: {
    titolo: 'Motivazione',
    testo: 'Spunta i fattori considerati per scegliere i valori adottati e aggiungi eventuali considerazioni.',
    rif: `${A}, par. 10: per giustificare i valori, nel residenziale si usano andamento dei prezzi al m², numero di transazioni, tempo medio di esposizione sul mercato e sconto tra offerta e prezzo; per gli uffici, canoni di locazione, tassi di capitalizzazione e tassi di vacancy (spazi sfitti).`,
  },

  // ---------- Passo 7 ----------
  10.1: {
    titolo: 'Ricavi da vendita',
    testo: 'Calcolati come superficie commerciale (cap. 6.2) × valore adottato (cap. 9.3) per ogni destinazione.',
    rif: `${A}, glossario ("Ricavi da vendita"): valore di mercato dei beni ottenibili dal progetto, definito in base agli usi ammessi dagli strumenti urbanistici.`,
  },
  10.2: {
    titolo: 'Box e pertinenze',
    testo: 'Valore totale delle pertinenze dal cap. 6.3.',
  },
  10.3: {
    titolo: 'Altri ricavi',
    testo: 'Ricavi non compresi nelle voci precedenti, con una breve descrizione. Qui puoi indicare, per esempio, i ricavi da locazione.',
    rif: `${A}, glossario ("Ricavi da locazione"): si stimano capitalizzando il canone annuo (lordo o netto) con un saggio di capitalizzazione, sempre sulla superficie commerciale.`,
  },
  10.4: {
    titolo: 'Ricavi complessivi',
    testo: 'Somma dei ricavi 10.1 + 10.2 + 10.3. È il valore "A" del modello mono-periodale (cap. 17.1).',
  },

  // ---------- Passo 8 ----------
  11: {
    titolo: 'Costo dell\'area/immobile',
    testo: 'Costo iniziale dell\'area e dei fabbricati esistenti, con i costi accessori e il criterio con cui è stato determinato.',
    rif: `${A}, glossario ("Costo dell'area"): valore di mercato o costo dell'area nello stato di fatto e di diritto prima dell'intervento; può essere una stima autonoma oppure il prezzo di compravendita, se ordinario. Fonti indicate: atti di compravendita e valori IMU (scheda tecnica). Il controllo tipico è l'incidenza dell'area sul valore dell'edificazione (par. 11).`,
  },
  12.1: {
    titolo: 'Demolizioni',
    testo: 'Quantità e prezzo delle demolizioni. Il volume esistente del cap. 5.2 può essere copiato come quantità.',
    rif: `${A}, glossario ("Costi di idoneizzazione"): le demolizioni rientrano nei costi per rendere l'area idonea. Fonte indicata: Prezzario regionale, con costo unitario riferito alla superficie o al volume e alle caratteristiche dei fabbricati e degli impianti (scheda tecnica).`,
  },
  12.2: {
    titolo: 'Costi di costruzione',
    testo:
      'Superficie e prezzo unitario di costruzione per ogni destinazione, con la fonte dei prezzi. Se lasci vuota la superficie si usa la SLP del cap. 6.2. ' +
      'Il totale è la base delle spese tecniche in % (cap. 14).',
    rif: `${A}, glossario ("Costi di costruzione"): prezzo delle lavorazioni (materiali, mano d'opera, noli e trasporti), più sicurezza, allestimento del cantiere, costi indiretti, spese generali e utile dell'impresa, distinto per destinazione d'uso. Fonti indicate: Prezzi Tipologie Edilizie DEI e prezzari regionali; lo scostamento ritenuto accettabile è dell'ordine del ±10% (scheda tecnica, tool "Costi di costruzione").`,
  },

  // ---------- Passo 9 ----------
  13: {
    titolo: 'Costi generali',
    testo:
      'Oneri di urbanizzazione, contributo sul costo di costruzione, monetizzazioni, opere pubbliche, standard qualitativi e altri oneri. ' +
      'Oneri U1 + U2 (meno scomputo) più costo di costruzione formano il contributo teorico (cap. 22.1).',
    rif: `${A}, glossario ("Costi"): i costi generali sono oneri di urbanizzazione primaria e secondaria, contributo commisurato al costo di costruzione e opere e servizi pubblici aggiuntivi. Il par. 6 li include tutti fra i costi dell'operazione.`,
  },
  14: {
    titolo: 'Soft costs',
    testo: 'Spese tecniche e generali. Puoi scrivere l\'importo o solo la percentuale sul costo di costruzione (cap. 12.2).',
    rif: `${A}, scheda tecnica (tool "Soft costs"): le spese tecniche (progettazione, direzione lavori, collaudi, sicurezza, accatastamenti...) si confrontano con i corrispettivi del D.Lgs. 50/2016, scostamento accettabile ±10%. Il project management ha un riferimento del 3% (scostamento fino a ±50%); gli imprevisti, per prassi, stanno fra 0% e 6% (scostamento ±20%).`,
  },
  15: {
    titolo: 'Costi di commercializzazione',
    testo: 'Costi di vendita in percentuale. Se lasci vuota la base, si usano i ricavi complessivi (cap. 10.4).',
    rif: `${A}, glossario ("Intermediazione immobiliare"): il corrispettivo si definisce in percentuale sui prezzi di vendita o sui canoni di locazione. Il tool regionale accetta come base sia i ricavi sia i costi di costruzione (scheda tecnica, tool "Costi commerciali").`,
  },

  // ---------- Passo 10 ----------
  16: {
    titolo: 'Scelta del modello di valutazione',
    testo:
      'Mono-periodale: criterio economico (o del margine), per interventi semplici e brevi. ' +
      'Pluri-periodale: criterio finanziario con flussi distribuiti nel tempo, per operazioni complesse e pluriennali. Motiva la scelta.',
    rif: `${A}, par. 7: la scelta dipende dai tempi della trasformazione. Il mono-periodale si usa con orizzonte limitato, bassa complessità e poca incertezza; il pluri-periodale per le trasformazioni complesse, perché considera il rischio nel tempo. Nel tool regionale la differenza ricavi–costi del mono-periodale non è attualizzata, salvo operazioni di breve/medio periodo oltre l'anno (scheda tecnica).`,
  },
  altriCosti: {
    titolo: 'Altri costi',
    testo: 'Costi non compresi nelle pagine precedenti. Entrano nella voce "Altri costi" di entrambi i modelli e nel quadro economico.',
  },
  17.1: {
    titolo: 'Ricavi (A)',
    testo: 'Ricavi complessivi del cap. 10.4.',
  },
  17.2: {
    titolo: 'Costi',
    testo: 'Riepilogo dei costi delle pagine precedenti (area, costruzione, demolizioni, bonifiche, oneri, spese tecniche, commercializzazione, altri costi).',
    rif: `${A}, glossario ("Costi"): i costi di trasformazione sono costo dell'area + costi generali + costi specifici (costruzione e idoneizzazione) + soft costs + commercializzazione + oneri finanziari + margine del promotore.`,
  },
  17.3: {
    titolo: 'Margine ordinario del promotore',
    testo: 'Remunerazione attesa dall\'operatore, in percentuale dei costi o dei ricavi. Nel modello mono-periodale è un costo; nel pluri-periodale è già compreso nel tasso di attualizzazione.',
    rif: `${A}, scheda tecnica (tool "Margine del promotore"): è ritenuta accettabile un'incidenza fra il 10% e il 20% dei costi di costruzione, oppure fra il 5% e il 15% dei ricavi. Per i soggetti con finalità sociali il margine può limitarsi alla copertura di alcune spese. Il glossario precisa che remunera l'attività del promotore, il rischio d'impresa e il capitale proprio.`,
  },
  17.4: {
    titolo: 'Oneri finanziari',
    testo: 'Costo del finanziamento dell\'operazione. Nel modello mono-periodale si aggiunge ai costi; nel pluri-periodale è compreso nel tasso di attualizzazione.',
    rif: `${A}, glossario ("Oneri finanziari"): costo del capitale di debito. Nel mono-periodale si considerano l'ammontare del debito, il tasso di interesse legato al rischio e la durata (acquisizione, progettazione e costruzione). La tabella dei parametri lo esprime in percentuale del costo pieno di costruzione.`,
  },
  17.5: {
    titolo: 'Costi complessivi e risultato',
    testo: 'B = costi + margine + oneri finanziari. Saldo = A – B. Il margine percentuale (17.7) è saldo / ricavi × 100.',
    rif: `${A}, par. 6: saldo positivo = plusvalore, e non serve ridurre i contributi ordinari (se c'è una variante si calcola il contributo straordinario); saldo zero = nessun contributo straordinario; saldo negativo = occorre ridurre la contribuzione ordinaria per rendere sostenibile l'operazione.`,
  },
  18: {
    titolo: 'Distribuzione temporale dei flussi',
    testo: 'Per ogni voce indica la percentuale che cade in ciascun anno (la somma deve fare 100%).',
    rif: `${A}, par. 10: la durata e la distribuzione di entrate e uscite si rappresentano con un cronoprogramma, utile al Comune anche per sapere quando saranno disponibili le opere pubbliche. Nei primi periodi i flussi sono di norma negativi (par. 9).`,
  },
  flussi: {
    titolo: 'Flussi anno per anno',
    testo: 'Per ogni anno: entrate, uscite e flusso netto, calcolato dalla distribuzione del cap. 18.',
    rif: `${A}, glossario ("Flusso di cassa"): beneficio economico netto dell'investimento, espresso in denaro e riferito a un arco temporale.`,
  },
  19: {
    titolo: 'Tasso di attualizzazione',
    testo: 'Tasso usato per riportare i flussi al valore attuale. Motivalo (rischio, durata, struttura finanziaria, costo del debito, rendimento del capitale proprio, mercato).',
    rif: `${A}, glossario: nel pluri-periodale il tasso può essere il costo medio ponderato del capitale (WACC = costo del debito × quota debito + costo del capitale proprio × quota capitale proprio). Il tool regionale chiede: quote di debito e capitale proprio, tasso sui prestiti, inflazione attesa, spread bancario, tasso privo di rischio e premio per il rischio (scheda tecnica, tool "Tassi immobiliari"). L'inflazione si considera aumentando ricavi e costi, lasciandoli costanti, oppure deflazionando il tasso.`,
  },
  20: {
    titolo: 'Valore attuale netto',
    testo:
      'VAN = somma dei flussi netti annui attualizzati al tasso del cap. 19. È il risultato del modello pluri-periodale. ' +
      'Il TIR è il tasso che rende il VAN uguale a zero.',
    rif: `${A}, par. 9: l'attualizzazione converte i flussi futuri in flussi equivalenti di oggi; si considerano tutti i flussi fino al completamento delle vendite.`,
  },

  // ---------- Passo 11 ----------
  21: {
    titolo: 'Quadro economico complessivo',
    testo: 'Riepilogo automatico di ricavi e costi. Nel pluri-periodale margine e oneri finanziari non sono costi: se ne tiene conto con il tasso di attualizzazione.',
    rif: `${A}, par. 9: nel pluri-periodale i costi finanziari (debito e capitale proprio) sono inclusi nel tasso di attualizzazione.`,
  },
  22.1: {
    titolo: 'Contributo di costruzione teorico',
    testo: 'Oneri U1 + U2 meno lo scomputo, più il contributo sul costo di costruzione (importi dal cap. 13).',
  },
  22.2: {
    titolo: 'Riduzione prevista dalla normativa',
    testo: 'Percentuale di riduzione del contributo e suo riferimento normativo. Il contributo ridotto entra nei costi (cap. 17) e nel quadro economico.',
    rif: `${A}, par. 3 (art. 43, comma 2-quater, L.R. 12/2005): riduzione del 50% negli ambiti di rigenerazione individuati nel Documento di Piano, per gli interventi di ristrutturazione urbanistica, salva la facoltà dei Comuni di prevedere ulteriori riduzioni.`,
  },
  22.3: {
    titolo: 'Eventuale rimodulazione',
    testo: 'Mostra il risultato dell\'operazione che il Comune può usare per decidere sulla rimodulazione del contributo.',
    rif: `${A}, par. 11: la verifica serve a stabilire di quanto il contributo può essere ridotto per rendere fattibile l'operazione, oppure aumentato senza comprometterne la fattibilità economico-finanziaria.`,
  },
  23: {
    titolo: 'Rapporto economico pubblico/privato',
    testo: 'Confronta i benefici pubblici (aree, monetizzazioni, oneri, opere, standard) con i costi sostenuti dal privato.',
    rif: `${A}, par. 4 e 6: la valutazione serve al Comune per conoscere ricavi e costi dell'operazione e decidere in modo consapevole la graduazione dei contributi, riducendo la discrezionalità.`,
  },

  // ---------- Passo 12 ----------
  24: {
    titolo: 'Analisi di sensitività',
    testo: 'Verifica quanto è stabile il risultato variando prezzi di vendita e costi di costruzione (10% se lasci vuoto).',
    rif: `${A}, par. 11: la sensitività individua le variabili critiche, cioè quelle le cui variazioni pesano di più sul risultato e sul contributo dovuto. Le variabili vanno analizzate una per volta. I valori soglia ("di rovesciamento") sono quelli oltre i quali il risultato scende sotto il livello minimo accettabile, e indicano i margini della trattativa.`,
  },
  24.5: {
    titolo: 'Ritardo di 12 mesi',
    testo: 'Nel modello mono-periodale il ritardo va stimato a mano, ad esempio togliendo dal saldo gli oneri e i costi di un anno in più.',
    rif: `${A}, par. 10: fra i rischi da considerare ci sono i tempi di vendita (rischio di liquidità) e l'incertezza su costi e tempi di realizzazione (rischio di esecuzione).`,
  },
  24.6: {
    titolo: 'Matrice',
    testo: 'Risultato per ogni combinazione di variazione di ricavi e costi.',
  },
  25: {
    titolo: 'Conclusioni',
    testo: 'Sintesi automatica dei risultati e considerazioni finali facoltative.',
    rif: `${A}, par. 5: le conclusioni espongono gli esiti della valutazione e il loro uso ai sensi dell'art. 43, comma 2-quater, oppure dell'art. 90, comma 1, della L.R. 12/2005. Il par. 12 ricorda che i modelli non considerano i costi e i benefici ambientali e sociali: la sostenibilità economico-finanziaria è solo uno dei criteri di valutazione.`,
  },

  // ---------- Passo 13 ----------
  26: {
    titolo: 'Quadro finale degli input',
    testo: 'Riepilogo dei dati principali usati nel calcolo con la loro fonte. Puoi correggere la fonte suggerita.',
    rif: `${A}, par. 11 e scheda tecnica: ogni dato va accompagnato dalla fonte. Il toolkit regionale indica, voce per voce, le fonti accreditate e l'intervallo di variazione più probabile, così il Comune può controllare l'attendibilità della REF.`,
  },
  27: {
    titolo: 'Documentazione a supporto',
    testo: 'Spunta gli allegati consegnati con la REF. Alcuni vengono suggeriti in base ai dati inseriti.',
    rif: `${A}, par. 10: il modo in cui l'operazione è finanziata può essere documentato con atti che attestano la capacità del soggetto privato di realizzare l'investimento proposto.`,
  },
  28: {
    titolo: 'Sottoscrizione',
    testo: 'Luogo, data e tecnico che firma. Se vuoti si usano comune e data del Frontespizio.',
    rif: `${A}, par. 5: la REF indica il proprio autore.`,
  },

  // ---------- Intestazioni di colonna ----------
  'col:slp': {
    titolo: 'SLP / SUL',
    testo: 'Superficie lorda di pavimento (o superficie utile lorda) secondo la definizione del PGT comunale.',
    rif: `${A}, scheda tecnica (tool "Costi di costruzione"): il costo unitario di costruzione si esprime sulla superficie lorda.`,
  },
  'col:superficieCommerciale': {
    titolo: 'Superficie commerciale',
    testo: 'Superficie usata per la vendita, su cui si applica il valore unitario adottato (cap. 9.3) per calcolare i ricavi.',
    rif: `${A}, glossario ("Ricavi da vendita") e tool "Ricavi": il valore unitario di mercato si applica alla superficie commerciale (vendibile).`,
  },
  'col:altezza': {
    titolo: 'Altezza',
    testo: 'Altezza in metri usata per calcolare il volume (SLP × altezza).',
  },
  'col:volume': {
    titolo: 'Volume',
    testo: 'Calcolato in automatico: SLP × altezza. Non si scrive a mano.',
    rif: `${A}, scheda tecnica: il costo unitario delle demolizioni può essere riferito alla superficie oppure al volume.`,
  },
  'col:valoreBox': {
    titolo: 'Valore unitario',
    testo: 'Per i box arriva dal cap. 9.3 (passo 6) e non si modifica qui. Per le altre pertinenze si scrive a mano.',
  },
  'col:tipoStandard': {
    titolo: 'Tipo standard',
    testo: 'Tipo di dotazione monetizzata: verde, parcheggi o altri servizi.',
  },
  'col:importoMonetizzazione': {
    titolo: 'Importo',
    testo: 'Calcolato in automatico: quantità × valore unitario.',
  },
};
