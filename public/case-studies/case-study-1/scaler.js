// Scales the fixed 1200×750 .stage to fit its frame, preserving aspect.
(function () {
  function fit() {
    var stage = document.querySelector('.stage');
    if (!stage) return;
    var s = Math.min(window.innerWidth / 1200, window.innerHeight / 750);
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  document.addEventListener('DOMContentLoaded', fit);
  fit();
})();
