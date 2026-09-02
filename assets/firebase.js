// ASTRA · Firebase compartido
// Carga este archivo DESPUÉS de firebase-app-compat, firebase-auth-compat y firebase-database-compat.
(() => {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyA71rh4uzcNOueb48-FegayRueExfmI9tw",
    authDomain: "astraprods.firebaseapp.com",
    databaseURL: "https://astraprods-default-rtdb.firebaseio.com",
    projectId: "astraprods"
  };

  const defaults = {
    team1Name: "LOCAL", team2Name: "VISITANTE",
    team1Logo: "", team2Logo: "", score1: 0, score2: 0,
    timer: {phase:"first",baseSeconds:0,running:false,startedAt:0,extraMinutes:0,extraActive:false},
    penalties: {active:false,team1Name:"LOCAL",team2Name:"VISITANTE",kicks1:[null,null,null,null,null],kicks2:[null,null,null,null,null],visibleKicks:5},
    layout: {
      name1:{x:10,y:38,w:30,h:8,fontSize:3,color:"#ffffff",fontWeight:800,align:"left"},
      name2:{x:60,y:38,w:30,h:8,fontSize:3,color:"#ffffff",fontWeight:800,align:"right"},
      score1:{x:28,y:48,w:15,h:12,fontSize:6,color:"#ffffff",fontWeight:900,align:"center"},
      score2:{x:57,y:48,w:15,h:12,fontSize:6,color:"#ffffff",fontWeight:900,align:"center"},
      clock:{x:40,y:20,w:20,h:10,fontSize:5,color:"#ffffff",fontWeight:900,align:"center"},
      extra:{x:46,y:30,w:8,h:6,fontSize:2.2,color:"#ffffff",fontWeight:800,align:"center"},
      logo1:{x:5,y:35,w:12,h:12,fontSize:1,color:"#ffffff",fontWeight:700,align:"center"},
      logo2:{x:83,y:35,w:12,h:12,fontSize:1,color:"#ffffff",fontWeight:700,align:"center"}
    }
  };

  const params = new URLSearchParams(location.search);
  const matchId = params.get("match") || "default";
  const clone = o => JSON.parse(JSON.stringify(o));

  if (!window.firebase) throw new Error("Firebase SDK no cargado.");
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);

  const auth = firebase.auth();
  const db = firebase.database();
  const ref = db.ref("marcadorSimple/" + matchId);
  let state = clone(defaults);
  let offset = 0;

  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2,"0");
  const serverNow = () => Date.now() + offset;

  function seconds() {
    const t = state.timer || defaults.timer;
    if (!t.running) return Math.max(0, Number(t.baseSeconds) || 0);
    return Math.max(0,
      (Number(t.baseSeconds) || 0) +
      Math.floor((serverNow() - (Number(t.startedAt) || 0)) / 1000)
    );
  }

  function fmt(s) {
    s = Math.max(0, Math.floor(Number(s) || 0));
    return `${pad(Math.floor(s/60))}:${pad(s%60)}`;
  }

  function mergeState(d) {
    return {
      ...clone(defaults), ...(d || {}),
      timer: {...defaults.timer, ...((d && d.timer) || {})},
      penalties: {...defaults.penalties, ...((d && d.penalties) || {})},
      layout: Object.fromEntries(Object.keys(defaults.layout).map(k => [k, {...defaults.layout[k], ...(((d && d.layout) || {})[k] || {})}]))
    };
  }

  const reportWriteError = err => { console.error("ASTRA Firebase write error:", err); window.dispatchEvent(new CustomEvent("astra-firebase-write-error", {detail: err})); throw err; };
  const save = patch => ref.update(patch).catch(reportWriteError);
  const setTimer = patch => ref.update({timer: {...state.timer, ...patch}}).catch(reportWriteError);

  ref.on("value", snap => {
    state = mergeState(snap.val());
    if (window.renderApp) window.renderApp();
  }, err => {
    console.error("ASTRA Firebase read error:", err);
    window.dispatchEvent(new CustomEvent("astra-firebase-error", {detail: err}));
  });

  db.ref(".info/serverTimeOffset").on("value", snap => offset = Number(snap.val() || 0));

  window.ASTRA = {
    $, db, auth, ref, defaults, save, setTimer, seconds, fmt, serverNow,
    getState: () => state,
    get offset(){ return offset; },
    matchId
  };
})();
