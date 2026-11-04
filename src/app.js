/* ===== Lanna Snap — app (screens, match, collection, upgrades, auth) ===== */
(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const L=x=>x?(x.th??x):''; const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SUPA={url:'https://gfhetnzcmoagbbjxmgyd.supabase.co',key:'sb_publishable_i7VWQb9gWnZAE8NWNNDDWQ_55xVgDUj'};
let sb=null; try{ if(window.supabase) sb=window.supabase.createClient(SUPA.url,SUPA.key); }catch(e){ sb=null; }
const TIERS=['ธรรมดา','กรอบผ้าทอ','ประกายดาว','ภาพนูน','เรืองแสง','ทองคำเปลว','ลายคำ'];
const UP_SPARE=[1,2,3,4,5,8], UP_BIA=[25,100,200,300,400,1500]; const MAX_BONUS=2; // only the final tier (ลายคำ) adds power
const PLAYABLE=C.filter(c=>!c.token);
const isDual=c=>c.prov.length>1; const rarityOf=c=>isDual(c)?'dual':c.type==='legend'?'legend':'common';
const RAR={common:{n:'ทั่วไป',p:86},legend:{n:'ตำนาน',p:12},dual:{n:'ตำนานสองแผ่นดิน',p:2}};
const KEY='lannasnap-v1';
let user=null, prof=null;
function freshProfile(){ const owned={}; const start=STARTER_DECKS.lanna.slice(); for(const id of start) owned[id]={tier:0,dup:0}; return {name:'ผู้มาเยือน',bia:60,cl:1,owned,deck:start,wins:0,losses:0,cubes:0,v:1,tut:false,tutReward:false,firstTopup:false}; }
function loadLocal(){ try{ const s=JSON.parse(localStorage.getItem(KEY)||'null'); if(s&&s.v===1) return s; }catch(e){} return null; }
async function saveProfile(){ try{ localStorage.setItem(KEY,JSON.stringify(prof)); }catch(e){} if(sb&&user){ try{ await sb.from('profiles').upsert({id:user.id,data:prof,updated_at:new Date().toISOString()}); }catch(e){} } }
async function loadCloud(){ if(!sb||!user) return null; try{ const {data,error}=await sb.from('profiles').select('data').eq('id',user.id).maybeSingle(); if(!error&&data&&data.data) return data.data; }catch(e){} return null; }

/* ---------- screens ---------- */
function show(id){ $$('.scr').forEach(s=>s.hidden=s.id!==id); $$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go===id)); if(id==='scrHome') renderHome(); if(id==='scrDeck') renderDeck(); if(id==='scrColl') renderColl(); if(id==='scrShop') renderShop(); }
document.addEventListener('click',e=>{ const g=e.target.closest('[data-go]'); if(g) show(g.dataset.go); });
const sfx=n=>{ try{ AUD.sfx(n); }catch(e){} };
function toast(msg,ms=1400){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(t._t); t._t=setTimeout(()=>t.hidden=true,ms); }
function modal(html,onOpen){ $('#mBody').innerHTML=html; $('#modal').hidden=false; onOpen&&onOpen($('#mBody')); }
function closeModal(){ $('#modal').hidden=true; if(prof&&$('#scrMatch').hidden) refreshScreens(); }
$('#modal .mClose').onclick=closeModal; $('#modal').addEventListener('click',e=>{ if(e.target.id==='modal') closeModal(); });

/* ---------- card rendering ---------- */
function refreshScreens(){ renderTop(); if(!$('#scrHome').hidden) renderHome(); if(!$('#scrDeck').hidden) renderDeck(); if(!$('#scrColl').hidden) renderColl(); }
function canUp(id){ const o=prof&&prof.owned[id]; return !!o&&o.tier<6&&(o.dup||0)>=UP_SPARE[o.tier]&&prof.bia>=UP_BIA[o.tier]; }
function cardHTML(def,o={}){ const pc=PROV[def.prov[0]].col; const pw=o.power??def.power; const base=def.power;
  const provs=def.prov.map(p=>`<i style="--c:${PROV[p].col};--k:${PROV[p].ink}">${esc(L(PROV[p].ab))}</i>`).join('');
  const sts=o.status?Object.entries(o.status).map(([k])=>`<b class="${k}">${esc(L(STATUS[k]))}</b>`).join(''):'';
  const isPow=def.type!=='temple'; const cost=o.cost??def.cost; const lk=(o.tier||0)>=6&&isPow&&o.power==null;
  const tk=o.tier||0; const tcl=Array.from({length:tk},(_,i)=>' t'+(i+1)).join('');
  return `<div class="card${tcl}${isDual(def)?' dual':''}${o.small?' small':''}${o.cls?' '+o.cls:''}" data-id="${def.id}"${o.uid?` data-uid="${o.uid}"`:''} data-t="${o.tier||0}" style="--pc:${pc}">
    <div class="art">${tk>=2?'<i class="twk"></i>':''}<img src="art/${def.id}.webp" alt="" loading="lazy" onerror="this.style.display='none';this.parentNode.style.background='linear-gradient(160deg,${pc},#1a1222)'"></div><div class="frame"></div>
    <div class="cost${cost<def.cost?' up':''}">${cost}</div>${isPow?`<div class="pow${lk?' lk':pw>base?' up':pw<base?' down':''}">${lk?pw+MAX_BONUS:pw}</div>`:''}
    <div class="prov">${provs}</div>${o.small?'':`<span class="tp">${esc(L(TYPES[def.type]))}</span>`}${sts?`<div class="sts">${sts}</div>`:''}
    <div class="nm"><span>${esc(L(def.name))}</span></div>${tk?`<div class="pips">${'<i></i>'.repeat(tk)}</div>`:''}${o.up?'<b class="upb">UP</b>':''}</div>`; }
function cardView(id){ const def=CARDS[id]; const own=prof.owned[id]; const inMatch=!$('#scrMatch').hidden; const tier=own&&!inMatch?own.tier:0;
  const nextB=UP_SPARE[tier], nextC=UP_BIA[tier]; const dup=own?(own.dup||0):0;
  const up=own?(tier<6?`<div class="up"><div class="tiers">${TIERS.map((n,i)=>`<span class="${i<=tier?'on':''}">${i===tier?'●':'○'}</span>`).join('')}</div><div>ระดับ: <b>${TIERS[tier]}</b> → ${TIERS[tier+1]}${tier===5?' <b class="gain">· พลัง +2 ในสนาม</b>':''}</div>${tier===5?'<small class="muted">ขั้นสุดท้าย ใช้อะไหล่และเบี้ยมาก แต่การ์ดได้พลัง +2 ทุกตา</small>':''}<div class="spares">${Array.from({length:nextB},(_,i)=>`<i class="${i<dup?'on':''}"></i>`).join('')}</div><small>อะไหล่ (การ์ดใบซ้ำ) <b>${dup}/${nextB}</b> ใบ · ใช้ ${nextC} เบี้ย${dup>nextB?` · เหลือเก็บ ${dup-nextB}`:''}</small><button class="btn primary" id="btnUp" type="button" ${dup>=nextB&&prof.bia>=nextC?'':'disabled'}>อัปเกรด</button></div>`:`<div class="up"><b>ระดับสูงสุด: ลายคำ ✦</b><span class="gain">พลัง +2 ทุกครั้งที่ลงสนาม</span></div>`):(isDual(def)?`<p class="muted"><span class="rainbowTxt">ตำนานสองแผ่นดิน</span> · หาได้จากซองการ์ดสุ่มเท่านั้น (โอกาส 2%)</p>`:`<p class="muted">ยังไม่ได้ปลดล็อก · ขึ้นระดับคอลเลกชัน ซื้อในร้าน หรือเปิดซองสุ่ม</p>`);
  const upHtml=inMatch?'':up;
  modal(`<div class="cardView">${cardHTML(def,{tier,cls:own?'':'unowned'})}<h3>${esc(L(def.name))}</h3>
    <div class="ab"><small>${isDual(def)?'<span class="rainbowTxt">ตำนานสองแผ่นดิน</span> · ':''}${esc(L(TYPES[def.type]))} · ${def.prov.map(p=>esc(L(PROV[p].name))).join(' / ')}</small><br>${esc(L(def.text))}</div>
    <div class="lore"><b>เรื่องจริงหลังการ์ด</b><br>${esc(L(def.lore))}</div>${upHtml}</div>`,b=>{
    const btn=b.querySelector('#btnUp'); if(btn) btn.onclick=async()=>{ own.dup=(own.dup||0)-nextB; prof.bia-=nextC; own.tier++; prof.cl++; await maybeUnlock(); await saveProfile(); cardView(id); refreshScreens(); sfx('upgrade'); FX.banner(`${TIERS[own.tier]}!`,'up'); const cv2=$('#mBody .card'); if(cv2){ cv2.classList.add('evolve'); cv2.classList.add('pop'); setTimeout(()=>{ FX.burst(cv2,'#ffd98a',34); FX.shimmer(cv2,'#ffe7a3',20); },150); } };
    const cv=b.querySelector('.card'); if(tier>=3&&cv){ cv.addEventListener('pointermove',e=>{ const r=cv.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; cv.style.transform=`perspective(500px) rotateY(${x*18}deg) rotateX(${-y*18}deg)`; cv.querySelector('.art img').style.transform=`scale(1.15) translate(${-x*10}px,${-y*10}px)`; }); cv.addEventListener('pointerleave',()=>{ cv.style.transform=''; }); } }); }
async function maybeUnlock(){ if(prof.cl%3!==0) return; const pool=PLAYABLE.filter(c=>!prof.owned[c.id]&&rarityOf(c)==='common'); if(!pool.length) return; const c=pool[Math.floor(Math.random()*pool.length)]; prof.owned[c.id]={tier:0,dup:0}; await wait(50); toast(`ปลดล็อกการ์ดใหม่! ${L(c.name)}`,2200); }

/* ---------- home / deck / collection ---------- */
function renderTop(){ if(!prof) return; $('#pName').textContent=prof.name; $('#pCL').textContent=`ระดับคอลเลกชัน ${prof.cl} · ชนะ ${prof.wins} แพ้ ${prof.losses}`; $('#pBia').textContent=prof.bia; $$('.biaMirror').forEach(e=>e.textContent=prof.bia); }
function renderHome(){ renderTop(); $('#homeDeckPreview').innerHTML=prof.deck.map(id=>cardHTML(CARDS[id],{small:true,tier:prof.owned[id]?.tier,up:canUp(id)})).join(''); }
let fDeck='all', fColl='all';
function filterBar(el,cur,set){ el.innerHTML=[['all','ทั้งหมด']].concat(Object.keys(PROV).map(k=>[k,L(PROV[k].ab)])).map(([k,n])=>`<button type="button" data-f="${k}" class="${k===cur?'on':''}">${n}</button>`).join(''); el.onclick=e=>{ const b=e.target.closest('[data-f]'); if(b) set(b.dataset.f); }; }
function sortDefs(a,b){ return a.cost-b.cost||L(a.name).localeCompare(L(b.name),'th'); }
function renderDeck(){ $('#deckCount').textContent=`${prof.deck.length}/12`;
  $('#deckSlots').innerHTML=Array.from({length:12},(_,i)=>prof.deck[i]?cardHTML(CARDS[prof.deck[i]],{small:true,tier:prof.owned[prof.deck[i]]?.tier,up:canUp(prof.deck[i])}):'<div class="slot"></div>').join('');
  filterBar($('#deckFilter'),fDeck,f=>{ fDeck=f; renderDeck(); });
  const pool=PLAYABLE.filter(c=>prof.owned[c.id]&&(fDeck==='all'||c.prov.includes(fDeck))).sort(sortDefs);
  $('#deckPool').innerHTML=pool.map(c=>cardHTML(c,{tier:prof.owned[c.id].tier,up:canUp(c.id),cls:prof.deck.includes(c.id)?'dim':''})).join(''); }
$('#deckSlots').onclick=e=>{ const c=e.target.closest('.card'); if(!c) return; prof.deck.splice(prof.deck.indexOf(c.dataset.id),1); saveProfile(); renderDeck(); };
$('#deckPool').onclick=e=>{ const c=e.target.closest('.card'); if(!c) return; const id=c.dataset.id; if(prof.deck.includes(id)) prof.deck.splice(prof.deck.indexOf(id),1); else if(prof.deck.length<12) prof.deck.push(id); else toast('เด็คเต็มแล้ว (12 ใบ)'); saveProfile(); renderDeck(); };
$('#deckPool').oncontextmenu=e=>{ const c=e.target.closest('.card'); if(c){ e.preventDefault(); cardView(c.dataset.id); } };
$('#btnAutoDeck').onclick=()=>{ const own=PLAYABLE.filter(c=>prof.owned[c.id]); const pick=[]; const want=[1,1,2,2,2,3,3,4,4,5,5,6]; for(const w of want){ const c=own.filter(x=>!pick.includes(x.id)).sort((a,b)=>Math.abs(a.cost-w)-Math.abs(b.cost-w)||Math.random()-.5)[0]; if(c) pick.push(c.id); } prof.deck=pick.slice(0,12); saveProfile(); renderDeck(); };
function renderColl(){ const n=PLAYABLE.filter(c=>prof.owned[c.id]).length; $('#collCount').textContent=`${n}/${PLAYABLE.length} ใบ · ระดับ ${prof.cl}`; renderTop();
  filterBar($('#collFilter'),fColl,f=>{ fColl=f; renderColl(); });
  $('#collGrid').innerHTML=PLAYABLE.filter(c=>fColl==='all'||c.prov.includes(fColl)).sort(sortDefs).map(c=>cardHTML(c,{tier:prof.owned[c.id]?.tier,up:canUp(c.id),cls:prof.owned[c.id]?'':'unowned'})).join(''); }
$('#collGrid').onclick=e=>{ const c=e.target.closest('.card'); if(c) cardView(c.dataset.id); };

/* ---------- match ---------- */
let S=null, sel=null, busy=false, aiLevel=1;
function aiDeck(){ const by=(cost)=>PLAYABLE.filter(c=>c.cost===cost); const want=[1,1,2,2,2,3,3,4,4,5,5,6]; const out=[]; const provs=Object.keys(PROV).filter(p=>p!=='ln').sort(()=>Math.random()-.5).slice(0,2);
  for(const w of want){ let cands=by(w).filter(c=>!out.includes(c.id)); const fav=cands.filter(c=>c.prov.some(p=>provs.includes(p))); cands=fav.length&&Math.random()<.7?fav:cands; if(!cands.length) cands=PLAYABLE.filter(c=>!out.includes(c.id)); out.push(cands[Math.floor(Math.random()*cands.length)].id); } return out; }
const AI_NAMES=['พ่อหนานคำ','แม่อุ๊ยแสง','ครูแก้ว','หนานจ๋อย','อ้ายเปา','น้องฝ้าย'];
const STAKES=[0,10,25,50,100];
function stakePick(){ if(prof.deck.length<12){ toast('จัดเด็คให้ครบ 12 ใบก่อนนะ'); show('scrDeck'); return; }
  modal(`<div class="result"><h2 style="font-size:28px">วางเดิมพัน</h2><p>ชนะได้ <b>เดิมพัน × แต้มคิวบ์</b> เบี้ย · แพ้เสียเท่ากัน<br><small class="muted">กดสแนปแล้วแต้มคูณสอง · ถอยก่อนเสียน้อยกว่า</small></p>
    <div class="stakes">${STAKES.map(s=>{ const ok=s===0||prof.bia>=s*2; return `<button class="stk${s===0?' free':''}" type="button" data-s="${s}" ${ok?'':'disabled'}><b>${s===0?'ซ้อมมือ':s}</b><small>${s===0?'ไม่เสียเบี้ย':`สูงสุด ±${s*8}`}</small></button>`; }).join('')}</div>
    <p class="muted">มีอยู่ ${prof.bia} เบี้ย · ต้องมีอย่างน้อย 2 เท่าของเดิมพัน</p></div>`,b=>{ b.querySelector('.stakes').onclick=e=>{ const k=e.target.closest('.stk'); if(!k||k.disabled) return; closeModal(); startMatch(+k.dataset.s); }; }); }
const TUT_DECK=['rooster','carriage','bosang','teafarmer','bowlpainter','wualai','lampangluang','elephantlp','thipchang','horse','morhom','khanomjeen'];
const TUT_AI=['langsat','saltmaker','coffeefarmer','fisher','silkweaver','kuptai','longan','phuean','hyacinth','namphi','rower','peacock'];
function tutIntro(){ modal(`<div class="result tutIntro"><div class="logo sm"><span class="l1">ล้านนา</span><span class="l2">SNAP</span></div><h2 style="font-size:24px">ยินดีต้อนรับ!</h2><p>มาลองเล่นตาแรกด้วยกัน<br>เล่นจบรับ <b class="gain">การ์ดใหม่ 10 ใบ</b></p><div class="actions"><button class="btn end" id="tutGo" type="button">เริ่มสอนเล่น</button></div></div>`,b=>{ b.querySelector('#tutGo').onclick=()=>{ closeModal(); startTutorial(); }; }); }
function matchMusic(){ FX.fireflies(true); try{ if(AUD.pref.music){ const t=AUD.shuffle(); if(t) showTrack(t); } }catch(e){} }
function showTrack(t){ const n=$('#trackName'); if(!n) return; n.textContent='♪ '+t.th; n.classList.remove('show'); void n.offsetWidth; n.classList.add('show'); }
function startTutorial(){ S=newGame({seed:20261104,decks:[TUT_DECK.slice(),TUT_AI.slice()],noShuffle:[true,true],locs:['clocktower','kwanphayao','tonsakyai'],names:[prof.name,'ครูแก้ว (สอนเล่น)']}); S.stake=0; S.tut=true;
  $('#oppName').textContent=S.players[1].name; show('scrMatch'); matchMusic(); nextTurn(); }
function coachMsg(){ const me=S.players[0]; const q=me.played.length; const hasTemple=me.hand.some(c=>c.def.type==='temple');
  if(S.turn===1){ if(q) return ['กด <b>จบเทิร์น</b> การ์ดของทั้งสองฝ่ายจะเปิดพร้อมกัน','#btnEnd']; if(sel) return ['แตะ<b>สนาม</b>ที่อยากวาง (ช่องที่มีกรอบเหลือง)','.loc.target .side.me'];
    return ['ชนะ <b>2 ใน 3 สนาม</b> คือชนะเกม · แตะการ์ดในมือ 1 ใบ<br><small>วงฟ้า = พลังงานที่ใช้ · หกเหลี่ยมส้ม = พลัง</small>','#hand']; }
  if(S.turn===2) return [q?'ดีมาก! กดจบเทิร์นได้เลย':'พลังงานเพิ่มเทิร์นละ 1 · สนามไหนพลังรวมมากกว่า ฝ่ายนั้นชนะสนาม<br><small>ตัวเลขมุมขวาของสนาม: บน = คู่แข่ง, ล่าง = เรา</small>',q?'#btnEnd':'#board'];
  if(S.turn===3) return ['แต่ละสนามมีกติกาพิเศษ อ่านใต้ชื่อสนาม · การ์ด ลป. ได้ +1 ที่ห้าแยกหอนาฬิกา (สนามบ้าน)<br><small>กดค้างที่การ์ดเพื่ออ่านความสามารถ</small>','.loc[data-li="0"] .tile'];
  if(S.turn===4) return hasTemple&&!me.played.some(p=>p.li==='temple')?['ลอง<b>การ์ดวัด</b>! แตะ วัดพระธาตุลำปางหลวง แล้วแตะ <b>ช่องวัด</b> ด้านซ้าย<br><small>การ์ด ลป. ทุกใบได้ +2 (ของคู่แข่งด้วย)</small>',sel&&sel.def.type==='temple'?'#templeSlot':'#hand']:['เยี่ยม! วัดอยู่จนกว่าจะมีวัดอื่นมาแทนที่','#btnEnd'];
  if(S.turn===5) return [me.snapped?'สแนปแล้ว! เดิมพันจะคูณ 2':'มั่นใจว่าชนะ? กด <b>สแนป</b> เพื่อเพิ่มเดิมพันเป็น 2 เท่า<br><small>ถ้าดูท่าจะแพ้ กด "ถอย" จะเสียน้อยกว่า</small>',me.snapped?'#btnEnd':'#btnSnap'];
  return ['เทิร์นสุดท้าย! ลงการ์ดให้คุ้มพลังงาน แล้วจบเทิร์น','#hand']; }
function renderCoach(){ const box=$('#coach'); $$('.hl').forEach(x=>x.classList.remove('hl')); if(!S||!S.tut||S.over){ box.hidden=true; return; } const [m,target]=coachMsg(); box.innerHTML=`<span class="cAv">ครู</span><div>${m}</div>`; box.hidden=false; const t=$(target); if(t) t.classList.add('hl'); }
async function tutReward(){ const pool=PLAYABLE.filter(c=>!prof.owned[c.id]&&rarityOf(c)==='common').sort(()=>Math.random()-.5).slice(0,10);
  for(const c of pool) prof.owned[c.id]={tier:0,dup:0}; prof.tutReward=true; await saveProfile();
  modal(`<div class="result"><h2 style="font-size:26px">รางวัลจบบทสอน</h2><p>ได้การ์ดใหม่ ${pool.length} ใบ!</p><div class="draw10">${pool.map(c=>`<div class="d10">${cardHTML(c)}</div>`).join('')}</div><div class="actions"><button class="btn end" id="d10ok" type="button">ไปจัดเด็คกัน</button></div></div>`,b=>{
    sfx('pack'); b.querySelectorAll('.d10').forEach((d,i)=>setTimeout(()=>{ d.classList.add('open'); sfx('reveal'); const c=d.querySelector('.card'); FX.burst(c,PROV[CARDS[c.dataset.id].prov[0]].col,14); },300+i*180));
    b.querySelector('#d10ok').onclick=()=>{ closeModal(); show('scrDeck'); toast('ใส่การ์ดใหม่ลงเด็คได้เลย หรือกด "จัดให้"',2200); }; }); }
function applyTierPower(S,p){ const P=S.players[p]; for(const c of [...P.deck,...P.hand]){ const o=prof.owned[c.def.id]; if(o&&o.tier>=6){ c.perm+=MAX_BONUS; c.laikham=true; } } }
function startMatch(stake=0){ if(prof.deck.length<12){ toast('จัดเด็คให้ครบ 12 ใบก่อนนะ'); show('scrDeck'); return; }
  S=newGame({seed:(Math.random()*2**31)|0,decks:[prof.deck.slice(),aiDeck()],names:[prof.name,AI_NAMES[Math.floor(Math.random()*AI_NAMES.length)]+' (AI)']}); S.stake=stake; applyTierPower(S,0);
  $('#oppName').textContent=S.players[1].name; show('scrMatch'); matchMusic(); nextTurn(); }
$('#btnPlay').onclick=stakePick;
$('#btnReset').onclick=()=>{ const legends=Object.keys(prof.owned).filter(id=>CARDS[id]&&rarityOf(CARDS[id])!=='common').length;
  modal(`<div class="result"><h2 style="font-size:24px">เริ่มเกมใหม่?</h2><p>ล้างเซฟทั้งหมด: การ์ด ${Object.keys(prof.owned).length} ใบ (ตำนาน ${legends} ใบ) เบี้ย ${prof.bia} และระดับอัปเกรด<br>แล้วเริ่มใหม่ด้วยเด็คเริ่มต้น (ตำนาน 1 ใบ) + โหมดสอนเล่น + รางวัล 10 ใบ</p><p class="loss">ย้อนกลับไม่ได้</p><div class="actions"><button class="btn ghost" id="rsNo" type="button">ยกเลิก</button><button class="btn end" id="rsYes" type="button">ล้างแล้วเริ่มใหม่</button></div></div>`,b=>{
    b.querySelector('#rsNo').onclick=closeModal;
    b.querySelector('#rsYes').onclick=async()=>{ const name=prof.name; prof=freshProfile(); if(user) prof.name=name; await saveProfile(); closeModal(); enter(); }; }); }; $('#btnTut').onclick=startTutorial;
function nextTurn(){ applySnapsAtTurnStart(S); startTurn(S); if(!S.tut&&aiShouldSnap(S,1)&&!S.players[1].snapped){ snap(S,1); toast('คู่แข่งกด สแนป! เดิมพันจะเพิ่มเป็นสองเท่า'); setTimeout(()=>{ FX.shock('#ff7a8a'); pulseCubes(); sfx('oppsnap'); },900); }
  FX.banner(S.turn===S.maxTurn?'เทิร์นสุดท้าย!':`เทิร์น ${S.turn}`,S.turn===S.maxTurn?'final':''); sfx('turn');
  if(S.turn<=3) setTimeout(()=>flashLoc(S.turn-1),200);
  sel=null; renderMatch(); }
function flashLoc(li){ const el=$(`.loc[data-li="${li}"] .tile`); if(el){ el.classList.add('reveal'); setTimeout(()=>el.classList.remove('reveal'),1300); setTimeout(()=>FX.burst(el,PROV[S.locs[li].def.prov].col,22),350); setTimeout(()=>{ sfx('locreveal'); FX.banner(L(S.locs[li].def.name),'loc'); },700); } }
function pulseCubes(){ const c=$('#cubes'); c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse'); }
function powerOf(c){ return cardPower(S,c); }
function renderMatch(hideUids){ const me=S.players[0];
  $('#cubes').textContent=S.cubes*(S.pendingSnap?2:1); $('#stakeLbl').textContent=S.stake?`× ${S.stake} เบี้ย`:'ซ้อมมือ'; $('#energy').textContent=me.energy; $('#turnLbl').textContent=`${S.turn}/${S.maxTurn}`;
  $('#btnSnap').disabled=me.snapped||S.over; $('#btnSnap').textContent=me.snapped?'สแนปแล้ว':'สแนป';
  const tc=S.temple; $('#templeSlot').classList.toggle('has',!!tc); $('#templeSlot').style.setProperty('--tc',tc?PROV[tc.def.temple].col:'transparent'); $('#templeSlot .tsCard').innerHTML=tc?`${cardHTML(tc.def,{tier:0})}<span class="tsBuff"><b>${esc(L(PROV[tc.def.temple].ab))}</b> +2<small>${tc.owner===0?'วัดของเรา':'วัดคู่แข่ง'}</small></span>`:'<div class="tsEmpty"><span>卍</span><small>ว่าง<br>ลงการ์ดวัด<br>บัฟทั้งจังหวัด</small></div>';
  const queuedTemple=me.played.find(p=>p.li==='temple'); if(queuedTemple) $('#templeSlot .tsCard').innerHTML=cardHTML(queuedTemple.c.def,{cls:'queued',uid:queuedTemple.c.uid})+'<span class="tsBuff"><small>รอเปิด</small></span>';
  $('#board').innerHTML=S.locs.map((Lc,li)=>{ const d=Lc.def; const pc=PROV[d.prov].col; const mine=Lc.cards[0].filter(c=>!hideUids||!hideUids.has(c.uid)), opp=Lc.cards[1].filter(c=>!hideUids||!hideUids.has(c.uid));
    const qd=me.played.filter(p=>p.li===li).map(p=>p.c); const a=locPower(S,li,0), b=locPower(S,li,1); const cap=capOf(S,li);
    const cd=c=>cardHTML(c.def,{small:true,uid:c.uid,power:powerOf(c),status:Object.fromEntries(Object.keys(c.status).filter(s=>statusActive(S,c,s)).map(s=>[s,1])),tier:0,cls:statusActive(S,c,'sleep')?'slept':''});
    const lw=Lc.revealed?(a>b?' wMe':b>a?' wOpp':''):''; return `<div class="loc${lw}" data-li="${li}"><div class="side opp${cap>4?' cap5':''}">${opp.map(cd).join('')}</div>
      <div class="tile${Lc.revealed?'':' hiddenLoc'}" style="--pc:${pc};${Lc.revealed?`background-image:url(art/loc_${d.id}.webp)`:''}">${Lc.revealed?`<span class="ab">${esc(L(PROV[d.prov].ab))}</span><b>${esc(L(d.name))}</b><small>${esc(L(d.text))}</small>`:`<b>?</b><small>เปิดเทิร์น ${li+1}</small>`}
        <div class="score"><span class="${b>a?'w':''}">${b}</span><span class="${a>b?'w':''}">${a}</span></div></div>
      <div class="side me${cap>4?' cap5':''}">${mine.map(cd).join('')}${qd.map(c=>cardHTML(c.def,{small:true,uid:c.uid,cls:'queued',tier:0})).join('')}</div></div>`; }).join('');
  $('#hand').style.setProperty('--n',Math.max(me.hand.length,1)); $('#hand').innerHTML=me.hand.map(c=>cardHTML(c.def,{uid:c.uid,cost:cardCost(S,c),power:c.def.power+c.perm,tier:0,cls:(c.laikham?'lkc ':'')+(sel===c?'sel':'')+(cardCost(S,c)>me.energy?' dim':'')})).join('');
  $$('.loc').forEach(el=>el.classList.toggle('target',!!sel&&sel.def.type!=='temple'&&canPlay(S,0,sel,+el.dataset.li)));
  $('#templeSlot').classList.toggle('target',!!sel&&sel.def.type==='temple'&&canPlay(S,0,sel,'temple')); renderCoach(); }
$('#hand').addEventListener('click',e=>{ if(busy) return; const el=e.target.closest('.card'); if(!el) return; const c=S.players[0].hand.find(x=>x.uid==el.dataset.uid); if(!c) return; if(sel===c){ sel=null; renderMatch(); sfx('tap'); return; } sel=c; renderMatch(); if(cardCost(S,c)>S.players[0].energy){ toast('พลังงานไม่พอ'); sfx('error'); } else sfx('select'); });
$('#hand').addEventListener('contextmenu',e=>{ const el=e.target.closest('.card'); if(el){ e.preventDefault(); cardView(el.dataset.id); } });
let pressT=null; document.addEventListener('pointerdown',e=>{ const el=e.target.closest('#scrMatch .card,#deckPool .card,#deckSlots .card'); if(!el) return; pressT=setTimeout(()=>{ pressT=null; cardView(el.dataset.id); },520); }); document.addEventListener('pointerup',()=>{ if(pressT){ clearTimeout(pressT); pressT=null; } });
$('#board').addEventListener('click',e=>{ if(busy) return; const q=e.target.closest('.card.queued'); if(q){ const me=S.players[0]; const i=me.played.findIndex(p=>p.c.uid==q.dataset.uid); if(i>=0){ unqueue(S,0,i); renderMatch(); sfx('unplace'); } return; }
  const card=e.target.closest('.card'); const loc=e.target.closest('.loc'); if(!loc) return; const li=+loc.dataset.li;
  if(sel&&sel.def.type!=='temple'){ if(queuePlay(S,0,sel,li)){ sel=null; renderMatch(); sfx('place'); const qe=$$(`.loc[data-li="${li}"] .card.queued`).pop(); if(qe) FX.burst(qe,'#fff0b8',8); } else { sfx('error'); toast(S.locs[li].revealed&&S.locs[li].def.closeAfter&&S.turn>S.locs[li].def.closeAfter?'ประตูน้ำปิดแล้ว ลงที่นี่ไม่ได้':'ลงที่นี่ไม่ได้'); } return; }
  if(card&&!card.classList.contains('queued')){ cardView(card.dataset.id); return; }
  const Lc=S.locs[li]; if(Lc.revealed) modal(`<div class="cardView"><h3>${esc(L(Lc.def.name))}</h3><div class="ab">${esc(L(Lc.def.text))}<br><small>สนามบ้าน: การ์ด ${esc(L(PROV[Lc.def.prov].ab))} ที่นี่ +1</small></div><div class="lore"><b>เรื่องจริง</b><br>${esc(L(Lc.def.lore))}<br><br><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(Lc.def.maps)}" target="_blank" rel="noopener" style="color:var(--gold)">📍 เปิดใน Google Maps</a></div></div>`); });
$('#templeSlot').addEventListener('click',e=>{ if(busy) return; const q=e.target.closest('.card.queued'); const me=S.players[0]; if(q){ const i=me.played.findIndex(p=>p.c.uid==q.dataset.uid); if(i>=0){ unqueue(S,0,i); renderMatch(); } return; }
  if(sel&&sel.def.type==='temple'){ if(me.played.some(p=>p.li==='temple')){ toast('ลงวัดได้เทิร์นละ 1 ใบ'); return; } if(queuePlay(S,0,sel,'temple')){ sel=null; renderMatch(); sfx('place'); } else { toast('พลังงานไม่พอ'); sfx('error'); } }
  else if(S.temple) cardView(S.temple.def.id); });
$('#btnSnap').onclick=()=>{ if(snap(S,0)){ toast('สแนป! เดิมพันเพิ่มเป็นสองเท่าตอนเริ่มเทิร์นหน้า'); renderMatch(); FX.shock('#a98bff'); pulseCubes(); sfx('snap'); } };
$('#btnRetreat').onclick=()=>{ if(busy) return; modal(`<div class="result"><h2>ถอย?</h2><p>เสียเดิมพัน ${S.cubes} แต้ม${S.stake?` = ${Math.min(prof.bia,S.cubes*S.stake)} เบี้ย`:''} (ถ้าสู้ต่อแล้วแพ้จะเสียมากกว่านี้)</p><div class="actions"><button class="btn ghost" id="noR" type="button">สู้ต่อ</button><button class="btn end" id="yesR" type="button">ถอย</button></div></div>`,b=>{ b.querySelector('#noR').onclick=closeModal; b.querySelector('#yesR').onclick=()=>{ closeModal(); retreat(S,0); endMatch(); }; }); };
$('#btnEnd').onclick=async()=>{ if(busy||S.over) return; busy=true; sel=null;
  for(const {c,li} of aiPlan(S,1,S.tut?0:aiLevel)) queuePlay(S,1,c,li);
  const queued=new Set([...S.players[0].played,...S.players[1].played].map(p=>p.c.uid));
  const ev=revealTurn(S);
  const hide=new Set(queued); renderMatch(hide);
  for(const e of ev){ if(e.k==='reveal'||e.k==='temple'){ const cc0=allBoard(S).concat(S.temple?[S.temple]:[]).find(x=>x.uid==e.uid); const bigOne=cc0&&(cc0.def.type==='legend'||cc0.def.prov.length>1||cc0.def.cost>=5);
    if(bigOne){ sfx(cc0.def.type==='legend'||cc0.def.prov.length>1?'legend':'big'); await FX.splash(cardHTML(cc0.def,{tier:0}),PROV[cc0.def.prov[0]].col,cc0.def.prov.length>1?'dual':cc0.owner===1?'opp':''); } else if(e.k==='temple'){ sfx('temple'); FX.glow(); } else sfx('reveal');
    hide.delete(e.uid); renderMatch(hide); const el=$(`[data-uid="${e.uid}"]`); if(el){ el.classList.add('pop'); const cc=allBoard(S).concat(S.temple?[S.temple]:[]).find(x=>x.uid==e.uid); setTimeout(()=>FX.burst(el,cc?PROV[cc.def.prov[0]].col:'#ffd98a',cc&&cc.def.cost>=5?30:16),180); if(cc&&cc.def.cost>=5) setTimeout(()=>FX.shake($('#board')),200); } if(e.k==='temple') setTimeout(()=>FX.rays($('#templeSlot')),150); if(e.k==='temple') toast(e.prev?`${L(S.temple.def.name)} เข้ามาแทนที่ บารมีวัดเดิมเลือนไป`:`${L(S.temple.def.name)} · การ์ด ${L(PROV[S.temple.def.temple].ab)} ทุกใบ +2`,1600); floats(e.log||[]); await wait(520); } else if(e.k==='endturn'){ renderMatch(); floats(e.log); await wait(300); } }
  if(!S.tut&&aiShouldRetreat(S,1)){ retreat(S,1); }
  busy=false; if(S.over) endMatch(); else nextTurn(); };
let sndT={}; function snd(n){ const now=Date.now(); if(sndT[n]&&now-sndT[n]<120) return; sndT[n]=now; sfx(n); }
function floats(log){ for(const l of log){ const el=$(`[data-uid="${l.uid}"]`); if(!el) continue; const r=el.getBoundingClientRect(), a=$('#app').getBoundingClientRect(); const f=document.createElement('div'); f.className='fly'; f.style.left=(r.left-a.left+r.width/2-10)+'px'; f.style.top=(r.top-a.top)+'px';
    if(l.k==='buff'){ f.textContent=(l.n>0?'+':'')+l.n; f.style.color=l.n>0?'#9dffbf':'#ff9f9f'; if(Math.abs(l.n)>=3) f.classList.add('bigfly'); if(l.n>0){ FX.shimmer(el,'#9dffbf',6); snd('buff'); } else { FX.shake(el); snd('debuff'); } } else if(l.k==='status'){ f.textContent=L(STATUS[l.s]); f.style.color='#ffd06a'; f.style.fontSize='13px'; FX.burst(el,'#ffd06a',8); FX.shake(el); snd('status'); } else if(l.k==='block'){ f.textContent='กัน!'; f.style.color='#9fe3ff'; snd('block'); FX.burst(el,'#9fe3ff',10); } else if(l.k==='move'){ f.textContent='ย้าย'; } else if(l.k==='vanish'){ f.textContent='✦'; } else continue;
    $('#app').appendChild(f); setTimeout(()=>f.remove(),950); } }
async function crowns(){ if(S.retreated!=null) return; for(let i=0;i<3;i++){ const w=locWinner(S,i); const el=$(`.loc[data-li="${i}"] .tile`); if(w===0||w===1){ FX.crown(el,w===0); sfx(w===0?'coin':'tap'); } await wait(380); } await wait(250); }
async function endMatch(){ renderMatch(); FX.fireflies(false); await crowns(); if(S.tut){ return endTutorial(); } const w=S.winner, ret=S.retreated; const cubes=ret!=null?S.cubes:S.cubes*(S.pendingSnap?2:1);
  const win=w===0, draw=w===-1, stake=S.stake||0; let gained=0; const before=prof.bia;
  let delta=0; if(stake){ if(win) delta=stake*cubes; else if(!draw) delta=-Math.min(prof.bia,stake*cubes); delta+=5; } else delta=win?10:5;
  if(win){ prof.wins++; prof.cubes+=cubes; } else if(!draw){ prof.losses++; prof.cubes=Math.max(0,prof.cubes-cubes); }
  const playedIds=new Set(); for(const c of [...allBoard(S),...S.destroyed]) if(c.owner===0) playedIds.add(c.def.id); if(S.temple&&S.temple.owner===0) playedIds.add(S.temple.def.id);
  const cand=[...playedIds].filter(id=>prof.owned[id]&&prof.owned[id].tier<6); let spareGot=null; if(cand.length&&(win||Math.random()<(draw?.5:.25))){ spareGot=cand[Math.floor(Math.random()*cand.length)]; prof.owned[spareGot].dup=(prof.owned[spareGot].dup||0)+1; gained=1; }
  prof.bia=Math.max(0,prof.bia+delta); await saveProfile();
  const res=[0,1,2].map(i=>locWinner(S,i));
  const money=stake?(win?`ได้เดิมพัน <b class="gain">+${stake*cubes}</b> เบี้ย`:draw?'เสมอ ได้เดิมพันคืน':`เสียเดิมพัน <b class="loss">${stake*cubes>before?'-'+before:'-'+stake*cubes}</b> เบี้ย`)+' · ค่าลงสนาม +5':`ซ้อมมือ · ได้ <b class="gain">+${delta}</b> เบี้ย`;
  if(win){ FX.confetti(); FX.lanterns(14); FX.fireworks(7); sfx('win'); } else if(!draw){ FX.shake($('#board')); sfx('lose'); }
  modal(`<div class="result"><h2 class="${win?'win':draw?'':'lose'}">${win?'ชนะ!':draw?'เสมอ':'แพ้'}</h2><p>${ret===0?'คุณถอย':ret===1?'คู่แข่งถอย!':`สนามที่ชนะ ${res.filter(x=>x===0).length}/3`} · ${cubes} แต้มคิวบ์${stake?` × ${stake}`:''}</p>
    <p>${money}</p><div class="biaBig"><span class="shell">◖</span><b id="resBia">${before}</b></div>${spareGot?`<div class="spareGot">${cardHTML(CARDS[spareGot],{small:true})}<span>ได้อะไหล่ <b>${esc(L(CARDS[spareGot].name))}</b> +1${canUp(spareGot)?' · <b class="loss">พร้อมอัป!</b>':''}</span></div>`:'<p class="muted">ตานี้ไม่ได้อะไหล่ · ชนะได้อะไหล่แน่นอน 1 ใบ</p>'}
    <div class="actions"><button class="btn ghost" id="toHome" type="button">หน้าหลัก</button><button class="btn end" id="again" type="button">เล่นอีกตา</button></div></div>`,b=>{ FX.count(b.querySelector('#resBia'),before,prof.bia,1100); b.querySelector('#toHome').onclick=()=>{ closeModal(); show('scrHome'); }; b.querySelector('#again').onclick=()=>{ closeModal(); stakePick(); }; }); }

async function endTutorial(){ const win=S.winner===0; prof.tut=true; await saveProfile(); sfx(win?'win':'lose'); if(win){ FX.fireworks(5); FX.confetti(); FX.lanterns(10); }
  modal(`<div class="result"><h2 class="${win?'win':''}">${win?'ชนะ!':'จบบทสอน'}</h2><p>${win?'เก่งมาก! พร้อมลุยแล้ว':'ไม่เป็นไร รู้วิธีเล่นแล้ว ลองอีกทีได้'}</p><p class="muted">สรุป: วางการ์ด · ชนะ 2 ใน 3 สนาม · วัดบัฟทั้งจังหวัด · สแนปเพิ่มเดิมพัน</p><div class="actions"><button class="btn end" id="tutRw" type="button">${prof.tutReward?'กลับหน้าหลัก':'รับรางวัล 10 ใบ'}</button></div></div>`,b=>{ b.querySelector('#tutRw').onclick=()=>{ if(prof.tutReward){ closeModal(); show('scrHome'); } else tutReward(); }; }); }

/* ---------- shop & daily gift ---------- */
function today(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function hashStr(s){ let h=2166136261; for(const ch of s){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function shopState(){ if(!prof.shop||prof.shop.day!==today()) prof.shop={day:today(),bought:[],gift:false,bags:0}; return prof.shop; }
function dailyOffers(){ const st=shopState(); if(!st.offers){ const locked=PLAYABLE.filter(c=>!prof.owned[c.id]&&!isDual(c)); const rng=RNG(hashStr(today()+(user?user.id:'guest'))); const pool=locked.slice(); const out=[]; while(pool.length&&out.length<4) out.push(pool.splice(Math.floor(rng()*pool.length),1)[0].id); st.offers=out; } return st.offers.map(id=>CARDS[id]); }
const priceOf=c=>80+c.cost*30+(c.type==='legend'?60:0); const PACK=150, BAG=60;
function renderShop(){ renderTop(); const st=shopState(); $('#shopDay').textContent='ของในร้านเปลี่ยนทุกวัน';
  const offers=dailyOffers(); const lockedN=PLAYABLE.filter(c=>!prof.owned[c.id]).length;
  $('#shopBody').innerHTML=`
    <div class="gift${st.gift?' done':''}"><div><b>ของขวัญประจำวัน</b><small>${st.gift?'รับแล้ว กลับมาใหม่พรุ่งนี้':'รับเบี้ยฟรี 50 วันละครั้ง'}</small></div><button class="btn end" id="btnGift" type="button" ${st.gift?'disabled':''}>${st.gift?'รับแล้ว':'รับ 50'}</button></div>
    ${prof.firstTopup?'':`<div class="topup big"><div class="tuShine"></div><div class="tuArt">${cardHTML(CARDS.mangrai,{tier:2})}</div><div class="tuTxt"><span class="tuTag">ครั้งเดียวต่อบัญชี</span><b>เติมเงินครั้งแรก</b><span class="tuLine">เติมเท่าไหร่ก็ได้<br>รับ <span class="rainbowTxt">พญามังราย</span></span><span class="tuSub">ระดับ ${TIERS[2]} (+2) · ตำนานสองแผ่นดิน</span><button class="btn play" id="btnTopup" type="button">เติมเงิน</button></div></div>`}
    <h4>การ์ดแนะนำวันนี้</h4>
    <div class="offers">${offers.length?offers.map(c=>{ const got=!!prof.owned[c.id]; return `<div class="offer${got?' sold':''}" data-id="${c.id}">${cardHTML(c,{cls:got?'':''})}<button class="buy" type="button" data-buy="${c.id}" ${got||prof.bia<priceOf(c)?'disabled':''}>${got?'ซื้อแล้ว':`<span class="shell">◖</span>${priceOf(c)}`}</button></div>`; }).join(''):'<p class="muted">คุณมีการ์ดครบทุกใบแล้ว</p>'}</div>
    <h4>ของอื่นๆ</h4>
    <div class="goods">
      <div class="good"><div class="gIcon pack"></div><div><b>ซองการ์ดสุ่ม</b><small>ได้การ์ดที่ยังไม่มี 1 ใบ · เหลือ ${lockedN} ใบ</small><small class="rates">ทั่วไป ${RAR.common.p}% · ตำนาน ${RAR.legend.p}% · <span class="rainbowTxt">สองแผ่นดิน ${RAR.dual.p}%</span></small></div><button class="buy" type="button" id="btnPack" ${prof.bia>=PACK?'':'disabled'}><span class="shell">◖</span>${PACK}</button></div>
      <div class="good"><div class="gIcon bag"></div><div><b>ซองอะไหล่</b><small>ได้อะไหล่ (การ์ดใบซ้ำ) 3 ใบ ของการ์ดสุ่มที่มี · วันละ 3 ซอง (${st.bags}/3)</small></div><button class="buy" type="button" id="btnBag" ${st.bags<3&&prof.bia>=BAG?'':'disabled'}><span class="shell">◖</span>${BAG}</button></div>
    </div>
    <p class="muted">เบี้ยเป็นเงินในเกมเท่านั้น ได้จากการเล่นและของขวัญรายวัน</p>`; }
function topupHide(){ try{ return localStorage.getItem('lannasnap-topup-hide')===today(); }catch(e){ return false; } }
function topupPopup(force){ if(prof.firstTopup||(!force&&topupHide())||!$('#modal').hidden) return;
  modal(`<div class="tuPop"><div class="tuGlow"></div><p class="tuKick">โปรเติมเงินครั้งแรก</p><div class="tuBig">${cardHTML(CARDS.mangrai,{tier:2})}</div><h2><span class="rainbowTxt">พญามังราย</span></h2><p>เติมเท่าไหร่ก็ได้ รับทันที<br>ระดับ <b>${TIERS[2]} (+2)</b> · ตำนานสองแผ่นดิน</p><button class="btn play" id="tuGo" type="button">ไปเติมเงิน</button><label class="tuHide"><input type="checkbox" id="tuHide"> ไม่แสดงอีกวันนี้</label></div>`,b=>{
    const c=b.querySelector('.tuBig .card'); c.classList.add('pop'); setTimeout(()=>{ FX.burst(c,'#ffd98a',30); },250); sfx('legend');
    const done=()=>{ if(b.querySelector('#tuHide')?.checked){ try{ localStorage.setItem('lannasnap-topup-hide',today()); }catch(e){} } };
    b.querySelector('#tuGo').onclick=()=>{ done(); closeModal(); show('scrShop'); };
    $('#modal').addEventListener('click',function once(e){ if(e.target.id==='modal'||e.target.closest('.mClose')){ done(); $('#modal').removeEventListener('click',once); } }); }); }
function confirmBuy(title,price,html,fn){ modal(`<div class="result"><h2 style="font-size:24px">${title}</h2>${html||''}<p>ราคา <b>${price}</b> เบี้ย · คงเหลือหลังซื้อ ${prof.bia-price}</p><div class="actions"><button class="btn ghost" id="noB" type="button">ไม่ซื้อ</button><button class="btn end" id="yesB" type="button">ซื้อเลย</button></div></div>`,b=>{ b.querySelector('#noB').onclick=closeModal; b.querySelector('#yesB').onclick=async()=>{ const before=prof.bia; prof.bia-=price; await fn(); await saveProfile(); renderShop(); FX.count($('.biaMirror'),before,prof.bia,700); }; }); }
function rollPack(){ const locked=PLAYABLE.filter(c=>!prof.owned[c.id]); const by=r=>locked.filter(c=>rarityOf(c)===r);
  const roll=Math.random()*100; let r=roll<RAR.dual.p?'dual':roll<RAR.dual.p+RAR.legend.p?'legend':'common';
  const order={common:['common','legend','dual'],legend:['legend','common','dual'],dual:['dual','legend','common']}[r];
  for(const k of order){ const p=by(k); if(p.length) return p[Math.floor(Math.random()*p.length)]; } const own=Object.keys(prof.owned).filter(id=>prof.owned[id].tier<6&&CARDS[id]); return CARDS[own[Math.floor(Math.random()*own.length)]||'rooster']; }
function reward(def,label){ const rr=rarityOf(def); sfx(rr==='common'?'pack':'legend'); label=rr==='dual'?'✦ ตำนานสองแผ่นดิน! ✦':rr==='legend'?'ตำนาน!':label; modal(`<div class="cardView"><p class="rlabel ${rr}">${label}</p>${cardHTML(def)}<h3>${esc(L(def.name))}</h3><div class="ab">${esc(L(def.text))}</div><button class="btn end" id="okR" type="button">เยี่ยม!</button></div>`,b=>{ const c=b.querySelector('.card'); c.classList.add('pop'); setTimeout(()=>{ if(rr==='dual'){ ['#ff6b6b','#ffd166','#9dffbf','#7fc4ff','#c792ff'].forEach((col,i)=>setTimeout(()=>FX.burst(c,col,26),i*140)); FX.shock('#ffd98a'); FX.confetti(70); } else if(rr==='legend'){ FX.burst(c,'#ffd98a',40); FX.shimmer(c,'#ffe7a3',26); } else { FX.burst(c,PROV[def.prov[0]].col,30); FX.shimmer(c,'#ffe7a3',14); } },200); b.querySelector('#okR').onclick=closeModal; }); }
$('#shopBody').addEventListener('click',async e=>{ const st=shopState();
  if(e.target.closest('#btnGift')){ if(st.gift) return; st.gift=true; const before=prof.bia; prof.bia+=50; await saveProfile(); renderShop(); sfx('coin'); setTimeout(()=>sfx('coin'),200); FX.coins($('#btnGift')||$('#shopBody'),$('.biaMirror'),10); FX.count($('.biaMirror'),before,prof.bia,900); return; }
  if(e.target.closest('#btnTopup')){ modal(`<div class="result"><h2 style="font-size:24px">เติมเงิน</h2><p>ระบบชำระเงินยังไม่เปิด<br><small class="muted">เปิดเมื่อเชื่อมช่องทางชำระเงินแล้ว เติมครั้งแรกจะได้พญามังราย (+2) ทันที</small></p><div class="actions"><button class="btn end" id="okT" type="button">รับทราบ</button></div></div>`,b=>{ b.querySelector('#okT').onclick=closeModal; }); return; }
  const by=e.target.closest('[data-buy]'); if(by&&!by.disabled){ const c=CARDS[by.dataset.buy]; const p=priceOf(c); if(prof.bia<p) return; confirmBuy(`ซื้อ ${esc(L(c.name))}?`,p,`<div class="cardView">${cardHTML(c)}</div>`,async()=>{ prof.owned[c.id]={tier:0,dup:0}; st.bought.push(c.id); reward(c,'ได้การ์ดใหม่!'); }); return; }
  if(e.target.closest('#btnPack')){ confirmBuy('ซองการ์ดสุ่ม?',PACK,'<p>เปิดได้การ์ดที่ยังไม่มี 1 ใบ<br><small class="muted">ทั่วไป 86% · ตำนาน 12% · สองแผ่นดิน 2% (การ์ดสองแผ่นดินหาได้จากซองนี้เท่านั้น)</small></p>',async()=>{ const c=rollPack(); if(prof.owned[c.id]){ prof.owned[c.id].dup=(prof.owned[c.id].dup||0)+2; reward(c,'มีครบแล้ว ได้อะไหล่ +2'); } else { prof.owned[c.id]={tier:0,dup:0}; reward(c,'เปิดซองได้…'); } }); return; }
  if(e.target.closest('#btnBag')){ if(st.bags>=3) return; confirmBuy('ซองอะไหล่?',BAG,'<p>ได้อะไหล่ 3 ใบ ของการ์ดสุ่มที่คุณมี</p>',async()=>{ st.bags++; const own=Object.keys(prof.owned).filter(id=>prof.owned[id].tier<6).sort(()=>Math.random()-.5).slice(0,3); for(const id of own) prof.owned[id].dup=(prof.owned[id].dup||0)+1; sfx('pack'); modal(`<div class="result"><h2 style="font-size:24px">ได้อะไหล่!</h2><div class="deckStrip">${own.map(id=>cardHTML(CARDS[id],{small:true,up:canUp(id)})).join('')}</div><p>${own.map(id=>esc(L(CARDS[id].name))).join(' · ')} +1</p><div class="actions"><button class="btn end" type="button" id="okB">ตกลง</button></div></div>`,b=>{ b.querySelectorAll('.card').forEach((c,i)=>setTimeout(()=>FX.burst(c,'#9dffbf',12),150+i*120)); b.querySelector('#okB').onclick=closeModal; }); }); return; }
  const of=e.target.closest('.offer .card'); if(of) cardView(of.dataset.id); });

/* ---------- auth ---------- */
function migrate(){ for(const id in prof.owned){ const o=prof.owned[id]; if(o.dup===undefined){ o.dup=Math.floor((o.boost||0)/5); delete o.boost; } } }
async function enter(){ migrate(); $('#scrLogin').hidden=true; if(prof.tut===undefined) prof.tut=(prof.wins+prof.losses)>0; if(prof.tutReward===undefined) prof.tutReward=prof.tut; show('scrHome'); if(!prof.tut) setTimeout(tutIntro,250); else setTimeout(topupPopup,700); setTimeout(()=>{ if(AUD.current) toast('♪ '+AUD.current.th,1800); },600); }
document.addEventListener('pointerdown',()=>{ try{ AUD.unlock(); }catch(e){} },{once:false,passive:true});
function soundBtns(){ const p=AUD.pref; $$('.btnMusic').forEach(b=>{ b.classList.toggle('off',!p.music); b.setAttribute('aria-pressed',p.music); }); $$('.btnSfx').forEach(b=>{ b.classList.toggle('off',!p.sfx); b.setAttribute('aria-pressed',p.sfx); }); }
document.addEventListener('click',e=>{ if(e.target.closest('.btnMusic')){ AUD.setMusic(!AUD.pref.music); soundBtns(); if(AUD.pref.music&&AUD.current) toast('♪ '+AUD.current.th); } else if(e.target.closest('.btnSfx')){ AUD.setSfx(!AUD.pref.sfx); soundBtns(); sfx('tap'); } else if(e.target.closest('.btnNext')){ const t=AUD.shuffle(); if(t){ toast('♪ '+t.th); showTrack(t); } } });
soundBtns();
$('#btnGuest').onclick=async()=>{ prof=loadLocal()||freshProfile(); await saveProfile(); enter(); };
$('#btnGoogle').onclick=async()=>{ if(!sb){ $('#loginMsg').textContent='เชื่อมต่อระบบล็อกอินไม่ได้ ลองเล่นแบบผู้เยี่ยมชมก่อน'; return; }
  try{ const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}}); if(error) $('#loginMsg').textContent='ล็อกอิน Google ยังไม่พร้อม: '+error.message; }catch(e){ $('#loginMsg').textContent='เปิดหน้าล็อกอินไม่ได้ในหน้านี้ ลองเปิดจากเว็บไซต์ของเกม'; } };
$('#btnLogout').onclick=async()=>{ if(sb&&user){ try{ await sb.auth.signOut(); }catch(e){} } user=null; $('#scrHome').hidden=true; $('#scrLogin').hidden=false; };
(async()=>{ if(sb){ try{ const {data}=await sb.auth.getSession(); if(data&&data.session){ user=data.session.user; const cloud=await loadCloud(); prof=cloud||loadLocal()||freshProfile(); prof.name=(user.user_metadata&&(user.user_metadata.full_name||user.user_metadata.name))||prof.name; await saveProfile(); enter(); return; } }catch(e){} }
  $('#scrLogin').hidden=false; })();
window.LS={startTutorial,tutReward,get S(){return S;},get prof(){return prof;},startMatch,newGame,aiPlan,revealTurn,startTurn,queuePlay,finish};
})();
