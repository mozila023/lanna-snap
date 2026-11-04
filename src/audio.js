/* ===== Lanna Snap — procedural music (4 Lanna-flavoured tracks) + sound effects, Web Audio only ===== */
(()=>{
let ctx=null, master, musicBus, sfxBus, verb, started=false;
const pref={music:true,sfx:true}; try{ Object.assign(pref,JSON.parse(localStorage.getItem('lannasnap-audio')||'{}')); }catch(e){}
const savePref=()=>{ try{ localStorage.setItem('lannasnap-audio',JSON.stringify(pref)); }catch(e){} };
const mtof=m=>440*Math.pow(2,(m-69)/12);

function init(){ if(ctx) return true; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false; ctx=new AC();
  master=ctx.createDynamicsCompressor(); master.threshold.value=-14; master.ratio.value=4; master.connect(ctx.destination);
  verb=ctx.createConvolver(); const len=ctx.sampleRate*2.2, ir=ctx.createBuffer(2,len,ctx.sampleRate); for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3); } verb.buffer=ir;
  const vg=ctx.createGain(); vg.gain.value=.32; verb.connect(vg); vg.connect(master);
  musicBus=ctx.createGain(); musicBus.gain.value=pref.music?.42:0; musicBus.connect(master); musicBus.connect(verb);
  sfxBus=ctx.createGain(); sfxBus.gain.value=pref.sfx?.75:0; sfxBus.connect(master); sfxBus.connect(verb);
  return true; }
function env(g,t,a,peak,d,sus=0.0001){ g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+a); g.gain.exponentialRampToValueAtTime(Math.max(sus,0.0001),t+a+d); }
function osc(type,f,t,dur,dest,gain,a=.005,d){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); env(g,t,a,gain,d??dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t+a+(d??dur)+.05); return o; }
let noiseBuf=null; function noise(){ if(noiseBuf) return noiseBuf; noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return noiseBuf; }
function nz(t,dur,dest,gain,type='bandpass',f=1000,q=1,f2){ const s=ctx.createBufferSource(); s.buffer=noise(); s.loop=true; const fl=ctx.createBiquadFilter(); fl.type=type; fl.frequency.setValueAtTime(f,t); if(f2) fl.frequency.exponentialRampToValueAtTime(f2,t+dur); fl.Q.value=q; const g=ctx.createGain(); env(g,t,.005,gain,dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t+dur+.05); }

/* ---------- instruments ---------- */
const I={
  sueng(f,t,dur,dest,v=.22){ // plucked lute (sueng / phin)
    const fl=ctx.createBiquadFilter(); fl.type='lowpass'; fl.frequency.setValueAtTime(f*9,t); fl.frequency.exponentialRampToValueAtTime(f*1.5,t+.45); fl.Q.value=2; fl.connect(dest);
    osc('sawtooth',f,t,0,fl,v*.55,.003,Math.min(1.4,dur*1.6)); osc('triangle',f*2.003,t,0,fl,v*.35,.003,.5); nz(t,.03,fl,v*.4,'highpass',2000); },
  salaw(f,t,dur,dest,v=.12){ // bowed fiddle with vibrato
    const o=ctx.createOscillator(), g=ctx.createGain(), fl=ctx.createBiquadFilter(), lfo=ctx.createOscillator(), lg=ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(f*.985,t); o.frequency.exponentialRampToValueAtTime(f,t+.12); lfo.frequency.value=5.5; lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(f*.012,t+.3); lfo.connect(lg); lg.connect(o.frequency);
    fl.type='bandpass'; fl.frequency.value=f*2.5; fl.Q.value=.9; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.12); g.gain.setValueAtTime(v,t+dur*.8); g.gain.exponentialRampToValueAtTime(.0001,t+dur+.15);
    o.connect(fl); fl.connect(g); g.connect(dest); o.start(t); lfo.start(t); o.stop(t+dur+.2); lfo.stop(t+dur+.2); },
  khong(f,t,dur,dest,v=.16){ // gong-circle bell: inharmonic partials
    osc('sine',f,t,0,dest,v,.002,2.2); osc('sine',f*2.76,t,0,dest,v*.35,.002,.9); osc('sine',f*5.4,t,0,dest,v*.12,.002,.35); },
  khlui(f,t,dur,dest,v=.11){ // bamboo flute
    const o=ctx.createOscillator(), g=ctx.createGain(), lfo=ctx.createOscillator(), lg=ctx.createGain(); o.type='sine'; o.frequency.value=f; lfo.frequency.value=5; lg.gain.value=f*.008; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.09); g.gain.setValueAtTime(v*.85,t+dur*.85); g.gain.exponentialRampToValueAtTime(.0001,t+dur+.12); o.connect(g); g.connect(dest); o.start(t); lfo.start(t); o.stop(t+dur+.2); lfo.stop(t+dur+.2);
    nz(t,dur*.6,dest,v*.18,'bandpass',f*2,6); },
  drone(f,t,dur,dest,v=.06){ const fl=ctx.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=380; fl.connect(dest); const g=ctx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.6); g.gain.setValueAtTime(v,t+dur-.4); g.gain.exponentialRampToValueAtTime(.0001,t+dur); g.connect(fl);
    for(const m of [1,1.5,2.003]){ const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=f*m; o.connect(g); o.start(t); o.stop(t+dur+.05); } },
  klong(t,dest,v=.5,f0=110){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f0*.42,t+.18); env(g,t,.003,v,.35); o.connect(g); g.connect(dest); o.start(t); o.stop(t+.45); nz(t,.05,dest,v*.25,'lowpass',900); },
  ching(t,dest,v=.09,open=false){ nz(t,open?.35:.07,dest,v,'highpass',6500,.7); osc('sine',3200,t,0,dest,v*.4,.001,open?.4:.08); },
  tap(t,dest,v=.12){ nz(t,.06,dest,v,'bandpass',1800,3); },
};

/* ---------- tracks ---------- */
const TRACKS=[
  {id:'saw',th:'สะล้อซอซึง',bpm:84,root:62,scale:[0,2,4,7,9],lead:'salaw',acc:'sueng',bell:true,drum:'soft'},
  {id:'klong',th:'กลองสะบัดชัย',bpm:118,root:57,scale:[0,2,4,7,9],lead:'sueng',acc:'khong',bell:true,drum:'big'},
  {id:'kad',th:'ราตรีกาดกองต้า',bpm:96,root:60,scale:[0,3,5,7,10],lead:'sueng',acc:'khong',bell:false,drum:'walk'},
  {id:'doi',th:'ยอดดอยสามหมอก',bpm:72,root:64,scale:[0,2,4,7,9],lead:'khlui',acc:'sueng',bell:true,drum:'none'},
];
function rnd(seed){ let a=seed>>>0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function makePhrase(r,len){ const out=[]; let deg=r()*5|0; for(let i=0;i<len;i++){ deg=Math.max(-2,Math.min(9,deg+[-2,-1,-1,0,1,1,2,3][r()*8|0])); out.push(r()<.14?null:deg); } return out; }
let cur=null, timer=null, nextT=0, step=0, song=null, trackIdx=-1;
function degToMidi(tr,deg){ const n=tr.scale.length; const o=Math.floor(deg/n), i=((deg%n)+n)%n; return tr.root+12*o+tr.scale[i]; }
function buildSong(tr){ const r=rnd(Date.now()); const A=makePhrase(r,8), B=makePhrase(r,8), C=makePhrase(r,8); const form=[A,A,B,A,C,B,A,A]; return {form,r}; }
function schedule(){ const tr=TRACKS[trackIdx]; const spb=60/tr.bpm/2; // 8th notes
  while(nextT<ctx.currentTime+.25){ const bar=Math.floor(step/8)%song.form.length, s=step%8, ph=song.form[bar]; const t=nextT;
    if(s===0&&bar%2===0) I.drone(mtof(tr.root-24),t,spb*16,musicBus,.045);
    const deg=ph[s]; if(deg!=null&&(s%2===0||tr.bpm<90||song.r()<.6)){ const f=mtof(degToMidi(tr,deg)); const len=(ph[s+1]==null?spb*2:spb)*1.05; I[tr.lead](f,t,len,musicBus,tr.lead==='salaw'?.1:tr.lead==='khlui'?.09:.16); }
    if(s%4===0){ const f=mtof(degToMidi(tr,(ph[0]??0)-5)); if(tr.acc==='sueng') I.sueng(f,t,spb*2,musicBus,.08); else I.khong(f*2,t,spb*2,musicBus,.05); }
    if(tr.bell&&s===0&&bar%4===3) I.khong(mtof(degToMidi(tr,7)),t,1,musicBus,.06);
    if(tr.drum==='big'){ if(s===0||s===3||s===6) I.klong(t,musicBus,s===0?.35:.2); if(s%2===1) I.ching(t,musicBus,.035); }
    else if(tr.drum==='soft'){ if(s===0) I.klong(t,musicBus,.16,90); if(s===4) I.ching(t,musicBus,.03,true); }
    else if(tr.drum==='walk'){ if(s%2===0) I.tap(t,musicBus,.05); if(s===0||s===5) I.klong(t,musicBus,.14,140); }
    nextT+=spb; step++; } }
function play(i){ if(!init()) return; if(ctx.state==='suspended') ctx.resume(); stop(); trackIdx=i; song=buildSong(TRACKS[i]); step=0; nextT=ctx.currentTime+.1; timer=setInterval(schedule,40); schedule(); return TRACKS[i]; }
function stop(){ if(timer){ clearInterval(timer); timer=null; } }
function shuffle(){ let i; do{ i=Math.random()*TRACKS.length|0; }while(TRACKS.length>1&&i===trackIdx); return play(i); }

/* ---------- sound effects ---------- */
function sfx(name){ if(!pref.sfx||!init()) return; if(ctx.state==='suspended') ctx.resume(); const t=ctx.currentTime+.01, d=sfxBus, M=m=>mtof(m);
  switch(name){
    case 'tap': I.tap(t,d,.12); osc('sine',M(86),t,0,d,.05,.002,.06); break;
    case 'select': I.sueng(M(74),t,.2,d,.14); break;
    case 'place': I.klong(t,d,.32,150); I.sueng(M(67),t+.02,.2,d,.12); break;
    case 'unplace': I.sueng(M(62),t,.2,d,.1); break;
    case 'reveal': nz(t,.25,d,.18,'bandpass',600,1.2,4000); I.khong(M(79),t+.14,.5,d,.08); break;
    case 'big': nz(t,.45,d,.25,'bandpass',300,1,3000); I.klong(t+.2,d,.6,80); I.khong(M(55),t+.22,2,d,.22); I.khong(M(67),t+.3,2,d,.12); break;
    case 'legend': [0,4,7,12,16].forEach((x,i)=>I.khong(M(67+x),t+i*.07,1,d,.12)); I.klong(t,d,.6,70); nz(t,.8,d,.12,'highpass',5000); break;
    case 'buff': [0,4,7].forEach((x,i)=>osc('triangle',M(76+x),t+i*.06,0,d,.07,.003,.18)); break;
    case 'debuff': [7,3,0].forEach((x,i)=>osc('square',M(64+x),t+i*.07,0,d,.035,.003,.16)); break;
    case 'status': { const o=osc('sine',M(70),t,0,d,.1,.01,.5); o.frequency.exponentialRampToValueAtTime(M(58),t+.5); break; }
    case 'block': I.khong(M(88),t,.3,d,.12); osc('sine',M(100),t,0,d,.05,.001,.15); break;
    case 'snap': nz(t,.5,d,.3,'bandpass',200,.8,5000); [0,7,12,19].forEach(x=>osc('sawtooth',M(55+x),t+.25,0,d,.05,.02,.9)); I.klong(t+.25,d,.6,60); break;
    case 'oppsnap': nz(t,.5,d,.25,'bandpass',4000,.8,200); [0,6,12].forEach(x=>osc('sawtooth',M(52+x),t+.2,0,d,.05,.02,.8)); I.klong(t+.2,d,.6,55); break;
    case 'temple': I.khong(M(43),t,3,d,.3); I.khong(M(55),t+.05,3,d,.15); [0,4,7,12].forEach(x=>I.khlui(M(67+x),t+.3,1.4,d,.045)); break;
    case 'turn': I.khong(M(72),t,.6,d,.09); I.khong(M(79),t+.12,.6,d,.07); break;
    case 'locreveal': nz(t,.6,d,.14,'bandpass',300,.7,2500); I.khong(M(60),t+.3,1.5,d,.14); break;
    case 'coin': [0,7].forEach((x,i)=>osc('square',M(88+x),t+i*.07,0,d,.04,.001,.12)); break;
    case 'win': [0,4,7,12,16,19,24].forEach((x,i)=>I.sueng(M(60+x),t+i*.11,.4,d,.16)); I.khong(M(72),t+.8,2,d,.18); I.klong(t,d,.5,90); I.klong(t+.8,d,.6,70); break;
    case 'lose': [7,3,0,-5].forEach((x,i)=>I.salaw(M(62+x),t+i*.28,.32,d,.09)); break;
    case 'upgrade': [0,4,7,12,16,19,24,28].forEach((x,i)=>osc('triangle',M(72+x),t+i*.05,0,d,.06,.002,.25)); I.khong(M(84),t+.42,1.2,d,.1); break;
    case 'pack': for(let i=0;i<10;i++) I.klong(t+i*.06,d,.12+i*.03,140); I.khong(M(72),t+.65,1.5,d,.16); nz(t+.6,.5,d,.15,'highpass',4000); break;
    case 'boom': nz(t,.5,d,.22,'lowpass',1200,.7,200); I.klong(t,d,.25,60); nz(t+.05,.6,d,.05,'highpass',6000); break;
    case 'error': osc('square',M(45),t,0,d,.06,.005,.18); break;
  } }

const A={ sfx, play, stop, shuffle, tracks:TRACKS, get current(){ return trackIdx>=0?TRACKS[trackIdx]:null; },
  unlock(){ if(started) return; if(!init()) return; started=true; if(ctx.state==='suspended') ctx.resume(); if(pref.music) shuffle(); },
  get pref(){ return {...pref}; },
  setMusic(on){ pref.music=on; savePref(); if(!init()) return; musicBus.gain.setTargetAtTime(on?.42:0,ctx.currentTime,.2); if(on&&!timer) shuffle(); },
  setSfx(on){ pref.sfx=on; savePref(); if(init()) sfxBus.gain.setTargetAtTime(on?.75:0,ctx.currentTime,.05); } };
window.AUD=A;
})();
