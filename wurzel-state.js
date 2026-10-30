/* wurzel-state.js v3 · NC.SUITE Runtime · +modus +pfad */
(() => {
  const KEY = "NC_SUITE_STATE_V1";
  const MAP = {
    HOME:  ["CLOSED","OPEN","VERBUNDEN"],
    ORT:   ["LEER","GEWÄHLT","GEHALTEN"],
    PRUEF: ["UNGEPRUEFT","RICHTIG","FEHLER"]
  };
  const MODI = ["ECHT","AUTO","STAND"];           // NEU
  const PFAD = [81, 9, 3, 9, 81];                 // NEU · 81→9→3→9→81

  const DEFAULT = {
    HOME:0, ORT:0, PRUEF:0,
    modus:0,          // NEU · 0=ECHT 1=AUTO 2=STAND
    pfadIndex:0,      // NEU · 0..4 (Schritt im Pfad)
    tmp:531,
    activeSlot:0,
    slots:Array(81).fill(false),
    peers:{ R1:"online", R2:"online", R3:"online" }
  };

  const clone = (o) => (typeof structuredClone==="function")
    ? structuredClone(o) : JSON.parse(JSON.stringify(o));

  function load(){
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULT);
      return { ...clone(DEFAULT), ...JSON.parse(raw) };
    } catch { return clone(DEFAULT); }
  }

  const S = load();
  const clamp = (v,min,max) => Math.min(max, Math.max(min, Number(v)||0));

  let bus = null;
  try { if (typeof BroadcastChannel!=="undefined") bus = new BroadcastChannel(KEY); } catch {}

  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
  function emit(){
    save();
    if (bus) try { bus.postMessage({ type:"sync", state:S }); } catch {}
    if (typeof api.onRemote==="function") api.onRemote();
  }
  function applyRemote(state){
    if (!state) return;
    Object.assign(S, state);
    if (typeof api.onRemote==="function") api.onRemote();
  }
  window.addEventListener("storage", e => {
    if (e.key!==KEY || !e.newValue) return;
    try { applyRemote(JSON.parse(e.newValue)); } catch {}
  });
  if (bus) bus.onmessage = (e) => {
    if (e.data && e.data.type==="sync") applyRemote(e.data.state);
  };

  const api = {
    _S:S, onRemote:null,
    get(n){ return S[n]; },
    set(n,i){
      if (!(n in MAP)) return;
      S[n] = clamp(i, 0, MAP[n].length-1);
      emit();
    },
    getZustand(n){ return (n in MAP) ? MAP[n][S[n]] : null; },
    zustand(){
      return { HOME:MAP.HOME[S.HOME], ORT:MAP.ORT[S.ORT], PRUEF:MAP.PRUEF[S.PRUEF] };
    },

    /* NEU — MODUS */
    modus(){ return MODI[S.modus]; },
    setModus(i){ S.modus = clamp(i, 0, 2); emit(); },
    isAuto(){ return S.modus === 1; },
    isStand(){ return S.modus === 2; },

    /* NEU — PFAD 81→9→3→9→81 */
    pfad(){ return PFAD.slice(); },
    pfadIndex(){ return S.pfadIndex; },
    pfadWert(){ return PFAD[S.pfadIndex]; },
    setPfadIndex(i){ S.pfadIndex = clamp(i, 0, PFAD.length-1); emit(); },
    pfadStep(){ S.pfadIndex = (S.pfadIndex + 1) % PFAD.length; emit(); return S.pfadIndex; },

    /* Slots */
    slotGet(slot){ return !!S.slots[clamp(slot,0,80)]; },
    slotSet(slot,val){ slot=clamp(slot,0,80); S.slots[slot]=!!val; S.activeSlot=slot; emit(); },
    slotToggle(slot){ slot=clamp(slot,0,80); S.slots[slot]=!S.slots[slot]; S.activeSlot=slot; emit(); },
    activeCount(){ return S.slots.filter(Boolean).length; },

    /* TMP */
    tmp(){ return S.tmp; },
    tmpSet(v){ S.tmp = clamp(v,0,729); emit(); },
    tmpStep(){ S.tmp += 81; if (S.tmp>729) S.tmp=0; emit(); return S.tmp; },

    /* RAR & WAHRHEIT */
    rarOf(slot){ slot=clamp(slot,0,80); return 81-(slot%9); },
    wahrheit(slot=S.activeSlot){
      slot=clamp(slot,0,80);
      return (S.tmp * (81-(slot%9))) / 729;
    },

    /* Blöcke */
    bloecke(){
      const wz = ["HOME","HOME","HOME","ORT","ORT","ORT","PRUEF","PRUEF","PRUEF"];
      return Array.from({length:9}, (_,i) => {
        const slots = Array.from({length:9}, (_,n)=>i*9+n);
        const isP = s => Math.floor(s/9) === (s%9);
        const dateien = slots.filter(s=>!isP(s) && S.slots[s]).length;
        const parity  = slots.filter(s=> isP(s) && S.slots[s]).length;
        return { idx:i, wurzel:wz[i], slots, dateien, parity, rarVon:81-i*9 };
      });
    },

    /* Ampel */
    ampel(){
      const Z = this.zustand();
      const f = [Z.HOME,Z.ORT,Z.PRUEF].filter(x=>
        ["CLOSED","LEER","FEHLER","UNGEPRUEFT"].includes(x)).length;
      const w = [Z.HOME,Z.ORT,Z.PRUEF].filter(x=>
        ["OPEN","GEWÄHLT"].includes(x)).length;
      if (f>=2) return "FAELLT";
      if (f>=1 || w>=2) return "WACKELT";
      return "STEHT";
    },

    reset(){ Object.assign(S, clone(DEFAULT)); emit(); }
  };

  window.WURZEL_STATE = api;
  save();
})();
