export function createSound(){
 let context,master,volume=.45,enabled=false,ambientStarted=false,timer,ducked=false,focused=false,ambientGain,ambientDepth,ambientFilter,chapter=0,musicBus,musicTimer;
 const musicNodes=new Set();
 function init(){
  if(context)return true;
  try{context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=volume;master.connect(context.destination);musicBus=context.createGain();musicBus.gain.value=.7;musicBus.connect(master);return true}catch{return false}
 }
 function note(freq,duration=.2,delay=0,{type='sine',gain=.14,end=freq}={}){
  if(!enabled||!context||context.state!=='running'||document.hidden)return;
  const t=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+duration);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.02);
 }
 function noise(duration=.17,gain=.1,cutoff=1100){
  if(!enabled||!context||context.state!=='running'||document.hidden)return;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const src=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain(),t=context.currentTime;
  src.buffer=buffer;filter.type='lowpass';filter.frequency.value=cutoff;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  src.connect(filter);filter.connect(g);g.connect(master);src.start();
 }
 function bubble(){note(340,.15,0,{end:760,gain:.025});note(660,.1,.1,{end:390,gain:.015})}
 function bird(){for(let i=0;i<3;i++)note(1550+i*160,.12,i*.16,{end:2500-i*180,gain:.014})}
 function ambient(){
  if(ambientStarted)return;ambientStarted=true;
  const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate),data=buffer.getChannelData(0);let smooth=0;
  for(let i=0;i<data.length;i++){smooth=(smooth+(Math.random()*2-1)*.025)/1.025;data[i]=smooth*3}
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain(),lfo=context.createOscillator(),depth=context.createGain();
  source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=chapter?550:850;ambientFilter=filter;ambientGain=g;ambientDepth=depth;g.gain.value=focused?.018:.07;lfo.frequency.value=.22;depth.gain.value=focused?.006:.025;
  source.connect(filter);filter.connect(g);g.connect(master);lfo.connect(depth);depth.connect(g.gain);source.start();lfo.start();
 }
 function scheduleNature(){clearInterval(timer);timer=setInterval(()=>{if(enabled&&!document.hidden&&!focused){bubble();if(chapter===0&&Math.random()>.4)bird()}},6400)}
 function stopMusic(){clearInterval(musicTimer);for(const node of musicNodes){try{node.stop()}catch{}}musicNodes.clear()}
 function musicTone(freq,delay,duration,gain){
  if(!enabled||context?.state!=='running'||document.hidden)return;
  const t=context.currentTime+delay,o=context.createOscillator(),harmonic=context.createOscillator(),g=context.createGain(),h=context.createGain(),filter=context.createBiquadFilter();
  o.type=chapter?'sine':'triangle';o.frequency.value=freq;harmonic.type='sine';harmonic.frequency.value=freq*2.005;filter.type='lowpass';filter.frequency.value=chapter?1250:950;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+duration);h.gain.value=.12;
  o.connect(g);harmonic.connect(h);h.connect(g);g.connect(filter);filter.connect(musicBus);
  for(const source of [o,harmonic]){musicNodes.add(source);source.onended=()=>{musicNodes.delete(source);source.disconnect()};source.start(t);source.stop(t+duration+.05)}
 }
 function musicPhrase(){
  if(!enabled||document.hidden)return;
  const melody=chapter?[293.66,349.23,440,659.25,523.25,440,349.23,329.63]:[392,493.88,587.33,493.88,440,392,329.63,392];
  const beat=chapter?.92:.66;
  melody.forEach((f,i)=>musicTone(f,i*beat,chapter?2.2:1.4,chapter?.045:.024));
  if(chapter)musicTone(146.83,0,5.7,.022);
 }
 function startMusic(){stopMusic();if(!enabled)return;musicPhrase();musicTimer=setInterval(musicPhrase,(chapter?.92:.66)*8000)}
 const api={
  enable(value){
   if(value&&!init())return false;
   enabled=value;
   if(enabled){context.resume().then(()=>{if(enabled){api.play('ready');startMusic()}});ambient();scheduleNature()}else{clearInterval(timer);stopMusic();context?.suspend()}
   return enabled;
  },
  setVolume(value){volume=Math.max(0,Math.min(1,value));if(master)master.gain.setTargetAtTime(volume*(ducked?.18:1),context.currentTime,.08)},
  duck(value){ducked=value;api.setVolume(volume)},
  setChapter(value){if(chapter===value)return;chapter=value;if(ambientFilter)ambientFilter.frequency.setTargetAtTime(value?550:850,context.currentTime,.5);if(enabled)startMusic()},
  focus(value){focused=value;if(musicBus)musicBus.gain.setTargetAtTime(value?.3:.7,context.currentTime,.4);if(ambientGain){ambientGain.gain.setTargetAtTime(value?.018:.07,context.currentTime,.3);ambientDepth.gain.setTargetAtTime(value?.006:.025,context.currentTime,.3)}},
  play(kind){
   switch(kind){
    case 'step':note(230,.14,0,{type:'triangle',gain:.16,end:115});break;
    case 'jump':note(270,.24,0,{type:'sine',gain:.16,end:800});note(520,.13,.07,{gain:.045,end:1000});break;
    case 'land':note(165,.18,0,{type:'triangle',gain:.18,end:80});noise(.17,.13,700);bubble();break;
    case 'splash':noise(.28,.19,1600);bubble();break;
    case 'wrong':note(230,.25,0,{gain:.13,end:150});note(180,.24,.12,{gain:.075,end:125});break;
    case 'freeze':for(const [i,f] of [660,880,1100].entries())note(f,.7,i*.08,{gain:.06});break;
    case 'tick':note(790,.16,0,{gain:.075});note(1580,.12,.01,{gain:.017});break;
    case 'ready':for(const [i,f] of [392,494,587].entries())note(f,.22,i*.11,{gain:.07});break;
    case 'win':for(const [i,f] of [392,494,587,784,659,784].entries())note(f,.48,i*.17,{gain:.13});break;
    case 'lose':note(330,.4,0,{gain:.1,end:260});note(220,.55,.24,{gain:.08});break;
    case 'bubble':bubble();break;
   }
  }
 };
 document.addEventListener('visibilitychange',()=>{if(!context||!enabled)return;if(document.hidden)context.suspend();else context.resume()});
 return api;
}
