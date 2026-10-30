// ── FOKUS-MODUS (ECHT/AUTO/STAND) ───────────────────────
const modus = has ? WURZEL_STATE.modus() : 'ECHT';
document.querySelectorAll('[data-fokus]').forEach(b=>{
  b.classList.toggle('on', ['ECHT','AUTO','STAND'][+b.dataset.fokus] === modus);
});
document.getElementById('modusDim').textContent = modus;
document.querySelector('.kopf-zeile').classList.remove('mode-auto','mode-stand');
if (modus === 'AUTO')  document.querySelector('.kopf-zeile').classList.add('mode-auto');
if (modus === 'STAND') document.querySelector('.kopf-zeile').classList.add('mode-stand');
// Badge im Header
let badge = document.querySelector('.mode-badge');
if (!badge) {
  badge = document.createElement('span');
  badge.className = 'mode-badge';
  document.querySelector('.kopf-state').appendChild(badge);
}
badge.textContent = modus;
badge.className = 'mode-badge ' + modus;

// ── PFAD-LADDER ────────────────────────────────────────
const PFAD = [
  {w:'81', op:'Ausgangspunkt', t:'Die Wurzel', b:'Start des Pfads. Die 81 steht vor der 9 — sie ist der Anfang, nicht das Ergebnis. Hier beginnt alles, und hierhin kehrt alles zurück.'},
  {w:'9',  op:'8 + 1 = 9',     t:'Die Quersumme', b:'Die 81 faltet sich auf ihre Essenz: 8 + 1 = 9. Was bleibt, wenn man die Wurzel auf das Wesentliche reduziert.'},
  {w:'3',  op:'√9 = 3',        t:'Die Wurzel der 9', b:'Der tiefste Punkt des Pfads. √9 = 3 — klein, exakt, nicht weiter teilbar. Die Mitte, in der der Pfad wendet.'},
  {w:'9',  op:'3² = 9',        t:'Das Quadrat', b:'Aus der Tiefe wächst es zurück: 3² = 9. Dieselbe 9 wie zuvor — und doch eine andere, weil sie den Weg durch die 3 kennt.'},
  {w:'81', op:'9² = 81',       t:'Die Rückkehr', b:'9² = 81. Der Pfad schließt sich: Das Ende ist der Anfang. Die 81 trägt den ganzen Weg in sich — deshalb ist sie echt.'}
];
const pfadIdx = has ? WURZEL_STATE.pfadIndex() : 0;
document.getElementById('pfadLadder').innerHTML = PFAD.map((p,i)=>{
  const on = i === pfadIdx;
  return `<div class="pfad-step ${on?'on':''}" data-pfad="${i}">
    <span class="num">${p.w}</span>
    <span class="op">${p.op}</span>
  </div>${i<PFAD.length-1 ? '<span class="pfad-arrow">›</span>' : ''}`;
}).join('');
document.getElementById('pfadInfo').textContent = PFAD[pfadIdx].t;
document.getElementById('pfadLabel').textContent = `Schritt ${pfadIdx+1} von 5 · ${PFAD[pfadIdx].op}`;
document.getElementById('pfadTitle').textContent = `${PFAD[pfadIdx].w} — ${PFAD[pfadIdx].t}`;
document.getElementById('pfadBody').textContent  = PFAD[pfadIdx].b;

// ORI-Anker zeigt aktuellen Pfadwert
document.getElementById('oriNum').textContent = PFAD[pfadIdx].w;
