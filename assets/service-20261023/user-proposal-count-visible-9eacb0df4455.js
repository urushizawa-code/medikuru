(() => {
  const dialog = document.querySelector('.mk8-report-dialog');
  if (!dialog) return;
  let trigger;
  document.querySelectorAll('[data-mk8-report-open]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      dialog.showModal();
      dialog.scrollTop = 0;
      dialog.querySelector('.mk8-dialog-close').focus();
    });
  });
  dialog.querySelector('.mk8-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => trigger?.focus());
})();

/* All scroll-led motion starts when the target's center enters the viewport's middle band. */
function ucObserveAtCenter(target, onCenter, insetRatio = .42) {
  const marker = document.createElement('span');
  marker.setAttribute('aria-hidden', 'true');
  marker.setAttribute('data-uc-motion-center', '');
  marker.style.cssText = 'position:absolute;left:50%;top:50%;width:1px;height:1px;pointer-events:none;';
  const oldPosition = target.style.position;
  const positioned = getComputedStyle(target).position === 'static';
  if (positioned) target.style.position = 'relative';
  target.appendChild(marker);
  let observer, disconnected = false;
  function disconnect() {
    if (disconnected) return;
    disconnected = true;
    observer?.disconnect();
    window.removeEventListener('resize', rebuild);
    marker.remove();
    if (positioned && target.style.position === 'relative') target.style.position = oldPosition;
  }
  function rebuild() {
    if (disconnected) return;
    observer?.disconnect();
    // Vertical rootMargin percentages use width; pixels keep the same center band on phones.
    const height = window.innerHeight || document.documentElement.clientHeight;
    const inset = Math.floor(height * insetRatio);
    observer = new IntersectionObserver(entries => {
      if (disconnected || !entries.some(entry => entry.target === marker && entry.isIntersecting)) return;
      disconnect();
      onCenter();
    }, {root: null, rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0});
    observer.observe(marker);
  }
  try {
    rebuild();
    window.addEventListener('resize', rebuild, {passive: true});
  } catch (error) { disconnect(); throw error; }
  return {disconnect};
}

/* Approved report fan motion, 2026-10-04. The static composition is the fallback. */
(() => {
  'use strict';
  const stages = [...document.querySelectorAll('.mk8-booklet-stage')];
  if (!('IntersectionObserver' in window) || !('animate' in Element.prototype)) {
    stages.forEach(stage => { stage.dataset.reportMotion = 'static'; });
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    stages.forEach(stage => { stage.dataset.reportMotion = 'reduced'; });
    return;
  }

  stages.forEach(stage => {
    const sheets = [...stage.querySelectorAll('.mk8-booklet-sheet')];
    if (sheets.some(img => !img)) return;
    let consumed = false;
    let stopped = false;
    let animations = [];
    let readyTimer;
    let watchdog;
    let observer;

    function removeListeners() {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onReduced);
      stage.removeEventListener('click', onOpen);
    }

    function restore(state = 'static') {
      stopped = true;
      clearTimeout(readyTimer);
      clearTimeout(watchdog);
      animations.forEach(animation => animation.cancel());
      animations = [];
      observer?.disconnect();
      removeListeners();
      stage.dataset.reportMotion = state;
    }

    function onResize() { if (consumed) restore(); }
    function onVisibility() { if (document.hidden && consumed) restore(); }
    function onReduced() { if (reduced.matches) restore(); }
    // Do not prevent or replace the existing report-sample click handler.
    function onOpen() { restore(); }

    async function playOnce() {
      consumed = true;
      observer.disconnect();
      stage.dataset.reportMotion = 'waiting';
      try {
        const decoded = sheets.map(img => typeof img.decode === 'function'
          ? img.decode()
          : (img.complete && img.naturalWidth > 0 ? Promise.resolve() : Promise.reject()));
        await Promise.race([
          Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), ...decoded]),
          new Promise((_, reject) => {
            readyTimer = setTimeout(() => reject(new Error('Report images were not ready')), 5000);
          })
        ]);
        clearTimeout(readyTimer);
        if (stopped) return;
        if (reduced.matches || document.hidden || sheets.some(img => img.naturalWidth === 0)) {
          restore();
          return;
        }
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (!width || !height) { restore(); return; }
        const positions = sheets.map(img => ({
          img,
          end: getComputedStyle(img).transform,
          dx: width * .5 - img.offsetLeft - img.offsetWidth / 2,
          dy: height * .47 - img.offsetTop - img.offsetHeight / 2
        }));
        stage.dataset.reportMotion = 'playing';
        // Sheets only: preserve the stage position, including LP's .4% optical centering.
        // Close in 230 ms, hold 180 ms, then unfold 5 -> 1 with a 100 ms stagger.
        positions.forEach(({img, end, dx, dy}, index) => {
          const stacked = `translate(${dx}px, ${dy}px) rotate(0deg) scale(.98)`;
          const start = 410 + index * 100;
          const duration = start + 850;
          animations.push(img.animate([
            {transform: end, offset: 0, easing: 'cubic-bezier(.4,0,.2,1)'},
            {transform: stacked, offset: 230 / duration},
            {transform: stacked, offset: start / duration, easing: 'cubic-bezier(.2,.75,.2,1)'},
            {transform: end, offset: 1}
          ], {duration, fill: 'none'}));
        });
        watchdog = setTimeout(() => restore(), 2400);
        await Promise.all(animations.map(animation => animation.finished));
        if (!stopped) restore('complete');
      } catch (_) {
        // A decode, layout, or animation failure must never hide or leave sheets stacked.
        restore();
      }
    }

    try {
      observer = ucObserveAtCenter(stage, () => { if (!consumed && !stopped) playOnce(); });
    } catch (_) { stage.dataset.reportMotion = 'static'; return; }
    window.addEventListener('resize', onResize, {passive: true});
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onReduced);
    stage.addEventListener('click', onOpen);
    stage.dataset.reportMotion = 'idle';
  });
})();

/* Restore the October 18 count-up timing; keep final values as the static fallback. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function playOnceInView(trigger, numbers, paint = () => {}, insetRatio = .42) {
    if (!trigger) return;
    const targets = numbers.map(node => Number(node.dataset.ucCount));
    const originalWidths = numbers.map(node => node.style.minWidth);
    let started = false, completed = false, frameId = 0, observer;

    function finish() {
      if (completed) return;
      completed = true;
      cancelAnimationFrame(frameId);
      numbers.forEach((node, index) => {
        node.textContent = String(targets[index]);
        node.style.minWidth = originalWidths[index];
      });
      paint(1);
      observer?.disconnect();
      reduced.removeEventListener?.('change', onReduced);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      trigger.dataset.countMotion = 'complete';
    }
    function onReduced() { if (reduced.matches) finish(); }
    function onResize() { if (started) finish(); }
    function onVisibility() { if (document.hidden && started) finish(); }

    if (reduced.matches || !('IntersectionObserver' in window) || !('requestAnimationFrame' in window)) {
      numbers.forEach((node, index) => { node.textContent = String(targets[index]); });
      paint(1);
      trigger.dataset.countMotion = 'static';
      return;
    }
    function start() {
      if (started || completed) return;
      started = true;
      trigger.dataset.countMotion = 'playing';
      numbers.forEach(node => {
        const width = node.getBoundingClientRect().width;
        if (width > 0) node.style.minWidth = `${width}px`;
        node.textContent = '0';
      });
      paint(0);
      const beganAt = performance.now();
      function frame(now) {
        if (completed) return;
        if (reduced.matches) { finish(); return; }
        const progress = Math.min(1, Math.max(0, (now - beganAt) / 1700));
        const eased = 1 - Math.pow(1 - progress, 3);
        numbers.forEach((node, index) => { node.textContent = String(Math.round(targets[index] * eased)); });
        paint(eased);
        if (progress < 1) frameId = requestAnimationFrame(frame);
        else finish();
      }
      frameId = requestAnimationFrame(frame);
    }
    try {
      observer = ucObserveAtCenter(trigger, start, insetRatio);
      reduced.addEventListener?.('change', onReduced);
      window.addEventListener('resize', onResize, {passive: true});
      document.addEventListener('visibilitychange', onVisibility);
      trigger.dataset.countMotion = 'ready';
    } catch (_) { finish(); }
  }

  const hero = document.querySelector('#mkf-new-hero .uc-era-count');
  // Hero time numbers may already sit above the narrow center band on a phone.
  playOnceInView(hero, [...(hero?.querySelectorAll('[data-uc-count]') || [])], () => {}, .10);

  const score = document.querySelector('.uc-dashboard-score');
  const scoreNumber = score?.querySelector('[data-uc-count]');
  const arc = score?.querySelector('[data-uc-score-arc]');
  if (scoreNumber && arc) {
    const target = Number(scoreNumber.dataset.ucCount);
    playOnceInView(score, [scoreNumber], progress => {
      arc.setAttribute('stroke-dasharray', `${target * progress} 100`);
      arc.style.opacity = progress === 0 ? '0' : '';
    });
  }

  const graph = document.querySelector('.uc-dashboard-bars');
  const stacks = [...(graph?.querySelectorAll('.uc-dashboard-bar-stack') || [])];
  if (stacks.length === 2) {
    playOnceInView(graph, [], progress => {
      stacks.forEach((stack, index) => {
        const value = index === 0 ? Math.min(1, progress / .7) : Math.max(0, (progress - .12) / .88);
        stack.style.clipPath = progress === 1 ? '' : `inset(${(1 - value) * 100}% 0 0 0)`;
      });
    });
  }

  const marketPlot = document.querySelector('.uc-market-plot');
  const marketMask = marketPlot?.querySelector('[data-uc-market-mask]');
  if (marketMask) {
    playOnceInView(marketPlot, [], progress => {
      marketMask.setAttribute('width', String(420 * progress));
    });
  }
})();

/* Keep one registration button available after the first button leaves view. */
(() => {
  const first=document.querySelector('#free-diagnosis .faithful-line-cta');
  const floating=document.querySelector('.uc-floating-cta');
  if(!first||!floating)return;
  let scheduled=false;
  const update=()=>{
    scheduled=false;
    const visible=first.getBoundingClientRect().bottom<=0;
    floating.hidden=!visible;
    floating.classList.toggle('mk-sticky-visible',visible);
  };
  const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',update);
  update();
})();
