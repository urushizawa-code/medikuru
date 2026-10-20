/* Keep the approved result visible without JS; animate once when it is in view. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-score-target]').forEach(card => {
    const target = Number(card.dataset.scoreTarget);
    const number = card.querySelector('.mk8-score-number');
    const arc = card.querySelector('.mk8-score-arc');
    if (!Number.isFinite(target) || !number || !arc) return;
    let frame = 0;
    let started = false;
    let observer;
    const render = value => {
      number.textContent = String(Math.floor(value));
      arc.setAttribute('stroke-dasharray', `${value} 100`);
    };
    const finish = state => {
      cancelAnimationFrame(frame);
      render(target);
      card.dataset.scoreMotion = state;
      observer?.disconnect();
    };
    if (reduced.matches || !('IntersectionObserver' in window)) {
      finish(reduced.matches ? 'reduced' : 'static');
      return;
    }
    const play = () => {
      if (started) return;
      started = true;
      observer.disconnect();
      card.dataset.scoreMotion = 'playing';
      render(0);
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / 1100, 1);
        render(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else finish('complete');
      };
      frame = requestAnimationFrame(tick);
    };
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .6)) play();
    }, {threshold: .6});
    card.dataset.scoreMotion = 'idle';
    observer.observe(card);
    reduced.addEventListener('change', () => { if (reduced.matches) finish('reduced'); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && started) finish('complete'); });
    window.addEventListener('pagehide', () => finish('complete'), {once: true});
  });
})();
