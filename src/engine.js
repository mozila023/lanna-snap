/* ===== Lanna Snap — rules engine (deterministic, seeded) ===== */
function RNG(seed){ let a=seed>>>0; const f=()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; f.int=n=>Math.floor(f()*n); f.pick=arr=>arr.length?arr[f.int(arr.length)]:null; f.shuffle=arr=>{ for(let i=arr.length-1;i>0;i--){ const j=f.int(i+1); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }; return f; }
const STATUS={sleep:t('หลับ','Asleep'),stun:t('มึนงง','Stunned'),confuse:t('สับสน','Confused'),shield:t('ป้องกัน','Shielded')};
function newGame(o){ // o:{seed, decks:[[ids],[ids]], names:[..]}
  const rng=RNG(o.seed||Date.now());
  let uid=0;
  const mk=(id,owner)=>({uid:++uid,def:CARDS[id],owner,perm:0,costMod:0,loc:-1,status:{},turnPlayed:0,seq:0});
  const players=[0,1].map(p=>({name:o.names?o.names[p]:'P'+p,deck:(o.noShuffle&&o.noShuffle[p]?(x=>x):rng.shuffle)(o.decks[p].map(id=>mk(id,p))),hand:[],played:[],energy:0,snapped:false,retreated:false}));
  const pool=o.locs?o.locs.map(id=>LOCMAP[id]):rng.shuffle(LOCS.slice()); const locs=[0,1,2].map(i=>({def:pool[i],revealed:false,cards:[[],[]],lastPlayed:[null,null]}));
  const S={rng,players,locs,turn:0,maxTurn:6,temple:null,log:[],cubes:1,seqN:0,over:false,winner:null,mkCard:mk,nextBonus:[[0,0,0],[0,0,0]],destroyed:[]};
  for(const P of players) for(let i=0;i<3;i++) drawCard(S,P);
  return S; }
function drawCard(S,P){ if(P.hand.length>=7||!P.deck.length) return null; const c=P.deck.shift(); P.hand.push(c); return c; }
function allBoard(S){ const out=[]; for(const l of S.locs) for(const side of l.cards) out.push(...side); return out; }
function cardCost(S,c){ return Math.max(0,c.def.cost+(c.costMod||0)); }
function statusActive(S,c,s){ const v=c.status[s]; if(!v) return false; if(c.loc>=0&&S.locs[c.loc].def.calm&&s!=='shield') return false; return v===true||v>=S.turn; }
function cardPower(S,c){
  if(c.loc<0) return c.def.power+c.perm;
  let p=c.def.power+c.perm;
  for(const s of allBoard(S)) if(s.def.aura) p+=s.def.aura(API(S),s,c)||0;
  const L=S.locs[c.loc]; if(L.revealed&&L.def.aura) p+=L.def.aura(API(S),L,c)||0;
  if(L.revealed&&c.def.prov.includes(L.def.prov)) p+=1; // home ground
  if(S.temple&&c.def.prov.includes(S.temple.def.temple)) p+=2;
  if(statusActive(S,c,'stun')) p-=2;
  if((c.def.steady||(L.revealed&&L.def.wall))&&p<c.def.power) p=c.def.power;
  if(statusActive(S,c,'sleep')) return 0;
  return p; }
function locPower(S,li,side){ return S.locs[li].cards[side].reduce((a,c)=>a+cardPower(S,c),0); }
function locWinner(S,li){ const a=locPower(S,li,0), b=locPower(S,li,1); return a>b?0:b>a?1:-1; }
function capOf(S,li){ const d=S.locs[li].def; if(S.locs[li].revealed&&d.cap) return d.cap; return 4; }
function canPlay(S,p,c,li){
  if(c.def.type==='temple') return li==='temple'&&cardCost(S,c)<=S.players[p].energy;
  if(li==='temple'||li<0||li>2) return false;
  const L=S.locs[li]; if(L.revealed&&L.def.closeAfter&&S.turn>L.def.closeAfter) return false;
  const pend=S.players[p].played.filter(x=>x.li===li).length;
  return cardCost(S,c)<=S.players[p].energy&&L.cards[p].length+pend<capOf(S,li); }
/* ---------- the API cards & locations use ---------- */
function API(S,actor){ const E={
  get turn(){ return S.turn; },
  rng:S.rng,
  hand:p=>S.players[p].hand,
  cost:c=>cardCost(S,c),
  templeProv:()=>S.temple?S.temple.def.temple:null,
  templeId:()=>S.temple?S.temple.def.id:null,
  allies:(c,o={})=>allBoard(S).filter(x=>x.owner===c.owner&&(!o.here||x.loc===c.loc)&&(!o.other||x!==c)),
  enemies:(c,o={})=>allBoard(S).filter(x=>x.owner!==c.owner&&(!o.here||x.loc===c.loc)),
  pickAlly:(c,o={})=>{ let a=allBoard(S).filter(x=>x.owner===c.owner&&x!==c&&(!o.here||x.loc===c.loc)&&(!o.elsewhere||x.loc!==c.loc)&&(!o.pred||o.pred(x))); if(o.other===false) a.push(c); a.sort((x,y)=>cardPower(S,y)-cardPower(S,x)||x.uid-y.uid); return a[0]||null; },
  pickEnemy:(c,o={})=>{ const a=allBoard(S).filter(x=>x.owner!==c.owner&&(!o.here||x.loc===c.loc)&&!x.def.hidden); return S.rng.pick(a.sort((x,y)=>x.uid-y.uid)); },
  strongestEnemy:c=>{ const a=allBoard(S).filter(x=>x.owner!==c.owner&&x.loc===c.loc&&!x.def.hidden).sort((x,y)=>cardPower(S,y)-cardPower(S,x)||x.uid-y.uid); return a[0]||null; },
  buff:(x,n)=>{ if(!x) return; if(n<0&&(statusActive(S,x,'shield')||x.def.steady||(x.loc>=0&&S.locs[x.loc].def.wall&&S.locs[x.loc].revealed))) { S.log.push({k:'block',uid:x.uid}); return; } x.perm+=n; S.log.push({k:'buff',uid:x.uid,n}); },
  shield:x=>{ if(!x) return; x.status.shield=true; S.log.push({k:'status',uid:x.uid,s:'shield'}); },
  status:(x,s)=>{ if(!x) return; if(statusActive(S,x,'shield')){ S.log.push({k:'block',uid:x.uid}); return; } x.status[s]=s==='confuse'?S.turn:S.turn+1; S.log.push({k:'status',uid:x.uid,s}); },
  cleanse:x=>{ if(!x) return false; const had=['sleep','stun','confuse'].some(s=>statusActive(S,x,s)); delete x.status.sleep; delete x.status.stun; delete x.status.confuse; return had; },
  remove:x=>{ const L=S.locs[x.loc]; if(!L) return; const i=L.cards[x.owner].indexOf(x); if(i>=0) L.cards[x.owner].splice(i,1); x.loc=-1; S.destroyed.push(x); S.log.push({k:'vanish',uid:x.uid}); },
  move:(x,li)=>moveCard(S,x,li),
  moveAnywhere:x=>{ const opts=[0,1,2].filter(i=>i!==x.loc&&S.locs[i].cards[x.owner].length<capOf(S,i)); if(opts.length){ const w=opts.sort((a,b)=>(locWinner(S,a)===x.owner)-(locWinner(S,b)===x.owner))[0]; moveCard(S,x,w); } },
  moveToLosing:x=>{ const opts=[0,1,2].filter(i=>i!==x.loc&&locWinner(S,i)===1-x.owner&&S.locs[i].cards[x.owner].length<capOf(S,i)); if(opts.length) moveCard(S,x,opts[0]); },
  draw:(p,n)=>{ for(let i=0;i<n;i++) drawCard(S,S.players[p]); },
  drawWhere:(p,pred)=>{ const P=S.players[p]; const i=P.deck.findIndex(pred); if(i>=0&&P.hand.length<7){ P.hand.push(P.deck.splice(i,1)[0]); } },
  addToHand:(p,id)=>{ const P=S.players[p]; if(P.hand.length<7) P.hand.push(S.mkCard(id,p)); },
  nextHere:(c,n)=>{ S.nextBonus[c.owner][c.loc]+=n; },
}; return E; }
function moveCard(S,x,li){ if(x.def.steady||li===x.loc||li<0) return false; const L=S.locs[x.loc]; if(S.locs[li].cards[x.owner].length>=capOf(S,li)) return false; const i=L.cards[x.owner].indexOf(x); if(i>=0) L.cards[x.owner].splice(i,1); x.loc=li; S.locs[li].cards[x.owner].push(x); S.log.push({k:'move',uid:x.uid,to:li}); return true; }
/* ---------- turn flow ---------- */
function startTurn(S){ S.turn++; S.log=[]; for(const P of S.players){ P.energy=S.turn; P.played=[]; drawCard(S,P); } if(S.turn<=3){ S.locs[S.turn-1].revealed=true; S.log.push({k:'locreveal',li:S.turn-1}); } if(S.turn===S.maxTurn) S.cubes=Math.min(8,S.cubes*2); }
function queuePlay(S,p,c,li){ if(!canPlay(S,p,c,li)) return false; const P=S.players[p]; P.energy-=cardCost(S,c); P.hand.splice(P.hand.indexOf(c),1); P.played.push({c,li}); return true; }
function unqueue(S,p,idx){ const P=S.players[p]; const it=P.played.splice(idx,1)[0]; if(!it) return; P.energy+=cardCost(S,it.c); P.hand.push(it.c); }
function firstPlayer(S){ let w=[0,0]; for(let i=0;i<3;i++){ const r=locWinner(S,i); if(r>=0) w[r]++; } if(w[0]!==w[1]) return w[0]>w[1]?0:1; let d=0; for(let i=0;i<3;i++) d+=locPower(S,i,0)-locPower(S,i,1); return d>0?0:d<0?1:(S.turn%2); }
function revealTurn(S){ // resolve both players' queued plays; returns ordered events for animation
  const ev=[]; const fp=firstPlayer(S); const order=[fp,1-fp];
  for(const p of order){ for(const {c,li} of S.players[p].played){
    if(c.def.type==='temple'){ const prev=S.temple; S.temple=c; c.loc=-2; c.turnPlayed=S.turn; ev.push({k:'temple',uid:c.uid,owner:p,prev:prev&&prev.uid}); continue; }
    if(!canPlace(S,p,li)){ S.players[p].hand.length<7?S.players[p].hand.push(c):0; ev.push({k:'bounce',uid:c.uid}); continue; }
    c.loc=li; c.turnPlayed=S.turn; c.seq=++S.seqN; S.locs[li].cards[p].push(c); S.locs[li].lastPlayed[p]=c;
    const E=API(S); S.log=[];
    if(S.nextBonus[p][li]){ E.buff(c,S.nextBonus[p][li]); S.nextBonus[p][li]=0; }
    const L=S.locs[li]; if(L.revealed&&L.def.onPlay) L.def.onPlay(E,L,c);
    if(c.def.reveal){ c.def.reveal(E,c); if(L.revealed&&L.def.doubleFood&&c.def.type==='food'&&S.turn>=5&&c.loc>=0) c.def.reveal(E,c); }
    ev.push({k:'reveal',uid:c.uid,owner:p,li,log:S.log.slice()});
  } S.players[p].played=[]; }
  endTurn(S,ev); return ev; }
function canPlace(S,p,li){ const L=S.locs[li]; return L.cards[p].length<capOf(S,li); }
function endTurn(S,ev){ const E=API(S); S.log=[];
  for(const c of allBoard(S).sort((a,b)=>a.seq-b.seq)) if(c.def.endTurn) c.def.endTurn(E,c);
  for(let li=0;li<3;li++){ const L=S.locs[li]; if(!L.revealed) continue;
    if(L.def.haunt){ const all=[...L.cards[0],...L.cards[1]]; const v=S.rng.pick(all); if(v) E.status(v,'confuse'); }
    if(L.def.tunnel){ for(const p of [0,1]){ const c=L.lastPlayed[p]; if(c&&c.loc===li&&c.turnPlayed===S.turn) moveCard(S,c,(li+1)%3); } } }
  for(const c of allBoard(S)) if(c.status.confuse&&c.status.confuse>=S.turn&&!(c.loc>=0&&S.locs[c.loc].def.calm)){ const opts=[0,1,2].filter(i=>i!==c.loc&&S.locs[i].cards[c.owner].length<capOf(S,i)); delete c.status.confuse; if(opts.length) moveCard(S,c,S.rng.pick(opts)); }
  ev.push({k:'endturn',log:S.log.slice()});
  if(S.turn>=S.maxTurn) finish(S); }
function finish(S){ S.over=true; let w=[0,0]; for(let i=0;i<3;i++){ const r=locWinner(S,i); if(r>=0) w[r]++; } if(w[0]===w[1]){ let d=0; for(let i=0;i<3;i++) d+=locPower(S,i,0)-locPower(S,i,1); S.winner=d>0?0:d<0?1:-1; } else S.winner=w[0]>w[1]?0:1; }
function snap(S,p){ const P=S.players[p]; if(P.snapped||S.over) return false; P.snapped=true; S.pendingSnap=true; return true; }
function applySnapsAtTurnStart(S){ if(S.pendingSnap){ S.cubes=Math.min(8,S.cubes*2); S.pendingSnap=false; } }
function retreat(S,p){ S.over=true; S.winner=1-p; S.retreated=p; }
/* ---------- AI ---------- */
function aiPlan(S,p,level=1){
  const P=S.players[p]; const plan=[];
  const hand=P.hand.slice().sort((a,b)=>cardCost(S,b)-cardCost(S,a)||b.def.power-a.def.power);
  let energy=P.energy;
  const tryTemple=hand.find(c=>c.def.type==='temple'&&cardCost(S,c)<=energy&&(S.turn>=4)&&(!S.temple||S.temple.def.temple!==c.def.temple)&&allBoard(S).filter(x=>x.owner===p&&x.def.prov.includes(c.def.temple)).length>=2);
  if(tryTemple){ plan.push({c:tryTemple,li:'temple'}); energy-=cardCost(S,tryTemple); }
  const counts=[0,1,2].map(i=>S.locs[i].cards[p].length);
  for(const c of hand){ if(c.def.type==='temple'||plan.some(x=>x.c===c)) continue; if(cardCost(S,c)>energy) continue;
    if((c.def.type==='item'||c.def.type==='food')&&!allBoard(S).some(x=>x.owner===p)&&S.turn<6) continue;
    let best=null,bs=-1e9;
    for(let li=0;li<3;li++){ const L=S.locs[li]; if(counts[li]>=capOf(S,li)) continue; if(L.revealed&&L.def.closeAfter&&S.turn>L.def.closeAfter) continue;
      const diff=locPower(S,li,p)-locPower(S,li,1-p); let sc=0;
      sc+= diff<0? 6-Math.min(6,-diff)*.3 : diff>8? -4 : 3-diff*.2;
      if(L.revealed&&c.def.prov.includes(L.def.prov)) sc+=2;
      if((c.def.type==='item'||c.def.type==='food')&&!L.cards[p].length) sc-=8;
      if(!L.revealed) sc-=1;
      sc+=S.rng()*(level>1?1:3);
      if(sc>bs){ bs=sc; best=li; } }
    if(best!=null){ plan.push({c,li:best}); energy-=cardCost(S,c); counts[best]++; } }
  return plan; }
function aiShouldSnap(S,p){ if(S.players[p].snapped||S.turn<3) return false; let w=0; for(let i=0;i<3;i++) if(locWinner(S,i)===p) w++; let d=0; for(let i=0;i<3;i++) d+=locPower(S,i,p)-locPower(S,i,1-p); return w>=2&&d>8; }
function aiShouldRetreat(S,p){ if(S.turn<5) return false; let l=0; for(let i=0;i<3;i++) if(locWinner(S,i)===1-p) l++; let d=0; for(let i=0;i<3;i++) d+=locPower(S,i,p)-locPower(S,i,1-p); return l>=2&&d<-14&&S.cubes>=4; }
