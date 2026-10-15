// Tooltip di aiuto: aggiunge un'icona ⓘ ai titoli dei capitoli (h2 con .capitolo),
// agli elementi con data-aiuto e alle intestazioni di colonna con data-aiuto.
// Passando il mouse (o con Tab) compare la spiegazione; un clic la tiene aperta; Esc la chiude.

import { AIUTI } from './aiuti.js';

let bolla = null;
let bottoneAperto = null;
let fissata = false;

function caricaStile() {
  if (document.querySelector('link[data-stile="tooltip"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./tooltip.css', import.meta.url).href;
  link.dataset.stile = 'tooltip';
  document.head.appendChild(link);
}

function chiaveDi(elemento) {
  if (elemento.dataset.aiuto) return elemento.dataset.aiuto;
  const capitolo = elemento.querySelector('.capitolo');
  return capitolo ? capitolo.textContent.trim() : null;
}

function creaBolla() {
  bolla = document.createElement('div');
  bolla.className = 'bolla-aiuto';
  bolla.id = 'bolla-aiuto';
  bolla.setAttribute('role', 'tooltip');
  bolla.hidden = true;
  document.body.appendChild(bolla);
}

function riempiBolla(aiuto) {
  bolla.innerHTML = '';
  const titolo = document.createElement('strong');
  titolo.textContent = aiuto.titolo;
  const testo = document.createElement('p');
  testo.textContent = aiuto.testo;
  bolla.append(titolo, testo);
  if (aiuto.rif) {
    const rif = document.createElement('p');
    rif.className = 'rif';
    rif.textContent = aiuto.rif;
    bolla.appendChild(rif);
  }
}

// La bolla sta sotto l'icona; se esce dalla finestra va sopra e viene spostata di lato.
function posiziona(bottone) {
  const margine = 8;
  const icona = bottone.getBoundingClientRect();
  const dimensione = bolla.getBoundingClientRect();
  let sinistra = icona.left + icona.width / 2 - dimensione.width / 2;
  sinistra = Math.max(margine, Math.min(sinistra, window.innerWidth - dimensione.width - margine));
  let alto = icona.bottom + margine;
  if (alto + dimensione.height > window.innerHeight - margine) {
    alto = Math.max(margine, icona.top - dimensione.height - margine);
  }
  bolla.style.left = `${sinistra}px`;
  bolla.style.top = `${alto}px`;
}

function apri(bottone, fissa = false) {
  const aiuto = AIUTI[bottone.dataset.chiave];
  if (!aiuto) return;
  if (bottoneAperto && bottoneAperto !== bottone) bottoneAperto.setAttribute('aria-expanded', 'false');
  riempiBolla(aiuto);
  bolla.hidden = false;
  posiziona(bottone);
  bottoneAperto = bottone;
  fissata = fissa;
  bottone.setAttribute('aria-expanded', 'true');
}

function chiudi() {
  if (!bolla || bolla.hidden) return;
  bolla.hidden = true;
  if (bottoneAperto) bottoneAperto.setAttribute('aria-expanded', 'false');
  bottoneAperto = null;
  fissata = false;
}

function aggiungiIcona(elemento) {
  elemento.dataset.aiutoMontato = '';
  const chiave = chiaveDi(elemento);
  if (!chiave || !AIUTI[chiave]) return;

  const bottone = document.createElement('button');
  bottone.type = 'button';
  bottone.className = 'icona-aiuto';
  bottone.textContent = 'i';
  bottone.dataset.chiave = chiave;
  bottone.setAttribute('aria-label', `Aiuto: ${AIUTI[chiave].titolo}`);
  bottone.setAttribute('aria-describedby', 'bolla-aiuto');
  bottone.setAttribute('aria-expanded', 'false');

  bottone.addEventListener('mouseenter', () => { if (!fissata) apri(bottone); });
  bottone.addEventListener('mouseleave', () => { if (!fissata) chiudi(); });
  bottone.addEventListener('focus', () => { if (!fissata) apri(bottone); });
  bottone.addEventListener('blur', () => { if (!fissata) chiudi(); });
  bottone.addEventListener('click', (evento) => {
    evento.stopPropagation();
    if (fissata && bottoneAperto === bottone) chiudi();
    else apri(bottone, true);
  });

  elemento.appendChild(bottone);
}

function cercaElementi(radice = document) {
  radice
    .querySelectorAll('h2:not([data-aiuto-montato]), [data-aiuto]:not([data-aiuto-montato])')
    .forEach((elemento) => {
      // L'anteprima della relazione (passo 13) resta senza icone.
      if (!elemento.closest('.foglio')) aggiungiIcona(elemento);
    });
}

// Da chiamare una volta per videata (lo fa montaLayout).
export function montaAiuti() {
  caricaStile();
  creaBolla();
  cercaElementi();

  // Le tabelle vengono ridisegnate quando cambiano i dati: le nuove intestazioni ricevono l'icona.
  new MutationObserver(() => cercaElementi()).observe(document.querySelector('.contenuto') ?? document.body, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('keydown', (evento) => { if (evento.key === 'Escape') chiudi(); });
  document.addEventListener('click', (evento) => { if (fissata && !bolla.contains(evento.target)) chiudi(); });
  window.addEventListener('scroll', chiudi, true);
  window.addEventListener('resize', chiudi);
}
