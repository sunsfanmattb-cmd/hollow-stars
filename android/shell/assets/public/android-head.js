/* Hollow Stars Android shell: track AudioContexts so sound pauses when the app is backgrounded */
(function(){
  var ctxs=[];
  ['AudioContext','webkitAudioContext'].forEach(function(k){
    var O=window[k];if(!O)return;
    var W=function(a,b){var c=arguments.length>1?new O(a,b):arguments.length?new O(a):new O();ctxs.push(c);return c};
    W.prototype=O.prototype;try{Object.setPrototypeOf(W,O)}catch(e){}
    window[k]=W;
  });
  var paused=false;
  window.hsPause=function(){paused=true;if(window.hsBat){try{window.hsBat.pause()}catch(e){}return}ctxs.forEach(function(c){try{if(c.state==='running')c.suspend()}catch(e){}});
    document.querySelectorAll('video').forEach(function(v){try{if(!v.paused){v.dataset.hsWas='1';v.pause()}}catch(e){}})};
  window.hsResume=function(){if(!paused)return;paused=false;if(window.hsBat){try{window.hsBat.resume()}catch(e){}return}/* v9 battery saver owns audio/video: it keeps a muted game's AudioContext suspended */ctxs.forEach(function(c){try{if(c.state==='suspended')c.resume()}catch(e){}});
    document.querySelectorAll('video[data-hs-was]').forEach(function(v){delete v.dataset.hsWas;try{v.play()}catch(e){}})};
  document.addEventListener('visibilitychange',function(){document.hidden?hsPause():hsResume()});
})();
