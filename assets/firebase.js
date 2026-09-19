// Compat se mantiene porque las páginas tienen scripts inline que consumen firebase.*.
(function bootstrapAstra(global) {
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA71rh4uzcNOueb48-FegayRueExfmI9tw",
  authDomain: "astraprods.firebaseapp.com",
  databaseURL: "https://astraprods-default-rtdb.firebaseio.com",
  projectId: "astraprods"
};

if(!global.firebase) throw new Error("Firebase SDK no cargado.");
if(!global.firebase.apps.length) global.firebase.initializeApp(FIREBASE_CONFIG);

const auth = global.firebase.auth();
const db = global.firebase.database();
const params = new URLSearchParams(global.location.search);
const matchId = params.get("match") || "default";

const defaults = {
team1Name:"LOCAL", team2Name:"VISITANTE",
team1Logo:"", team2Logo:"", score1:0, score2:0,
timer:{phase:"first",baseSeconds:0,running:false,startedAt:0,extraMinutes:0,extraActive:false,extraStartSeconds:0},
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
const moduleDefaults = {
  production: {
    countdown:{active:false,baseSeconds:0,startedAt:0},
    stats:{shots1:0,shots2:0,corners1:0,corners2:0,sourceUrl:""},
    sponsors:[{name:"",logo:"",enabled:false},{name:"",logo:"",enabled:false},{name:"",logo:"",enabled:false}]
  },
  volleyball:{teamAName:"LOCAL",teamBName:"VISITANTE",pointsA:0,pointsB:0,setsA:0,setsB:0,setNumber:1,serving:1,finished:false,history:[]},
  noticias:{category:"ÚLTIMA HORA · DEPORTES",headline:"",subtitle:"",logo:"",logoScale:1,blue:"#174ea6",red:"#d71920",visible:false,updatedAt:0},
  rotulo:{name:"",cargo:"",color1:"#4e7fff",color2:"#111111",font:"Arial",logo:"",logoScale:1,visible:false,updatedAt:0},
  alineaciones:{teamA:{name:"EQUIPO A",players:Array.from({length:11},()=>({num:"",name:""}))},teamB:{name:"EQUIPO B",players:Array.from({length:11},()=>({num:"",name:""}))},visible:false,updatedAt:0}
};

const clone = value => JSON.parse(JSON.stringify(value));
const mergeState = (base, data) => ({...base,...(data||{}),timer:{...(base.timer||{}),...((data||{}).timer||{})},penalties:{...(base.penalties||{}),...((data||{}).penalties||{})},layout:{...(base.layout||{}),...((data||{}).layout||{})}});
const serverNow = offset => Date.now() + (Number(offset)||0);
const secondsForTimer = (timer, offset) => {
    const value = timer || {};
    if(!value.running) return Math.max(0, Number(value.baseSeconds)||0);
    return Math.max(0, (Number(value.baseSeconds)||0) + Math.floor((serverNow(offset) - (Number(value.startedAt)||0)) / 1000));
};
const extraSecondsForTimer = (timer, offset) => {
  const value = timer || {};
  if(!value.extraActive) return 0;
  return Math.max(0, secondsForTimer(value, offset) - (Number(value.extraStartSeconds)||0));
};
const pad = value => String(value).padStart(2,"0");
const fmt = value => { const seconds = Math.max(0, Math.floor(value)); return `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`; };
const createRef = path => db.ref(path);
const createMatchRef = path => createRef(`marcadorSimple/${matchId}${path ? `/${path}` : ""}`);

global.ASTRA = {
    FIREBASE_CONFIG,
    auth,
    db,
    matchId,
    ref: createMatchRef(),
    defaults,
    moduleDefaults,
    clone,
    mergeState,
    createRef,
    createMatchRef,
    serverNow,
    secondsForTimer,
    seconds: secondsForTimer,
    extraSecondsForTimer,
    fmt,
    save: patch => createMatchRef().update(patch)
};
})(window);
