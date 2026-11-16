/* Phone fallback: phones (iPhone Safari especially) won't show a scroll-scrubbed <video>,
   so on touch devices we draw still frames on a canvas instead. Pages set window.__T (seconds). */
(function(){
  "use strict";
  var cfg=window.__FRAMES; if(!cfg) return;
  var coarse=matchMedia("(pointer: coarse)").matches||/iP(hone|ad|od)/.test(navigator.userAgent);
  if(!coarse) return;
  window.__useFrames=true;
  var imgs=new Array(cfg.count),loaded=0,cv,cx,vid,lastIdx=-1,lastW=0,lastH=0;
  function src(i){return cfg.dir+"f"+("00"+(i+1)).slice(-3)+".jpg";}
  function onload(){loaded++;if(cfg.onProgress)cfg.onProgress(loaded/cfg.count);lastIdx=-1;}
  function load(i){if(imgs[i])return;var im=new Image();im.decoding="async";im.onload=onload;im.onerror=onload;im.src=src(i);imgs[i]=im;}
  /* load the first frame, then a coarse pass, then everything */
  load(0);for(var s=8;s>=1;s=s>>1)for(var i=0;i<cfg.count;i+=s)load(i);
  function nearest(i){for(var d=0;d<cfg.count;d++){var a=imgs[i-d],b=imgs[i+d];if(a&&a.complete&&a.naturalWidth)return a;if(b&&b.complete&&b.naturalWidth)return b;}return null;}
  function setup(){
    vid=document.getElementById(cfg.video);if(!vid)return false;
    cv=document.createElement("canvas");cv.setAttribute("aria-hidden","true");
    vid.parentNode.insertBefore(cv,vid.nextSibling);vid.style.visibility="hidden";cx=cv.getContext("2d");return true;
  }
  function fit(){
    var cs=getComputedStyle(vid);
    ["position","top","bottom","left","right","width","height","-webkit-mask-image","mask-image"].forEach(function(p){cv.style.setProperty(p,cs.getPropertyValue(p));});
    cv.style.pointerEvents="none";
    var r=vid.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    var w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(w!==lastW||h!==lastH){cv.width=w;cv.height=h;lastW=w;lastH=h;lastIdx=-1;}
  }
  function draw(){
    if(!cv&&!setup()){requestAnimationFrame(draw);return;}
    fit();
    var T=window.__T||0,i=Math.max(0,Math.min(cfg.count-1,Math.round(T*cfg.fps)));
    var pos=(vid.style.objectPosition||getComputedStyle(vid).objectPosition||"50% 50%").split(" ");
    var key=i+"|"+pos.join(",");
    if(key!==lastIdx){
      var im=nearest(i);
      if(im){var s=Math.max(cv.width/im.naturalWidth,cv.height/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
        var px=parseFloat(pos[0])/100,py=parseFloat(pos[1]||"50")/100;if(isNaN(px))px=.5;if(isNaN(py))py=.5;
        cx.drawImage(im,(cv.width-w)*px,(cv.height-h)*py,w,h);lastIdx=key;}
    }
    requestAnimationFrame(draw);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",draw);else draw();
})();
