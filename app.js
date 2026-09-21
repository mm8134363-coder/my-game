let ws,name,self,room=null,localStream=null,peers={};
const $=id=>document.getElementById(id);
function start(){
 name=$("name").value.trim()||"زائر";
 ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host);
 ws.onopen=()=>{$("status").textContent="🟢 متصل";$("login").hidden=true;$("app").hidden=false};
 ws.onclose=()=>{$("status").textContent="🔴 غير متصل"};
 ws.onmessage=e=>handle(JSON.parse(e.data));
}
function handle(m){
 if(m.type==="welcome"||m.type==="joined"){renderRooms(m.rooms);if(m.type==="joined"){room=m.room;$("roomTitle").textContent=(m.rooms.find(x=>x.id===room)||{}).name||room}}
 if(m.type==="chat") add(`<b>${esc(m.from)}:</b> ${esc(m.text)}`);
 if(m.type==="system") add(`<span class="system">${esc(m.text)}</span>`);
 if(m.type==="signal") signal(m);
}
function renderRooms(list){$("rooms").innerHTML=list.map(r=>`<button class="${r.id===room?'roomActive':''}" onclick="join('${r.id}')">🎙️ ${esc(r.name)} <small>(${r.users})</small></button>`).join("")}
function join(r){room=r;ws.send(JSON.stringify({type:"join",room:r,name}));$("messages").innerHTML=""}
function sendChat(){let t=$("msg").value.trim();if(t){ws.send(JSON.stringify({type:"chat",text:t}));$("msg").value=""}}
function add(x){$("messages").insertAdjacentHTML("beforeend",`<div class="msg">${x}</div>`);$("messages").scrollTop=$("messages").scrollHeight}
async function toggleMic(){
 if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;$("mic").textContent="🎤 تشغيل الميكروفون";return}
 try{localStream=await navigator.mediaDevices.getUserMedia({audio:true});$("mic").textContent="🔇 إيقاف الميكروفون";add('<span class="system">تم تشغيل الميكروفون على جهازك.</span>');}
 catch(e){alert("اسمح للمتصفح باستخدام الميكروفون. يلزم HTTPS في الاستضافة.");}
}
function report(){let t=prompt("سبب البلاغ؟");if(t)ws.send(JSON.stringify({type:"report",text:t}))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function signal(m){/* مكان إشارات WebRTC؛ يوسع لاحقًا لاتصال صوتي مباشر بين المشاركين. */}