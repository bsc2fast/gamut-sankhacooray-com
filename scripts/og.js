// Injected into the app at 1200x630 to compose the share image.
(async () => {
  document.querySelector('.bar').remove();
  document.querySelectorAll('.pane, .notes, .caption').forEach(e => e.remove());
  const app = document.querySelector('.app');
  app.style.cssText = 'grid-template-columns: 560px 1fr; padding: 36px 40px 30px 60px; gap: 0;';
  const left = document.createElement('div');
  left.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;font:700 34px Cinzel,serif;letter-spacing:.08em;color:#fff4dc">
      <img src="/icons/icon.svg" style="width:52px;height:52px">GAMUT</div>
    <div style="margin-top:40px;font:700 54px/1.08 Cinzel,serif;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.6)">Scales of the world on one wheel</div>
    <div style="margin-top:22px;font:600 22px/1.5 Manrope,sans-serif;color:#e8e2f0;opacity:.9">See and hear each scale as a shape, in its homeland.</div>
    <div style="margin-top:34px;display:flex;flex-wrap:wrap;gap:8px;max-width:500px">${['Maqam', 'Raga', 'Blues', 'Gamelan', 'Koto', 'Qenet', 'Jazz', 'Melakarta'].map(t => `<span style="padding:8px 15px;border-radius:999px;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);font:700 16px Manrope,sans-serif;color:#fff">${t}</span>`).join('')}</div>
    <div style="margin-top:34px;font:600 18px Manrope,sans-serif;color:#7fe9da">gamut.sankhacooray.com</div>`;
  left.style.cssText = 'align-self:center;position:relative;z-index:2';
  app.prepend(left);
  await document.fonts.ready;
  return 'ok';
})()
