const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'store-assets', 'brand');
fs.mkdirSync(outDir, { recursive: true });

const blue = '#1677FF';
const dark = '#0D183D';
const sky = '#2CC7FF';

const mark = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clinicafy">
  <defs>
    <linearGradient id="clinicafyBlue" x1="128" y1="896" x2="896" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="${blue}"/>
      <stop offset="0.55" stop-color="${sky}"/>
      <stop offset="1" stop-color="${blue}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="#FFFFFF"/>
  <path d="M380 128h264c96.8 0 176 79.2 176 176v120h132v264H820v120c0 96.8-79.2 176-176 176H380c-96.8 0-176-79.2-176-176V688H72V424h132V304c0-96.8 79.2-176 176-176Zm0 104c-39.6 0-72 32.4-72 72v228H176v48h240v228c0 39.6 32.4 72 72 72h264c39.6 0 72-32.4 72-72V580h240v-48H716V304c0-39.6-32.4-72-72-72H380Z" fill="url(#clinicafyBlue)"/>
  <path d="M468 372h88v280h-88zM372 468h280v88H372z" fill="${blue}"/>
</svg>`;

const markBlue = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clinicafy">
  <rect width="1024" height="1024" rx="224" fill="${blue}"/>
  <g transform="translate(215 215) scale(.58)">
    <path d="M380 128h264c96.8 0 176 79.2 176 176v120h132v264H820v120c0 96.8-79.2 176-176 176H380c-96.8 0-176-79.2-176-176V688H72V424h132V304c0-96.8 79.2-176 176-176Zm0 104c-39.6 0-72 32.4-72 72v228H176v48h240v228c0 39.6 32.4 72 72 72h264c39.6 0 72-32.4 72-72V580h240v-48H716V304c0-39.6-32.4-72-72-72H380Z" fill="#FFFFFF"/>
    <path d="M468 372h88v280h-88zM372 468h280v88H372z" fill="${blue}"/>
  </g>
</svg>`;

const horizontal = `
<svg width="1800" height="520" viewBox="0 0 1800 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clinicafy">
  <defs>
    <linearGradient id="clinicafyBlueWord" x1="44" y1="430" x2="430" y2="44" gradientUnits="userSpaceOnUse">
      <stop stop-color="${blue}"/>
      <stop offset="0.55" stop-color="${sky}"/>
      <stop offset="1" stop-color="${blue}"/>
    </linearGradient>
  </defs>
  <rect width="1800" height="520" rx="96" fill="#FFFFFF"/>
  <g transform="translate(72 72) scale(.39)">
    <path d="M380 128h264c96.8 0 176 79.2 176 176v120h132v264H820v120c0 96.8-79.2 176-176 176H380c-96.8 0-176-79.2-176-176V688H72V424h132V304c0-96.8 79.2-176 176-176Zm0 104c-39.6 0-72 32.4-72 72v228H176v48h240v228c0 39.6 32.4 72 72 72h264c39.6 0 72-32.4 72-72V580h240v-48H716V304c0-39.6-32.4-72-72-72H380Z" fill="url(#clinicafyBlueWord)"/>
    <path d="M468 372h88v280h-88zM372 468h280v88H372z" fill="${blue}"/>
  </g>
  <text x="506" y="326" font-family="Inter, Arial, Helvetica, sans-serif" font-size="168" font-weight="900" letter-spacing="-8">
    <tspan fill="${dark}">Clinica</tspan><tspan fill="${blue}">fy</tspan>
  </text>
</svg>`;

fs.writeFileSync(path.join(outDir, 'clinicafy-mark.svg'), mark.trim());
fs.writeFileSync(path.join(outDir, 'clinicafy-mark-blue.svg'), markBlue.trim());
fs.writeFileSync(path.join(outDir, 'clinicafy-logo-horizontal.svg'), horizontal.trim());

function html(svg, size) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${size}px;height:${size}px;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style></head><body>${svg}</body></html>`;
}

function squareInstagram() {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1080px;height:1080px;background:#f5fbff;font-family:Inter,Arial,sans-serif}
.wrap{width:1080px;height:1080px;display:grid;place-items:center;background:radial-gradient(circle at 70% 10%,#dff4ff 0,#f5fbff 36%,#fff 100%)}
.card{width:760px;height:760px;border-radius:210px;background:white;display:grid;place-items:center;box-shadow:0 42px 120px rgba(13,24,61,.16)}
svg{width:640px;height:640px}
</style></head><body><div class="wrap"><div class="card">${mark}</div></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const render = async (content, viewport, file) => {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.setContent(content, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(outDir, file), omitBackground: file.includes('transparent') });
    await page.close();
  };

  await render(html(mark, 1024), { width: 1024, height: 1024 }, 'clinicafy-app-icon-1024.png');
  await render(html(markBlue, 1024), { width: 1024, height: 1024 }, 'clinicafy-white-on-blue-1024.png');
  await render(html(mark.replace('<rect width="1024" height="1024" rx="224" fill="#FFFFFF"/>', ''), 1024), { width: 1024, height: 1024 }, 'clinicafy-mark-transparent-1024.png');
  await render(squareInstagram(), { width: 1080, height: 1080 }, 'clinicafy-instagram-profile-1080.png');

  fs.writeFileSync(path.join(outDir, 'README.md'), `# Clinicafy Brand Assets

Arquivos gerados:

- clinicafy-mark.svg
- clinicafy-mark-blue.svg
- clinicafy-logo-horizontal.svg
- clinicafy-app-icon-1024.png
- clinicafy-white-on-blue-1024.png
- clinicafy-mark-transparent-1024.png
- clinicafy-instagram-profile-1080.png

Uso recomendado:

- Instagram: clinicafy-instagram-profile-1080.png
- App Store: clinicafy-app-icon-1024.png
- Google Play: clinicafy-white-on-blue-1024.png ou clinicafy-app-icon-1024.png
- Site/apresentacoes: clinicafy-logo-horizontal.svg

Regenerar:

\`\`\`bash
node scripts/generate-brand-assets.cjs
\`\`\`
`);

  await browser.close();
})();
