'use strict';
const hpMenu=document.querySelector('.menu-toggle'),hpNav=document.querySelector('#site-nav');
function toggleHPMenu(open){hpMenu?.setAttribute('aria-expanded',String(open));hpNav?.classList.toggle('open',open);document.body.classList.toggle('hp-menu-open',open);}
hpMenu?.addEventListener('click',()=>toggleHPMenu(hpMenu.getAttribute('aria-expanded')!=='true'));
hpNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleHPMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleHPMenu(false);});
function hpObserveAtCenter(target, onCenter, insetRatio = .42) {
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
  const stages = [...document.querySelectorAll('.hp-report-sheets')];
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
    const sheets = [...stage.querySelectorAll('.hp-report-page')];
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
      observer = hpObserveAtCenter(stage, () => { if (!consumed && !stopped) playOnce(); });
    } catch (_) { stage.dataset.reportMotion = 'static'; return; }
    window.addEventListener('resize', onResize, {passive: true});
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onReduced);
    stage.addEventListener('click', onOpen);
    stage.dataset.reportMotion = 'idle';
  });
})();


/* Hero time numbers begin while their center is visible in the viewport's middle 80%; other motion keeps the center band. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-hp-motion]:not([data-hp-motion="report"]):not([data-hp-motion="dashboard"])').forEach(target=>{
  const numbers=[...target.querySelectorAll('[data-hp-count],[data-uc-count]')];
  const goals=numbers.map(n=>Number(n.dataset.hpCount||n.dataset.ucCount));
  const arc=target.querySelector('[data-uc-score-arc]');
  let started=false,completed=false,frame=0,observer,animations=[];
  const savedWidths=numbers.map(n=>n.style.minWidth);
  function finish(){
   if(completed)return;completed=true;cancelAnimationFrame(frame);observer?.disconnect();
   numbers.forEach((n,i)=>{n.textContent=String(goals[i]);n.style.minWidth=savedWidths[i];});
   if(arc)arc.setAttribute('stroke-dasharray','45 100');
   animations.forEach(a=>a.cancel());animations=[];
   removeEventListener('resize',onResize);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);
  }
  function onResize(){if(started)finish();}
  function onVisibility(){if(document.hidden&&started)finish();}
  function onReduced(){if(reduced.matches)finish();}
  function play(){
   if(started||completed||document.hidden||reduced.matches){finish();return;}
   started=true;const start=performance.now(),duration=1700;
   numbers.forEach(n=>n.style.minWidth=n.getBoundingClientRect().width+'px');
   function step(now){if(completed)return;const p=Math.min(1,(now-start)/duration),v=1-Math.pow(1-p,3);numbers.forEach((n,i)=>n.textContent=String(Math.round(goals[i]*v)));if(arc)arc.setAttribute('stroke-dasharray',`${45*v} 100`);if(p<1)frame=requestAnimationFrame(step);else finish();}
   target.querySelectorAll('.uc-dashboard-bar-stack').forEach(bar=>animations.push(bar.animate([{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration,easing:'cubic-bezier(.2,.7,.2,1)',fill:'none'})));
   frame=requestAnimationFrame(step);
  }
  if(reduced.matches||!('IntersectionObserver' in window)||!('animate' in Element.prototype)){finish();return;}
  try{observer=hpObserveAtCenter(target,play,target.dataset.hpMotion==='time'?.10:.42);}catch(_){finish();return;}
  addEventListener('resize',onResize,{passive:true});document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onReduced);
 });
})();

/* Dashboard score and opportunity bars: one slow3.4-second play, then the final state. */
(() => {
/* Pass cycles: 3 only for the dashboard score and bars. Other callers keep one play. */
function playCountInView(trigger, numbers, paint, observeAtCenter, {cycles = 1, insetRatio = .42} = {}) {
  if (!trigger) return;
  numbers = Array.from(numbers || []);
  paint = typeof paint === 'function' ? paint : () => {};
  const totalCycles = Math.max(1, Math.min(3, Math.floor(Number(cycles)) || 1));
  const goals = numbers.map(node => {
    const value = Number(node.dataset.ucCount ?? node.dataset.hpCount);
    return Number.isFinite(value) ? value : 0;
  });
  const originalWidths = numbers.map(node => node.style.minWidth || '');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  let completed = false, cycle = 0, phase = 'ready', frameId = 0, holdTimer = 0, observer;
  trigger.dataset.countMotionCycles = String(totalCycles);
  trigger.dataset.countMotionCycle = '0';

  function setPhase(value) {
    phase = value;
    trigger.dataset.countMotion = value;
  }
  function restoreValues() {
    numbers.forEach((node, index) => { node.textContent = String(goals[index]); });
    paint(1);
  }
  function finish(state = 'complete') {
    if (completed) return;
    completed = true;
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frameId);
    clearTimeout(holdTimer);
    observer?.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    reduced?.removeEventListener?.('change', onReduced);
    try { restoreValues(); } catch (_) { /* Static numbers must survive a paint failure. */ }
    numbers.forEach((node, index) => { node.style.minWidth = originalWidths[index]; });
    setPhase(state);
  }
  function inView() {
    const rect = trigger.getBoundingClientRect();
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth;
    return rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width;
  }
  function onReduced() { if (reduced?.matches) finish(); }
  function onResize() {
    const width = window.innerWidth || document.documentElement.clientWidth;
    if (cycle > 0 && width !== viewportWidth) finish();
    viewportWidth = width;
  }
  function onVisibility() { if (cycle > 0 && document.hidden) finish(); }
  function onScroll() {
    if (!completed && phase === 'paused' && inView()) startCycle();
  }
  function nextCycle() {
    holdTimer = 0;
    if (completed) return;
    if (document.hidden || reduced?.matches) { finish(); return; }
    if (!inView()) { setPhase('paused'); return; }
    startCycle();
  }
  function startCycle() {
    if (completed || phase === 'playing' || cycle >= totalCycles) return;
    if (document.hidden || reduced?.matches) { finish(); return; }
    cycle += 1;
    trigger.dataset.countMotionCycle = String(cycle);
    setPhase('playing');
    numbers.forEach(node => {
      const width = node.getBoundingClientRect().width;
      if (width > 0) node.style.minWidth = `${width}px`;
      node.textContent = '0';
    });
    try { paint(0); } catch (_) { finish(); return; }
    const beganAt = performance.now();
    function frame(now) {
      if (completed) return;
      if (document.hidden || reduced?.matches) { finish(); return; }
      const progress = Math.min(1, Math.max(0, (now - beganAt) / 3400));
      const eased = 1 - Math.pow(1 - progress, 3);
      numbers.forEach((node, index) => { node.textContent = String(Math.round(goals[index] * eased)); });
      try { paint(eased); } catch (_) { finish(); return; }
      if (progress < 1) { frameId = requestAnimationFrame(frame); return; }
      frameId = 0;
      if (cycle >= totalCycles) { finish(); return; }
      // Hold the readable final state before another bounded play. Offscreen time
      // never consumes a new cycle; a scroll back into view resumes the remainder.
      setPhase('holding');
      holdTimer = setTimeout(nextCycle, 1100);
    }
    frameId = requestAnimationFrame(frame);
  }

  if (reduced?.matches || typeof observeAtCenter !== 'function' || typeof requestAnimationFrame !== 'function') {
    finish('static');
    return {finish};
  }
  setPhase('ready');
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onResize, {passive: true});
  document.addEventListener('visibilitychange', onVisibility);
  reduced?.addEventListener?.('change', onReduced);
  try {
    observer = observeAtCenter(trigger, () => {
      if (phase !== 'ready' || completed) return;
      observer?.disconnect();
      startCycle();
    }, insetRatio);
  } catch (_) { finish('static'); }
  return {finish};
}

  const score = document.querySelector('#report-benefit .uc-dashboard-score');
  const number = score?.querySelector('[data-uc-count]');
  const arc = score?.querySelector('[data-uc-score-arc]');
  if (number && arc) {
    const goal = Number(number.dataset.ucCount);
    playCountInView(score, [number], progress => {
      arc.setAttribute('stroke-dasharray', `${goal * progress} 100`);
      arc.style.opacity = progress === 0 ? '0' : '';
    }, hpObserveAtCenter, {cycles: 1});
  }
  const graph = document.querySelector('#report-benefit .uc-dashboard-bars');
  const stacks = [...(graph?.querySelectorAll('.uc-dashboard-bar-stack') || [])];
  if (stacks.length === 2) {
    playCountInView(graph, [], progress => {
      stacks.forEach((stack, index) => {
        const amount = index === 0 ? Math.min(1, progress / .7) : Math.max(0, (progress - .12) / .88);
        stack.style.clipPath = progress === 1 ? '' : `inset(${(1 - amount) * 100}% 0 0 0)`;
      });
    }, hpObserveAtCenter, {cycles: 1});
  }
})();
