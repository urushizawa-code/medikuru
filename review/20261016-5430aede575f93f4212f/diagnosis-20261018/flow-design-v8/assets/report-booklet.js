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
