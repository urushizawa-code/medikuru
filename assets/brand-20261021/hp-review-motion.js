/* Homepage diagrams reveal once; research charts replay on a fresh viewport entry.
   Text, published values and navigation remain unchanged. */
(() => {
  'use strict';

  const start = () => {
    if (!document.body.classList.contains('corporate')) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !('IntersectionObserver' in window)) return;


    // Keep immutable final values so replay never reads an in-progress number.
    const counterValues = new WeakMap();
    const counterFrames = new Map();
    const counter = el => {
      if (!el) return null;
      if (counterValues.has(el)) return counterValues.get(el);
      const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && /^\s*\d+(?:\.\d+)?\s*$/.test(n.nodeValue));
      if (!node) return null;
      const text = node.nodeValue;
      const decimals = (text.trim().split('.')[1] || '').length;
      const value = {node, text, decimals, target: Number(text.trim())};
      counterValues.set(el, value);
      return value;
    };
    const finishNumber = el => {
      if (!el) return;
      cancelAnimationFrame(counterFrames.get(el));
      counterFrames.delete(el);
      const value = counter(el);
      if (value) value.node.nodeValue = value.text;
    };
    const countNumber = (el, duration = 1200) => {
      const value = counter(el);
      if (!value) return;
      finishNumber(el);
      if (reduced.matches || value.target === 0) return;
      const started = performance.now();
      value.node.nodeValue = (0).toFixed(value.decimals);
      const tick = now => {
        const p = Math.min(1, (now - started) / duration);
        value.node.nodeValue = (value.target * (1 - Math.pow(1 - p, 3))).toFixed(value.decimals);
        if (p < 1) counterFrames.set(el, requestAnimationFrame(tick));
        else finishNumber(el);
      };
      counterFrames.set(el, requestAnimationFrame(tick));
    };
    document.querySelectorAll('#research .donut strong, #research .bar-value, #research .delta, #research .future-highlight strong').forEach(counter);

    const targets = document.querySelectorAll([
      '.strategy-hero-visual',
      '.official-media-strip .official-media-logos',
      '#services .hp-value-pillars',
      '#services .service-grid',
      '#branding .branding-equation .branding-operand',
      '#branding .branding-equation .branding-multiply',
      '#branding .branding-journey-steps > li',
      '#research .review-data',
      '#research .future-graphic',
      '#news-comparison .interview-process',
      '#ai-comparison .citation-targets',
      '#ai-comparison .three-pillars',
      '#simulation .model-future-charts figure',
      '#pricing .price-grid',
      '#pricing .process-grid',
      '#pricing .strategy-roi__math'
    ].join(','));
    // The longest CSS sequence ends at 3360ms; keep its fill until it finishes.
    const playbackCleanupMs = 4000;
    const timers = new Map();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target;
        observer.unobserve(target);
        if (reduced.matches) continue;
        target.classList.add('hp-motion-play');
        timers.set(target, window.setTimeout(() => {
          target.classList.remove('hp-motion-play');
          timers.delete(target);
        }, playbackCleanupMs));
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -18% 0px' });

    targets.forEach(target => observer.observe(target));

    // Observe the actual plots. A tall card can enter before its bars are visible.
    const charts = document.querySelectorAll('#research .review-data > .donut, #research .adoption-card > .bar-chart');
    const visibleCharts = new Set();
    const chartRuns = new Map();
    const finishChart = (target) => {
      const run = chartRuns.get(target);
      if (run) {
        window.cancelAnimationFrame(run.frame);
        window.clearTimeout(run.timer);
      }
      target.classList.remove('hp-chart-play');
      target.querySelectorAll('strong,.bar-value').forEach(finishNumber);
      finishNumber(target.closest('.adoption-card')?.querySelector('.delta'));
      target.style.removeProperty('--hp-donut-progress');
      target.closest('.adoption-card')?.classList.remove('hp-chart-playing');
      chartRuns.delete(target);
    };
    const playChart = (target) => {
      finishChart(target);
      const isDonut = target.classList.contains('donut');
      const percentage = isDonut ? counter(target.querySelector('strong'))?.target : 0;
      if (isDonut && !Number.isFinite(percentage)) return;
      const run = { frame: 0, timer: 0 };
      chartRuns.set(target, run);
      if (isDonut) target.style.setProperty('--hp-donut-progress', '0%');
      target.classList.add('hp-chart-play');
      if (isDonut) countNumber(target.querySelector('strong'));
      else { target.querySelectorAll('.bar-value').forEach(el => countNumber(el)); countNumber(target.closest('.adoption-card')?.querySelector('.delta')); }
      target.closest('.adoption-card')?.classList.add('hp-chart-playing');
      if (isDonut) {
        let startedAt;
        const draw = (now) => {
          if (startedAt === undefined) startedAt = now;
          const progress = Math.min((now - startedAt) / 1200, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          target.style.setProperty('--hp-donut-progress', `${percentage * eased}%`);
          if (progress < 1) run.frame = window.requestAnimationFrame(draw);
          else finishChart(target);
        };
        run.frame = window.requestAnimationFrame(draw);
      } else {
        // Bars: 1100ms + 200ms stagger; result emphasis ends at 1400ms.
        run.timer = window.setTimeout(() => finishChart(target), 1600);
      }
    };
    const chartObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target;
        if (!entry.isIntersecting) {
          visibleCharts.delete(target);
          finishChart(target);
          continue;
        }
        const threshold = target.classList.contains('donut') ? 0.45 : 0.85;
        if (entry.intersectionRatio < threshold || visibleCharts.has(target) || reduced.matches) continue;
        visibleCharts.add(target);
        playChart(target);
      }
    }, { threshold: [0, 0.45, 0.85], rootMargin: '-70px 0px -12% 0px' });
    charts.forEach(target => chartObserver.observe(target));


    // The new phone result and six-month chart share the same scroll-triggered rhythm.
    const groups = [...document.querySelectorAll('.review-phone, .review-report-chart, .mkc-card, #research .future-highlight')];
    const groupRuns = new Map();
    const valuesFor = group => [...group.querySelectorAll('.review-phone-score>b,.review-phone-appearance b,.review-report-column>b>span,.mkc-value>strong')].concat(group.matches('.future-highlight') ? [...group.querySelectorAll('strong')] : []);
    groups.forEach(group => valuesFor(group).forEach(counter));
    const finishGroup = group => {
      const run = groupRuns.get(group);
      if (run) { run.animations.forEach(animation => animation.cancel()); clearTimeout(run.timer); }
      valuesFor(group).forEach(finishNumber);
      groupRuns.delete(group);
      group.dataset.reviewMotion = 'complete';
    };
    const groupObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const group = entry.target;
        if (!entry.isIntersecting) { if (groupRuns.has(group)) finishGroup(group); continue; }
        if (entry.intersectionRatio < .4 || groupRuns.has(group) || group.dataset.reviewMotion === 'complete' || reduced.matches) continue;
        group.dataset.reviewMotion = 'playing';
        valuesFor(group).forEach(el => countNumber(el));
        const animations = [...group.querySelectorAll('.review-phone-bar>span,.review-report-track>i')].map((bar, index) => {
          const horizontal = bar.matches('.review-phone-bar>span');
          return bar.animate([{transform: horizontal ? 'scaleX(0)' : 'scaleY(0)'},{transform: horizontal ? 'scaleX(1)' : 'scaleY(1)'}], {duration:1200,delay:index*100,easing:'cubic-bezier(.22,.65,.3,1)',fill:'both'});
        });
        groupRuns.set(group, {animations, timer:setTimeout(() => finishGroup(group), 1500)});
      }
    }, {threshold:[0,.4],rootMargin:'-60px 0px -8% 0px'});
    groups.forEach(group => { group.dataset.reviewMotion = 'idle'; groupObserver.observe(group); });
    const finishAllNumbers = () => {
      [...counterFrames.keys()].forEach(finishNumber);
      [...groupRuns.keys()].forEach(finishGroup);
    };
    reduced.addEventListener('change', () => {
      if (reduced.matches) { groupObserver.disconnect(); finishAllNumbers(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) finishAllNumbers(); });
    window.addEventListener('pagehide', finishAllNumbers, {once:true});

    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      observer.disconnect();
      chartObserver.disconnect();
      charts.forEach(finishChart);
      visibleCharts.clear();
      timers.forEach((timer, target) => {
        window.clearTimeout(timer);
        target.classList.remove('hp-motion-play');
      });
      timers.clear();
    }, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
