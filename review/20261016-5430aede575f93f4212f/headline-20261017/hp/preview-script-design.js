
(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const setMenu = open => { if (!menu || !nav) return; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); document.body.classList.toggle('hp-menu-open', open); menu.querySelector('.visually-hidden').textContent = open ? 'メニューを閉じる' : 'メニューを開く'; };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  const dialog = document.querySelector('#consult-dialog');
  let lastTrigger = null;
  document.querySelectorAll('[data-consult]').forEach(button => button.addEventListener('click', () => { lastTrigger = button; setMenu(false); dialog?.showModal(); }));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog?.close()));
  dialog?.addEventListener('click', e => { if(e.target === dialog) { const box = dialog.getBoundingClientRect(); if(e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close(); } });
  dialog?.addEventListener('close', () => lastTrigger?.focus());
  document.addEventListener('keydown', e => { if(e.key === 'Escape') setMenu(false); });
  document.querySelectorAll('[data-calculator]').forEach(calculator => { const slider = calculator.querySelector('input'); const update = () => { const profit = Number(slider.value); calculator.querySelector('[data-profit-value]').textContent = `${profit}万円`; calculator.querySelector('[data-ai-deals]').textContent = Math.ceil(18 / profit); calculator.querySelector('[data-first-deals]').textContent = Math.ceil(48 / profit); slider.setAttribute('aria-valuetext', `1件あたりの限界利益${profit}万円`); }; slider.addEventListener('input', update); update(); });

  document.querySelectorAll('[data-future-chart]').forEach(chart => {
    const result = chart.querySelector('[data-future-result]');
    const number = result?.firstChild;
    if (!number || number.nodeType !== Node.TEXT_NODE) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let target = Number.parseFloat(number.nodeValue);
    let frame = 0;
    let visible = false;
    const finish = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      number.nodeValue = target.toFixed(1);
    };
    const play = () => {
      finish();
      if (reduced.matches || !visible) return;
      number.nodeValue = '0.0';
      let started;
      const draw = now => {
        if (started === undefined) started = now;
        const progress = Math.min((now - started) / 1700, 1);
        number.nodeValue = (target * (1 - Math.pow(1 - progress, 3))).toFixed(1);
        if (progress < 1) frame = window.requestAnimationFrame(draw);
        else finish();
      };
      frame = window.requestAnimationFrame(draw);
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            visible = false;
            finish();
          } else if (entry.intersectionRatio >= 0.6 && !visible) {
            visible = true;
            play();
          }
        }
      }, { threshold: [0, 0.6], rootMargin: '-70px 0px -10% 0px' });
      observer.observe(result);
    }
    reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
    chart.querySelectorAll('[data-future-control]').forEach(button => button.addEventListener('click', () => {
      const scenario = button.dataset.futureControl;
      chart.querySelectorAll('[data-future-control]').forEach(b => { const active = b === button; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
      chart.querySelectorAll('[data-future-line]').forEach(line => { const active = line.dataset.futureLine === scenario; line.setAttribute('stroke-width',active?'3.5':'1.6'); line.setAttribute('opacity',active?'1':'.55'); });
      target = scenario === 'half' ? 89.0 : 63.2;
      play();
      chart.querySelector('[data-future-assumption]').textContent = `直近の平均増加幅の${scenario === 'half' ? '半分' : '4分の1'}が続くと仮定`;
    }));
  });
})();
