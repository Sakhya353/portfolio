// theme toggle
const root=document.documentElement;
document.getElementById('themeBtn').onclick=()=>{
  const cur=root.getAttribute('data-theme');
  root.setAttribute('data-theme', cur==='light'?'dark':'light');
};
// mobile nav
const links=document.getElementById('navlinks');
document.getElementById('hamburger').onclick=()=>links.classList.toggle('open');
links.querySelectorAll('a').forEach(a=>a.onclick=()=>links.classList.remove('open'));
// nav shrink + active link
const navEl=document.getElementById('nav');
const sections=[...document.querySelectorAll('section[id]')];
window.addEventListener('scroll',()=>{
  navEl.classList.toggle('shrink', window.scrollY>40);
  let cur=sections[0]?.id;
  for(const s of sections){ if(window.scrollY+90>=s.offsetTop) cur=s.id; }
  links.querySelectorAll('a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
});
// reveal on scroll
const io=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show'); io.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// animated counters
const counters=document.querySelectorAll('.metric .num[data-count]');
const cio=new IntersectionObserver((entries)=>{entries.forEach(e=>{
  if(e.isIntersecting){
    const el=e.target, target=parseFloat(el.dataset.count), suffix=el.dataset.suffix||'';
    let start=0, t0=performance.now();
    function step(t){
      const p=Math.min(1,(t-t0)/900);
      el.textContent=(target%1===0? Math.round(target*p): (target*p).toFixed(2))+suffix;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    cio.unobserve(el);
  }
})},{threshold:.4});
counters.forEach(c=>cio.observe(c));

// hero waveform canvas
const wc=document.getElementById('waveCanvas');
const wctx=wc.getContext('2d');
let mx=0.5, my=0.5;
function sizeCanvas(){ wc.width=wc.clientWidth*devicePixelRatio; wc.height=wc.clientHeight*devicePixelRatio; }
sizeCanvas(); window.addEventListener('resize', sizeCanvas);
wc.addEventListener('mousemove', e=>{ const r=wc.getBoundingClientRect(); mx=(e.clientX-r.left)/r.width; my=(e.clientY-r.top)/r.height; });
let t=0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function drawHero(){
  const W=wc.width, H=wc.height;
  wctx.clearRect(0,0,W,H);
  wctx.strokeStyle='rgba(140,160,179,0.15)'; wctx.lineWidth=1;
  for(let gx=0; gx<W; gx+=W/16){ wctx.beginPath(); wctx.moveTo(gx,0); wctx.lineTo(gx,H); wctx.stroke(); }
  for(let gy=0; gy<H; gy+=H/8){ wctx.beginPath(); wctx.moveTo(0,gy); wctx.lineTo(W,gy); wctx.stroke(); }
  const amp = (H*0.28) * (0.7+mx*0.6);
  const freq = 0.02 + my*0.02;
  wctx.beginPath(); wctx.strokeStyle=getComputedStyle(root).getPropertyValue('--accent'); wctx.lineWidth=2*devicePixelRatio;
  for(let x=0;x<W;x++){
    const y = H/2 + Math.sin(x*freq + t)*amp*Math.exp(-Math.pow((x-W*mx)/(W*0.5),2)*0.3) + Math.sin(x*0.005+t*2)*8;
    x===0? wctx.moveTo(x,y): wctx.lineTo(x,y);
  }
  wctx.stroke();
  wctx.fillStyle='rgba(140,160,179,0.7)'; wctx.font=(11*devicePixelRatio)+'px IBM Plex Mono';
  wctx.fillText('time →', 10, H-10);
  wctx.save(); wctx.translate(14,H/2); wctx.rotate(-Math.PI/2); wctx.fillText('amplitude', 0,0); wctx.restore();
  t+= reduceMotion? 0 : 0.03;
  requestAnimationFrame(drawHero);
}
drawHero();

// research node grid
const nodeGrid=document.getElementById('nodeGrid'), nodeTip=document.getElementById('nodeTip');
const comps=['H1','H2','Vertical'];
for(let i=1;i<=101;i++){
  const n=document.createElement('div'); n.className='node';
  n.addEventListener('mouseenter',()=>{ nodeTip.textContent=`Station #${i} — component ${comps[i%3]} — analyzed`; });
  nodeGrid.appendChild(n);
}

// skills
const skills=[
  ['MATLAB','Programming','Numerical modeling & analysis'],
  ['Python (Basic)','Programming','Ground-motion data processing'],
  ['R Programming (Basic)','Programming','Statistical analysis'],
  ['HTML','Web','Markup for web applications'],
  ['CSS','Web','Styling & responsive layout'],
  ['JavaScript','Web','Interactivity & visualization'],
  ['React','Web','Component-based UI'],
  ['Backend','Web','Server-side application logic'],
  ['MS Word','Office','Documentation & reports'],
  ['MS PowerPoint','Office','Presentations'],
  ['MS Excel','Office','Data tabulation'],
];
const sg=document.getElementById('skillGrid');
skills.forEach(([name,cat,ctx])=>{
  const c=document.createElement('div'); c.className='skillchip';
  c.innerHTML=`${name}<span class="tip">${cat} · ${ctx}</span>`;
  sg.appendChild(c);
});

// ===== Research Lab: synthetic generator + real trapezoidal integration =====
const $=(id)=>document.getElementById(id);
const ampR=$('amp'),freqR=$('freq'),durR=$('dur'),srR=$('sr'),noiseR=$('noise'),pwR=$('pw'),ppR=$('pp');
const ampV=$('ampV'),freqV=$('freqV'),durV=$('durV'),srV=$('srV'),noiseV=$('noiseV'),pwV=$('pwV'),ppV=$('ppV');
[[ampR,ampV,2],[freqR,freqV,1],[durR,durV,0],[srR,srV,0],[noiseR,noiseV,2],[pwR,pwV,1],[ppR,ppV,2]].forEach(([r,v,dec])=>{
  r.addEventListener('input',()=>v.textContent=parseFloat(r.value).toFixed(dec));
});

let lastData=null;

function trapz(y, dt){
  const out=new Float64Array(y.length); out[0]=0;
  for(let i=1;i<y.length;i++) out[i]=out[i-1] + dt*(y[i]+y[i-1])/2;
  return out;
}

function generate(){
  const amp=parseFloat(ampR.value), freq=parseFloat(freqR.value), dur=parseFloat(durR.value),
        sr=parseFloat(srR.value), noise=parseFloat(noiseR.value), pw=parseFloat(pwR.value), pp=parseFloat(ppR.value);
  const dt=1/sr, N=Math.round(dur*sr);
  const t=new Float64Array(N), acc=new Float64Array(N);
  const center=dur*pp;
  for(let i=0;i<N;i++){
    const ti=i*dt; t[i]=ti;
    const env=Math.exp(-Math.pow((ti-center)/(pw/2),2));
    acc[i]= amp*Math.sin(2*Math.PI*freq*ti)*env + (Math.random()-0.5)*2*noise;
  }
  const g=9.81;
  const accMs2=acc.map(a=>a*g);
  const vel=trapz(accMs2, dt);
  const disp=trapz(vel, dt);
  lastData={t,acc,vel,disp,dt};
  drawChart('cAcc', t, acc, 'g');
  drawChart('cVel', t, vel, 'm/s');
  drawChart('cDisp', t, disp, 'm');
  const pga=Math.max(...acc.map(Math.abs));
  const pgv=Math.max(...vel.map(Math.abs));
  const pgd=Math.max(...disp.map(Math.abs));
  $('mPGA').textContent=pga.toFixed(3)+' g';
  $('mPGV').textContent=pgv.toFixed(3)+' m/s';
  $('mPGD').textContent=pgd.toFixed(3)+' m';
  $('mN').textContent=N;
}

function drawChart(id,t,y,unit){
  const c=document.getElementById(id);
  c.width=c.clientWidth*devicePixelRatio; c.height=c.clientHeight*devicePixelRatio;
  const ctx=c.getContext('2d'); const W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(140,160,179,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  const ymax=Math.max(...y.map(Math.abs))||1;
  ctx.strokeStyle=getComputedStyle(root).getPropertyValue('--accent'); ctx.lineWidth=1.5*devicePixelRatio;
  ctx.beginPath();
  for(let i=0;i<y.length;i++){
    const x=(i/(y.length-1))*W;
    const yy=H/2 - (y[i]/ymax)*(H*0.42);
    i===0? ctx.moveTo(x,yy): ctx.lineTo(x,yy);
  }
  ctx.stroke();
}

$('genBtn').onclick=generate;
$('resetBtn').onclick=()=>{ ['cAcc','cVel','cDisp'].forEach(id=>{const c=document.getElementById(id); c.getContext('2d').clearRect(0,0,c.width,c.height)}); ['mPGA','mPGV','mPGD','mN'].forEach(id=>$(id).textContent='–'); lastData=null; };

async function downloadCSV(){
  if(!lastData){ generate(); }
  const {t,acc,vel,disp}=lastData;
  let csv='time_s,acceleration_g,velocity_ms,displacement_m\n';
  for(let i=0;i<t.length;i++) csv+=`${t[i].toFixed(4)},${acc[i].toFixed(6)},${vel[i].toFixed(6)},${disp[i].toFixed(6)}\n`;
  try{
    if(window.claude && window.claude.use){
      const dl = await window.claude.use('downloads');
      if(dl){ await dl.save({filename:'synthetic-ground-motion.csv', data:csv}); return; }
    }
  }catch(e){}
  try{
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    const a=document.createElement('a'); a.href=url; a.download='synthetic-ground-motion.csv';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){ alert('Download is not available in this environment.'); }
}
$('csvBtn').onclick=downloadCSV;
generate();

// ===== Site search =====
const searchIndex = [
  {label:"Home — hero", tag:"Section", id:"home"},
  {label:"About Sakhya", tag:"Section", id:"about"},
  {label:"Featured Research — Step-Fling Pulse", tag:"Research", id:"research"},
  {label:"101 Analyzed Stations visualization", tag:"Research", id:"research"},
  {label:"Earthquake Research Lab", tag:"Lab", id:"lab"},
  {label:"Synthetic Earthquake Generator", tag:"Lab", id:"lab"},
  {label:"Research Methodology / Workflow", tag:"Section", id:"methodology"},
  {label:"Experience Timeline", tag:"Section", id:"experience"},
  {label:"DST-INSPIRE Summer Research Project", tag:"Experience", id:"experience"},
  {label:"Geological Field Training", tag:"Experience", id:"field"},
  {label:"FoodNest — MERN Food & Grocery App", tag:"Project", id:"projects"},
  {label:"Earthquake Data Analysis & Web App", tag:"Project", id:"projects"},
  {label:"Molecular Logic Gates", tag:"Project", id:"projects"},
  {label:"Tensor Analysis in Astrophysics", tag:"Project", id:"projects"},
  {label:"Field Geology / Geological Cross-Section", tag:"Section", id:"field"},
  {label:"Education Timeline", tag:"Section", id:"education"},
  {label:"Skills — MATLAB, Python, JavaScript, React…", tag:"Skills", id:"skills"},
  {label:"Achievements & Positions", tag:"Section", id:"achievements"},
  {label:"Contact", tag:"Section", id:"contact"},
];
skills.forEach(([name,cat,ctx])=>searchIndex.push({label:`${name} skill`, tag:cat, id:"skills"}));

const overlay=$('searchOverlay'), searchInput=$('siteSearch'), resultsEl=$('searchResults');
function openSearch(){ overlay.classList.add('open'); searchInput.value=''; renderResults(''); setTimeout(()=>searchInput.focus(),50); }
function closeSearch(){ overlay.classList.remove('open'); }
$('searchBtn').onclick=openSearch;
$('searchClose').onclick=closeSearch;
overlay.addEventListener('click', e=>{ if(e.target===overlay) closeSearch(); });
document.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); overlay.classList.contains('open')? closeSearch(): openSearch(); }
  if(e.key==='Escape') closeSearch();
});
function renderResults(q){
  q=q.trim().toLowerCase();
  const matches = q? searchIndex.filter(i=>i.label.toLowerCase().includes(q)||i.tag.toLowerCase().includes(q)).slice(0,8) : searchIndex.slice(0,8);
  resultsEl.innerHTML = matches.length? matches.map(m=>`<li data-id="${m.id}"><span>${m.label}</span><span class="rtag">${m.tag}</span></li>`).join('')
    : `<li class="empty">No matches — try "research", "skills", "projects"…</li>`;
  resultsEl.querySelectorAll('li[data-id]').forEach(li=>li.onclick=()=>{
    const target=document.getElementById(li.dataset.id);
    closeSearch();
    setTimeout(()=>{ target.scrollIntoView({behavior:'smooth', block:'start'}); target.classList.add('hlpulse'); setTimeout(()=>target.classList.remove('hlpulse'),1600); },150);
  });
}
searchInput.addEventListener('input', ()=>renderResults(searchInput.value));

// cursor glow (desktop only)
if(window.matchMedia('(pointer:fine)').matches && !reduceMotion){
  const glow=document.createElement('div'); glow.className='cursor-glow'; document.body.appendChild(glow);
  window.addEventListener('mousemove', e=>{ glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px'; glow.classList.add('active'); });
  window.addEventListener('mouseleave', ()=>glow.classList.remove('active'));
}

// magnetic buttons
if(!reduceMotion){
  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('mousemove', e=>{
      const r=b.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*0.25, y=(e.clientY-r.top-r.height/2)*0.35;
      b.style.transform=`translate(${x}px,${y}px)`;
    });
    b.addEventListener('mouseleave', ()=>b.style.transform='');
  });
  // subtle 3D tilt on cards
  document.querySelectorAll('.card, .projcard').forEach(c=>{
    c.addEventListener('mousemove', e=>{
      const r=c.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-0.5)*-6, ry=((e.clientX-r.left)/r.width-0.5)*6;
      c.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    c.addEventListener('mouseleave', ()=>c.style.transform='');
  });
}
