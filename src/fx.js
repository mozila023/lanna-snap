/* ===== Lanna Snap — visual effects (particles, lanterns, shockwaves) ===== */
(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.createElement('canvas'); cv.id='fx'; document.body.appendChild(cv);
const ctx=cv.getContext('2d'); let W=0,H=0,dpr=1; const parts=[]; let running=false; let ffT=null; const A=n=>{ try{ window.AUD&&AUD.sfx(n); }catch(e){} };
function size(){ dpr=Math.min(2,window.devicePixelRatio||1); W=innerWidth; H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+'px'; cv.style.height=H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
size(); addEventListener('resize',size);
function loop(){ ctx.clearRect(0,0,W,H); for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.t+=1; if(p.t>p.life){ parts.splice(i,1); continue; } p.vx*=p.drag; p.vy=p.vy*p.drag+p.g; p.x+=p.vx; p.y+=p.vy; const k=1-p.t/p.life; p.draw(p,k); }
  if(parts.length){ requestAnimationFrame(loop); } else { running=false; ctx.clearRect(0,0,W,H); } }
function add(p){ if(reduce) return; parts.push(Object.assign({t:0,drag:.96,g:0},p)); if(!running){ running=true; requestAnimationFrame(loop); } }
const spark=(p,k)=>{ ctx.globalCompositeOperation='lighter'; ctx.fillStyle=p.c; ctx.globalAlpha=k; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(.4+k*.6),0,7); ctx.fill(); ctx.globalAlpha=k*.35; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2.6*k,0,7); ctx.fill(); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; };
const star=(p,k)=>{ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.t*.08); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=k; ctx.fillStyle=p.c; const r=p.r*(.5+k*.5); ctx.beginPath(); for(let i=0;i<8;i++){ const a=i*Math.PI/4, rr=i%2?r*.3:r; ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } ctx.fill(); ctx.restore(); };
const ring=(p,k)=>{ ctx.globalAlpha=k*.9; ctx.strokeStyle=p.c; ctx.lineWidth=p.lw*k+1; ctx.beginPath(); ctx.arc(p.x,p.y,p.r+(1-k)*p.grow,0,7); ctx.stroke(); ctx.globalAlpha=1; };
const conf=(p,k)=>{ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot+p.t*p.spin); ctx.globalAlpha=Math.min(1,k*2); ctx.fillStyle=p.c; ctx.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9); ctx.restore(); };
const lantern=(p,k)=>{ const fl=.85+Math.sin(p.t*.3+p.ph)*.15; ctx.save(); ctx.translate(p.x+Math.sin(p.t*.02+p.ph)*8,p.y); ctx.globalAlpha=Math.min(1,k*2.5,p.t/20);
  const g=ctx.createRadialGradient(0,0,2,0,0,p.r*2.4); g.addColorStop(0,`rgba(255,200,110,${.55*fl})`); g.addColorStop(1,'rgba(255,150,60,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,p.r*2.4,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,${170+fl*40|0},90,.95)`; ctx.beginPath(); ctx.moveTo(-p.r*.7,-p.r); ctx.quadraticCurveTo(0,-p.r*1.25,p.r*.7,-p.r); ctx.lineTo(p.r*.55,p.r*.8); ctx.quadraticCurveTo(0,p.r*.95,-p.r*.55,p.r*.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,250,220,.9)'; ctx.beginPath(); ctx.arc(0,p.r*.55,p.r*.22*fl,0,7); ctx.fill(); ctx.restore(); };
function center(el){ const r=el.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,r]; }
const FX={
  burst(el,color='#ffd98a',n=18){ if(!el) return; const [x,y,r]=center(el);
    add({x,y,r:Math.max(r.width,r.height)*.35,grow:r.width*.9,lw:5,c:color,life:26,draw:ring,drag:1});
    for(let i=0;i<n;i++){ const a=Math.random()*7, s=2+Math.random()*4; add({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:1.5+Math.random()*2.5,c:Math.random()<.35?'#fff6d8':color,life:30+Math.random()*24,draw:Math.random()<.3?star:spark,g:.05}); } },
  shimmer(el,color='#ffd98a',n=10){ if(!el) return; const r=el.getBoundingClientRect(); for(let i=0;i<n;i++) add({x:r.left+Math.random()*r.width,y:r.top+r.height*(.3+Math.random()*.7),vx:(Math.random()-.5)*.6,vy:-.6-Math.random()*1.2,r:1.5+Math.random()*2,c:color,life:40+Math.random()*30,draw:Math.random()<.4?star:spark,drag:.99}); },
  rays(el){ if(!el) return; el.classList.remove('rays'); void el.offsetWidth; el.classList.add('rays'); setTimeout(()=>el.classList.remove('rays'),1400); FX.shimmer(el,'#ffe7a3',26); },
  shock(color='#a98bff'){ const x=W/2,y=H*.45; for(let i=0;i<3;i++) add({x,y,r:20,grow:Math.max(W,H)*.7,lw:10-i*3,c:color,life:34+i*8,draw:ring,drag:1});
    const fl=document.createElement('div'); fl.className='flash'; fl.style.setProperty('--fc',color); document.body.appendChild(fl); setTimeout(()=>fl.remove(),600); },
  shake(el){ if(!el||reduce) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),500); },
  confetti(n=90){ const cols=['#ffd879','#e8b64a','#ff7a6a','#9dffbf','#9fe3ff','#c7b8ff','#fff']; for(let i=0;i<n;i++) add({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*12,vy:-6-Math.random()*8,r:3+Math.random()*3,rot:Math.random()*7,spin:(Math.random()-.5)*.3,c:cols[i%cols.length],life:110+Math.random()*50,g:.22,drag:.985,draw:conf}); },
  lanterns(n=14){ for(let i=0;i<n;i++) setTimeout(()=>add({x:Math.random()*W,y:H+30,vx:0,vy:-.9-Math.random()*.9,r:9+Math.random()*9,ph:Math.random()*7,life:420,drag:1,draw:lantern}),i*160); },
  coins(fromEl,toEl,n=10){ if(!fromEl||!toEl) return; const [x0,y0]=center(fromEl), [x1,y1]=center(toEl); for(let i=0;i<n;i++) setTimeout(()=>{ const life=40; add({x:x0+(Math.random()-.5)*40,y:y0,vx:(x1-x0)/life,vy:(y1-y0)/life-3,g:3*2/life,r:4,c:'#ffe7a3',life,drag:1,draw:star}); },i*45); },

  fireworks(n=7){ const cols=['#ffd879','#ff7a6a','#9dffbf','#9fe3ff','#c7b8ff','#ffb3e6']; for(let k=0;k<n;k++) setTimeout(()=>{ const x=W*(.15+Math.random()*.7), y=H*(.12+Math.random()*.3), col=cols[k%cols.length];
      add({x,y:H+10,vx:(x-x)/1,vy:-(H+10-y)/38,r:2.5,c:'#fff3c4',life:38,drag:1,draw:spark,g:0});
      setTimeout(()=>{ for(let i=0;i<46;i++){ const a=i/46*Math.PI*2, sp=2.4+Math.random()*2.6; add({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:1.6+Math.random()*1.6,c:Math.random()<.2?'#fff':col,life:60+Math.random()*30,g:.04,drag:.97,draw:Math.random()<.25?star:spark}); } add({x,y,r:6,grow:90,lw:6,c:col,life:22,draw:ring,drag:1}); A('boom'); },630); },k*380); },
  fireflies(on){ clearInterval(ffT); if(!on||reduce) return; ffT=setInterval(()=>{ if(document.hidden) return; add({x:Math.random()*W,y:H*(.2+Math.random()*.7),vx:(Math.random()-.5)*.3,vy:-.15-Math.random()*.25,r:1.4+Math.random()*1.4,c:Math.random()<.5?'#ffe7a3':'#c9ffb0',life:200+Math.random()*120,drag:1,draw:(p,k)=>{ p.vx+=(Math.random()-.5)*.04; spark(p,Math.sin(Math.PI*(1-k))*.8); }}); },260); },
  banner(text,kind=''){ const b=document.createElement('div'); b.className='banner '+kind; b.innerHTML=`<span>${text}</span>`; document.body.appendChild(b); setTimeout(()=>b.remove(),1500); },
  splash(html,color='#ffd98a',kind=''){ return new Promise(res=>{ if(reduce){ res(); return; } const w=document.createElement('div'); w.className='splash '+kind; w.style.setProperty('--sc',color); w.innerHTML=`<div class="sRays"></div><div class="sCard">${html}</div>`; document.body.appendChild(w);
      setTimeout(()=>{ const c=w.querySelector('.card'); if(c) FX.burst(c,color,40); },260); setTimeout(()=>w.classList.add('out'),900); setTimeout(()=>{ w.remove(); res(); },1250); }); },
  glow(color='rgba(255,215,120,.55)'){ const g=document.createElement('div'); g.className='glowAll'; g.style.setProperty('--gc',color); document.body.appendChild(g); setTimeout(()=>g.remove(),1400); },
  crown(el,mine){ if(!el) return; const c=document.createElement('div'); c.className='crown '+(mine?'me':'opp'); c.textContent=mine?'ชนะ':'แพ้'; el.appendChild(c); if(mine){ FX.burst(el,'#ffd98a',26); } },
  count(el,from,to,ms=900){ if(!el) return; if(reduce){ el.textContent=to; return; } const t0=performance.now(); const step=t=>{ const k=Math.min(1,(t-t0)/ms); el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-k,3))); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
};
window.FX=FX;
})();
