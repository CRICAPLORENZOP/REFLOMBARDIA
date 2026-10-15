// Crea un archivio ZIP (senza compressione) a partire da un elenco di file di testo.
// Serve per il file Word: un .docx è uno ZIP che contiene alcuni file XML.

const TABELLA_CRC = (() => {
  const tabella = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabella[n] = c >>> 0;
  }
  return tabella;
})();

function crc32(dati) {
  let crc = 0xffffffff;
  for (let i = 0; i < dati.length; i++) crc = TABELLA_CRC[(crc ^ dati[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// Data e ora nel formato MS-DOS richiesto dallo ZIP
function dataDos(data) {
  const ora = (data.getHours() << 11) | (data.getMinutes() << 5) | Math.floor(data.getSeconds() / 2);
  const giorno = ((data.getFullYear() - 1980) << 9) | ((data.getMonth() + 1) << 5) | data.getDate();
  return { ora, giorno };
}

// file = [{ nome: 'word/document.xml', contenuto: '<xml…>' }, …]  ->  Uint8Array
export function creaZip(file) {
  const codifica = new TextEncoder();
  const { ora, giorno } = dataDos(new Date());
  const parti = [];
  const centrale = [];
  let posizione = 0;

  for (const { nome, contenuto } of file) {
    const nomeByte = codifica.encode(nome);
    const dati = typeof contenuto === 'string' ? codifica.encode(contenuto) : contenuto;
    const crc = crc32(dati);

    const locale = new DataView(new ArrayBuffer(30));
    locale.setUint32(0, 0x04034b50, true);
    locale.setUint16(4, 20, true);
    locale.setUint16(6, 0x0800, true); // nomi in UTF-8
    locale.setUint16(8, 0, true); // nessuna compressione
    locale.setUint16(10, ora, true);
    locale.setUint16(12, giorno, true);
    locale.setUint32(14, crc, true);
    locale.setUint32(18, dati.length, true);
    locale.setUint32(22, dati.length, true);
    locale.setUint16(26, nomeByte.length, true);
    locale.setUint16(28, 0, true);
    parti.push(new Uint8Array(locale.buffer), nomeByte, dati);

    const voce = new DataView(new ArrayBuffer(46));
    voce.setUint32(0, 0x02014b50, true);
    voce.setUint16(4, 20, true);
    voce.setUint16(6, 20, true);
    voce.setUint16(8, 0x0800, true);
    voce.setUint16(10, 0, true);
    voce.setUint16(12, ora, true);
    voce.setUint16(14, giorno, true);
    voce.setUint32(16, crc, true);
    voce.setUint32(20, dati.length, true);
    voce.setUint32(24, dati.length, true);
    voce.setUint16(28, nomeByte.length, true);
    voce.setUint32(42, posizione, true);
    centrale.push(new Uint8Array(voce.buffer), nomeByte);

    posizione += 30 + nomeByte.length + dati.length;
  }

  const dimensioneCentrale = centrale.reduce((totale, parte) => totale + parte.length, 0);
  const fine = new DataView(new ArrayBuffer(22));
  fine.setUint32(0, 0x06054b50, true);
  fine.setUint16(8, file.length, true);
  fine.setUint16(10, file.length, true);
  fine.setUint32(12, dimensioneCentrale, true);
  fine.setUint32(16, posizione, true);

  const tutte = [...parti, ...centrale, new Uint8Array(fine.buffer)];
  const risultato = new Uint8Array(tutte.reduce((totale, parte) => totale + parte.length, 0));
  let scostamento = 0;
  for (const parte of tutte) {
    risultato.set(parte, scostamento);
    scostamento += parte.length;
  }
  return risultato;
}
