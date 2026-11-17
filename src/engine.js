/* ===== COURT SHIFT DUEL ENGINE (no DOM) ===== */
const LANES=3,TURNS=6,LUNCH_AFTER=3,MAXLANE=4,FUP=3;
const RK=()=>Math.random();
/* defense tactics: [id,type,nameSV,nameEN,textSV,textEN,cost,pow,kw,lane] */
const DEF_CARDS=[
 ["kors","TRO","Korsförhör","Cross-examination","Pressa vittnet på detaljerna.","Press the witness on the details.",1,1,"strikeVIT",-1],
 ["minne","TRO","Ifrågasätt minnet","Question the memory","Ljus, avstånd, tid. Hur säker är vittnet?","Light, distance, time. How sure is the witness?",2,2,"debuffVIT",-1],
 ["motiv","TRO","Vittnets motiv","The witness's motive","Har vittnet något att vinna?","Does the witness gain anything?",3,3,"strikeVIT",-1],
 ["analys","MET","Bristande analys","Missing analysis","Ingen expert har undersökt spåret.","No expert examined the trace.",2,1,"strikeTEK",-1],
 ["metod","MET","Osäker metod","Unreliable method","Metoden kan inte peka ut en enda person.","The method can't point to one person.",1,1,"debuffTEK",-1],
 ["kontam","MET","Kontaminerat spår","Contaminated trace","Spåret kan ha förorenats.","The trace may be contaminated.",3,2,"strikeTEK",-1],
 ["annan","ALT","Annan förklaring","Another explanation","Det finns ett oskyldigt sätt att förklara detta.","There is an innocent explanation.",1,1,"strikeOMS",-1],
 ["forlopp","ALT","Alternativt förlopp","Alternative course","Det kan ha gått till helt annorlunda.","It may have happened differently.",2,4,"plain",-1],
 ["vanligt","ALT","Vanligt beteende","Ordinary behaviour","Det här gör vanliga människor varje dag.","Ordinary people do this every day.",2,2,"debuffOMS",-1],
 ["tvivel","GEN","Rimligt tvivel","Reasonable doubt","Hellre fria än fälla.","When in doubt, acquit.",3,5,"plain",-1],
 ["alibi","GEN","Alibi","Alibi","Hon var någon annanstans. Bara på Personen.","She was somewhere else. Person lane only.",4,6,"plain",1]];
const PROS_EXTRA=[
 ["sakk","GEN","Sakkunnig","Expert witness","Experten styrker din tekniska bevisning: +2 på dina tekniska kort här.","The expert backs your technical evidence: +2 to your technical cards here.",2,1,"boostTEK",-1],
 ["helhet","GEN","Helhetsbedömning","Overall assessment","Bevisen stärker varandra: +1 på alla dina kort här.","The evidence supports itself: +1 to all your cards here.",3,2,"boostAll",-1]];
const SPECIAL=[["obj","SP","Invändning!","Objection!","Spelas direkt efter att korten vänts: stryk ett nytt kort hos motparten.","Played right after the reveal: strike one of the other side's new cards.",0,0,"obj",-1],
 ["obj","SP","Invändning!","Objection!","Spelas direkt efter att korten vänts: stryk ett nytt kort hos motparten.","Played right after the reveal: strike one of the other side's new cards.",0,0,"obj",-1],
 ["ovr","SP","Genmäle!","Rebuttal!","När motparten invänder: bemöt, så lämnas invändningen utan avseende.","When the other side objects: rebut it, and the objection is overruled.",0,0,"ovr",-1]];
const ARTH={P:["arthur","VIT","Arthur C. Bara","Arthur C. Bara","Mästerdetektiven vittnar. Han såg allt (nästan).","The master detective testifies. He saw everything (almost).",3,4,"arthurP",-1],
 D:["arthur","GEN","Arthur C. Bara","Arthur C. Bara","Mästerdetektiven har hittat en lucka i utredningen.","The master detective found a gap in the investigation.",3,3,"arthurD",-1]};
const FLIP=["vand","GEN","Vänd på steken","Turn the tables","Motpartens starkaste kort på banan byter sida.","The other side's strongest card in the lane switches sides.",3,0,"vand",-1];
const KW={strikeVIT:["Fäller det starkaste vittnet här.","Strikes the strongest witness here."],strikeTEK:["Fäller det starkaste tekniska beviset här.","Strikes the strongest technical evidence here."],strikeOMS:["Fäller den starkaste omständigheten här.","Strikes the strongest circumstance here."],
 debuffVIT:["Alla vittnen här −2.","All witnesses here −2."],debuffTEK:["Alla tekniska bevis här −2.","All technical evidence here −2."],debuffOMS:["Alla omständigheter här −2.","All circumstances here −2."],
 osaker:["Osäker: styrkan avgörs när vittnet hörs (±2).","Uncertain: strength is decided when heard (±2)."],kedja:["Kedja: +2 om du redan har ett kort här.","Chain: +2 if you already have a card here."],tung:["Tung: fälls bara av metodkritik.","Heavy: only method critique breaks it."],
 boostTEK:["+2 på dina tekniska kort här.","+2 to your technical cards here."],boostAll:["+1 på alla dina kort här.","+1 to all your cards here."],plain:["",""],obj:["⚡ Efter avslöjandet: stryk ett nytt kort hos motparten.","⚡ After the reveal: strike one of the other side's new cards."],ovr:["⚡ Stoppar motpartens invändning.","⚡ Stops the other side's objection."],arthurP:["Detektiv: kan inte fällas av Trovärdighet.","Detective: can't be broken by Credibility."],arthurD:["Detektiv: fäller det starkaste kortet här, vilken typ som helst.","Detective: strikes the strongest card here, any type."],vand:["Motpartens starkaste kort här byter sida!","The other side's strongest card here switches sides!"]};
const EVENTS2=[["coffee",["☕ Kaffe på aktbilagan","☕ Coffee on the exhibit"],["Tekniska bevis som spelas här denna runda −2.","Technical evidence played here this round −2."]],
 ["sleep",["😴 Nämndemannen somnar","😴 A lay judge dozes off"],["Vittnen som spelas här denna runda −2.","Witnesses played here this round −2."]],
 ["paper",["📚 Ordföranden älskar papper","📚 The judge loves paperwork"],["Omständigheter som spelas här denna runda +2.","Circumstances played here this round +2."]],
 ["closed",["🚫 Bänken är upptagen","🚫 The bench is busy"],["Inga kort får spelas här denna runda.","No cards may be played here this round."]],
 ["spot",["🔦 Rätten lyssnar extra noga","🔦 The court listens closely"],["Alla kort som spelas här denna runda +1.","All cards played here this round +1."]]];
let UID=1;
function mkEvCard(r,n,cid){const v=r[6],ty=r[1];let pow=Math.round(v/2.9),cost=ty==="TEK"?(pow>=5?3:2):ty==="VIT"?2:(pow>=5?2:1);
 return {uid:UID++,side:"P",id:cid+"_"+n,n,ty,icon:r[0],name:[r[2],r[3]],text:[r[4],r[5]],rebut:[r[7],r[8]],cost,pow,kw:ty==="VIT"?"osaker":ty==="OMS"?"kedja":"tung",lane:r[9],face:r.length>10?r[10]:-1}}
function mkGen(r,side){return {uid:UID++,side,id:r[0],ty:r[1],name:[r[2],r[3]],text:[r[4],r[5]],cost:r[6],pow:r[7],kw:r[8],lane:r[9],icon:""}}
function shuf(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=RK()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function newGame(cs,mode){
 const P=shuf([...cs.ev.map((r,n)=>mkEvCard(r,n,cs.id)),...PROS_EXTRA.map(r=>mkGen(r,"P")),...SPECIAL.slice(1).map(r=>mkGen(r,"P"))]);
 const defs=DEF_CARDS.map(r=>r[0]==="vanligt"&&cs.xtac?["vanligt","ALT",cs.xtac[1],cs.xtac[2],cs.xtac[3],cs.xtac[4],2,2,"debuffOMS",-1]:r);
 const D=shuf([...defs.map(r=>mkGen(r,"D")),...SPECIAL.slice(1).map(r=>mkGen(r,"D"))]);
 const g={cs,mode,turn:1,lanes:[0,1,2].map(()=>({P:[],D:[],ev:null})),hand:{P:P.splice(0,4),D:D.splice(0,4)},deck:{P,D},pend:{P:[],D:[]},
  seat:{A:"P",B:"D"},swap:false,log:[],stats:{A:{strikes:0,obj:0,played:0},B:{strikes:0,obj:0,played:0}},close:{P:-1,D:-1},over:false};
 ["P","D"].forEach(sd=>{const h=g.hand[sd],d=g.deck[sd];
  for(let i=h.length-1;i>=0;i--)if(isReact(h[i])){const j=d.findIndex(c=>!isReact(c));const t=h[i];h[i]=d[j];d[j]=t}
  [1,2].forEach(cost=>{if(!h.some(c=>c.cost===cost)){const j=d.findIndex(c=>c.cost===cost&&!isReact(c));if(j>=0){const k=h.findIndex(c=>c.cost>=3)>=0?h.findIndex(c=>c.cost>=3):h.length-1;const t=h[k];h[k]=d[j];d[j]=t}}});
  /* one objection guaranteed in hand; the flip card arrives in round 2 or 3 */
  h.push(mkGen(SPECIAL[0],sd));d.splice(RK()<.5?0:1,0,mkGen(FLIP,sd));
  const o=d.findIndex(c=>c.kw==="ovr");if(o>=0)d.splice(2+(RK()*3|0),0,d.splice(o,1)[0]);
  d.splice(1+(RK()*3|0),0,mkGen(ARTH[sd],sd))});
 rollEvent(g);return g}
function rollEvent(g){g.lanes.forEach(l=>l.ev=null);if(g.turn>1&&RK()<.75){const e=EVENTS2[RK()*EVENTS2.length|0];g.lanes[RK()*3|0].ev=e[0]}}
const isReact=c=>c.kw==="obj"||c.kw==="ovr";
const energy=g=>Math.min(g.turn,6);
const spent=(g,s)=>g.pend[s].reduce((a,p)=>a+p.c.cost,0);
const laneCount=(g,s,l)=>g.lanes[l][s].length+g.pend[s].filter(p=>p.l===l).length;
function canPlace(g,s,c,l){if(isReact(c))return false;if(c.lane>=0&&c.lane!==l)return false;if(g.lanes[l].ev==="closed")return false;if(laneCount(g,s,l)>=MAXLANE)return false;return spent(g,s)+c.cost<=energy(g)}
function place(g,s,i,l,q){const c=g.hand[s][i];if(!c||!canPlace(g,s,c,l))return false;g.hand[s].splice(i,1);g.pend[s].push({c,l,q:q===undefined?1:q});return true}
function unplace(g,s,k){const p=g.pend[s].splice(k,1)[0];if(p)g.hand[s].push(p.c)}
function power(g,s,l){return g.lanes[l][s].filter(x=>!x.struck).reduce((a,x)=>a+x.pow,0)+(s==="P"?FUP:0)}
function laneWinner(g,l){return power(g,"P",l)>power(g,"D",l)?"P":"D"}
const opp=s=>s==="P"?"D":"P";
const seatOf=(g,s)=>g.seat.A===s?"A":"B";
/* resolve both sides' pending plays simultaneously; returns list of log events */
function reveal(g){const ev=[],L=g.lanes,T=g.turn;
 /* Arthur can only testify for one side. If both call him in the same round, the prosecution's summons stands (it presents evidence first). */
 const isA=p=>p.c.id==="arthur";
 if(g.pend.P.some(isA)&&g.pend.D.some(isA)){g.pend.D=g.pend.D.filter(p=>!isA(p));ev.push({t:"arthurClash",s:"P"})}
 /* objections first */
 const prot={P:new Set(),D:new Set()};
 ["P","D"].forEach(s=>g.pend[s].forEach(p=>{if(p.c.kw==="ovr")prot[s].add(p.l)}));
 const cancelled=new Set();
 ["P","D"].forEach(s=>g.pend[s].forEach(p=>{if(p.c.kw!=="obj")return;const o=opp(s);let n=0;
  g.pend[o].forEach(q=>{if(q.l===p.l&&q.c.kw!=="obj"&&!prot[o].has(p.l)&&!cancelled.has(q.c.uid)){cancelled.add(q.c.uid);n++}});
  if(n){g.stats[seatOf(g,s)].obj++;ev.push({t:"obj",s,l:p.l,n})}else ev.push({t:"objmiss",s,l:p.l,blocked:prot[o].has(p.l)})}));
 /* place cards */
 ["P","D"].forEach(s=>g.pend[s].forEach(p=>{const c=p.c;g.stats[seatOf(g,s)].played++;
  if(c.kw==="obj")return;
  if(cancelled.has(c.uid)){ev.push({t:"struckObj",s,l:p.l,c});return}
  let pow=c.pow;const e=L[p.l].ev;
  if(c.kw==="osaker")pow+=Math.round(RK()*4-2);
  if(c.kw==="kedja"&&L[p.l][s].some(x=>!x.struck))pow+=2;
  if(e==="coffee"&&c.ty==="TEK")pow-=2;if(e==="sleep"&&c.ty==="VIT")pow-=2;if(e==="paper"&&c.ty==="OMS")pow+=2;if(e==="spot")pow+=1;
  if(p.q===0)pow=Math.round(pow/2);
  pow=Math.max(0,pow);const item={c,pow,base:pow,struck:false,turn:T,s};L[p.l][s].push(item);ev.push({t:"play",s,l:p.l,c,pow})}));
 /* on-reveal effects: prosecution boosts first, then defense attacks */
 ["P","D"].forEach(s=>g.pend[s].forEach(p=>{const c=p.c;if(cancelled.has(c.uid))return;const lane=L[p.l],mine=lane[s].filter(x=>!x.struck),theirs=lane[opp(s)].filter(x=>!x.struck);
  if(p.q===0&&/^(boost|strike|debuff)/.test(c.kw)){ev.push({t:"fail",s,l:p.l,c});return}
  if(c.kw==="boostTEK"){mine.filter(x=>x.c.ty==="TEK").forEach(x=>x.pow+=2);ev.push({t:"boost",s,l:p.l,c})}
  if(c.kw==="boostAll"){mine.filter(x=>x.c!==c).forEach(x=>x.pow+=1);ev.push({t:"boost",s,l:p.l,c})}
  if(c.kw==="arthurD"){if(p.q===0){ev.push({t:"fail",s,l:p.l,c});return}const x=theirs.sort((a,b)=>b.pow-a.pow)[0];if(!x){ev.push({t:"whiff",s,l:p.l,c});return}x.struck=true;g.stats[seatOf(g,s)].strikes++;ev.push({t:"strike",s,l:p.l,c,x});return}
  const m=/^(strike|debuff)(VIT|TEK|OMS)$/.exec(c.kw);
  if(m){const ty=m[2],tg=theirs.filter(x=>x.c.ty===ty&&!(ty==="VIT"&&x.c.kw==="arthurP"));
   if(!tg.length){ev.push({t:"whiff",s,l:p.l,c,ty});return}
   if(m[1]==="strike"){const x=tg.sort((a,b)=>b.pow-a.pow)[0];x.struck=true;g.stats[seatOf(g,s)].strikes++;ev.push({t:"strike",s,l:p.l,c,x})}
   else{tg.forEach(x=>x.pow=Math.max(0,x.pow-2));g.stats[seatOf(g,s)].strikes++;ev.push({t:"debuff",s,l:p.l,c,n:tg.length})}}}));
 ["P","D"].forEach(s=>{if(!g.arthur&&g.pend[s].some(p=>p.c.id==="arthur"&&!cancelled.has(p.c.uid))){g.arthur=s;const o=opp(s);
  const had=g.hand[o].some(c=>c.id==="arthur");g.hand[o]=g.hand[o].filter(c=>c.id!=="arthur");g.deck[o]=g.deck[o].filter(c=>c.id!=="arthur");ev.push({t:"arthurGone",s,had})}});
 /* flips last */
 ["P","D"].forEach(s=>g.pend[s].forEach(p=>{const c=p.c;if(c.kw!=="vand"||cancelled.has(c.uid))return;if(p.q===0){ev.push({t:"fail",s,l:p.l,c});return}
  const lane=L[p.l],o=opp(s),tg=lane[o].filter(x=>!x.struck).sort((a,b)=>b.pow-a.pow)[0];
  if(!tg){ev.push({t:"whiff",s,l:p.l,c});return}
  lane[o].splice(lane[o].indexOf(tg),1);tg.s=s;tg.flip=true;tg.turn=T;lane[s].push(tg);g.stats[seatOf(g,s)].strikes++;ev.push({t:"flip",s,l:p.l,c,x:tg})}));
 g.pend={P:[],D:[]};g.log.push(...ev);return ev}
/* ===== REACTIVE OBJECTIONS ===== */
const hasKw=(g,s,kw)=>g.hand[s].some(c=>c.kw===kw);
function useKw(g,s,kw){const i=g.hand[s].findIndex(c=>c.kw===kw);return i>=0?g.hand[s].splice(i,1)[0]:null}
function objTargets(g,s){const o=opp(s),out=[];g.lanes.forEach((L,l)=>L[o].forEach(x=>{if(!x.struck&&x.turn===g.turn&&x.c.cost>0&&!x.flip)out.push({l,x})}));return out}
function sustain(g,s,x){x.struck=true;g.stats[seatOf(g,s)].obj++}
function aiObject(g,s){if(!hasKw(g,s,"obj"))return null;const t=objTargets(g,s).sort((a,b)=>b.x.pow-a.x.pow)[0];if(!t)return null;
 const thr=g.turn>=5?3:4;if(t.x.pow<thr||RK()>.7)return null;return t}
const aiCounter=(g,s)=>hasKw(g,s,"ovr")&&RK()<.85;
const DRAW=2,MAXHAND=8;
function draw(g){["P","D"].forEach(s=>{for(let k=0;k<DRAW;k++)if(g.deck[s].length&&g.hand[s].length<MAXHAND)g.hand[s].push(g.deck[s].shift())})}
function endTurn(g){g.turn++;draw(g);rollEvent(g)}
function doSwap(g){g.seat={A:g.seat.B,B:g.seat.A};g.swap=!g.swap}
function closing(g){const ev=[];if(g.close.P>=0){g.lanes[g.close.P].P.push({c:{name:["Slutanförande","Closing"],ty:"GEN",icon:"🎙️",kw:"plain",cost:0,pow:3},pow:3,base:3,struck:false,turn:7,s:"P"});ev.push({t:"close",s:"P",l:g.close.P})}
 if(g.close.D>=0){g.lanes[g.close.D].D.push({c:{name:["Slutanförande","Closing"],ty:"GEN",icon:"🎙️",kw:"plain",cost:0,pow:3},pow:3,base:3,struck:false,turn:7,s:"D"});ev.push({t:"close",s:"D",l:g.close.D})}return ev}
function verdictOf(g){const w=[0,1,2].map(l=>laneWinner(g,l));return {lanes:w,guilty:w.every(x=>x==="P")}}
/* ===== AI ===== */
function aiPlan(g,s){const h=g.hand[s];let budget=energy(g);
 const visP=l=>power(g,"P",l),visD=l=>power(g,"D",l);
 const tries=[];
 for(let k=0;k<6;k++){const order=shuf(h.map((c,i)=>i));tries.push(order)}
 const score=(plan)=>{/* estimate lane powers after plan */
  const add={P:[0,0,0],D:[0,0,0]};plan.forEach(([i,l])=>{const c=h[i];if(c.kw==="vand"){const m=Math.max(0,...g.lanes[l][opp(s)].filter(x=>!x.struck).map(x=>x.pow));add[s][l]+=m;add[opp(s)][l]-=m;return}add[s][l]+=c.pow+(c.kw&&/^strike|arthurD/.test(c.kw)?3:0)+(c.kw&&/^debuff/.test(c.kw)?2:0)});
  let sc=0;for(let l=0;l<3;l++){const P=visP(l)+add.P[l],D=visD(l)+add.D[l];
   if(s==="P"){const d=P-D;sc+=Math.min(d,6)+(d>0?6:0)}else{const d=D-P;sc+=Math.max(-6,Math.min(d,8))+(d>=0?10:0)}}
  if(s==="P"){const m=Math.min(...[0,1,2].map(l=>visP(l)+add.P[l]-visD(l)-add.D[l]));sc+=m*1.5}
  return sc+RK()*3};
 let best=[],bs=-1e9;
 for(const order of tries){const plan=[];let left=budget;const cnt=[0,1,2].map(l=>g.lanes[l][s].length);
  for(const i of order){const c=h[i];if(c.cost>left||isReact(c))continue;
   let lanes=c.lane>=0?[c.lane]:[0,1,2];lanes=lanes.filter(l=>g.lanes[l].ev!=="closed"&&cnt[l]<MAXLANE);if(!lanes.length)continue;
   let l;if(c.kw==="vand"){const bl=lanes.map(x=>[x,Math.max(0,...g.lanes[x][opp(s)].filter(y=>!y.struck).map(y=>y.pow))]).sort((a,b)=>b[1]-a[1])[0];if(bl[1]<3)continue;l=bl[0]}
   else if(c.kw==="arthurD"){const bl=lanes.map(x=>[x,Math.max(0,...g.lanes[x][opp(s)].filter(y=>!y.struck).map(y=>y.pow))]).sort((a,b)=>b[1]-a[1])[0];l=bl[0]}
   else if(/^(strike|debuff)/.test(c.kw)){const ty=c.kw.slice(-3);const hit=lanes.filter(x=>g.lanes[x][opp(s)].some(y=>!y.struck&&y.c.ty===ty));l=hit.length?hit[RK()*hit.length|0]:lanes[RK()*lanes.length|0]}
   else if(s==="P")l=lanes.sort((a,b)=>(visP(a)-visD(a))-(visP(b)-visD(b)))[0];
   else l=lanes.sort((a,b)=>(visD(a)-visP(a))-(visD(b)-visP(b)))[RK()<.6?lanes.length-1:0];
   plan.push([i,l]);left-=c.cost;cnt[l]++}
  const sc=score(plan);if(sc>bs){bs=sc;best=plan}}
 best.map(([i])=>h[i]).forEach((c,k)=>{const l=best[k][1];const idx=h.indexOf(c);place(g,s,idx,l,RK()<.78?1:0)})}
function aiClose(g,s){const d=l=>power(g,"P",l)-power(g,"D",l);const ls=[0,1,2].sort((a,b)=>Math.abs(d(a))-Math.abs(d(b)));g.close[s]=ls[0]}
