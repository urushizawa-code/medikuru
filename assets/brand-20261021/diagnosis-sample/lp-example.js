(() => {
const root = document.getElementById('mk-acq-example');
if (!root) return;
const tabs = [...root.querySelectorAll('[role="tab"]')];
function select(tab) {
  tabs.forEach(t => {
    const active = t === tab;
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', e => {
    let next;
    if(e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if(e.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
    if(e.key === 'Home') next = tabs[0];
    if(e.key === 'End') next = tabs[tabs.length - 1];
    if(next) { e.preventDefault(); select(next); next.focus(); }
  });
});
})();