const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const crypto=require("crypto");

const app=express();
const server=http.createServer(app);
const io=new Server(server);
app.use(express.static("public"));

const rooms=new Map();

const positions=[
 ["Arquera","POR"],["Lateral derecha","LD"],["Defensa central","DFC"],["Defensa central","DFC"],
 ["Lateral izquierda","LI"],["Mediocampista","MC"],["Mediocampista","MC"],["Mediocampista","MC"],
 ["Extrema derecha","ED"],["Delantera","DC"],["Extrema izquierda","EI"]
];
const nations=["🇺🇸 Estados Unidos","🇧🇷 Brasil","🇨🇦 Canadá","🇬🇧 Reino Unido","🇦🇺 Australia","🇩🇪 Alemania","🇫🇷 Francia","🇪🇸 España","🇮🇹 Italia","🇨🇿 República Checa","🇷🇺 Rusia","🇯🇵 Japón","🇲🇽 México","🇦🇷 Argentina","🇨🇴 Colombia"];
const names=["Abella Danger","Adriana Chechik","Angela White","Anna Bell Peaks","Anya Olsen","Ariella Ferrera","Ariana Marie","Asa Akira","Autumn Falls","Ava Addams","Brittany Andrews","Brandi Love","Brooklyn Chase","Carmen Caliente","Carter Cruise","Casey Calvert","Charlotte Sartre","Cherie DeVille","Christy Canyon","Clara Mia","Dani Daniels","Dani Jensen","Dillion Harper","Elsa Jean","Emily Willis","Eva Elfie","Eva Lovia","Gianna Dior","Gina Valentina","Hannah Hays","Harley Dean","Isabella Soprano","Jasmine Grey","Jayden Cole","Jessa Rhodes","Jill Kassidy","Jillian Janson","Kendra Lust","Kira Noir","Kissa Sins","Kylie Page","Lana Rhoades","Lauren Phillips","Lexi Belle","Lisa Ann","Little Caprice","Luna Star","Madison Ivy","Mandy Muse","Maria Nagai","Mia Malkova","Mia Melano","Molly Little","Monique Alexander","Nicole Aniston","Nina North","Nikki Benz","Nina Hartley","Peta Jensen","Phoenix Marie","Piper Perri","Riley Reid","Romi Rain","Sasha Grey","Sara Jay","Serena Blair","Sinn Sage","Sky Bri","Sophie Dee","Stormy Daniels","Tasha Reign","Teanna Trump","Tori Black","Violet Myers","Whitney Westgate","Zoe Parker","Aidra Fox","Alina Lopez","Alexis Texas","Amarna Miller","Alyssa Reece","Angel Youngs","Aubrey Gold","Bailey Brooke","Bella Rolland","Blair Williams","Briana Banks","Chanel Preston","Chloe Cherry","Coco Austin","Courtney Taylor","Dakota Skye","Demi Sutra","Diana Prince","Dolly Leigh","Eden Ivy","Ella Knox","Ember Snow","Erika Bell","India Summer","Jade Kush","Jana Cova","Janet Mason","Jasmine James","Jessica Drake","Jessie Andrews","Jordan Capri","Julia Ann","Kagney Linn Karter","Karlee Grey","Kenzie Reeves","Kristen Scott","Leah Gotti","Lily Carter","London Keyes","Megan Rain","Mia Li","Mila Azul","Misha Cross","Molly Cavalli","Natalia Starr","Olivia Lua","Penny Pax","Rachel Starr","Reagan Foxx","Remy LaCroix","Riley Nixon","Riley Steele","Samantha Saint","Savannah Sixx","Scarlet Red","Sierra Skye","Sunny Leone","Valentina Nappi","Veronica Avluv","Victoria Cakes","Victoria June","Vicky Vette","Yasmin Lee","Abigail Mac","Aaliyah Love","Alyx Star","Briana Banks","Cali Carter","Camille Crimson","Chloe Amour","Daisy Ducati","Daphne Dare","Delilah Day","Destiny Cruz","Diana Doll","Ella Reese","Gia Derza","Gigi Allens","Giselle Leon","Holly Hendrix","Isla Ivy","Ivana Sugar","Jada Stevens","Jasmine Jae","Jazmin Luv","Jennifer White","Kali Roses","Kara Lee","Kasey Warner","Katalina Cruz","Katrina Jade","Kelly Divine","Lacy Lennon","Lana Violet","Lola Fae","Lexi Luna","Lily Lou","Luna Rival","Lyra Law","Maddy O'Reilly","Malena Morgan"];

function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function makePerson(){
 const base=rand(40,90);
 return {
  name:names[Math.floor(Math.random()*names.length)],
  ovr:base+rand(1,9),
  height:rand(150,185),
  nation:nations[Math.floor(Math.random()*nations.length)],
  category:base>=85?"Icono":base>=75?"Oro":base>=65?"Plata":"Bronce"
 };
}

function newAuction(room){
 const active=room.players.filter(p=>!p.squad[room.pos] && p.budget>0);
 const max=Math.max(1,...active.map(p=>p.budget));
 
 room.auction={
  person:makePerson(),
  start:rand(1,Math.min(100,max)),
  bid:0,
  leader:null,
  closed:false,
  timeLeft: 20,
  skips: [] // Registro de quién ha votado por skipear
 };
 room.auction.bid=room.auction.start;
 
 if(room.timer) clearInterval(room.timer);
 
 room.timer = setInterval(() => {
   if(!room.auction || room.auction.closed) {
     clearInterval(room.timer);
     return;
   }
   room.auction.timeLeft--;
   io.to(room.code).emit("tick", room.auction.timeLeft);
   
   if(room.auction.timeLeft <= 0) {
     clearInterval(room.timer);
     executeAward(room);
   }
 }, 1000);
}

function executeAward(room) {
 const a = room.auction;
 if(!a || a.closed) return;
 a.closed = true;
 
 const active = room.players.filter(p => !p.squad[room.pos]);

 if(!a.leader) {
   // Nadie pujó
   if (active.length === 1) {
     const lastPlayer = active[0];
     if (!lastPlayer.soloSkipUsed) {
       // Auto-skip porque es el último y no ha usado su skip en esta posición
       lastPlayer.soloSkipUsed = true;
       io.to(room.code).emit("reveal", { winner: null, person: a.person, msg: `Skipeada auto. por ${lastPlayer.name} (Último skip)` });
       setTimeout(() => { newAuction(room); broadcast(room); }, 3000);
       return;
     } else {
       // Ya usó su skip y nadie pujó, se le asigna a la fuerza por precio base
       a.leader = lastPlayer.id;
       a.bid = Math.min(a.start, lastPlayer.budget); 
     }
   } else {
     // Hay varios jugadores y nadie pujó, se skipea
     io.to(room.code).emit("reveal", { winner: null, person: a.person, msg: "Tiempo agotado. ¡Skipeada!" });
     setTimeout(() => { newAuction(room); broadcast(room); }, 3000);
     return;
   }
 }
 
 // Adjudicar al líder de la subasta (o al último jugador forzado)
 const winner = room.players.find(p=>p.id===a.leader);
 if(winner) {
    winner.budget -= a.bid;
    winner.squad[room.pos] = {...a.person, price:a.bid, position:positions[room.pos][0]};
    io.to(room.code).emit("reveal", { winner: winner.name, person: a.person, price: a.bid });
 }
 
 // Verificar si todos tienen a la jugadora
 if(room.players.every(p=>p.squad[room.pos])){
   room.pos++;
   // Reseteamos el uso del "Solo Skip" para la nueva ronda
   room.players.forEach(p => p.soloSkipUsed = false);
   
   if(room.pos>=positions.length){
       room.finished=true;
       room.auction=null;
       broadcast(room);
       return;
   }
 }
 setTimeout(()=>{newAuction(room);broadcast(room)}, 3000);
}

function publicState(room){
 return {
  code:room.code,
  maxPlayers:room.maxPlayers,
  started:room.started,
  finished:room.finished,
  pos:room.pos,
  players:room.players.map(p=>({id:p.id,name:p.name,budget:p.budget,squad:p.squad, soloSkipUsed: p.soloSkipUsed})),
  auction:room.auction ? {
   person:{height:room.auction.person.height,nation:room.auction.person.nation},
   start:room.auction.start,
   bid:room.auction.bid,
   leader:room.auction.leader,
   closed:room.auction.closed,
   timeLeft: room.auction.timeLeft,
   skips: room.auction.skips
  } : null,
  host:room.host
 };
}

function broadcast(room){io.to(room.code).emit("state",publicState(room));}

io.on("connection",socket=>{
 socket.on("createRoom",(data,cb)=>{
  const code=crypto.randomBytes(3).toString("hex").toUpperCase();
  const p={id:socket.id,name:String(data.name||"Jugador 1").slice(0,18),budget:1000,squad:Array(11).fill(null), soloSkipUsed: false};
  rooms.set(code,{code,maxPlayers:Math.max(2,Math.min(8,Number(data.maxPlayers)||4)),players:[p],host:socket.id,started:false,finished:false,pos:0,auction:null});
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
  const room=rooms.get(socket.room);
  if(room&&room.host===socket.id&&!room.started&&room.players.length>1){
   room.started=true;newAuction(room);broadcast(room);cb({ok:true});
  }
 });

 socket.on("bid",cb=>{
  const room=rooms.get(socket.room);
  if(room&&room.started&&!room.finished){
   const a=room.auction,p=room.players.find(x=>x.id===socket.id);
   if(a&&!a.closed&&p&&!p.squad[room.pos]&&a.leader!==p.id&&p.budget>=a.bid+5){
    a.bid+=5;a.leader=p.id;
    if(a.timeLeft < 5) {
      a.timeLeft = 5;
    }
    broadcast(room);cb({ok:true});
   }
  }
 });
 
 socket.on("skip", cb => {
   const room = rooms.get(socket.room);
   if(!room || !room.started || room.finished) return;
   const a = room.auction;
   const p = room.players.find(x => x.id === socket.id);
   
   if(!a || a.closed || !p) return;
   if(p.squad[room.pos]) return cb?.({ok:false, msg: "Ya tienes esta posición, no puedes skipear."});
   if(a.leader === p.id) return cb?.({ok:false, msg: "No puedes skipear si vas ganando la puja."});
   
   if(!a.skips.includes(p.id)) {
     a.skips.push(p.id);
   }
   
   const active = room.players.filter(x => !x.squad[room.pos]);
   
   // Si es el último jugador verificamos su skip personal
   if(active.length === 1) {
     if(p.soloSkipUsed) return cb?.({ok:false, msg: "Ya usaste tu único skip en esta posición."});
     p.soloSkipUsed = true;
   }
   
   // Verificamos si todos los jugadores activos ya votaron para saltar
   if(a.skips.length >= active.length) {
     if(room.timer) clearInterval(room.timer);
     a.closed = true;
     io.to(room.code).emit("reveal", { winner: null, person: a.person, msg: "¡Skipeada por votación!" });
     setTimeout(() => { newAuction(room); broadcast(room); }, 3000);
   } else {
     broadcast(room); // Refrescar botones
   }
   cb?.({ok:true});
 });

 socket.on("disconnect",()=>{
  const room=rooms.get(socket.room);
  if(room&&!room.started){
   room.players=room.players.filter(p=>p.id!==socket.id);
   if(!room.players.length)rooms.delete(room.code);
   else{
    if(room.host===socket.id)room.host=room.players[0].id;
    broadcast(room);
   }
  }
 });
});

server.listen(3000,()=>console.log("Server port 3000"));
