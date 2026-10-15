// Trasforma i blocchi della relazione (relazione.js) in un file Word (.docx).
// Un .docx è un archivio ZIP con dentro alcuni file XML (formato "WordprocessingML").

import { creaZip } from './zip.js';

const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

// Larghezza utile della pagina A4 con margini di 2 cm, in twip (1 cm = 567 twip)
const LARGHEZZA_UTILE = 9638;

const xml = (testo) =>
  String(testo ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Testo -> "run" di Word. Gli a-capo diventano <w:br/>, i dati mancanti [●] vengono evidenziati in giallo.
function runs(testo, { grassetto = false, corsivo = false, dimensione = null, colore = null } = {}) {
  const proprieta = (evidenzia) =>
    [
      grassetto ? '<w:b/>' : '',
      corsivo ? '<w:i/>' : '',
      colore ? `<w:color w:val="${colore}"/>` : '',
      dimensione ? `<w:sz w:val="${dimensione}"/><w:szCs w:val="${dimensione}"/>` : '',
      evidenzia ? '<w:highlight w:val="yellow"/>' : '',
    ].join('');
  return String(testo ?? '')
    .split(/(\[●\])/)
    .filter((parte) => parte !== '')
    .map((parte) => {
      const evidenzia = parte === '[●]';
      const righe = parte.split('\n').map((riga) => `<w:t xml:space="preserve">${xml(riga)}</w:t>`);
      return `<w:r><w:rPr>${proprieta(evidenzia)}</w:rPr>${righe.join('<w:br/>')}</w:r>`;
    })
    .join('');
}

function paragrafo(contenuto, { stile = null, allinea = null, prima = null, dopo = null, rientro = null, unitoAlSeguente = false } = {}) {
  const proprieta = [
    stile ? `<w:pStyle w:val="${stile}"/>` : '',
    unitoAlSeguente ? '<w:keepNext/>' : '',
    prima != null || dopo != null ? `<w:spacing${prima != null ? ` w:before="${prima}"` : ''}${dopo != null ? ` w:after="${dopo}"` : ''}/>` : '',
    rientro ? `<w:ind w:left="${rientro}" w:hanging="284"/>` : '',
    allinea ? `<w:jc w:val="${allinea}"/>` : '',
  ].join('');
  return `<w:p><w:pPr>${proprieta}</w:pPr>${contenuto}</w:p>`;
}

const STILI_PARAGRAFO = {
  'copertina-titolo': { allinea: 'center', prima: 2400, dopo: 240, run: { grassetto: true, dimensione: 40, colore: '1F3864' } },
  'copertina-sottotitolo': { allinea: 'center', prima: 600, dopo: 120, run: { grassetto: true, dimensione: 28 } },
  centrato: { allinea: 'center' },
  nota: { run: { corsivo: true, dimensione: 18, colore: '595959' } },
  evidenza: { run: { grassetto: true } },
  firma: { allinea: 'right', dopo: 60 },
};

function paragrafoStile(testo, stile) {
  const s = STILI_PARAGRAFO[stile] || {};
  return paragrafo(runs(testo, s.run), { allinea: s.allinea, prima: s.prima, dopo: s.dopo });
}

// ---------- Tabelle ----------

function larghezzeColonne(colonne) {
  if (colonne.length === 1) return [LARGHEZZA_UTILE];
  const prima = Math.round(LARGHEZZA_UTILE * (colonne.length > 5 ? 0.22 : colonne.length === 2 ? 0.6 : 0.34));
  const altre = Math.floor((LARGHEZZA_UTILE - prima) / (colonne.length - 1));
  return [prima, ...Array(colonne.length - 1).fill(altre)];
}

function cella(testo, larghezza, { numero = false, grassetto = false, sfondo = null, dimensione = 20, unione = 1, unitoAlSeguente = true } = {}) {
  const proprieta = [
    `<w:tcW w:w="${larghezza}" w:type="dxa"/>`,
    unione > 1 ? `<w:gridSpan w:val="${unione}"/>` : '',
    sfondo ? `<w:shd w:val="clear" w:color="auto" w:fill="${sfondo}"/>` : '',
  ].join('');
  const contenuto = paragrafo(runs(testo, { grassetto, dimensione }), { allinea: numero ? 'right' : null, prima: 40, dopo: 40, unitoAlSeguente });
  return `<w:tc><w:tcPr>${proprieta}</w:tcPr>${contenuto}</w:tc>`;
}

const rigaSezione = (riga) => riga.slice(1).every((c) => c === '' || c == null);

function tabella(blocco) {
  const larghezze = larghezzeColonne(blocco.colonne);
  const dimensione = blocco.piccola ? (blocco.colonne.length > 8 ? 12 : 15) : 20;
  const opzioni = (i, extra = {}) => ({ numero: blocco.colonne[i]?.numero && i > 0, dimensione, ...extra });

  const bordo = (lato) => `<w:${lato} w:val="single" w:sz="4" w:space="0" w:color="8EAADB"/>`;
  const proprieta = `<w:tblPr><w:tblW w:w="${LARGHEZZA_UTILE}" w:type="dxa"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(bordo).join('')}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>`;
  const griglia = `<w:tblGrid>${larghezze.map((l) => `<w:gridCol w:w="${l}"/>`).join('')}</w:tblGrid>`;

  const intestazione = `<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${blocco.colonne
    .map((c, i) => cella(c.titolo, larghezze[i], opzioni(i, { grassetto: true, sfondo: 'D9E2F3' })))
    .join('')}</w:tr>`;

  // L'ultima riga non va "unita alla seguente", altrimenti la tabella si lega al testo successivo
  const righe = blocco.righe
    .map((riga, r) => {
      const unitoAlSeguente = Boolean(blocco.totale) || r < blocco.righe.length - 1;
      if (rigaSezione(riga)) {
        return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cella(riga[0], LARGHEZZA_UTILE, { grassetto: true, sfondo: 'F2F2F2', dimensione, unione: blocco.colonne.length, unitoAlSeguente })}</w:tr>`;
      }
      return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${riga.map((c, i) => cella(c, larghezze[i], opzioni(i, { unitoAlSeguente }))).join('')}</w:tr>`;
    })
    .join('');

  const totale = blocco.totale
    ? `<w:tr><w:trPr><w:cantSplit/></w:trPr>${blocco.totale
        .map((c, i) => cella(c, larghezze[i], opzioni(i, { grassetto: true, sfondo: 'D9E2F3', unitoAlSeguente: false })))
        .join('')}</w:tr>`
    : '';

  // Paragrafo vuoto dopo la tabella: Word non permette due tabelle attaccate
  return `<w:tbl>${proprieta}${griglia}${intestazione}${righe}${totale}</w:tbl>${paragrafo('', { dopo: 120 })}`;
}

// ---------- Corpo del documento ----------

function corpo(blocchi) {
  return blocchi
    .map((b) => {
      switch (b.tipo) {
        case 'titolo':
          return paragrafo(runs(b.testo), { stile: b.livello === 1 ? 'Heading1' : 'Heading2' });
        case 'paragrafo':
          return paragrafoStile(b.testo, b.stile);
        case 'campo':
          return paragrafo(`${runs(`${b.etichetta}: `, { grassetto: true })}${runs(b.valore)}`, { dopo: 60 });
        case 'elenco':
          return b.voci.map((voce) => paragrafo(runs(`•  ${voce}`), { rientro: 568, dopo: 40 })).join('');
        case 'tabella':
          return tabella(b);
        case 'interruzione':
          return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
        default:
          return '';
      }
    })
    .join('');
}

function documento(blocchi) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS_W}" xmlns:r="${NS_R}"><w:body>${corpo(blocchi)}<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1134" w:bottom="1418" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

const STILI = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${NS_W}">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="it-IT"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:jc w:val="left"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="1F3864"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:jc w:val="left"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="2F5496"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
</w:styles>`;

const PIE_PAGINA = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="${NS_W}"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

const TIPI_CONTENUTO = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;

const RELAZIONI_PACCHETTO = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const RELAZIONI_DOCUMENTO = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;

// blocchi -> contenuto del file .docx (Uint8Array)
export function creaDocx(blocchi) {
  return creaZip([
    { nome: '[Content_Types].xml', contenuto: TIPI_CONTENUTO },
    { nome: '_rels/.rels', contenuto: RELAZIONI_PACCHETTO },
    { nome: 'word/document.xml', contenuto: documento(blocchi) },
    { nome: 'word/styles.xml', contenuto: STILI },
    { nome: 'word/footer1.xml', contenuto: PIE_PAGINA },
    { nome: 'word/_rels/document.xml.rels', contenuto: RELAZIONI_DOCUMENTO },
  ]);
}
