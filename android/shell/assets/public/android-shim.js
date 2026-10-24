/* Hollow Stars Android shell shim: back-button routing (injected at APK build time only) */
(function(){
  var $=function(s){return document.querySelector(s)};
  function closeConfirm(){var d=$('#hsQuitAsk');if(d)d.remove()}
  function askQuit(){
    if($('#hsQuitAsk')){closeConfirm();return}
    var d=document.createElement('div');d.id='hsQuitAsk';
    d.innerHTML='<div class="hqbox"><h2>ABANDON THE RITE?</h2><p>Leaving now forfeits this match.</p><div class="hqrow"><button class="btn ghost" id="hqStay">Stay</button><button class="btn" id="hqLeave"><span>Leave</span></button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click',function(e){if(e.target===d)closeConfirm()});
    $('#hqStay').onclick=function(){closeConfirm()};
    $('#hqLeave').onclick=function(){closeConfirm();var q=$('#quit');if(q)q.click();else if(typeof show==='function')show('title')};
  }
  /* returns true if handled, false if the app should go to background */
  window.hsBack=function(){
    try{
      if($('#hsQuitAsk')){closeConfirm();return true}
      var cin=$('#cin');if(cin&&cin.classList.contains('on')){if(typeof cinSkip==='function')cinSkip();return true}
      var z=$('#zoom');if(z&&z.classList.contains('on')){if(typeof hideZoom==='function')hideZoom();else z.className='';return true}
      var dl=$('#dlg');if(dl&&dl.classList.contains('on')){var n=$('#dlgNo');if(n)n.click();return true}
      var s=$('#settings');if(s&&s.classList.contains('on')){var c=$('#sClose');if(c)c.click();else s.classList.remove('on');return true}
      var ov=$('#over');if(ov&&ov.classList.contains('on')){var m=$('#ovm');if(m)m.click();return true}
      var c=(typeof cur!=='undefined')?cur:'title';
      if(c==='match'){var g=(typeof G!=='undefined')?G:null;if(g&&!g.over){askQuit();return true}var q=$('#quit');if(q)q.click();else show('title');return true}
      if(c!=='title'){if(typeof show==='function')show('title');return true}
      return false;
    }catch(e){return false}
  };
  var st=document.createElement('style');
  st.textContent='#hsQuitAsk{position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);animation:fade .2s}'+
  '#hsQuitAsk .hqbox{width:min(86vw,330px);padding:22px 20px;text-align:center;border:1px solid #5a1a22;border-radius:10px;background:radial-gradient(circle at 50% 0,#2a0a10,#07040a 70%);box-shadow:0 0 40px #000,0 0 18px rgba(200,26,42,.25) inset;color:#d8cbb8}'+
  '#hsQuitAsk h2{margin:0 0 8px;letter-spacing:.12em;color:#e0303f;font-size:20px}'+
  '#hsQuitAsk p{margin:0 0 18px;opacity:.85}'+
  '#hsQuitAsk .hqrow{display:flex;gap:12px;justify-content:center}';
  (document.head||document.documentElement).appendChild(st);
})();
