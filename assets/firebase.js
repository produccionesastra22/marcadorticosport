// Firebase compartido: conserva el proyecto y la ruta del marcador original.
const FIREBASE_CONFIG = {
apiKey: "AIzaSyA71rh4uzcNOueb48-FegayRueExfmI9tw",
authDomain: "astraprods.firebaseapp.com",
databaseURL: "https://astraprods-default-rtdb.firebaseio.com",
projectId: "astraprods"
};
firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.database();

const params = new URLSearchParams(location.search);
const matchId = params.get("match") || "default";
const ref = db.ref("marcadorSimple/" + matchId);

const defaults = {
team1Name:"LOCAL", team2Name:"VISITANTE",
team1Logo:"", team2Logo:"", score1:0, score2:0,
timer:{phase:"first",baseSeconds:0,running:false,startedAt:0,extraMinutes:0,extraActive:false},
penalties:{active:false,team1Name:"LOCAL",team2Name:"VISITANTE",kicks1:[null,null,null,null,null],kicks2:[null,null,null,null,null],visibleKicks:5},
layout:{
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

let state = JSON.parse(JSON.stringify(defaults));
let offset = 0;

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");

function serverNow() { return Date.now() + offset; }

function seconds() {
  if(!state.timer.running) return Math.max(0, Number(state.timer.baseSeconds)||0);
  return Math.max(0,
    (Number(state.timer.baseSeconds)||0) +
    Math.floor((serverNow()-(Number(state.timer.startedAt)||0))/1000)
  );
}

function fmt(s) {
  s=Math.max(0,Math.floor(s));
  return `${pad(Math.floor(s/60))}:${pad(s%60)}`;
}

function save(p) { return ref.update(p); }

ref.on("value", snap => {
  const d=snap.val()||{};
  state={...defaults,...d,timer:{...defaults.timer,...(d.timer||{})},penalties:{...defaults.penalties,...(d.penalties||{})}};
  if(window.renderApp) window.renderApp();
});

db.ref(".info/serverTimeOffset").on("value",s=>offset=Number(s.val()||0));

window.ASTRA = { $, db, auth, ref, state, defaults, save, seconds, fmt, getState:()=>state };
window.refreshAstraState = () => window.ASTRA.state = state;
