// Videata 11 - Quadro economico (cap. 21), contributo di costruzione (cap. 22),
// rapporto pubblico/privato (cap. 23). Quasi tutto è calcolato dalle videate precedenti.

import { montaLayout } from '../../comune/layout.js';
import { collegaCampi } from '../../comune/campi.js';
import { getProgetto, onCambio } from '../../comune/stato.js';
import { formattaConUnita, formatta } from '../../comune/numeri.js';
import { CALCOLI, VOCI_COSTO, isPluri } from '../../comune/calcoli.js';

montaLayout(10);

const euro = (valore) => formattaConUnita(valore, '€');

function disegnaQuadro() {
  const p = getProgetto();
  const pluri = isPluri(p);
  const riga = (voce, valore, classe = '') =>
    `<tr class="${classe}"><td class="fissa">${voce}</td><td class="numero">${valore}</td></tr>`;

  const costi = VOCI_COSTO.map((voce) => riga(voce.voce, euro(voce.valore(p)))).join('');
  const nonApplicabile = '<span class="non-applicabile">non applicabile*</span>';
  const saldo = pluri ? CALCOLI.saldoPluri(p) : CALCOLI.saldoMono(p);

  document.getElementById('quadro-economico').innerHTML = `
    <table class="tabella-dati quadro">
      <thead><tr><th>Componente</th><th class="numero">Importo <small>(€)</small></th></tr></thead>
      <tbody>
        <tr class="sezione"><td colspan="2">RICAVI</td></tr>
        ${riga('Vendita immobili', euro(CALCOLI.ricaviVendita(p)))}
        ${riga('Box/pertinenze', euro(CALCOLI.ricaviPertinenze(p)))}
        ${riga('Altri ricavi', euro(CALCOLI.altriRicavi(p)))}
        ${riga('TOTALE RICAVI', euro(CALCOLI.ricaviComplessivi(p)), 'subtotale')}
        <tr class="sezione"><td colspan="2">COSTI</td></tr>
        ${costi}
        ${riga('Margine promotore', pluri ? nonApplicabile : euro(CALCOLI.marginePromotore(p)))}
        ${riga('Oneri finanziari*', pluri ? nonApplicabile : euro(CALCOLI.oneriFinanziari(p)))}
        ${riga('TOTALE COSTI', euro(CALCOLI.costiComplessivi(p)), 'subtotale')}
        ${riga(pluri ? 'SALDO (non attualizzato)' : 'SALDO', euro(saldo), `saldo${saldo < 0 ? ' negativo' : ''}`)}
        ${pluri ? riga('VAN', euro(CALCOLI.van(p)), `saldo${CALCOLI.van(p) < 0 ? ' negativo' : ''}`) : ''}
      </tbody>
    </table>`;

  document.getElementById('nota-pluri').hidden = !pluri;
  document.getElementById('etichetta-risultato').textContent = pluri ? 'VAN dell\'operazione' : 'Saldo economico dell\'operazione';
  document.getElementById('box-risultato').classList.toggle('negativo', CALCOLI.risultato(p) < 0);

  const privato = CALCOLI.totaleInvestimentoPrivato(p);
  document.getElementById('rapporto-pubblico-privato').textContent = privato
    ? `${formatta((CALCOLI.totaleBeneficiPubblici(p) / privato) * 100)} %`
    : '—';
}

collegaCampi();
disegnaQuadro();
onCambio(disegnaQuadro);
