const fokus = e.target.closest('[data-fokus]');
if (fokus) {
  if (window.WURZEL_STATE) WURZEL_STATE.setModus(+fokus.dataset.fokus);
  pushLog(`Fokus → ${['ECHT','AUTO','STAND'][+fokus.dataset.fokus]}`);
  draw(); return;
}
const pfad = e.target.closest('[data-pfad]');
if (pfad) {
  if (window.WURZEL_STATE) WURZEL_STATE.setPfadIndex(+pfad.dataset.pfad);
  pushLog(`Pfad → Schritt ${+pfad.dataset.pfad+1}`);
  draw(); return;
}
