const fs=require('fs');eval(fs.readFileSync(__dirname+'/cases.js','utf8')+fs.readFileSync(__dirname+'/engine.js','utf8')+`
let res={g:0,n:0,lanes:[0,0,0],obj:0,sus:0,flip:0,objHeld:0};
function react(g){["P","D"].forEach(s=>{const t=aiObject(g,s);if(!t)return;useKw(g,s,"obj");res.obj++;if(aiCounter(g,opp(s))){useKw(g,opp(s),"ovr");return}if(RK()<.75){sustain(g,s,t.x);res.sus++}})}
for(let i=0;i<3000;i++){const g=newGame(CASES[i%3],'ai');
 for(let t=1;t<=6;t++){aiPlan(g,'P');aiPlan(g,'D');const ev=reveal(g);res.flip+=ev.filter(e=>e.t==="flip").length;react(g);if(t===3&&Math.random()<.5)doSwap(g);if(t<6)endTurn(g)}
 aiClose(g,'P');aiClose(g,'D');closing(g);const v=verdictOf(g);res.n++;if(v.guilty)res.g++;v.lanes.forEach((w,l)=>{if(w==='P')res.lanes[l]++})}
console.log('guilty',(res.g/res.n).toFixed(2),'laneP',res.lanes.map(x=>(x/res.n).toFixed(2)),'obj/game',(res.obj/res.n).toFixed(2),'sustained/game',(res.sus/res.n).toFixed(2),'flips/game',(res.flip/res.n).toFixed(2))`)
