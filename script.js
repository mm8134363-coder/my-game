const navs=document.querySelectorAll('.nav'), pages=document.querySelectorAll('.page');
const titles={dashboard:'لوحة التحكم',rooms:'إدارة الغرف',users:'المستخدمون',reports:'البلاغات',settings:'الإعدادات'};
navs.forEach(n=>n.onclick=()=>{navs.forEach(x=>x.classList.remove('active'));n.classList.add('active');pages.forEach(p=>p.classList.toggle('active',p.id===n.dataset.page));document.getElementById('title').textContent=titles[n.dataset.page]});
let rooms=[['سهرة الأصدقاء','7','نشطة'],['الألعاب','12','نشطة'],['الموسيقى','5','نشطة'],['الدردشة العامة','0','مغلقة']];
let users=[['أحمد','متصل','عضو'],['سارة','متصل','مشرف'],['محمد','غير متصل','عضو'],['نور','متصل','عضو']];
let reports=[['بلاغ #104','محتوى مخالف','قيد المراجعة'],['بلاغ #103','إزعاج','تمت المعالجة'],['بلاغ #102','اسم مستخدم','قيد المراجعة']];
function render(){
 roomTable.innerHTML='<div class="row head"><span>الغرفة</span><span>المستخدمون</span><span>الحالة</span><span>إجراء</span></div>'+rooms.map((r,i)=>`<div class="row"><span>🎙️ ${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span><button class="action" onclick="toggleRoom(${i})">تغيير</button></span></div>`).join('');
 userTable.innerHTML='<div class="row head"><span>المستخدم</span><span>الحالة</span><span>الدور</span><span>إجراء</span></div>'+users.map((u,i)=>`<div class="row"><span>👤 ${u[0]}</span><span>${u[1]}</span><span>${u[2]}</span><span><button class="action danger" onclick="banUser(${i})">حظر</button></span></div>`).join('');
 reportTable.innerHTML='<div class="row head"><span>البلاغ</span><span>السبب</span><span>الحالة</span><span>إجراء</span></div>'+reports.map((r,i)=>`<div class="row"><span>🚨 ${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span><button class="action" onclick="resolve(${i})">معالجة</button></span></div>`).join('');
}
function newRoom(){let n=prompt('اسم الغرفة؟');if(n){rooms.push([n,'0','نشطة']);render();alert('تم إنشاء الغرفة تجريبيًا');}}
function toggleRoom(i){rooms[i][2]=rooms[i][2]==='نشطة'?'مغلقة':'نشطة';render()}
function banUser(i){if(confirm('حظر '+users[i][0]+'؟')){users[i][1]='محظور';render()}}
function resolve(i){reports[i][2]='تمت المعالجة';render()}
function saveSettings(){alert('تم حفظ الإعدادات محليًا في هذه النسخة التجريبية.')}
userSearch.oninput=e=>{let q=e.target.value.trim();document.querySelectorAll('#userTable .row:not(.head)').forEach((r,i)=>r.style.display=users[i][0].includes(q)?'grid':'none')};
render();