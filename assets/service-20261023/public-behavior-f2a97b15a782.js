'use strict';
document.querySelectorAll('[data-mk-video-play]').forEach(button=>{
 const video=document.getElementById(button.dataset.mkVideoPlay);if(!video)return;
 button.addEventListener('click',()=>{if(video.paused){video.muted=false;video.play().catch(()=>{button.textContent='▶ もう一度再生する';});}else{video.pause();}});
 video.addEventListener('play',()=>{button.textContent='Ⅱ 一時停止';});
 video.addEventListener('pause',()=>{button.textContent='▶ 音声付きで再生';});
 video.addEventListener('ended',()=>{button.textContent='▶ もう一度見る';});
});
