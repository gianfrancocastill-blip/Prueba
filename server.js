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
const names=["Abella Danger","Adriana Chechik","Angela White","Anna Bell Peaks","Anya Olsen","Ariella Ferrera","Ariana Marie","Asa Akira","Autumn Falls","Ava Addams","Brittany Andrews","Brandi Love","Brooklyn Chase","Carmen Caliente","Carter Cruise","Casey Calvert","Charlotte Sartre","Cherie DeVille","Christy Canyon","Clara Mia","Dani Daniels","Dani Jensen","Dillion Harper","Elsa Jean","Emily Willis","Eva Elfie","Eva Lovia","Gianna Dior","Gina Valentina","Hannah Hays","Harley Dean","Isabella Soprano","Jasmine Grey","Jayden Cole","Jessa Rhodes","Jill Kassidy","Jillian Janson","Kendra Lust","Kira Noir","Kissa Sins","Kylie Page","Lana Rhoades","Lauren Phillips","Lexi Belle","Lisa Ann","Little Caprice","Luna Star","Madison Ivy","Mandy Muse","Maria Nagai","Mia Malkova","Mia Melano","Molly Little","Monique Alexander","Nicole Aniston","Nina North","Nikki Benz","Nina Hartley","Peta Jensen","Phoenix Marie","Piper Perri","Riley Reid","Romi Rain","Sasha Grey","Sara Jay","Serena Blair","Sinn Sage","Sky Bri","Sophie Dee","Stormy Daniels","Tasha Reign","Teanna Trump","Tori Black","Violet Myers","Whitney Westgate","Zoe Parker","Aidra Fox","Alina Lopez","Alexis Texas","Amarna Miller","Alyssa Reece","Angel Youngs","Aubrey Gold","Bailey Brooke","Bella Rolland","Blair Williams","Briana Banks","Chanel Preston","Chloe Cherry","Coco Austin","Courtney Taylor","Dakota Skye","Demi Sutra","Diana Prince","Dolly Leigh","Eden Ivy","Ella Knox","Ember Snow","Erika Bell","India Summer","Jade Kush","Jana Cova","Janet Mason","Jasmine James","Jessica Drake","Jessie Andrews","Jordan Capri","Julia Ann","Kagney Linn Karter","Karlee Grey","Kenzie Reeves","Kristen Scott","Leah Gotti","Lily Carter","London Keyes","Megan Rain","Mia Li","Mila Azul","Misha Cross","Molly Cavalli","Natalia Starr","Olivia Lua","Penny Pax","Rachel Starr","Reagan Foxx","Remy LaCroix","Riley Nixon","Riley Steele","Samantha Saint","Savannah Sixx","Scarlet Red","Sierra Skye","Sunny Leone","Valentina Nappi","Veronica Avluv","Victoria Cakes","Victoria June","Vicky Vette","Yasmin Lee","Abigail Mac","Aaliyah Love","Alyx Star","Briana Banks","Cali Carter","Camille Crimson","Chloe Amour","Daisy Ducati","Daphne Dare","Delilah Day","Destiny Cruz","Diana Doll","Ella Reese","Gia Derza","Gigi Allens","Giselle Leon","Holly Hendrix","Isla Ivy","Ivana Sugar","Jada Stevens","Jasmine Jae","Jazmin Luv","Jennifer White","Kali Roses","Kara Lee","Karmen Karma","Kasey Warner","Kathy Rose","Keisha Grey","Kira Perez","Kylie Rocket","Layla London","Lia Lin","Lily Rader","Lola Fae","Madi Meadows","Mandy Flores","Marley Brinx","Maya Bijou","Mia Rider","Mimi Miyagi","Miss Raquel","Nikki Dream","Nina Elle","Olivia Jayy","Penny Barber","Raven Bay","Raven Rockette","Roxie Sinner","Sasha Heart","Savannah Sixx","Sienna West","Skye Blue","Sydnee Steele","Tiffany Tatum","Tina Kay","Valentina Jewels","Veronica Vain","Vicky Chase","Violet Starr","Wendy Moon","Zelda Morrison"];

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function makePerson(){
 const category=["Leyenda","Promesa","Regular","Broma/Meme"][rand(0,3)];
 let min=60,max=84;
 if(category==="Leyenda"){min=85;max=99}
 if(category==="Promesa"){min=75;max=90}
 if(category==="Broma/Meme"){min=40;max=70}
 const ovr=rand(min,max);
 const v=x=>Math.max(1,Math.min(99,rand(ovr-8,ovr+7)));
 return {name:names[rand(0,names.length-1)],category,ovr,height:rand(160,188),nation:nations[rand(0,nations.length-1)],
 stats:{Velocidad:v(),Tecnica:v(),Fisico:v(),Defensa:v(),Pase:v(),Finalizacion:v()}};
}

function newAuction(room){
 const active=room.players.filter(p=>!p.squad[room.pos] && p.budget>0);
 const max=Math.max(1,...active.map(p=>p.budget));
 
 room.auction={person:makePerson(),start:rand(1,Math.min(100,max)),bid:0,leader:null,closed:false, timeLeft: 15};
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
 const a=room.auction;
 if(!a || a.closed) return;
 if(!a.leader) {
   newAuction(room);
   broadcast(room);
   return;
 }
 a.closed=true;
 const winner=room.players.find(p=>p.id===a.leader);
 winner.budget-=a.bid;
 winner.squad[room.pos]={...a.person,price:a.bid,position:positions[room.pos][0]};
 io.to(room.code).emit("reveal",{winner:winner.name,person:a.person,price:a.bid});
 if(room.players.every(p=>p.squad[room.pos])){
   room.pos++;
   if(room.pos>=positions.length){room.finished=true;room.auction=null;broadcast(room);return;}
 }
 setTimeout(()=>{newAuction(room);broadcast(room)}, 1400);
}

function publicState(room){
 return {code:room.code,maxPlayers:room.maxPlayers,started:room.started,finished:room.finished,pos:room.pos,
 players:room.players.map(p=>({id:p.id,name:p.name,budget:p.budget,squad:p.squad})),
 auction:room.auction ? {person:{height:room.auction.person.height,nation:room.auction.person.nation},start:room.auction.start,bid:room.auction.bid,leader:room.auction.leader,closed:room.auction.closed, timeLeft:room.auction.timeLeft} : null,
 host:room.host};
}

function broadcast(room){io.to(room.code).emit("state",publicState(room));}

io.on("connection",socket=>{
 socket.on("createRoom",(data,cb)=>{
   const code=crypto.randomBytes(3).toString("hex").toUpperCase();
   const p={id:socket.id,name:String(data.name||"Jugador 1").slice(0,18),budget:1000,squad:Array(11).fill(null)};
   rooms.set(code,{code,maxPlayers:Math.max(3,Math.min(8,Number(data.maxPlayers)||4)),players:[p],host:socket.id,started:false,finished:false,pos:0,auction:null});
   socket.join(code);socket.room=code;
   cb({ok:true,code});broadcast(rooms.get(code));
 });
 
 socket.on("joinRoom",(data,cb)=>{
   const code=String(data.code||"").toUpperCase(),room=rooms.get(code);
   if(!room)return cb({ok:false,msg:"La sala no existe."});
   if(room.started)return cb({ok:false,msg:"La partida ya comenzó."});
   if(room.players.length>=room.maxPlayers)return cb({ok:false,msg:"La sala está llena."});
   const p={id:socket.id,name:String(data.name||"Jugador").slice(0,18),budget:1000,squad:Array(11).fill(null)};
   room.players.push(p);socket.join(code);socket.room=code;cb({ok:true,code});broadcast(room);
 });
 
 socket.on("start",cb=>{
   const room=rooms.get(socket.room);if(!room)return;
   if(socket.id!==room.host)return cb?.({ok:false,msg:"Solo el anfitrión puede iniciar."});
   // Permitimos iniciar si está lleno o si tiene al menos 3 jugadores según las reglas del juego
   if(room.players.length < 3 || room.players.length > room.maxPlayers)return cb?.({ok:false,msg:`Se necesitan entre 3 y ${room.maxPlayers} jugadores.`});
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
   
   a.bid=n;
   a.leader=p.id;
   if(a.timeLeft < 5) a.timeLeft = 5;
   
   broadcast(room);cb?.({ok:true});
 });
 
 socket.on("award",cb=>{
   const room=rooms.get(socket.room);if(!room||socket.id!==room.host||!room.auction)return;
   if(!room.auction.leader)return cb?.({ok:false,msg:"Debe existir una puja."});
   executeAward(room);
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
