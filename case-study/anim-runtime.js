/* Shared runtime for the four product reels.
   - Drives a 10s looping clock (requestAnimationFrame).
   - Applies a global fade-bookend so the loop seam is a soft dissolve.
   - Scales the fixed 1200x750 stage to fit the frame.
   - Exposes window.__seek(seconds) for static frame inspection.

   Usage:  Reel.start(function(t){ ... update DOM from t in [0,10) ... });
   Helpers: Reel.kf, Reel.step, Reel.lerp, Reel.ease  */

(function () {
  var DUR = 10;

  var ease = {
    linear: function (t) { return t; },
    inOut: function (t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    outBack: function (t) { var c1=1.70158,c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); },
    outQuint: function (t) { return 1 - Math.pow(1 - t, 5); },
  };

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  // normalized 0..1 progress across [t0,t1] with optional easing
  function step(t, t0, t1, e){
    if (t <= t0) return 0;
    if (t >= t1) return 1;
    var p = (t - t0) / (t1 - t0);
    return (e || ease.linear)(p);
  }

  // keyframe interpolation: kf(t, [[time,val],...], easeFn)
  function kf(t, frames, e){
    if (t <= frames[0][0]) return frames[0][1];
    var last = frames[frames.length-1];
    if (t >= last[0]) return last[1];
    for (var i=0;i<frames.length-1;i++){
      var a=frames[i], b=frames[i+1];
      if (t>=a[0] && t<=b[0]){
        var p=(t-a[0])/(b[0]-a[0]);
        return lerp(a[1], b[1], (e||ease.linear)(p));
      }
    }
    return last[1];
  }

  function fit(){
    var stage = document.querySelector('.stage');
    if (!stage) return;
    var s = Math.min(window.innerWidth/1200, window.innerHeight/750);
    stage.style.transform = 'scale(' + s + ')';
  }

  function globalFade(t){
    // 0->1 over [0,0.6], hold, 1->0 over [9.2,10]
    if (t < 0.6) return t/0.6;
    if (t > 9.2) return clamp(1 - (t-9.2)/0.8, 0, 1);
    return 1;
  }

  var Reel = {
    ease: ease, lerp: lerp, clamp: clamp, step: step, kf: kf,
    start: function (render) {
      var reel = document.querySelector('.reel') || document.querySelector('.stage');
      var raf = null, t0 = null, paused = false;
      function frame(ts){
        if (t0 == null) t0 = ts;
        var t = ((ts - t0) / 1000) % DUR;
        if (reel) reel.style.opacity = globalFade(t);
        render(t);
        raf = requestAnimationFrame(frame);
      }
      window.__seek = function (sec){
        paused = true;
        if (raf) cancelAnimationFrame(raf);
        var t = ((sec % DUR) + DUR) % DUR;
        if (reel) reel.style.opacity = globalFade(t);
        render(t);
      };
      fit();
      window.addEventListener('resize', fit);
      raf = requestAnimationFrame(frame);
    }
  };

  window.Reel = Reel;
})();
