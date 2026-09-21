const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map([
  ["general", {id:"general", name:"الدردشة العامة", users:new Set()}],
  ["games", {id:"games", name:"الألعاب", users:new Set()}],
  ["music", {id:"music", name:"الموسيقى", users:new Set()}]
]);
const clients = new Map();
const reports = [];

function roomList(){
  return [...rooms.values()].map(r=>({id:r.id,name:r.name,users:r.users.size}));
}
function send(ws, data){ if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(data)); }
function broadcastRoom(roomId, data, except){
  const r=rooms.get(roomId); if(!r) return;
  for(const id of r.users){ const c=clients.get(id); if(c && c.ws!==except) send(c.ws,data); }
}
function broadcastAdmin(){
  const payload=JSON.stringify({type:"admin:update", rooms:roomList(), users:[...clients.values()].map(c=>({id:c.id,name:c.name,room:c.room,status:"متصل"})), reports});
  for(const c of clients.values()) if(c.admin) send(c.ws, JSON.parse(payload));
}

wss.on("connection",(ws)=>{
  const id=Math.random().toString(36).slice(2,10);
  clients.set(id,{id,ws,name:"زائر",room:null,admin:false});
  send(ws,{type:"welcome",id,rooms:roomList()});

  ws.on("message",(raw)=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    const c=clients.get(id); if(!c) return;

    if(m.type==="join"){
      if(c.room && rooms.has(c.room)) rooms.get(c.room).users.delete(id);
      const roomId=rooms.has(m.room)?m.room:"general";
      c.room=roomId; c.name=String(m.name||"زائر").slice(0,30);
      rooms.get(roomId).users.add(id);
      send(ws,{type:"joined",room:roomId,rooms:roomList(),self:id});
      broadcastRoom(roomId,{type:"system",text:`انضم ${c.name} إلى الغرفة`},ws);
      broadcastAdmin();
    }
    else if(m.type==="leave"){
      if(c.room && rooms.has(c.room)){ broadcastRoom(c.room,{type:"system",text:`غادر ${c.name} الغرفة`},ws); rooms.get(c.room).users.delete(id); }
      c.room=null; broadcastAdmin();
    }
    else if(m.type==="chat" && c.room){
      broadcastRoom(c.room,{type:"chat",from:c.name,text:String(m.text||"").slice(0,500)});
    }
    else if(m.type==="signal" && c.room){
      const target=clients.get(m.to);
      if(target) send(target.ws,{type:"signal",from:id,data:m.data});
    }
    else if(m.type==="report"){
      reports.push({id:Date.now().toString(36),from:c.name,text:String(m.text||"").slice(0,300),status:"قيد المراجعة"});
      broadcastAdmin();
    }
    else if(m.type==="admin"){
      // For demo: protect with ADMIN_KEY environment variable in real deployment.
      if(String(m.key||"") === String(process.env.ADMIN_KEY||"admin123")){
        c.admin=true; send(ws,{type:"admin:auth",ok:true,rooms:roomList(),users:[...clients.values()].map(x=>({id:x.id,name:x.name,room:x.room,status:"متصل"})),reports});
      } else send(ws,{type:"admin:auth",ok:false});
    }
    else if(m.type==="admin:createRoom" && c.admin){
      const roomId=String(m.id||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,30);
      if(roomId && !rooms.has(roomId)){ rooms.set(roomId,{id:roomId,name:String(m.name||roomId).slice(0,40),users:new Set()}); }
      broadcastAdmin();
    }
    else if(m.type==="admin:deleteRoom" && c.admin){
      const rid=String(m.room||"");
      if(!["general","games","music"].includes(rid) && rooms.has(rid) && rooms.get(rid).users.size===0) rooms.delete(rid);
      broadcastAdmin();
    }
    else if(m.type==="admin:resolve" && c.admin){
      const r=reports.find(x=>x.id===m.id); if(r) r.status="تمت المعالجة"; broadcastAdmin();
    }
  });

  ws.on("close",()=>{
    const c=clients.get(id);
    if(c?.room && rooms.has(c.room)) rooms.get(c.room).users.delete(id);
    clients.delete(id); broadcastAdmin();
  });
});

app.get("/api/status",(req,res)=>res.json({rooms:roomList(),online:clients.size,reports}));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));

server.listen(PORT,()=>console.log(`Sawtna server running on ${PORT}`));