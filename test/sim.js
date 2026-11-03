const fs=require('fs'), vm=require('vm');
const ctx={console,Math,Date}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('../src/cards.js','utf8')+'\n'+fs.readFileSync('../src/engine.js','utf8')+'\nthis.API_={C,CARDS,LOCS,newGame,startTurn,aiPlan,queuePlay,revealTurn,locWinner,cardPower,allBoard,applySnapsAtTurnStart};',ctx);
const A=ctx.API_; const PLAY=A.C.filter(c=>!c.token);
const rnd=n=>Math.floor(Math.random()*n);
function deck(){ const want=[1,1,2,2,2,3,3,4,4,5,5,6]; const out=[]; for(const w of want){ const c=PLAY.filter(x=>x.cost===w&&!out.includes(x.id)); const pick=c.length?c[rnd(c.length)]:PLAY.filter(x=>!out.includes(x.id))[0]; out.push(pick.id);} return out; }
const stats={}; let errs=0, games=0, draws=0; const winsByCard={}, useByCard={};
for(let g=0;g<3000;g++){ const decks=[deck(),deck()]; let S;
  try{ S=A.newGame({seed:g*7919+1,decks});
    while(!S.over){ A.applySnapsAtTurnStart(S); A.startTurn(S); for(const p of [0,1]) for(const {c,li} of A.aiPlan(S,p,1)) A.queuePlay(S,p,c,li); A.revealTurn(S); }
    games++; if(S.winner===-1) draws++;
    for(const p of [0,1]){ const used=new Set(A.allBoard(S).filter(c=>c.owner===p).map(c=>c.def.id)); for(const id of used){ useByCard[id]=(useByCard[id]||0)+1; if(S.winner===p) winsByCard[id]=(winsByCard[id]||0)+1; } }
  }catch(e){ errs++; if(errs<5) console.log('ERR',e.stack.split('\n').slice(0,3).join(' | ')); } }
console.log({games,errs,draws});
const rows=Object.keys(useByCard).map(id=>[id,useByCard[id],((winsByCard[id]||0)/useByCard[id]*100).toFixed(1)]).sort((a,b)=>b[2]-a[2]);
console.log('TOP',rows.slice(0,8).map(r=>r.join(':')).join('  '));
console.log('BOTTOM',rows.slice(-8).map(r=>r.join(':')).join('  '));
console.log('UNUSED',PLAY.filter(c=>!useByCard[c.id]).map(c=>c.id).join(','));
