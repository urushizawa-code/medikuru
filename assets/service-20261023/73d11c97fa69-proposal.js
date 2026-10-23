'use strict';
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#site-nav');
function setMenu(open){
  if(!menu||!nav)return;
  menu.setAttribute('aria-expanded',String(open));
  nav.classList.toggle('open',open);
  document.body.classList.toggle('hp-menu-open',open);
  const label=menu.querySelector('.visually-hidden');
  if(label)label.textContent=open?'メニューを閉じる':'メニューを開く';
}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
