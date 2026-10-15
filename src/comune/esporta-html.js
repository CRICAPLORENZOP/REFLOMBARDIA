// Trasforma i blocchi della relazione (relazione.js) in HTML:
// serve per l'anteprima nella videata 13 e per la stampa in PDF.

const sicuro = (testo) =>
  String(testo ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[●\]/g, '<span class="manca">[●]</span>');

const rigaSezione = (riga) => riga.slice(1).every((cella) => cella === '' || cella == null);

function tabellaHtml(blocco) {
  const allinea = (indice) => (blocco.colonne[indice]?.numero ? ' class="numero"' : '');
  const intestazione = blocco.colonne.map((c, i) => `<th${allinea(i)}>${sicuro(c.titolo)}</th>`).join('');
  const righe = blocco.righe
    .map((riga) =>
      rigaSezione(riga)
        ? `<tr class="sezione"><td colspan="${blocco.colonne.length}">${sicuro(riga[0])}</td></tr>`
        : `<tr>${riga.map((cella, i) => `<td${allinea(i)}>${sicuro(cella)}</td>`).join('')}</tr>`,
    )
    .join('');
  const totale = blocco.totale
    ? `<tfoot><tr>${blocco.totale.map((cella, i) => `<td${allinea(i)}>${sicuro(cella)}</td>`).join('')}</tr></tfoot>`
    : '';
  return `<table class="${blocco.piccola ? 'piccola' : ''}"><thead><tr>${intestazione}</tr></thead><tbody>${righe}</tbody>${totale}</table>`;
}

export function relazioneInHtml(blocchi) {
  return blocchi
    .map((b) => {
      switch (b.tipo) {
        case 'titolo':
          return b.livello === 1 ? `<h2>${sicuro(b.testo)}</h2>` : `<h3>${sicuro(b.testo)}</h3>`;
        case 'paragrafo':
          return `<p class="${b.stile || ''}">${sicuro(b.testo)}</p>`;
        case 'campo':
          return `<p class="campo-relazione"><strong>${sicuro(b.etichetta)}:</strong> ${sicuro(b.valore)}</p>`;
        case 'elenco':
          return `<ul>${b.voci.map((v) => `<li>${sicuro(v)}</li>`).join('')}</ul>`;
        case 'tabella':
          return tabellaHtml(b);
        case 'interruzione':
          return '<div class="interruzione"></div>';
        default:
          return '';
      }
    })
    .join('\n');
}
