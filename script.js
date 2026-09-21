const arena=document.getElementById('arena');
const scoreEl=document.getElementById('score');
const timeEl=document.getElementById('time');
const startBtn=document.getElementById('startBtn');
const message=document.getElementById('message');

let score=0, time=30, timer=null, playing=false;

function placeCoin(){
  document.querySelectorAll('.coin').forEach(c=>c.remove());
  if(!playing) return;
  const coin=document.createElement('button');
  coin.className='coin';
  coin.textContent='🪙';
  const maxX=Math.max(0,arena.clientWidth-62);
  const maxY=Math.max(0,arena.clientHeight-62);
  coin.style.left=(Math.random()*maxX)+'px';
  coin.style.top=(Math.random()*maxY)+'px';
  coin.addEventListener('click',()=>{
    if(!playing) return;
    score++;
    scoreEl.textContent=score;
    placeCoin();
  });
  arena.appendChild(coin);
}

function endGame(){
  playing=false;
  clearInterval(timer);
  timer=null;
  document.querySelectorAll('.coin').forEach(c=>c.remove());
  message.textContent=`انتهت اللعبة! نتيجتك: ${score} 🏆`;
  message.style.display='grid';
  startBtn.textContent='العب مرة أخرى';
}

function startGame(){
  clearInterval(timer);
  score=0; time=30; playing=true;
  scoreEl.textContent=score; timeEl.textContent=time;
  message.style.display='none';
  startBtn.textContent='إعادة اللعب';
  placeCoin();
  timer=setInterval(()=>{
    time--;
    timeEl.textContent=time;
    if(time<=0) endGame();
  },1000);
}
startBtn.addEventListener('click',startGame);
window.addEventListener('resize',()=>{if(playing) placeCoin();});
