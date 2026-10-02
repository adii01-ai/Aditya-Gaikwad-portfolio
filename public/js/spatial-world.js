(function(){
  function initPortfolioSpatialWorld(){
    var root=document.documentElement,reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile=window.matchMedia('(max-width: 768px)').matches;
    var canvas=document.getElementById('model'),hero=document.querySelector('.hero'),stage=document.querySelector('.hero-stage');
    var navigation=document.querySelector('.hero-navigation'),nodes=Array.prototype.slice.call(document.querySelectorAll('.hero-node'));
    var readoutIndex=document.getElementById('world-index'),readoutTitle=document.getElementById('world-title');
    var readoutDescription=document.getElementById('world-description'),count=document.getElementById('world-count');
    var labels=[
      {title:'ABOUT',description:'INTELLIGENCE, BUILT INTO THE INTERFACE'},
      {title:'WORK',description:'SELECTED DIGITAL PRODUCTS'},
      {title:'SERVICES',description:'DESIGNING AND BUILDING SYSTEMS'},
      {title:'CONTACT',description:'START A CONVERSATION'}
    ];
    if(!canvas||!window.THREE||!THREE.GLTFLoader||!nodes.length)return;

    var renderer;
    try{renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:!isMobile,powerPreference:isMobile?'low-power':'high-performance'});}catch(error){return;}
    renderer.setClearColor(0x000000,0);
    renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=isMobile?.7:.8;

    var scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(isMobile?34:30,1,.1,50);
    var environment=new THREE.Scene();
    environment.background=new THREE.Color(0x050505);
    [[8,3,0,6,0,7],[3,8,-6,0,2,5],[3,8,6,0,-2,4],[10,2,0,-5,3,2],[6,6,0,1,-7,3]].forEach(function(light){
      var panel=new THREE.Mesh(new THREE.PlaneGeometry(light[0],light[1]),new THREE.MeshBasicMaterial({color:new THREE.Color(light[5]*.24,light[5]*.24,light[5]*.24),side:THREE.DoubleSide}));
      panel.position.set(light[2],light[3],light[4]);panel.lookAt(0,0,0);environment.add(panel);
    });
    var pmrem=new THREE.PMREMGenerator(renderer);
    scene.environment=pmrem.fromScene(environment,.03).texture;
    pmrem.dispose();
    scene.add(new THREE.AmbientLight(0xffffff,isMobile?.28:.42));
    var keyLight=new THREE.DirectionalLight(0xffffff,isMobile?.9:1.35);keyLight.position.set(-3,5,7);scene.add(keyLight);
    var fillLight=new THREE.PointLight(0xffffff,isMobile?10:18,isMobile?12:18);fillLight.position.set(3,-2,5);scene.add(fillLight);

    var cameraStops=[],models=[],activeIndex=-1,rawProgress=0,currentProgress=0,frameId=0,visible=true;
    var pointerX=0,pointerY=0,targetPointerX=0,targetPointerY=0,focusUntil=0;
    var scrollRange=0,lastScrollY=-1,routeTimer=0;
    var aimVector=new THREE.Vector3();
    var loadingManager=new THREE.LoadingManager();
    loadingManager.onProgress=function(url,loaded,total){if(window.__portfolioLoaderProgress)window.__portfolioLoaderProgress(loaded,total);};
    var loader=new THREE.GLTFLoader(loadingManager);
    var descriptions=nodes.map(function(node,index){return labels[index]||{title:node.textContent.trim(),description:'PORTFOLIO SECTION'};});

    function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
    function updateCameraStops(){
      var defaultZ=8,halfHeight=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*defaultZ;
      var halfWidth=halfHeight*camera.aspect;
      models.forEach(function(item){
        var depthScale=(defaultZ-item.depth)/defaultZ;
        var itemX=isMobile?50:item.x,itemY=isMobile?50:item.y;
        item.homeX=(itemX/100-.5)*halfWidth*2*depthScale;
        item.homeY=(.5-itemY/100)*halfHeight*2*depthScale;
        var zoomZ=item.zoomZ,objectDistance=zoomZ-item.depth;
        var aimX=isMobile?0:item.index%2===0?.46:.42;
        var aimY=isMobile?-.34:item.index===3?-.06:.03;
        cameraStops[item.index]={
          x:item.homeX-aimX*objectDistance*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect,
          y:item.homeY-aimY*objectDistance*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),
          z:zoomZ
        };
      });
    }
    function layout(){
      var width=canvas.clientWidth,height=canvas.clientHeight;
      if(!width||!height)return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isMobile?1:root.classList.contains('fx-full')?1.5:1.15));
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.updateProjectionMatrix();
      updateCameraStops();
      scrollRange=Math.max(1,hero.offsetHeight-window.innerHeight);
      if(models.length)draw(performance.now()/1000);
    }
    function setActive(index){
      index=clamp(index,0,nodes.length-1);
      if(index===activeIndex)return;
      activeIndex=index;
      nodes.forEach(function(node,nodeIndex){
        var selected=nodeIndex===activeIndex;
        node.classList.toggle('active',selected);
        node.setAttribute('aria-hidden',String(!selected));
        node.tabIndex=selected?0:-1;
      });
      var label=descriptions[activeIndex];
      readoutIndex.textContent=String(activeIndex+1).padStart(2,'0')+' / '+String(nodes.length).padStart(2,'0');
      count.textContent=readoutIndex.textContent;
      readoutTitle.textContent=label.title;
      readoutDescription.textContent=label.description;
    }
    function updateHotspots(){
      models.forEach(function(item){
        item.group.updateMatrixWorld(true);
        var projected=new THREE.Vector3();
        item.group.getWorldPosition(projected);projected.project(camera);
        var node=nodes[item.index];
        var x=(projected.x*.5+.5)*stage.clientWidth,y=(-projected.y*.5+.5)*stage.clientHeight;
        node.style.setProperty('--x',x+'px');node.style.setProperty('--y',y+'px');
      });
    }
    function draw(time){
      if(!cameraStops.length)return;
      var segment=currentProgress*(nodes.length-1),from=Math.floor(segment),to=Math.min(nodes.length-1,from+1);
      var blend=segment-from;blend=blend*blend*(3-2*blend);
      var a=cameraStops[from]||cameraStops[0],b=cameraStops[to]||a;
      if(!a||!b)return;
      var focusBoost=performance.now()<focusUntil?.75:0;
      camera.position.set(a.x+(b.x-a.x)*blend+pointerX*.045,a.y+(b.y-a.y)*blend+pointerY*.035,a.z+(b.z-a.z)*blend-focusBoost);
      aimVector.set(camera.position.x,camera.position.y,0);
      camera.lookAt(aimVector);
      var nearest=clamp(Math.round(segment),0,nodes.length-1);setActive(nearest);
      models.forEach(function(item){
        var distance=Math.abs(segment-item.index),selected=item.index===nearest;
        var scaleTarget=selected?1.28:1;
        item.group.visible=selected;
        item.group.scale.setScalar(item.group.scale.x+(scaleTarget-item.group.scale.x)*.1);
        item.group.position.set(item.homeX+pointerX*.025,item.homeY+Math.sin(time*.55+item.phase)*.025+pointerY*.02,item.depth);
        item.group.rotation.set(item.rotX+pointerY*.045+Math.sin(time*.35+item.phase)*.018,item.rotY+time*(.09+item.index*.008)+pointerX*.08,item.rotZ+Math.sin(time*.3+item.phase)*.014);
      });
      updateHotspots();renderer.render(scene,camera);
      var fade=clamp((currentProgress-.08)/.55,0,1);
      document.querySelector('.hero-text').style.transform='translate3d('+(-fade*2.2)+'vw,0,0)';
      document.querySelector('.hero-text').style.opacity=String(1-fade*.62);
    }
    function animate(time){
      frameId=requestAnimationFrame(animate);
      currentProgress+=(rawProgress-currentProgress)*.075;
      pointerX+=(targetPointerX-pointerX)*.055;pointerY+=(targetPointerY-pointerY)*.055;
      draw(time/1000);
    }
    function start(){if(!frameId&&visible&&!document.hidden&&!reduce)frameId=requestAnimationFrame(animate);}
    function stop(){if(frameId){cancelAnimationFrame(frameId);frameId=0;}}
    function readScroll(){
      var top=hero.getBoundingClientRect().top+window.scrollY;
      rawProgress=clamp((window.scrollY-top)/scrollRange,0,1);
      if(reduce||document.hidden){currentProgress=rawProgress;draw(performance.now()/1000);}else start();
    }
    function moveTo(index,hash){
      index=clamp(index,0,nodes.length-1);
      var target=hero.offsetTop+scrollRange*(index/(nodes.length-1));
      if(reduce||document.hidden){
        var previousBehavior=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo(0,target);root.style.scrollBehavior=previousBehavior;readScroll();
      }else window.scrollTo({top:target,behavior:'smooth'});
      window.clearTimeout(routeTimer);
      if(!hash)return;
      if(reduce||document.hidden){window.location.hash=hash;return;}
      var started=performance.now();
      function finishRoute(){
        if(Math.abs(window.scrollY-target)<3||performance.now()-started>1800){
          window.location.hash=hash;
          return;
        }
        routeTimer=window.setTimeout(finishRoute,60);
      }
      routeTimer=window.setTimeout(finishRoute,60);
    }
    function sectionIndex(hash){return nodes.findIndex(function(node){return node.getAttribute('href')===hash;});}

    nodes.forEach(function(node,index){
      node.addEventListener('click',function(event){event.preventDefault();focusUntil=performance.now()+700;moveTo(index,node.getAttribute('href').slice(1));});
      node.tabIndex=-1;node.setAttribute('aria-hidden','true');
    });
    document.getElementById('world-prev').addEventListener('click',function(){readScroll();moveTo(activeIndex<0?0:activeIndex-1);});
    document.getElementById('world-next').addEventListener('click',function(){readScroll();moveTo(activeIndex<0?1:activeIndex+1);});
    document.addEventListener('click',function(event){
      if(event.defaultPrevented)return;
      var link=event.target.closest&&event.target.closest('a[href^="#"]');
      if(!link||nodes.indexOf(link)>=0)return;
      var index=sectionIndex(link.getAttribute('href'));
      if(index<0)return;
      event.preventDefault();moveTo(index,link.getAttribute('href').slice(1));
    });
    window.addEventListener('scroll',readScroll,{passive:true});
    window.addEventListener('resize',layout,{passive:true});
    if('ResizeObserver' in window){var resizeObserver=new ResizeObserver(layout);resizeObserver.observe(stage);}
    window.addEventListener('pointermove',function(event){
      if(reduce||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
      targetPointerX=(event.clientX/window.innerWidth-.5)*2;targetPointerY=(event.clientY/window.innerHeight-.5)*2;start();
    },{passive:true});
    document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else{readScroll();start();}});
    if('IntersectionObserver' in window)new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;visible?start():stop();}).observe(hero);

    Promise.all(nodes.map(function(node,index){
      return new Promise(function(resolve){
        loader.load('models/'+encodeURIComponent(node.dataset.model),function(gltf){
          var content=gltf.scene;content.updateMatrixWorld(true);
          var bounds=new THREE.Box3().setFromObject(content),center=bounds.getCenter(new THREE.Vector3()),dimensions=bounds.getSize(new THREE.Vector3());
          var modelScale=Number(node.dataset.size)*1.18/Math.max(dimensions.x,dimensions.y,dimensions.z);
          content.position.copy(center).negate().multiplyScalar(modelScale);content.scale.setScalar(isMobile?modelScale*.8:modelScale);
          var group=new THREE.Group();group.visible=false;group.add(content);scene.add(group);
          models.push({group:group,index:index,x:Number(node.dataset.x),y:Number(node.dataset.y),depth:Number(node.dataset.depth),zoomZ:[5.35,5.65,5.3,5.55][index],rotX:[.12,-.18,.2,-.1][index],rotY:[-.35,.42,-.6,.25][index],rotZ:[-.15,.1,.12,-.2][index],phase:index*1.45,homeX:0,homeY:0});
          resolve(true);
        },undefined,function(error){console.error('Could not load hero model:',node.dataset.model,error);resolve(false);});
      });
    })).then(function(results){
      if(!results.some(Boolean)){if(window.__portfolioLoaderWorldReady)window.__portfolioLoaderWorldReady(false);else root.classList.remove('fx3d');return;}
      models.sort(function(a,b){return a.index-b.index;});layout();readScroll();canvas.classList.add('ready');navigation.classList.add('ready');start();
      if(window.__portfolioLoaderWorldReady)window.__portfolioLoaderWorldReady(true);
      var wanted=sectionIndex(window.location.hash);if(wanted>=0&&window.scrollY<hero.offsetTop+scrollRange)moveTo(wanted);
    });
  }
  window.initPortfolioSpatialWorld=initPortfolioSpatialWorld;
})();