// Two independent clients simulate the same match; each only knows its own plays and receives the other's (uid, li) list.
global.window={}; const vm=require('vm'), fs=require('fs');
vm.runInThisContext(fs.readFileSync('../src/cards.js','utf8')); vm.runInThisContext(fs.readFileSync('../src/engine.js','utf8'));
const ids=C.filter(c=>!c.token).map(c=>c.id);
function rnd(n){ return Math.floor(Math.random()*n); }
function deck(){ const d=[]; while(d.length<12){ const id=ids[rnd(ids.length)]; if(!d.includes(id)) d.push(id); } return d; }
function snapState(S){ return JSON.stringify({t:S.turn,c:S.cubes,ps:S.pendingSnap,tm:S.temple&&S.temple.uid,over:S.over,w:S.winner,locs:S.locs.map(l=>l.cards.map(side=>side.map(c=>[c.uid,c.perm,c.costMod,Object.keys(c.status).sort().join()]))),hands:S.players.map(P=>P.hand.map(c=>c.uid)),decks:S.players.map(P=>P.deck.map(c=>c.uid))}); }
let bad=0, games=500, turns=0;
for(let g=0;g<games;g++){ const seed=(Math.random()*2**31)|0; const decks=[deck(),deck()]; const lk=[[decks[0][0]],[]];
  const mk=()=>{ const S=newGame({seed,decks:decks.map(d=>d.slice())}); for(const p of [0,1]) for(const c of [...S.players[p].deck,...S.players[p].hand]) if(lk[p].includes(c.def.id)) c.perm+=2; return S; };
  const A=mk(), B=mk(); const cl=[A,B]; // client k sees itself as seat k
  for(let t=0;t<6&&!A.over;t++){
    for(const S of cl){ applySnapsAtTurnStart(S); startTurn(S); }
    const msgs=[];
    for(const k of [0,1]){ const S=cl[k]; const P=S.players[k]; const handOrder=P.hand.map(c=>c.uid);
      // messy local play: queue, unqueue, requeue in random order
      const real=S.rng; S.rng=RNG((Math.random()*2**31)|0); const plan=aiPlan(S,k,Math.random()<.5?1:2); S.rng=real; for(const {c,li} of plan) queuePlay(S,k,c,li);
      if(P.played.length>1&&Math.random()<.6){ unqueue(S,k,0); const c=P.hand[P.hand.length-1]; for(const li of [2,1,0]) if(queuePlay(S,k,c,li)) break; }
      if(Math.random()<.15) snap(S,k);
      // canonicalize exactly like netEndTurn
      const plays=P.played.map(p=>[p.c.uid,p.li]); for(let i=P.played.length-1;i>=0;i--) unqueue(S,k,i);
      const by=new Map(P.hand.map(c=>[c.uid,c])); P.hand=handOrder.map(u=>by.get(u)).filter(Boolean).concat(P.hand.filter(c=>!handOrder.includes(c.uid)));
      for(const [u,li] of plays){ const c=P.hand.find(x=>x.uid===u); if(c) queuePlay(S,k,c,li); }
      msgs[k]={plays,snap:!!P.snapped}; }
    for(const k of [0,1]){ const S=cl[k], o=1-k, O=S.players[o];
      for(const [u,li] of msgs[o].plays){ const c=O.hand.find(x=>x.uid===u); if(!c||!queuePlay(S,o,c,li)){ bad++; } }
      if(msgs[o].snap&&!O.snapped) snap(S,o); revealTurn(S); }
    turns++;
    if(snapState(A)!==snapState(B)){ bad++; console.log('DESYNC game',g,'turn',A.turn); break; } }
  for(const S of cl) if(!S.over) finish(S);
  if(A.winner!==B.winner) { bad++; console.log('winner mismatch',g); } }
console.log(`games ${games}, turns ${turns}, desyncs ${bad}`);
