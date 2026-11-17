/* Sound: synthesised with Web Audio, no files. Browsers stay silent until the first tap. */
let AC=null;
function ctx(){
  try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended"&&!document.hidden)AC.resume();return AC;}catch(e){return null;}
}
function ac(){return save.mute?null:ctx();}
function tone(f,at,d,type,vol,f2){
  const a=ac();if(!a)return;
  const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(at||0);
  o.type=type||"triangle";o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.18,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.03);
}
function hiss(d,vol,freq){
  const a=ac();if(!a)return;
  const n=Math.floor(a.sampleRate*d),buf=a.createBuffer(1,n,a.sampleRate),ch=buf.getChannelData(0);
  for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
  const src=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();
  src.buffer=buf;fl.type="bandpass";fl.frequency.value=freq;g.gain.value=vol;
  src.connect(fl);fl.connect(g);g.connect(a.destination);src.start();
}
const SCALE=[523,587,659,784,880,1047,1175,1319,1568,1760];
const sfx={
  ok:n=>tone(SCALE[Math.min(Math.max(n,1),10)-1],0,.15,"triangle",.2),
  bad:()=>tone(150,0,.22,"sawtooth",.11,85),
  toss:()=>{hiss(.16,.2,1800);tone(700,0,.12,"sine",.08,300);},
  oops:()=>{tone(440,0,.12,"triangle",.14);tone(330,.12,.2,"triangle",.14);},
  word:()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.24,"triangle",.2)),
  aha:()=>{tone(1319,0,.12,"sine",.15);tone(1760,.1,.32,"sine",.15);},
  tick:()=>tone(880,0,.05,"square",.045),
  pick:()=>tone(660,0,.07,"triangle",.1),
  free:()=>{tone(659,0,.12,"triangle",.18);tone(988,.11,.28,"triangle",.18);},
  buzz:()=>tone(196,0,.3,"sawtooth",.1,150),
  scene:()=>[523,659,784,659,1047].forEach((f,i)=>tone(f,i*.11,.26,"triangle",.18)),
  win:()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,i*.12,.32,"triangle",.2));[262,330,392].forEach(f=>tone(f,.84,1,"sine",.1));},
  cold:()=>tone(400,0,.5,"triangle",.13,140),
  hint:()=>tone(1047,0,.28,"sine",.12),
  dawn:()=>{[196,247,294,392].forEach((f,i)=>tone(f,.3+i*.55,3,"sine",.07));tone(784,2.4,1.6,"sine",.06);},
  title:()=>[392,494,587,784].forEach((f,i)=>tone(f,i*.07,.55,"triangle",.14))
};
document.addEventListener("click",e=>{ctx();const b=e.target.closest&&e.target.closest(".btn,.case");if(b&&b.id!=="present"&&!b.disabled)sfx.tick();},true);

/* Music: two quiet generated tracks. "puzzle" is a slow lo-fi groove (marimba, plucked strings,
   soft bass and brushes). "palace" has no drums: held strings, a ticking clock and a slow cello line.
   Everything is scheduled a little ahead of the audio clock and runs through a low-pass filter. */
const MUS={on:false,id:0,next:0,step:0,track:"puzzle",g:{},bus:null,noise:null};
function hz(m){return 440*Math.pow(2,(m-69)/12);}
function musBus(){
  const a=AC;if(MUS.bus)return;
  const lp=a.createBiquadFilter(),m=a.createGain();
  lp.type="lowpass";lp.frequency.value=2400;m.gain.value=.9;lp.connect(m);m.connect(a.destination);
  MUS.bus=lp;MUS.master=m;
  for(const k of ["puzzle","palace"]){const g=a.createGain();g.gain.value=k===MUS.track?1:0;g.connect(lp);MUS.g[k]=g;}
  const n=a.sampleRate,buf=a.createBuffer(1,n,n),ch=buf.getChannelData(0);
  for(let i=0;i<n;i++)ch[i]=Math.random()*2-1;
  MUS.noise=buf;
}
function mPluck(dest,m,at,d,type,vol){
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.value=hz(m);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+d);
  o.connect(g);g.connect(dest);o.start(at);o.stop(at+d+.03);
}
function mPad(dest,m,at,d,vol){
  const g=AC.createGain();
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+1);g.gain.setValueAtTime(vol,at+d-.4);g.gain.linearRampToValueAtTime(0,at+d+1);
  g.connect(dest);
  for(const det of [-6,6]){const o=AC.createOscillator();o.type="triangle";o.frequency.value=hz(m);o.detune.value=det;o.connect(g);o.start(at);o.stop(at+d+1.05);}
}
function mCello(dest,m,at,d,vol){
  const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();
  o.type="sawtooth";o.frequency.value=hz(m);f.type="lowpass";f.frequency.value=700;
  l.frequency.value=5;lg.gain.value=9;l.connect(lg);lg.connect(o.detune);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+.3);g.gain.setValueAtTime(vol,at+d-.25);g.gain.linearRampToValueAtTime(0,at+d+.35);
  o.connect(f);f.connect(g);g.connect(dest);o.start(at);l.start(at);o.stop(at+d+.4);l.stop(at+d+.4);
}
function mNoise(dest,at,d,vol,type,freq){
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=MUS.noise;f.type=type;f.frequency.value=freq;
  g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0001,at+d);
  s.connect(f);f.connect(g);g.connect(dest);s.start(at,Math.random()*.8,d+.02);
}
function mKick(dest,at,vol){
  const o=AC.createOscillator(),g=AC.createGain();
  o.frequency.setValueAtTime(115,at);o.frequency.exponentialRampToValueAtTime(44,at+.16);
  g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0001,at+.22);
  o.connect(g);g.connect(dest);o.start(at);o.stop(at+.25);
}
const PZ_CH=[[38,[62,65,69,72]],[46,[58,62,65,69]],[43,[58,62,65,67]],[45,[57,61,64,67]],[38,[62,65,69,72]],[41,[57,60,64,65]],[43,[58,62,65,67]],[45,[57,61,64,67]]];
const PZ_ARP=[[1,0],[3,2],[4,1],[6,3],[7,2]];
const PZ_MEL=[[[2,74],[3,77],[5,76]],[[0,74]],[[2,74],[3,70],[5,72]],[[0,73],[4,76]],[[2,69],[3,74],[5,77]],[[0,76],[3,72]],[[2,74],[4,70]],[[1,73],[3,76],[5,79]],
              [],[[4,77],[5,74]],[],[[2,76],[3,73],[4,69]],[[0,74]],[],[[3,70],[5,74]],[[2,73],[4,69]]];
const PL_CH=[[50,57,62,65],[50,57,62,65],[55,58,62],[57,62,65],[58,62,65],[55,58,62],[57,61,64],[50,57,62]];
const PL_MEL=[[[0,50,2],[2,53,2]],[[0,52,4]],[[0,55,2],[2,53,2]],[[0,57,4]],[[0,58,2],[2,57,2]],[[0,55,4]],[[0,52,2],[2,49,2]],[[0,50,4]]];
const TRACKS={
  puzzle:{sp:60/76/2,len:128,sched(step,at){
    const g=MUS.g.puzzle,bar=step>>3,s=step&7,ch=PZ_CH[bar%8],root=ch[0],tones=ch[1];
    if(s&1)at+=this.sp*.16; // swing
    if(s===0||s===5)mKick(g,at,s===0?.13:.08);
    if(s===2||s===6)mNoise(g,at,.09,.035,"bandpass",1700);
    mNoise(g,at,.03,s&1?.016:.01,"highpass",6000);
    if(s===0){mPluck(g,root,at,.55,"sine",.13);mPluck(g,root+12,at,.4,"triangle",.035);}
    if(s===3||s===7){mPluck(g,root+7,at,.3,"sine",.08);mPluck(g,root+19,at,.25,"triangle",.02);}
    PZ_ARP.forEach(p=>{if(p[0]===s){const m=tones[bar&1?3-p[1]:p[1]]+12;mPluck(g,m,at,.5,"sine",.05);mPluck(g,m+24,at,.1,"sine",.007);}});
    PZ_MEL[bar%16].forEach(n=>{if(n[0]===s)mPluck(g,n[1],at,.22,"triangle",.04);});
  }},
  palace:{sp:1,len:32,sched(step,at){
    const g=MUS.g.palace,bar=step>>2,s=step&3;
    mNoise(g,at,.025,.03,"bandpass",s&1?2200:3200); // tick, tock
    if(s===0)PL_CH[bar].forEach(m=>mPad(g,m,at,4,.026));
    PL_MEL[bar].forEach(n=>{if(n[0]===s)mCello(g,n[1],at,n[2]*this.sp,.05);});
  }}
};
function musicTick(){
  const a=AC;if(!a||!MUS.on||a.state!=="running")return;
  const tr=TRACKS[MUS.track];
  if(MUS.next<a.currentTime)MUS.next=a.currentTime+.06;
  while(MUS.next<a.currentTime+.3){tr.sched(MUS.step,MUS.next);MUS.next+=tr.sp;MUS.step=(MUS.step+1)%tr.len;}
}
function setTrack(name){
  if(MUS.track===name)return;
  const old=MUS.track;MUS.track=name;MUS.step=0;
  if(!MUS.on||!AC||!MUS.bus)return;
  const now=AC.currentTime;
  MUS.g[old].gain.setTargetAtTime(0,now,.25);MUS.g[name].gain.setTargetAtTime(1,now+.2,.25);
  MUS.next=now+.5;
}
function startMusic(){
  if(save.music===false||MUS.on)return;
  const a=ctx();if(!a)return;
  musBus();
  MUS.master.gain.cancelScheduledValues(a.currentTime);MUS.master.gain.setValueAtTime(.9,a.currentTime);
  for(const k in MUS.g)MUS.g[k].gain.setValueAtTime(k===MUS.track?1:0,a.currentTime);
  MUS.on=true;MUS.step=0;MUS.next=a.currentTime+.2;
  MUS.id=setInterval(musicTick,90);
}
function stopMusic(){
  MUS.on=false;clearInterval(MUS.id);
  if(MUS.master&&AC)MUS.master.gain.setTargetAtTime(0,AC.currentTime,.05);
}
document.addEventListener("visibilitychange",()=>{if(!AC)return;try{document.hidden?AC.suspend():AC.resume();}catch(e){}});
