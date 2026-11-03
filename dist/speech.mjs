export function createSpeech({onStart,onEnd,onUnavailable}){
 const synth=window.speechSynthesis,select=document.getElementById('voice-choice');
 let voices=[];
 function score(v){return (/natural|neural|premium|enhanced|online|google|microsoft/i.test(v.name)?80:0)+(/milena|milya|svetlana|dariya|alena/i.test(v.name)?30:0)+(v.default?5:0)}
 function refresh(){
  if(!synth)return;const previous=select.value;
  voices=synth.getVoices().filter(v=>v.lang.toLowerCase().startsWith('ru')).sort((a,b)=>score(b)-score(a));
  select.replaceChildren();const auto=document.createElement('option');auto.value='';auto.textContent=voices.length?'Автоматически — '+voices[0].name:'Системный русский голос';select.append(auto);
  for(const v of voices){const o=document.createElement('option');o.value=v.voiceURI;o.textContent=v.name;select.append(o)}if(voices.some(v=>v.voiceURI===previous))select.value=previous;
  document.getElementById('voice-note').textContent=voices.length?'Выберите голос и послушайте образец.':'Список голосов ещё загружается. Используется системная озвучка.';
 }
 if(synth){refresh();synth.addEventListener('voiceschanged',refresh)}
 return {
  stop(){synth?.cancel();onEnd?.()},
  speak(text,character=false){
   if(!synth){onUnavailable?.();return}
   synth.cancel();refresh();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=character?.98:.91;u.pitch=1;u.volume=1;
   const voice=voices.find(v=>v.voiceURI===select.value)||voices[0];if(voice)u.voice=voice;
   u.onstart=onStart;u.onend=onEnd;u.onerror=e=>{onEnd?.();if(e.error!=='interrupted'&&e.error!=='canceled')onUnavailable?.()};synth.speak(u);
  }
 };
}
