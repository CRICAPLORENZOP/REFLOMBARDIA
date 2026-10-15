// Funzioni per leggere e mostrare i numeri all'italiana (virgola per i decimali).

// Trasforma il testo scritto dall'utente in un numero. "1250,5" -> 1250.5
export function leggiNumero(testo) {
  if (testo == null) return null;
  let pulito = String(testo).trim().replace(/\s/g, '').replace('€', '');
  if (pulito === '') return null;
  if (pulito.includes(',')) pulito = pulito.replace(/\./g, '').replace(',', '.');
  const numero = Number(pulito);
  return Number.isFinite(numero) ? numero : null;
}

// Mostra un numero con i separatori italiani. 1250.5 -> "1.250,5"
export function formatta(numero, decimali = 2) {
  if (numero == null || !Number.isFinite(numero)) return '';
  return numero.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: decimali, useGrouping: 'always' });
}

// Importi in euro: senza decimali se interi, altrimenti sempre con due (2.068.732,10)
export function formattaEuro(numero) {
  if (numero == null || !Number.isFinite(numero)) return '';
  const arrotondato = Math.round(numero * 100) / 100;
  const decimali = Number.isInteger(arrotondato) ? 0 : 2;
  return arrotondato.toLocaleString('it-IT', {
    minimumFractionDigits: decimali,
    maximumFractionDigits: decimali,
    useGrouping: 'always',
  });
}

// Valore da rimettere dentro una casella di testo (senza punti delle migliaia).
export function perCasella(numero) {
  if (numero == null) return '';
  return String(numero).replace('.', ',');
}

export function formattaConUnita(numero, unita) {
  if (numero == null) return '';
  if (unita === '€') return `€ ${formattaEuro(numero)}`;
  return unita ? `${formatta(numero)} ${unita}` : formatta(numero);
}

// Somma una colonna di una tabella, ignorando le celle vuote.
export function somma(righe, chiave) {
  return (righe || []).reduce((totale, riga) => totale + (Number.isFinite(riga[chiave]) ? riga[chiave] : 0), 0);
}
