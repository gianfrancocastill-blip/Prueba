const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

const rooms = new Map();

const positions = [
 ["Arquera","POR"],["Lateral derecha","LD"],["Defensa central","DFC"],["Defensa central","DFC"],
 ["Lateral izquierda","LI"],["Mediocampista","MC"],["Mediocampista","MC"],["Mediocampista","MC"],
 ["Extrema derecha","ED"],["Delantera","DC"],["Extrema izquierda","EI"]
];

// Puedes agregar el OVR fijo como sexto elemento (ej: 95). Si no lo pones, se genera automático.
const rawPlayers = [
 ["Ava Koxxx", 191, "Reino Unido", "Normal", "POR"],["Rocky Emerson", 190, "EE.UU.", "Promesa", "POR"],["Elena Koshka", 183, "Rusia / EE.UU.", "Promesa", "POR"],["Alison Tyler", 183, "EE.UU.", "Normal", "POR"],["Nicolette Shea", 180, "EE.UU.", "Normal", "POR"],["Paige Turnah", 180, "Reino Unido", "Normal", "POR"],["Skylar Vox", 178, "EE.UU.", "Normal", "POR"],["Elly Clutch", 178, "EE.UU.", "Promesa", "POR"],["Chloe Foxxe", 178, "EE.UU.", "Promesa", "POR"],["Alura Jenson", 175, "EE.UU.", "Meme", "POR"],["Julia Ann", 175, "EE.UU.", "Leyenda", "POR"],["Tera Patrick", 175, "EE.UU.", "Leyenda", "POR"],["Briana Banks", 175, "EE.UU.", "Leyenda", "POR"],["Tori Black", 175, "EE.UU.", "Leyenda", "POR"],["Eliza Ibarra", 175, "EE.UU.", "Normal", "POR"],["Alexis Texas", 173, "EE.UU.", "Normal", "POR"],["Bridgette B", 173, "España", "Normal", "POR"],["Brandi Love", 170, "EE.UU.", "Leyenda", "POR"],["Savannah Bond", 170, "Australia", "Normal", "POR"],["Vero Buffone", 170, "Argentina", "Normal", "POR"],["Siri", 175, "EE.UU.", "Meme", "POR"],
 ["Angela White", 160, "Australia", "Leyenda", "DEF", 97],["Sofia Rose", 170, "EE.UU.", "Meme", "DEF"],["Sara Jay", 160, "EE.UU.", "Meme", "DEF"],["Lena Paul", 163, "EE.UU.", "Normal", "DEF"],["Kendra Lust", 163, "EE.UU.", "Normal", "DEF"],["Cherie DeVille", 163, "EE.UU.", "Normal", "DEF"],["Ryan Conner", 163, "EE.UU.", "Meme", "DEF"],["Dee Williams", 163, "EE.UU.", "Meme", "DEF"],["Gabbie Carter", 165, "EE.UU.", "Normal", "DEF"],["Lexi Luna", 165, "EE.UU.", "Normal", "DEF"],["Alexis Fawx", 165, "EE.UU.", "Normal", "DEF"],["Cory Chase", 163, "EE.UU.", "Normal", "DEF"],["Natasha Nice", 163, "Francia / EE.UU.", "Normal", "DEF"],["Valentina Nappi", 165, "Italia", "Normal", "DEF"],["Jessa Rhodes", 165, "EE.UU.", "Normal", "DEF"],["Blake Blossom", 163, "EE.UU.", "Normal", "DEF"],["Gianna Dior", 163, "EE.UU.", "Normal", "DEF"],["Violet Myers", 160, "EE.UU.", "Normal", "DEF"],["Emily Willis", 165, "Argentina / EE.UU.", "Normal", "DEF"],["Eva Elfie", 163, "Rusia", "Normal", "DEF"],["Mia Malkova", 170, "EE.UU.", "Normal", "DEF"],["Abella Danger", 163, "EE.UU.", "Normal", "DEF"],["Nicole Aniston", 165, "EE.UU.", "Normal", "DEF"],["Dani Daniels", 170, "EE.UU.", "Normal", "DEF"],["Ariella Ferrera", 165, "Colombia", "Normal", "DEF"],["Luna Star", 163, "Cuba / EE.UU.", "Normal", "DEF"],["Esperanza Gómez", 170, "Colombia", "Normal", "DEF"],["Franceska Jaimes", 170, "Colombia", "Normal", "DEF"],["Susy Gala", 163, "España", "Normal", "DEF"],["Erica Fontes", 165, "Portugal", "Normal", "DEF"],["Tiffany Tatum", 163, "Hungría", "Normal", "DEF"],["Amirah Adara", 163, "Hungría", "Normal", "DEF"],["Anna de Ville", 165, "Hungría", "Normal", "DEF"],["Agatha Vega", 165, "Venezuela", "Promesa", "DEF"],["Eve Sweet", 163, "Europa", "Promesa", "DEF"],["Sara Diamante", 165, "Italia", "Promesa", "DEF"],["Catherine Knight", 163, "Chile", "Promesa", "DEF"],["Syren De Mer", 163, "EE.UU.", "Meme", "DEF"],["Andi James", 165, "EE.UU.", "Meme", "DEF"],["Vicky Vette", 168, "Noruega / EE.UU.", "Meme", "DEF"],["Darla Crane", 165, "EE.UU.", "Meme", "DEF"],["Deauxma", 165, "EE.UU.", "Meme", "DEF"],["Persia Monir", 165, "EE.UU.", "Meme", "DEF"],["Nina Hartley", 163, "EE.UU.", "Leyenda", "DEF"],["Alina Lopez", 168, "EE.UU.", "Normal", "DEF"],["Victoria June", 163, "EE.UU.", "Normal", "DEF"],["Ella Knox", 165, "EE.UU.", "Normal", "DEF"],["Mariana Martix", 165, "Colombia", "Promesa", "DEF"],["Leah Gotti", 163, "EE.UU.", "Normal", "DEF"],
 ["Riley Reid", 163, "EE.UU.", "Leyenda", "MC", 95],["Lana Rhoades", 160, "EE.UU.", "Leyenda", "MC"],["Sasha Grey", 168, "EE.UU.", "Leyenda", "MC"],["Jenna Jameson", 170, "EE.UU.", "Leyenda", "MC"],["Asa Akira", 157, "EE.UU.", "Leyenda", "MC"],["Stoya", 168, "EE.UU.", "Leyenda", "MC"],["Belladonna", 163, "EE.UU.", "Leyenda", "MC"],["Katsuni", 163, "Francia", "Leyenda", "MC"],["Silvia Saint", 165, "Rep. Checa", "Leyenda", "MC"],["Jesse Jane", 160, "EE.UU.", "Leyenda", "MC"],["Janine Lindemulder", 170, "EE.UU.", "Leyenda", "MC"],["Stormy Daniels", 163, "EE.UU.", "Leyenda", "MC"],["Bree Olson", 163, "EE.UU.", "Leyenda", "MC"],["Teagan Presley", 157, "EE.UU.", "Leyenda", "MC"],["Savanna Samson", 165, "EE.UU.", "Leyenda", "MC"],["Kylie Ireland", 163, "EE.UU.", "Leyenda", "MC"],["Jewel De'Nyle", 165, "EE.UU.", "Leyenda", "MC"],["Asia Carrera", 163, "EE.UU.", "Leyenda", "MC"],["Devon", 170, "EE.UU.", "Leyenda", "MC"],["Nikki Benz", 163, "Canadá / EE.UU.", "Leyenda", "MC"],["Gal Ritchie", 165, "Reino Unido", "Promesa", "MC"],["Chanel Camryn", 160, "EE.UU.", "Promesa", "MC"],["Cheerleader Kait", 165, "EE.UU.", "Promesa", "MC"],["Aubree Valentine", 163, "EE.UU.", "Promesa", "MC"],["Amber Moore", 160, "EE.UU.", "Promesa", "MC"],["Madison Wilde", 163, "EE.UU.", "Promesa", "MC"],["Brianna Arson", 165, "EE.UU.", "Promesa", "MC"],["Kelsey Kane", 163, "EE.UU.", "Promesa", "MC"],["Hayley Davies", 165, "Australia", "Promesa", "MC"],["Jasmine Sherni", 163, "EE.UU.", "Promesa", "MC"],["Violet Voss", 160, "EE.UU.", "Promesa", "MC"],["Sky Wonderland", 163, "EE.UU.", "Promesa", "MC"],["Ashby Winter", 165, "Rusia", "Promesa", "MC"],["Beca Barbie", 165, "EE.UU.", "Promesa", "MC"],["Alexa Chains", 163, "EE.UU.", "Promesa", "MC"],["Rissa May", 160, "EE.UU.", "Promesa", "MC"],["Willow Ryder", 163, "EE.UU.", "Promesa", "MC"],["Leilani Li", 160, "EE.UU.", "Promesa", "MC"],["Lily Starfire", 160, "EE.UU.", "Promesa", "MC"],["Eva Generosi", 165, "Italia", "Promesa", "MC"],["Comatozze", 162, "Rusia", "Promesa", "MC"],["Sweetie Fox", 165, "Rusia", "Promesa", "MC"],["Veronica Leal", 162, "Colombia", "Promesa", "MC"],["Canela Skin", 160, "Colombia", "Promesa", "MC"],["Giselle Montes", 160, "México", "Normal", "MC"],["Little Caprice", 160, "Rep. Checa", "Normal", "MC"],["Hitomi Tanaka", 155, "Japón", "Normal", "MC"],
 ["Piper Perri", 150, "EE.UU.", "Normal", "EXT", 79],["Elsa Jean", 152, "EE.UU.", "Normal", "EXT"],["Kimmy Granger", 157, "EE.UU.", "Normal", "EXT"],["Eva Lovia", 157, "EE.UU.", "Normal", "EXT"],["Adriana Chechik", 157, "EE.UU.", "Normal", "EXT"],["Jynx Maze", 155, "EE.UU.", "Normal", "EXT"],["LaSirena69", 152, "Venezuela", "Normal", "EXT"],["Cubbi Thompson", 150, "EE.UU.", "Promesa", "EXT"],["Sheridan Love", 150, "EE.UU.", "Meme", "EXT"],["April Flores", 157, "EE.UU.", "Meme", "EXT"],["Bunny De La Cruz", 157, "EE.UU.", "Meme", "EXT"],["Karla Lane", 157, "EE.UU.", "Meme", "EXT"],["Lulu Chu", 150, "EE.UU.", "Normal", "EXT"],["Kenzie Reeves", 152, "EE.UU.", "Normal", "EXT"],["Rae Lil Black", 157, "EE.UU.", "Normal", "EXT"],["Autumn Falls", 157, "EE.UU.", "Normal", "EXT"],["Melody Marks", 157, "EE.UU.", "Normal", "EXT"],["Gina Valentina", 155, "Brasil", "Normal", "EXT"],["Chloe Cherry", 160, "EE.UU.", "Normal", "EXT"],["Emma Fiore", 157, "Argentina", "Promesa", "EXT"],["Marina Gold", 157, "Perú", "Promesa", "EXT"],["Xxlayna Marie", 152, "EE.UU.", "Promesa", "EXT"],["Sophia Leone", 157, "EE.UU.", "Normal", "EXT"],
 ["Mia Khalifa", 157, "Líbano / EE.UU.", "Leyenda", "DC", 93],["Lisa Ann", 157, "EE.UU.", "Leyenda", "DC"],["Jenna Haze", 157, "EE.UU.", "Leyenda", "DC"],["Ginger Lynn", 157, "EE.UU.", "Leyenda", "DC"],["Christy Canyon", 163, "EE.UU.", "Leyenda", "DC"],["Ava Addams", 160, "EE.UU.", "Leyenda", "DC"],["Julie Cash", 168, "EE.UU.", "Meme", "DC"],["Lila Lovely", 170, "EE.UU.", "Meme", "DC"],["Mazzaratie Monica", 165, "EE.UU.", "Meme", "DC"],["Lexxxi Luxe", 168, "EE.UU.", "Meme", "DC"],["Samantha 38G", 163, "EE.UU.", "Meme", "DC"],["Kimmie Kaboom", 165, "EE.UU.", "Meme", "DC"],["Eliza Allure", 165, "EE.UU.", "Meme", "DC"],["Victoria Cakes", 170, "EE.UU.", "Meme", "DC"],["Marilyn Mayson", 165, "EE.UU.", "Meme", "DC"],["Angelina Castro", 168, "Cuba / EE.UU.", "Meme", "DC"],["Rita Daniels", 165, "EE.UU.", "Meme", "DC"],["Sally D'Angelo", 155, "EE.UU.", "Meme", "DC"],["Bea Cummins", 160, "EE.UU.", "Meme", "DC"],["Candy Samples", 163, "EE.UU.", "Meme", "DC"],["Erica Lauren", 165, "EE.UU.", "Meme", "DC"],["Klaudia Kelly", 163, "EE.UU.", "Meme", "DC"],["Alexxxis Allure", 161, "EE.UU.", "Meme", "DC"],["Lela Star", 157, "EE.UU.", "Normal", "DC"]
];

const playersDB = rawPlayers.map(p => ({ 
  name: p[0], height: p[1], nation: p[2], category: p[3], pos: p[4], ovrBase: p[5] || null 
}));

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function getGeneralPos(posCode) {
 if (posCode === "POR") return "POR";
 if (["LD", "DFC", "LI"].includes(posCode)) return "DEF";
 if (posCode === "MC") return "MC";
 if (["ED", "EI"].includes(posCode)) return "EXT";
 if (posCode === "DC") return "DC";
}

function getOVR(cat) {
 if(cat === "Leyenda") return rand(85, 99);
 if(cat === "Promesa") return rand(75, 89);
 if(cat === "Normal") return rand(70, 84);
 return rand(40, 69);
}

// NUEVO: Se le pasa el room para que filtre jugadoras ya usadas
function makePerson(room, posIndex){
 const posCode = positions[posIndex][1];
 const genPos = getGeneralPos(posCode);
 
 // Filtramos por posición y por las que AÚN NO han salido en la sala
 let available = playersDB.filter(p => p.pos === genPos && !room.usedPlayers.includes(p.name));
 
 // Fallback: si por alguna razón nos quedamos sin jugadoras, se reinicia el filtro (evita crasheos)
 if (available.length === 0) {
   available = playersDB.filter(p => p.pos === genPos);
 }
 
 const base = available[rand(0, available.length - 1)];
 room.usedPlayers.push(base.name); // Registrarla para que no vuelva a salir
 
 // Usa el OVR fijo si existe, si no, genera uno
 const ovr = base.ovrBase ? base.ovrBase : getOVR(base.category);
 const v = x => Math.max(1, Math.min(99, rand(ovr - 8, ovr + 7)));
 
 return {
   name: base.name, category: base.category, ovr: ovr, height: base.height, nation: base.nation,
   stats:{Velocidad:v(),Tecnica:v(),Fisico:v(),Defensa:v(),Pase:v(),Finalizacion:v()}
 };
}

function newAuction(room){
 const active=room.players.filter(p=>!p.squad[room.pos] && p.budget>0);
 const max=Math.max(1,...active.map(p=>p.budget));
 
 room.auction = { 
   person: makePerson(room, room.pos), 
   start: rand(1, Math.min(100, max)), 
   bid: 0, 
   leader: null, 
   closed: false, 
   timeLeft: 20, 
   skips: [] 
 };
 room.auction.bid = room.auction.start;
 
 if(room.timer) clearInterval(room.timer);
 room.timer = setInterval(() => {
   if(!room.auction || room.auction.closed) return clearInterval(room.timer);
   room.auction.timeLeft--;
   io.to(room.code).emit("tick", room.auction.timeLeft);
   if(room.auction.timeLeft <= 0) { clearInterval(room.timer); executeAward(room); }
 }, 1000);
}

function executeAward(room) {
 const a=room.auction;
 if(!a || a.closed) return;
 a.closed=true;
 const active = room.players.filter(p => !p.squad[room.pos]);

 if(!a.leader) {
   if (active.length === 1) {
     if (!active[0].soloSkipUsed) {
       active[0].soloSkipUsed = true;
       io.to(room.code).emit("reveal", { winner: null, person: a.person, msg: `Skipeada (Último skip)` });
       return setTimeout(()=>{newAuction(room);broadcast(room)}, 2500);
     } else {
       a.leader = active[0].id;
       a.bid = Math.min(a.start, active[0].budget);
     }
   } else {
     io.to(room.code).emit("reveal", { winner: null, person: a.person, msg: "Tiempo agotado. ¡Skipeada!" });
     return setTimeout(()=>{newAuction(room);broadcast(room)}, 2500);
   }
 }

 const winner=room.players.find(p=>p.id===a.leader);
 if(winner){
   winner.budget-=a.bid;
   winner.squad[room.pos]={...a.person,price:a.bid,position:positions[room.pos][0]};
   io.to(room.code).emit("reveal",{winner:winner.name,person:a.person,price:a.bid});
 }

 if(room.players.every(p=>p.squad[room.pos])){
   room.pos++;
   room.players.forEach(p => p.soloSkipUsed = false);
   if(room.pos>=positions.length){
     room.auction=null;
     startTournament(room); 
     return;
   }
 }
 setTimeout(()=>{newAuction(room);broadcast(room)}, 2500);
}

function startTournament(room) {
 room.finished = true;
 let pool = [...room.players].sort(()=>Math.random()-0.5); // Barajar jugadores
 let matchQueue = [];
 let roundNum = 1;

 while(pool.length > 1) {
   let winners = [];
   let roundName = pool.length <= 2 ? "GRAN FINAL" : (pool.length <= 4 ? "SEMIFINAL" : "Ronda " + roundNum);
   for(let i=0; i<pool.length; i+=2){
     if(i+1 < pool.length){
       let p1 = pool[i], p2 = pool[i+1];
       let m = { p1, p2, roundName };
       let p1s=0, p2s=0;
       
       for(let k=0; k<11; k++){
         if(p1.squad[k].ovr > p2.squad[k].ovr) p1s++;
         else if(p2.squad[k].ovr > p1.squad[k].ovr) p2s++;
       }
       if(p1s === p2s){ 
         let t1 = p1.squad.reduce((a,b)=>a+b.ovr,0);
         let t2 = p2.squad.reduce((a,b)=>a+b.ovr,0);
         if(t1>=t2) p1s++; else p2s++;
       }
       m.p1FinalScore = p1s;
       m.p2FinalScore = p2s;
       let winner = p1s > p2s ? p1 : p2;
       winners.push(winner);
       matchQueue.push(m);
     } else {
       winners.push(pool[i]); 
     }
   }
   pool = winners;
   roundNum++;
 }
 
 room.tournament = { queue: matchQueue, champion: pool[0], state: 'STARTING' };
 broadcast(room);
 setTimeout(() => runNextMatch(room), 4000);
}

function runNextMatch(room) {
 if(!room.tournament.queue.length) {
   room.tournament.state = 'CHAMPION';
   broadcast(room);
   return;
 }
 let match = room.tournament.queue.shift();
 room.tournament.currentMatch = { p1: match.p1, p2: match.p2, p1s: 0, p2s: 0, roundName: match.roundName };
 room.tournament.pos = 0;
 room.tournament.state = 'MATCH';
 broadcast(room);

 room.timer = setInterval(() => {
   let m = room.tournament.currentMatch;
   let pos = room.tournament.pos;

   if(pos < 11) {
     let c1 = m.p1.squad[pos], c2 = m.p2.squad[pos];
     let w = 0;
     if(c1.ovr > c2.ovr) { m.p1s++; w = 1; }
     else if(c2.ovr > c1.ovr) { m.p2s++; w = 2; }

     io.to(room.code).emit("tourney_tick", { posName: positions[pos][0], c1, c2, w, p1s: m.p1s, p2s: m.p2s });
     room.tournament.pos++;
   } else {
     clearInterval(room.timer);
     let finalW = match.p1FinalScore > match.p2FinalScore ? match.p1.name : match.p2.name;
     let isTieBreak = (m.p1s === m.p2s);
     io.to(room.code).emit("tourney_match_end", { msg: isTieBreak ? `¡Avanza ${finalW} por Desempate de OVR Total!` : `¡Avanza ${finalW}!` });
     setTimeout(() => runNextMatch(room), 5000);
   }
 }, 2000);
}

function publicState(room){
 return {
   code:room.code,
   maxPlayers:room.maxPlayers,
   started:room.started,
   finished:room.finished,
   pos:room.pos,
   players:room.players.map(p=>({id:p.id,name:p.name,budget:p.budget,squad:p.squad, soloSkipUsed: p.soloSkipUsed})),
   auction:room.auction ? {person:{height:room.auction.person.height,nation:room.auction.person.nation},start:room.auction.start,bid:room.auction.bid,leader:room.auction.leader,closed:room.auction.closed, timeLeft:room.auction.timeLeft, skips: room.auction.skips} : null,
   tournament:room.tournament ? { state: room.tournament.state, currentMatch: room.tournament.currentMatch ? { p1Name: room.tournament.currentMatch.p1.name, p2Name: room.tournament.currentMatch.p2.name, roundName: room.tournament.currentMatch.roundName } : null, champion: room.tournament.champion.name } : null,
   host:room.host
 };
}

function broadcast(room){io.to(room.code).emit("state",publicState(room));}

io.on("connection",socket=>{
 socket.on("createRoom",(data,cb)=>{
   const code=crypto.randomBytes(3).toString("hex").toUpperCase();
   const p={id:socket.id,name:String(data.name||"Jugador 1").slice(0,18),budget:1000,squad:Array(11).fill(null), soloSkipUsed: false};
   
   // AÑADIDO: Array usedPlayers para la nueva sala
   rooms.set(code,{
       code,
       maxPlayers:Math.max(2,Math.min(8,Number(data.maxPlayers)||4)),
       players:[p],
       host:socket.id,
       started:false,
       finished:false,
       pos:0,
       auction:null,
       usedPlayers: []
   });
   
   socket.join(code);socket.room=code;
   cb({ok:true,code});broadcast(rooms.get(code));
 });
 
 socket.on("joinRoom",(data,cb)=>{
   const code=String(data.code||"").toUpperCase(),room=rooms.get(code);
   if(!room)return cb({ok:false,msg:"La sala no existe."});
   if(room.started)return cb({ok:false,msg:"La partida ya comenzó."});
   if(room.players.length>=room.maxPlayers)return cb({ok:false,msg:"La sala está llena."});
   const p={id:socket.id,name:String(data.name||"Jugador").slice(0,18),budget:1000,squad:Array(11).fill(null), soloSkipUsed: false};
   room.players.push(p);socket.join(code);socket.room=code;cb({ok:true,code});broadcast(room);
 });
 
 socket.on("start",cb=>{
   const room=rooms.get(socket.room);if(!room)return;
   if(socket.id!==room.host)return cb?.({ok:false,msg:"Solo el anfitrión puede iniciar."});
   if(room.players.length<2)return cb?.({ok:false,msg:"Se necesitan al menos 2 jugadores para iniciar."});
   room.started=true;room.pos=0;newAuction(room);broadcast(room);cb?.({ok:true});
 });
 
 socket.on("bid",(add,cb)=>{
   const room=rooms.get(socket.room);if(!room||!room.started||room.finished)return;
   const p=room.players.find(x=>x.id===socket.id),a=room.auction;
   if(!p||!a||a.closed)return;
   if(p.squad[room.pos])return cb?.({ok:false,msg:"Ya tienes esta posición."});
   const n=a.bid+Number(add);
   if(![5,10,50,100].includes(Number(add)))return cb?.({ok:false,msg:"Puja no válida."});
   if(p.budget<n)return cb?.({ok:false,msg:"No tienes suficiente presupuesto."});
   a.bid=n; a.leader=p.id; if(a.timeLeft < 5) a.timeLeft = 5;
   broadcast(room);cb?.({ok:true});
 });
 
 socket.on("skip",cb=>{
   const room=rooms.get(socket.room);if(!room||!room.started||room.finished)return;
   const p=room.players.find(x=>x.id===socket.id),a=room.auction;
   if(!p||!a||a.closed)return;
   if(p.squad[room.pos])return cb?.({ok:false,msg:"Ya tienes esta posición, no debes skipear."});
   if(a.leader===p.id)return cb?.({ok:false,msg:"No puedes skipear si vas ganando la puja."});
   if(!a.skips.includes(p.id)) a.skips.push(p.id);
   
   const active = room.players.filter(x => !x.squad[room.pos]);
   if(active.length === 1) {
     if(p.soloSkipUsed) return cb?.({ok:false, msg:"Ya usaste tu skip único en esta posición."});
     p.soloSkipUsed = true;
   }
   
   if(a.skips.length >= active.length) {
     if(room.timer) clearInterval(room.timer);
     a.closed = true;
     io.to(room.code).emit("reveal", { winner: null, person: a.person, msg: "¡Skipeada por votación!" });
     setTimeout(()=>{newAuction(room);broadcast(room)}, 2500);
   } else {
     broadcast(room);
   }
   cb?.({ok:true});
 });
 
 socket.on("disconnect",()=>{
   const room=rooms.get(socket.room);if(!room)return;
   if(!room.started){
     room.players=room.players.filter(p=>p.id!==socket.id);
     if(socket.id===room.host && room.players.length){room.host=room.players[0].id}
     if(!room.players.length){
       if(room.timer) clearInterval(room.timer);
       rooms.delete(room.code);
     } else broadcast(room);
   }
 });
});

server.listen(process.env.PORT||3000,()=>console.log("Subasta Pornera online en puerto "+(process.env.PORT||3000)));
