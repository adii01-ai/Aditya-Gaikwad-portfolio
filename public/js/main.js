(function(){
  try{
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cursorOK=root.classList.contains('fx'); /* pen cursor + magnetic pull: desktop and laptop only */

  /* Keep the branded loader visible until the document has completed loading. */
  var loader=document.getElementById('loader');
  if(loader){
    var loaderValue=document.getElementById('loader-value'),loaderTrack=document.getElementById('loader-track'),loaderFill=document.getElementById('loader-fill'),loaderProgress=0;
    var loaderPageReady=document.readyState==='complete',loaderWorldReady=!root.classList.contains('fx3d'),loaderFinished=false;
    function setLoaderProgress(value){loaderProgress=value;loaderValue.textContent=value+'%';loaderTrack.setAttribute('aria-valuenow',String(value));loaderFill.style.width=value+'%';}
    var loaderTimer=window.setInterval(function(){if(!loaderPageReady&&loaderProgress<8)setLoaderProgress(loaderProgress+1);},100);
    function finishLoader(){
      if(loaderFinished)return;loaderFinished=true;
      window.clearInterval(loaderTimer);setLoaderProgress(100);
      window.setTimeout(function(){loader.classList.add('is-done');root.classList.remove('loading');window.setTimeout(function(){loader.remove();},reduce?0:300);},reduce?0:460);
    }
    function finishWhenReady(){if(loaderPageReady&&loaderWorldReady)finishLoader();}
    window.__portfolioLoaderProgress=function(loaded,total){if(total)setLoaderProgress(Math.min(96,Math.max(loaderProgress,Math.round(8+88*loaded/total))));};
    window.__portfolioLoaderWorldReady=function(success){loaderWorldReady=true;if(!success)root.classList.remove('fx3d');finishWhenReady();};
    setLoaderProgress(0);
    if(loaderPageReady)finishWhenReady();
    else window.addEventListener('load',function(){loaderPageReady=true;finishWhenReady();},{once:true});
    if(!loaderWorldReady)window.setTimeout(function(){if(!loaderWorldReady){loaderWorldReady=true;root.classList.remove('fx3d');finishWhenReady();}},12000);
  }

  /* split hero name into letters */
  var n=0;
  document.querySelectorAll('#name .ln').forEach(function(line){
    var txt=line.textContent; line.textContent='';
    txt.split('').forEach(function(c){
      var s=document.createElement('span'); s.className='ch'; s.setAttribute('aria-hidden','true');
      s.style.setProperty('--i',n++); s.textContent=c; line.appendChild(s);
    });
  });
  var hero=document.querySelector('.hero-text');
  function start(){ hero.classList.add('go'); setTimeout(function(){hero.classList.add('settled');}, 2600); }
  if(reduce){ hero.classList.add('go','settled'); }
  else if(document.fonts&&document.fonts.ready){ Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,900)})]).then(function(){requestAnimationFrame(function(){requestAnimationFrame(start)})}); }
  else{ setTimeout(start,100); }

  document.querySelectorAll('h2[data-io]').forEach(function(h){ var s=document.createElement('span'); s.className='hx'; s.textContent=h.textContent; h.textContent=''; h.appendChild(s); });
  /* stagger delays */
  document.querySelectorAll('[data-stagger]').forEach(function(ul){
    Array.prototype.forEach.call(ul.children,function(li,i){ li.setAttribute('data-reveal',''); li.setAttribute('data-io',''); li.style.setProperty('--d',i); });
  });
  var rows=document.querySelectorAll('.row'); rows.forEach(function(r,i){ r.style.setProperty('--d',i); });

  /* scroll reveal */
  var els=document.querySelectorAll('[data-io]');
  function show(el){
    el.classList.add('in');
    if(el.classList.contains('row')){ setTimeout(function(){ el.removeAttribute('data-reveal'); }, 1500+(parseInt(el.style.getPropertyValue('--d'))||0)*90); }
  }
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target);} }); },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(show); }

  /* scroll progress */
  var bar=document.getElementById('bar');
  function prog(){ var m=root.scrollHeight-window.innerHeight; bar.style.transform='scaleX('+(m>0?Math.min(1,window.scrollY/m):0)+')'; }
  window.addEventListener('scroll',prog,{passive:true}); prog();

  /* magnetic pull */
  if(cursorOK){
    var mags=Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]'));
    document.addEventListener('pointermove',function(e){
      mags.forEach(function(el){
        var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
        var dx=e.clientX-cx,dy=e.clientY-cy;
        if(Math.abs(dx)<r.width/2+50&&Math.abs(dy)<r.height/2+50){ el.style.transform='translate('+(dx*.14)+'px,'+(dy*.18)+'px)'; }
        else if(el.style.transform){ el.style.transform=''; }
      });
    },{passive:true});

    /* custom cursor */
    var cur=document.getElementById('cur'),ring=document.getElementById('ring'),dot=document.getElementById('dot');
    var px=-100,py=-100,rx=-100,ry=-100;
    root.classList.add('cursor-on');
    document.addEventListener('pointermove',function(e){ px=e.clientX; py=e.clientY; dot.style.transform='translate('+px+'px,'+py+'px)'; },{passive:true});
    (function loop(){ rx+=(px-rx)*.16; ry+=(py-ry)*.16; ring.style.transform='translate('+rx+'px,'+ry+'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover',function(e){
      var t=e.target.closest&&e.target.closest('a,button,.ch');
      ring.classList.toggle('big',!!(t&&!t.classList.contains('ch')));
    });
    document.addEventListener('pointerdown',function(){ ring.classList.add('down'); });
    document.addEventListener('pointerup',function(){ ring.classList.remove('down'); });
    document.documentElement.addEventListener('pointerleave',function(){ cur.style.opacity=0; });
    document.documentElement.addEventListener('pointerenter',function(){ cur.style.opacity=1; });
  }

  /* copy email with label feedback */
  var btn=document.getElementById('copy'),st=document.getElementById('status'),lbl=document.getElementById('copylbl'),addr='adityagaikwad4434@gmail.com';
  function flash(msg){ lbl.textContent=msg; lbl.setAttribute('data-t',msg); setTimeout(function(){ lbl.textContent='Copy email address'; lbl.setAttribute('data-t','Copy email address'); },1800); }
  function done(ok){ st.textContent=ok?'Email address copied.':'Could not copy. Select the address above and copy it manually.'; if(ok) flash('Copied'); }
  function fallback(){ try{ var r=document.createRange(); r.selectNodeContents(document.getElementById('mail')); var s=window.getSelection(); s.removeAllRanges(); s.addRange(r); done(document.execCommand('copy')); }catch(e){ done(false); } }
  btn.addEventListener('click',function(){
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(addr).then(function(){done(true)},fallback); } else { fallback(); }
  });

  /* ---- scroll-driven motion (hero drift, statement highlight, photo parallax) ---- */
  if(!reduce){
    var lines=Array.prototype.slice.call(document.querySelectorAll('#name .ln'));
    var dirs=[-1,1,-1],heroSec=document.querySelector('.hero'),heroCta=document.querySelector('.hero-cta');
    var stmt=document.querySelector('.about-text p');
    var words=[];
    if(stmt){
      var parts=stmt.textContent.trim().split(/\s+/); stmt.textContent='';
      parts.forEach(function(w,i){ var s=document.createElement('span'); s.className='w'; s.textContent=w; stmt.appendChild(s); if(i<parts.length-1) stmt.appendChild(document.createTextNode(' ')); words.push(s); });
      stmt.setAttribute('aria-label',parts.join(' '));
    }
    var frame=document.querySelector('.portrait'),pimg=frame?frame.querySelector('img'):null;
    var sm=window.scrollY,wp=0;
    function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
    (function tick(){
      requestAnimationFrame(tick);
      var vh=window.innerHeight,y=window.scrollY;
      sm+=(y-sm)*.1;
      /* hero: lines drift apart, text softens as the next section arrives */
      var pin=root.classList.contains('fx3d'),hs=pin?Math.max(1,heroSec.offsetHeight-vh):vh;
      if(y<hs+vh*.3){
        var p=clamp(sm/hs,0,1),narrow=window.innerWidth<700;
        lines.forEach(function(l,i){ l.style.transform='translate3d('+(dirs[i]*p*(narrow?3:9)*(i===1?.7:1))+'vw,0,0)'; });
        hero.style.opacity=String(pin?1-clamp((p-.3)/.45,0,1):1-p*.4);
        if(pin&&heroCta){heroCta.style.opacity=p>0?String(1-clamp(p/.25,0,1)):'';heroCta.style.pointerEvents=p>.25?'none':'';}
      }
      /* statement: words light up as it crosses the screen */
      if(stmt){
        var r=stmt.getBoundingClientRect();
        var pr=clamp((vh*.95-r.top)/(vh*.55),0,1);
        wp+=(pr-wp)*.15;
        var n=words.length;
        for(var i=0;i<n;i++){ var k=clamp(wp*(n+2)-i,0,1); words[i].style.opacity=(.3+.7*k).toFixed(3); }
      }
      /* photo: image drifts inside its frame */
      if(frame&&pimg){
        var fr=frame.getBoundingClientRect();
        if(fr.bottom>0&&fr.top<vh){ var c=(fr.top+fr.height/2-vh/2)/(vh/2+fr.height/2); pimg.style.setProperty('--py',clamp(c,-1,1).toFixed(3)); }
      }
    })();
  }

  
  /* ---- content: edit this block to change skills and projects ---- */
  var GH='https://github.com/adii01-ai';
  var zio=('IntersectionObserver' in window&&!reduce)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');zio.unobserve(e.target);}});},{threshold:.15}):null;


  /* projects: list + case-study modal */
  var list=document.getElementById('projs'),fil=document.getElementById('filters'),count=document.getElementById('work-count'),pm=document.getElementById('pm'),pmb=document.getElementById('pmb');
  var railControls=document.getElementById('work-scroll-controls'),railPrev=document.getElementById('work-prev'),railNext=document.getElementById('work-next');
  var PJ=[],lastBtn=null,isHttp=location.protocol.indexOf('http')===0;
  function updateRail(){
    var max=list.scrollWidth-list.clientWidth;
    railControls.hidden=max<=2;
    railPrev.disabled=list.scrollLeft<=2;
    railNext.disabled=list.scrollLeft>=max-2;
  }
  function scrollRail(direction){list.scrollBy({left:direction*Math.max(280,list.clientWidth*.85),behavior:reduce?'auto':'smooth'});}
  railPrev.addEventListener('click',function(){scrollRail(-1);});
  railNext.addEventListener('click',function(){scrollRail(1);});
  list.addEventListener('scroll',updateRail,{passive:true});
  window.addEventListener('resize',updateRail,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(updateRail).observe(list);
  var railPointer=null,railMoved=false,suppressRailClick=false;
  list.addEventListener('pointerdown',function(event){
    if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('a,button'))return;
    railPointer={id:event.pointerId,x:event.clientX,left:list.scrollLeft};railMoved=false;
    list.setPointerCapture(event.pointerId);
  });
  list.addEventListener('pointermove',function(event){
    if(!railPointer||event.pointerId!==railPointer.id)return;
    var delta=event.clientX-railPointer.x;
    if(Math.abs(delta)>5){railMoved=true;list.scrollLeft=railPointer.left-delta;}
  });
  function finishRailPointer(event){
    if(!railPointer||event.pointerId!==railPointer.id)return;
    suppressRailClick=railMoved;railPointer=null;
    if(suppressRailClick)window.setTimeout(function(){suppressRailClick=false;},0);
  }
  list.addEventListener('pointerup',finishRailPointer);
  list.addEventListener('pointercancel',finishRailPointer);
  list.addEventListener('click',function(event){
    if(suppressRailClick){event.preventDefault();event.stopPropagation();suppressRailClick=false;}
  },true);
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';';});}
  function link(v){return /^https?:\/\//.test(v||'')?esc(v):'';}
  function sp(v){return /^(?!\/)[\w\/.\-]+$/.test(v||'')?esc(v):'';}
  function A(k){var v=(window.ASSETS&&window.ASSETS[k])||k;if(/^data:video/.test(v)){A.c=A.c||{};if(!A.c[k]){var b=atob(v.split(',')[1]),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);A.c[k]=URL.createObjectURL(new Blob([u],{type:'video/mp4'}));}return A.c[k];}return v;}
  function norm(x){return{rt:String(x.title||''),t:esc(x.title),c:esc(x.category||'Web'),y:esc(x.year),tag:esc(x.tagline),o:esc(x.overview),p:esc(x.problem),b:esc(x.solution),f:(x.features||[]).map(esc),s:(x.stack||[]).map(esc),ch:esc(x.challenges),r:esc(x.result),gh:link(x.github),demo:link(x.demo),img:sp(x.image),vid:sp(x.video),poster:sp(x.poster),gal:(x.gallery||[]).map(function(g){return{s:sp(g.src),c:esc(g.caption)};}).filter(function(g){return g.s;})};}
  function rb(t,h,c){return '<a class="btn '+c+'" data-magnetic href="'+h+'" target="_blank" rel="noopener noreferrer"><span class="roll"><span data-t="'+t+'">'+t+'</span></span></a>';}
  function sec(h,x){return x?'<section class="pm-s"><h4>'+h+'</h4><p>'+x+'</p></section>':'';}
  function lis(a,c){return a.map(function(x){return '<li'+(c||'')+'>'+x+'</li>';}).join('');}
  function items(p){var m=[];if(p.vid)m.push({k:'v',s:p.vid,c:'Demo video',th:p.poster||p.img});p.gal.forEach(function(g){m.push({k:'i',s:g.s,c:g.c,th:g.s});});return m;}
  function mediaHTML(p){return items(p).length?'<div class="media"><div class="stage"></div><div class="thumbs"></div><p class="cap"></p></div>':'<div class="shot"><div class="bar3"><i></i><i></i><i></i><span>'+p.t+'</span></div><div class="mock"><b>'+p.t+'</b></div></div>';}
  function initMedia(p){
    var m=items(p);if(!m.length){pm._nav=null;if(p.img){var im0=new Image();im0.alt='Screenshot of '+p.rt;im0.onload=function(){var sh=pmb.querySelector('.shot');if(sh)sh.appendChild(im0);};im0.src=A(p.img);}return;}
    var st=pmb.querySelector('.stage'),th=pmb.querySelector('.thumbs'),cp=pmb.querySelector('.cap'),cur=0;
    function show(i){
      cur=i;var it=m[i];st.innerHTML='';st.style.aspectRatio='';
      if(it.k==='v'){
        var v=document.createElement('video'),so=document.createElement('source');v.controls=true;v.playsInline=true;v.preload='metadata';if(it.th)v.poster=A(it.th);v.addEventListener('loadedmetadata',function(){if(v.videoWidth)st.style.aspectRatio=v.videoWidth+'/'+v.videoHeight;});
        so.src=A(it.s);so.type='video/mp4';v.appendChild(so);
        so.addEventListener('error',function(){st.innerHTML='<div class="vfail"><p>The video could not be loaded.</p><p><a href="'+A(it.s)+'" target="_blank" rel="noopener">Open the video file directly</a></p><p class="vp">'+it.s+'</p></div>';});
        st.appendChild(v);}
      else{var im=new Image();im.alt=p.rt+' screenshot';im.onload=function(){if(im.naturalWidth)st.style.aspectRatio=im.naturalWidth+'/'+im.naturalHeight;};im.src=A(it.s);st.appendChild(im);}
      cp.innerHTML=it.c;
      Array.prototype.forEach.call(th.children,function(b,j){b.classList.toggle('on',j===i);b.setAttribute('aria-pressed',String(j===i));});
    }
    m.forEach(function(it,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label',it.k==='v'?'Play demo video':'Screenshot '+i);b.innerHTML='<img alt="" src="'+A(it.th)+'">'+(it.k==='v'?'<span class="pl">&#9654;</span>':'');b.addEventListener('click',function(){show(i);});th.appendChild(b);});
    if(m.length<2)th.hidden=true;
    show(0);
    pm._nav=function(d){show((cur+d+m.length)%m.length);};
  }
  pm.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();pm.close();return;}if(pm._nav&&e.target.tagName!=='VIDEO'&&(e.key==='ArrowLeft'||e.key==='ArrowRight'))pm._nav(e.key==='ArrowRight'?1:-1);});
  function openP(i,btn){
    var p=PJ[i];lastBtn=btn;
    pmb.innerHTML='<button type="button" class="pm-x">Close</button>'+
      mediaHTML(p)+
      '<p class="pm-k">'+p.c+' / '+p.y+'</p><h3 id="pmt">'+p.t+'</h3><p class="pm-o">'+p.o+'</p>'+
      '<div class="pm-3">'+sec('Problem',p.p)+sec('What I built',p.b)+sec('Result',p.r)+'</div>'+
      (p.f.length?'<section class="pm-s"><h4>Key features</h4><ul class="pm-l">'+lis(p.f)+'</ul></section>':'')+
      sec('Challenges',p.ch)+
      (p.s.length?'<section class="pm-s"><h4>Tech stack</h4><ul class="chips">'+lis(p.s)+'</ul></section>':'')+
      '<div class="actions">'+(p.gh?rb('View on GitHub',p.gh,''):'')+(p.demo?rb('Live demo',p.demo,'alt'):'')+'</div>';
    initMedia(p);
    pmb.querySelector('.pm-x').addEventListener('click',function(){pm.close();});
    root.classList.remove('cursor-on');root.style.overflow='hidden';pm.scrollTop=0;
    pm.showModal();
  }
  pm.addEventListener('click',function(e){if(e.target===pm)pm.close();});
  pm.addEventListener('close',function(){var vv=pmb.querySelector('video');if(vv)vv.pause();root.style.overflow='';if(cursorOK)root.classList.add('cursor-on');if(lastBtn)lastBtn.focus();});
  function render(items){
    PJ=items.map(norm);list.innerHTML='';fil.innerHTML='';
    function updateCount(category){var visible=Array.prototype.filter.call(list.children,function(p){return !p.hidden;}).length;count.textContent=visible+' '+(visible===1?'project':'projects')+(category==='All'?'':' / '+category);}
    PJ.forEach(function(p,i){
      var w=document.createElement('div');w.className='proj';w.dataset.c=p.c;w.setAttribute('data-reveal','');w.style.setProperty('--d',i);
      w.innerHTML='<article class="card"><div class="c-img"><span class="bar3"><i></i><i></i><i></i><span>'+p.t+'</span></span><span class="mock"><b>'+p.t+'</b></span>'+(p.vid?'<span class="c-play">&#9654; Demo video</span>':'')+'</div>'+
        '<div class="c-body"><p class="c-top"><span>0'+(i+1)+'</span><span>'+p.c+' / '+p.y+'</span></p>'+
        '<h3 class="c-t"><button type="button" class="c-open" aria-haspopup="dialog">'+p.t+'<span class="sr"> (open case study)</span></button></h3>'+
        '<p class="c-tag">'+p.tag+'</p>'+(p.f.length?'<ul class="c-feat">'+lis(p.f.slice(0,3))+'</ul>':'')+'<ul class="c-stack">'+lis(p.s.slice(0,5))+'</ul>'+
        '<div class="c-actions">'+(p.gh?rb('GitHub',p.gh,'ghost'):'')+(p.demo?rb('Live demo',p.demo,''):'')+'<span class="c-cta" aria-hidden="true">Case study &rarr;</span></div></div></article>';
      var b=w.firstChild;
      w.querySelector('.c-open').addEventListener('click',function(){openP(i,this);});
      if(p.img){var t=new Image();t.alt='';t.loading='lazy';t.onload=function(){b.querySelector('.c-img').appendChild(t);};t.src=A(p.img);}
      if(cursorOK){
        b.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var r=b.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;b.style.setProperty('--ry',((x-.5)*7).toFixed(2)+'deg');b.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg');b.style.setProperty('--mx',(x*100).toFixed(1)+'%');b.style.setProperty('--my',(y*100).toFixed(1)+'%');});
        b.addEventListener('pointerleave',function(){b.style.setProperty('--rx','0deg');b.style.setProperty('--ry','0deg');});
      }
      list.appendChild(w);
      if(zio){zio.observe(w);}else{w.classList.add('in');}
    });
    ['All'].concat(PJ.map(function(p){return p.c;}).filter(function(c,i,a){return a.indexOf(c)===i;})).forEach(function(c){
      var b=document.createElement('button');b.type='button';b.className='tab';b.textContent=c;b.setAttribute('aria-pressed',String(c==='All'));
      b.addEventListener('click',function(){
        Array.prototype.forEach.call(fil.children,function(x){x.setAttribute('aria-pressed',String(x===b));});
        Array.prototype.forEach.call(list.children,function(p){p.hidden=!(c==='All'||p.dataset.c===c);});
        updateCount(c);
        requestAnimationFrame(updateRail);
      });
      fil.appendChild(b);
    });
    updateCount('All');
    requestAnimationFrame(updateRail);
  }
  function load(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json();});}
  if(isHttp){
    /* projects come from MongoDB, or from projects.json if the database is unavailable */
    /* text comes from MongoDB when available; images and video always come from projects.json, so an out-of-date database can never hide them */
    Promise.all([load('projects.json').catch(function(){return [];}),load('/api/projects').catch(function(){return [];})]).then(function(r){
      var js=r[0],db=r[1],base=db.length?db:js;
      if(!base.length)return;
      render(base.map(function(x){
        var j=js.filter(function(y){return y.title===x.title;})[0];
        if(j)['image','poster','video','gallery'].forEach(function(k){if(j[k]!=null)x[k]=j[k];});
        return x;
      }));
    }).catch(function(){});
    /* hide the resume buttons until public/resume.pdf exists */
    fetch('resume.pdf',{method:'HEAD'}).then(function(r){if(!r.ok)throw 0;}).catch(function(){document.querySelectorAll('[data-resume]').forEach(function(a){a.hidden=true;});});
  }

  /* Save enquiries through the server, then send email directly through Web3Forms. */
  var cf=document.getElementById('cform'),fst=document.getElementById('fstatus');
  var contactEmail='adityagaikwad4434@gmail.com';
  var contactInFlight=false;
  var HINT={Website:'Who is it for, what pages or features do you need, and any sites you like?',Software:'What should it do, who will use it, and what problem does it solve?',Application:'Web or mobile app? Describe the main features and who it is for.',Other:'Tell me about your idea and what you need.'};
  var ptype='Website',fm=document.getElementById('fm'),cnt=document.getElementById('cnt'),radios=cf.querySelectorAll('.type-row [role=radio]');
  function setType(t){ptype=t;fm.placeholder=HINT[t];Array.prototype.forEach.call(radios,function(b){b.setAttribute('aria-checked',String(b.dataset.t===t));});}
  Array.prototype.forEach.call(radios,function(b){b.addEventListener('click',function(){setType(b.dataset.t);});});
  /* project-type chips: roving focus + arrow keys; Services links preselect a type */
  function focusType(b){Array.prototype.forEach.call(radios,function(r){r.tabIndex=r===b?0:-1;});b.focus();}
  var setType0=setType;setType=function(t){setType0(t);Array.prototype.forEach.call(radios,function(r){r.tabIndex=r.dataset.t===t?0:-1;});};
  cf.querySelector('.type-row').addEventListener('keydown',function(e){
    var k=e.key,i=Array.prototype.indexOf.call(radios,document.activeElement);if(i<0)return;
    var d=(k==='ArrowRight'||k==='ArrowDown')?1:(k==='ArrowLeft'||k==='ArrowUp')?-1:0;if(!d)return;
    e.preventDefault();var n=radios[(i+d+radios.length)%radios.length];setType(n.dataset.t);focusType(n);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-type]'),function(a){a.addEventListener('click',function(){setType(a.dataset.type);});});
  setType('Website');
  fm.addEventListener('input',function(){cnt.textContent=fm.value.length+' / 1500';});
  function setFormStatus(message,state){
    fst.dataset.state=state||'';
    fst.textContent=message;
  }
  function showDeliveryError(error){
    var saved=!!(error&&error.saved);
    setFormStatus(error&&error.message?error.message:'Your inquiry could not be sent. Please try again.', 'error');
    if(saved)fst.appendChild(document.createTextNode(' Your inquiry is saved, but it has not reached my inbox.'));
    fst.appendChild(document.createTextNode(' You can email me directly at '));
    var directLink=document.createElement('a');
    directLink.href='mailto:'+contactEmail;
    directLink.textContent=contactEmail;
    fst.appendChild(directLink);
    fst.appendChild(document.createTextNode('.'));
  }
  cf.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(cf),n=String(d.get('name')).trim(),m=String(d.get('email')).trim(),g=String(d.get('message')).trim(),sb=cf.querySelector('[type=submit]');
    var website=String(d.get('website')||'');
    function done(){cf.reset();setType('Website');cnt.textContent='0 / 1500';}
    if(!isHttp){
      window.location.href='mailto:'+contactEmail+'?subject='+encodeURIComponent('New '+ptype+' enquiry from '+n)+'&body='+encodeURIComponent('Project type: '+ptype+'\nName: '+n+'\nEmail: '+m+'\n\n'+g);
      showDeliveryError(new Error('Opening your email app. If it does not open, use the direct email link.'));
      return;
    }
    if(contactInFlight)return;
    contactInFlight=true;
    sb.disabled=true;setFormStatus('Sending your inquiry securely...','pending');
    var serverRequest=fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:ptype,name:n,email:m,message:g,website:website})})
      .then(function(r){return r.json().catch(function(){return {};}).then(function(result){if(!r.ok){var error=new Error(result.error||'Your inquiry could not be sent. Please try again.');error.saved=!!result.saved;throw error;}return result;});});
    var accessKey=window.PORTFOLIO_CONFIG&&window.PORTFOLIO_CONFIG.web3formsAccessKey;
    var emailRequest=website?Promise.resolve({success:true}):(function(){
      if(!accessKey)return Promise.reject(new Error('Email delivery failed. Please try again in a moment.'));
      var received=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}).format(new Date());
      return fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:accessKey,name:n,email:m,replyto:m,subject:'New '+ptype+' enquiry from '+n,message:'Project type: '+ptype+'\nName: '+n+'\nEmail: '+m+'\nReceived time: '+received+' IST\n\nMessage:\n'+g})})
        .then(function(r){return r.json().catch(function(){return {};}).then(function(response){if(!r.ok||!response.success)throw new Error(response.message||'Web3Forms submission failed');return response;});})
        .catch(function(){throw new Error('Email delivery failed. Please try again in a moment.');});
    })();
    Promise.all([
      serverRequest.then(function(result){return {ok:true,result:result};},function(error){return {ok:false,error:error};}),
      emailRequest.then(function(result){return {ok:true,result:result};},function(error){return {ok:false,error:error};})
    ]).then(function(results){
        var serverResult=results[0],emailResult=results[1];
        if(!emailResult.ok){emailResult.error.saved=!!(serverResult.ok&&serverResult.result.saved);throw emailResult.error;}
        if(!serverResult.ok)throw serverResult.error;
        setFormStatus('Your inquiry was sent to my inbox. I will reply by email.','success');
        done();
      })
      .catch(function(error){
        console.error('Contact form submission failed:',error);
        if(error instanceof TypeError&&error.message==='Failed to fetch'){
          error=new Error('Could not connect to the portfolio server. Please check that the site is online and try again.');
        }
        showDeliveryError(error);
      })
      .then(function(){contactInFlight=false;sb.disabled=false;});
  });

  if('IntersectionObserver' in window){
    var links=document.querySelectorAll('header nav a');
    var spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){if(l.getAttribute('href')==='#'+e.target.id){l.setAttribute('aria-current','true');}else{l.removeAttribute('aria-current');}});}});},{rootMargin:'-45% 0px -45% 0px'});
    ['about','work','services','contact'].forEach(function(id){spy.observe(document.getElementById(id));});
  }
  /* floating pen cursor */
  var pen=document.getElementById('pen');
  if(pen&&cursorOK){
    var tx=0,ty=0,cx=0,cy=0,vx=0,rot=0,sc=1,hov=false,dn=false,seen=false;
    document.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(!seen){cx=tx;cy=ty;seen=true;}hov=!!(e.target.closest&&e.target.closest('a,button,input,textarea'));pen.style.opacity=1;},{passive:true});
    document.addEventListener('pointerdown',function(){dn=true;});document.addEventListener('pointerup',function(){dn=false;});
    document.documentElement.addEventListener('pointerleave',function(){pen.style.opacity=0;});
    (function loop(t){
      requestAnimationFrame(loop);
      var dx=tx-cx;cx+=dx*.18;cy+=(ty-cy)*.18;vx+=(dx-vx)*.2;
      var target=Math.max(-20,Math.min(20,-vx*.8))+(hov?-8:0)+(dn?8:0);rot+=(target-rot)*.15;
      sc+=((dn?.88:hov?1.14:1)-sc)*.18;
      pen.style.transform='translate3d('+(cx-3)+'px,'+(cy-43+Math.sin(t/650)*2)+'px,0) rotate('+rot.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
    })(0);
  }
  /* Load the desktop spatial world only on capable pointer devices. */
  function load3d(){
    var three=document.createElement('script');three.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    three.onload=function(){
      var gltf=document.createElement('script');gltf.src='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      gltf.onload=function(){var world=document.createElement('script');world.src='js/spatial-world.js';world.onload=function(){window.initPortfolioSpatialWorld();};document.head.appendChild(world);};
      gltf.onerror=function(){console.error('Could not load GLTFLoader.');if(window.__portfolioLoaderWorldReady)window.__portfolioLoaderWorldReady(false);};document.head.appendChild(gltf);
    };
    three.onerror=function(){console.error('Could not load Three.js.');if(window.__portfolioLoaderWorldReady)window.__portfolioLoaderWorldReady(false);};document.head.appendChild(three);
  }
  function start3d(){(window.requestIdleCallback||setTimeout)(load3d);}
  if(root.classList.contains('fx3d')){if(document.readyState==='complete')start3d();else window.addEventListener('load',start3d);}
  /* mobile menu */
  var navBtn=document.querySelector('.nav-toggle'),navEl=document.getElementById('site-nav');
  function navSet(o){root.classList.toggle('nav-open',o);navBtn.setAttribute('aria-expanded',String(o));}
  if(navBtn&&navEl){
    navBtn.addEventListener('click',function(){navSet(!root.classList.contains('nav-open'));});
    navEl.addEventListener('click',function(e){if(e.target.closest('a'))navSet(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('nav-open')){navSet(false);navBtn.focus();}});
    var mq=window.matchMedia('(min-width:768px)'),mqf=function(e){if(e.matches)navSet(false);};mq.addEventListener?mq.addEventListener('change',mqf):mq.addListener(mqf);
  }
  window.__ok=true;
  }catch(err){ console.error(err); }
})();
