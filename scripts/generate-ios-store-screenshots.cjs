const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'store-assets', 'ios');
const iphoneDir = path.join(outRoot, 'iphone-6-9');
const ipadDir = path.join(outRoot, 'ipad-13');

for (const dir of [iphoneDir, ipadDir]) fs.mkdirSync(dir, { recursive: true });

const iphoneScenes = [
  {
    file: '01-dashboard-clinica.png',
    title: 'Sistema inteligente para clínicas modernas',
    subtitle: 'Dashboard com pacientes, consultas, agenda e gestão em tempo real.',
    screen: 'dashboard',
  },
  {
    file: '02-prontuario-eletronico.png',
    title: 'Prontuário eletrônico em um toque',
    subtitle: 'Histórico do paciente, evolução clínica e documentos sempre organizados.',
    screen: 'patient',
  },
  {
    file: '03-agenda-medica.png',
    title: 'Agenda médica sem conflito',
    subtitle: 'Acompanhe horários, status e próximos atendimentos de forma clara.',
    screen: 'agenda',
  },
  {
    file: '04-guias-tiss-tuss.png',
    title: 'Guias TISS/TUSS organizadas',
    subtitle: 'Controle status, autorização, convênio, CID e TUSS no mesmo fluxo.',
    screen: 'guides',
  },
  {
    file: '05-recibos-pdf.png',
    title: 'Recibos em PDF e exportações',
    subtitle: 'Emita recibos, baixe PDF individual e exporte o histórico financeiro.',
    screen: 'receipts',
  },
  {
    file: '06-relatorios-gestao.png',
    title: 'Relatórios para decisões melhores',
    subtitle: 'Veja produtividade, evolução dos atendimentos e indicadores da clínica.',
    screen: 'reports',
  },
  {
    file: '07-seguranca-lgpd.png',
    title: 'Dados centralizados e acesso autenticado',
    subtitle: 'Mais controle para reduzir planilhas soltas e compartilhamentos informais.',
    screen: 'security',
  },
  {
    file: '08-plano-gratis.png',
    title: 'Comece grátis, sem cartão',
    subtitle: 'Plano Básico para organizar a rotina e evoluir quando a clínica crescer.',
    screen: 'pricing',
  },
];

const ipadScenes = [
  {
    file: '01-ipad-dashboard-agenda.png',
    title: 'Visão completa da clínica',
    subtitle: 'Dashboard e agenda lado a lado para operar com mais clareza.',
    screen: 'ipadDashboard',
  },
  {
    file: '02-ipad-prontuario.png',
    title: 'Prontuário amplo para iPad',
    subtitle: 'Linha do tempo, dados do paciente e evolução clínica em tela maior.',
    screen: 'ipadPatient',
  },
  {
    file: '03-ipad-faturamento.png',
    title: 'Recibos, guias e gestão financeira',
    subtitle: 'Documentos operacionais e indicadores para reduzir retrabalho.',
    screen: 'ipadBilling',
  },
  {
    file: '04-ipad-seguranca-planos.png',
    title: 'Planos claros e rotina segura',
    subtitle: 'Comece no Básico e avance para recursos profissionais quando precisar.',
    screen: 'ipadPlans',
  },
];

function brandMark() {
  return `
    <svg width="86" height="86" viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="mark" x1="12" y1="84" x2="84" y2="12">
          <stop stop-color="#1677FF" />
          <stop offset="0.55" stop-color="#2CC7FF" />
          <stop offset="1" stop-color="#00A3FF" />
        </linearGradient>
      </defs>
      <path d="M36 8h24c8.8 0 16 7.2 16 16v12h12v24H76v12c0 8.8-7.2 16-16 16H36c-8.8 0-16-7.2-16-16V60H8V36h12V24C20 15.2 27.2 8 36 8Zm0 10c-3.3 0-6 2.7-6 6v22H18v4h22v22c0 3.3 2.7 6 6 6h24c3.3 0 6-2.7 6-6V50h22v-4H66V24c0-3.3-2.7-6-6-6H36Z" fill="url(#mark)" />
      <path d="M44 35h8v26h-8zM35 44h26v8H35z" fill="#1677FF" />
    </svg>`;
}

function miniChart() {
  return `
    <div class="chart">
      <span style="height:38%"></span><span style="height:58%"></span><span style="height:45%"></span>
      <span style="height:72%"></span><span style="height:62%"></span><span style="height:86%"></span>
    </div>`;
}

function phoneScreen(type) {
  const metric = (label, value, tone = 'blue') => `<div class="metric ${tone}"><b>${value}</b><small>${label}</small></div>`;
  const row = (a, b, c = '') => `<div class="row"><span>${a}</span><strong>${b}</strong>${c ? `<em>${c}</em>` : ''}</div>`;

  const screens = {
    dashboard: `
      <div class="appbar">${brandMark()}<div><b>Clinicafy</b><small>Dashboard</small></div></div>
      <div class="hello">Olá, Dra. Ana</div>
      <div class="grid2">${metric('Pacientes', '128')}${metric('Realizadas', '42', 'sky')}${metric('Agendadas', '18', 'indigo')}${metric('Pendentes', '3', 'amber')}</div>
      <div class="panel"><h3>Agenda de hoje</h3>${row('09:00', 'Mariana Costa', 'Consulta')}${row('10:30', 'Carlos Lima', 'Retorno')}${row('14:00', 'Fernanda Alves', 'Telemedicina')}</div>
      <div class="panel dark"><h3>Resumo da clínica</h3>${miniChart()}</div>`,
    patient: `
      <div class="appbar">${brandMark()}<div><b>Mariana Costa</b><small>Prontuário</small></div></div>
      <div class="profile"><div>MC</div><span><b>Mariana Costa</b><small>32 anos • Convênio</small></span></div>
      <div class="panel"><h3>Linha do tempo</h3>${row('Hoje', 'Evolução registrada', 'Dor lombar')}${row('12 mai', 'Receita anexada', 'PDF')}${row('02 mai', 'Consulta inicial', 'Anamnese')}</div>
      <div class="notes"><b>Conduta</b><p>Orientação clínica, retorno programado e exames anexados ao histórico.</p></div>`,
    agenda: `
      <div class="appbar">${brandMark()}<div><b>Agenda</b><small>Maio 2026</small></div></div>
      <div class="calendar">${['Seg','Ter','Qua','Qui','Sex'].map((d,i)=>`<div class="${i===2?'active':''}">${d}<b>${18+i}</b></div>`).join('')}</div>
      <div class="panel"><h3>Próximos horários</h3>${row('09:00', 'Consulta confirmada', 'Sala 1')}${row('10:30', 'Retorno agendado', 'Sala 2')}${row('15:00', 'Aguardando status', 'Vencida')}</div>
      <div class="tagline">Status claro para consultas realizadas, canceladas ou remarcadas.</div>`,
    guides: `
      <div class="appbar">${brandMark()}<div><b>Guias</b><small>TISS/TUSS</small></div></div>
      <div class="panel"><h3>Guia autorizada</h3>${row('Operadora', 'Unimed Rio')}${row('Registro ANS', '393321')}${row('Carteira', '0089123456')}${row('CID / TUSS', 'M54.5 • 10101012')}</div>
      <div class="statusline"><span>Rascunho</span><span class="on">Autorizada</span><span>Enviada</span></div>
      <div class="notes"><b>PDF operacional</b><p>Dados estruturados para conferência e faturamento da clínica.</p></div>`,
    receipts: `
      <div class="appbar">${brandMark()}<div><b>Recibos</b><small>Financeiro</small></div></div>
      <div class="amount">R$ 8.420,00<small>Total em maio</small></div>
      <div class="panel"><h3>Recibos emitidos</h3>${row('Nº 0042', 'R$ 350,00', 'PDF')}${row('Nº 0041', 'R$ 420,00', 'PDF')}${row('Nº 0040', 'R$ 280,00', 'XLS')}</div>
      <div class="actions"><span>PDF individual</span><span>PDF todos</span><span>XLS</span></div>`,
    reports: `
      <div class="appbar">${brandMark()}<div><b>Relatórios</b><small>Gestão</small></div></div>
      <div class="grid2">${metric('Pacientes', '128')}${metric('Mês', '42', 'sky')}${metric('Evoluções', '317', 'indigo')}${metric('Atualização', '98%', 'blue')}</div>
      <div class="panel"><h3>Atendimentos por mês</h3>${miniChart()}</div>
      <div class="tagline">Indicadores para acompanhar crescimento e produtividade.</div>`,
    security: `
      <div class="appbar">${brandMark()}<div><b>Segurança</b><small>LGPD</small></div></div>
      <div class="shield">✓</div>
      <div class="panel"><h3>Controle de acesso</h3>${row('Login', 'Autenticado')}${row('Dados', 'Centralizados')}${row('Busca', 'Páginas privadas bloqueadas')}${row('Equipe', 'Acessos individuais')}</div>
      <div class="tagline">Mais controle operacional para dados sensíveis da clínica.</div>`,
    pricing: `
      <div class="appbar">${brandMark()}<div><b>Planos</b><small>Comece agora</small></div></div>
      <div class="price"><b>R$ 0</b><small>Plano Básico</small></div>
      <div class="panel"><h3>Incluído no grátis</h3>${row('Pacientes', 'Até 50')}${row('Agenda', 'Liberada')}${row('Recibos', 'PDF')}${row('Guias', 'TISS/TUSS')}</div>
      <div class="button">Criar conta grátis</div>`,
  };
  return screens[type];
}

function ipadScreen(type) {
  const side = `<aside><b>Clinicafy</b><span>Dashboard</span><span>Pacientes</span><span>Agenda</span><span>Guias</span><span>Recibos</span><span>Relatórios</span></aside>`;
  const cards = `<div class="ipadCards"><div><b>128</b><small>Pacientes</small></div><div><b>42</b><small>Consultas</small></div><div><b>18</b><small>Agendadas</small></div></div>`;
  const screens = {
    ipadDashboard: `${side}<main>${cards}<section><h3>Agenda do dia</h3>${phoneScreen('agenda')}</section></main>`,
    ipadPatient: `${side}<main><section><h3>Prontuário de Mariana Costa</h3>${phoneScreen('patient')}</section><section><h3>Evoluções</h3>${phoneScreen('reports')}</section></main>`,
    ipadBilling: `${side}<main><section><h3>Faturamento</h3>${phoneScreen('receipts')}</section><section><h3>Guias TISS/TUSS</h3>${phoneScreen('guides')}</section></main>`,
    ipadPlans: `${side}<main><section><h3>Planos</h3>${phoneScreen('pricing')}</section><section><h3>Segurança</h3>${phoneScreen('security')}</section></main>`,
  };
  return screens[type];
}

function html(scene, device) {
  const isPad = device === 'ipad';
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=swap');
    *{box-sizing:border-box} body{margin:0;font-family:Poppins,Arial,sans-serif;background:#f8fbff;color:#0d183d}
    .canvas{width:100vw;height:100vh;position:relative;overflow:hidden;background:radial-gradient(circle at 75% 12%,#dff5ff 0,#f8fbff 32%,#fff 72%)}
    .bg{position:absolute;inset:0;background:linear-gradient(160deg,#ffffff 0%,#edf7ff 46%,#dbeeff 100%)}
    .top{position:absolute;left:${isPad ? 110 : 76}px;right:${isPad ? 110 : 76}px;top:${isPad ? 90 : 76}px;display:flex;align-items:center;gap:24px}
    .brand{display:flex;align-items:center;gap:18px;font-weight:900;font-size:${isPad ? 44 : 34}px}.brand span:nth-child(2){color:#1677ff}
    .copy{position:absolute;left:${isPad ? 118 : 78}px;right:${isPad ? 980 : 78}px;top:${isPad ? 230 : 220}px;z-index:2}
    .eyebrow{color:#1677ff;text-transform:uppercase;letter-spacing:.16em;font-size:${isPad ? 28 : 24}px;font-weight:900;margin-bottom:24px}
    h1{font-size:${isPad ? 78 : 74}px;line-height:1.02;letter-spacing:-2px;margin:0;font-weight:900}
    .subtitle{font-size:${isPad ? 34 : 32}px;line-height:1.35;color:#526070;margin-top:28px;font-weight:600}
    .device{position:absolute;z-index:3;box-shadow:0 44px 120px rgba(13,24,61,.22);background:#0d183d}
    .iphone{width:760px;height:1640px;border-radius:96px;right:88px;bottom:78px;padding:30px;border:8px solid #17264d}
    .notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:220px;height:48px;background:#0d183d;border-radius:0 0 28px 28px;z-index:4}
    .phoneInner{width:100%;height:100%;border-radius:72px;background:#fff;overflow:hidden;padding:58px 42px 44px}
    .ipad{left:660px;right:92px;top:245px;bottom:112px;border-radius:46px;padding:24px;border:8px solid #17264d}
    .ipadInner{height:100%;border-radius:30px;background:#f8fafc;overflow:hidden;display:grid;grid-template-columns:240px 1fr}
    .appbar{display:flex;align-items:center;gap:18px;margin-bottom:28px}.appbar svg{width:64px;height:64px}.appbar b{display:block;font-size:30px}.appbar small{display:block;color:#6b7280;font-size:18px;font-weight:700;margin-top:3px}
    .hello{font-size:42px;font-weight:900;margin:20px 0 24px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:24px}
    .metric{border-radius:26px;background:#eff6ff;color:#1677ff;padding:24px;border:1px solid #dbeafe}.metric b{font-size:42px;display:block}.metric small{font-size:17px;color:#526070;font-weight:800}.metric.sky{background:#eef9ff;color:#0284c7}.metric.indigo{background:#eef2ff;color:#4f46e5}.metric.amber{background:#fff7ed;color:#d97706}
    .panel{border:1px solid #e5edf7;background:#fff;border-radius:30px;padding:26px;margin:20px 0;box-shadow:0 14px 40px rgba(13,24,61,.06)}.panel h3{font-size:26px;margin:0 0 18px}
    .row{display:grid;grid-template-columns:110px 1fr auto;align-items:center;gap:10px;border-top:1px solid #edf2f7;padding:18px 0;font-size:21px}.row:first-of-type{border-top:0}.row span{color:#64748b;font-weight:800}.row strong{font-weight:900}.row em{font-style:normal;border-radius:999px;background:#eff6ff;color:#1677ff;padding:8px 12px;font-size:15px;font-weight:900}
    .dark{background:#0d183d;color:white}.dark h3{color:white}.chart{height:210px;display:flex;align-items:end;gap:18px}.chart span{flex:1;border-radius:16px 16px 4px 4px;background:linear-gradient(#54c7ff,#1677ff)}
    .profile{display:flex;align-items:center;gap:18px;background:#eff6ff;border-radius:30px;padding:24px}.profile>div{width:82px;height:82px;border-radius:28px;background:#1677ff;color:white;display:grid;place-items:center;font-size:28px;font-weight:900}.profile b{font-size:28px}.profile small{display:block;color:#64748b;font-size:18px;font-weight:800}
    .notes,.tagline{border-radius:28px;background:#0d183d;color:white;padding:28px;font-size:22px;font-weight:700;line-height:1.35}.notes p{color:#cfe6ff;margin:12px 0 0}.calendar{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px}.calendar div{border-radius:24px;background:#f1f5f9;padding:18px;text-align:center;font-size:17px;font-weight:900;color:#64748b}.calendar b{display:block;font-size:34px;color:#0d183d}.calendar .active{background:#1677ff;color:white}.calendar .active b{color:white}
    .statusline,.actions{display:flex;gap:12px;margin:24px 0}.statusline span,.actions span{flex:1;text-align:center;border-radius:999px;background:#eef2ff;color:#31538a;padding:14px;font-size:16px;font-weight:900}.statusline .on{background:#1677ff;color:white}
    .amount,.price{text-align:center;border-radius:32px;background:linear-gradient(135deg,#1677ff,#2457d6);color:white;padding:34px;margin:18px 0}.amount,.price b{font-size:54px;font-weight:900}.amount small,.price small{display:block;font-size:18px;color:#dbeafe;font-weight:800}.shield{width:150px;height:150px;border-radius:50px;background:#1677ff;color:white;display:grid;place-items:center;font-size:88px;font-weight:900;margin:30px auto}.button{border-radius:999px;background:#1677ff;color:white;text-align:center;padding:22px;font-size:24px;font-weight:900;margin-top:22px}
    aside{background:#fff;border-right:1px solid #e5edf7;padding:42px 28px;display:flex;flex-direction:column;gap:20px} aside b{font-size:34px;color:#1677ff;margin-bottom:22px} aside span{border-radius:18px;padding:16px 18px;font-size:20px;font-weight:900;color:#64748b} aside span:nth-child(2){background:#1677ff;color:white}
    .ipadInner main{padding:44px;display:grid;grid-template-columns:1fr 1fr;gap:30px}.ipadInner section{background:white;border-radius:32px;padding:28px;overflow:hidden;border:1px solid #e5edf7}.ipadInner section h3{font-size:34px;margin:0 0 22px}.ipadCards{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.ipadCards div{background:#fff;border:1px solid #e5edf7;border-radius:28px;padding:28px}.ipadCards b{display:block;font-size:48px;color:#1677ff}.ipadCards small{font-size:20px;color:#64748b;font-weight:900}
    .ipadInner .appbar svg,.ipadInner .appbar small,.ipadInner .calendar,.ipadInner .tagline,.ipadInner .notes,.ipadInner .amount,.ipadInner .price,.ipadInner .shield,.ipadInner .button{transform:scale(.78);transform-origin:left top}.ipadInner .panel{padding:18px;margin:12px 0}.ipadInner .row{font-size:16px;padding:11px 0;grid-template-columns:80px 1fr auto}.ipadInner .metric b{font-size:30px}.ipadInner .metric small{font-size:13px}.ipadInner .chart{height:130px}
  </style>
</head>
<body>
  <div class="canvas">
    <div class="bg"></div>
    <div class="top"><div class="brand">${brandMark()}<div><span>Clinica</span><span>fy</span></div></div></div>
    <div class="copy"><div class="eyebrow">Clinicafy</div><h1>${scene.title}</h1><div class="subtitle">${scene.subtitle}</div></div>
    ${isPad
      ? `<div class="device ipad"><div class="ipadInner">${ipadScreen(scene.screen)}</div></div>`
      : `<div class="device iphone"><div class="notch"></div><div class="phoneInner">${phoneScreen(scene.screen)}</div></div>`}
  </div>
</body>
</html>`;
}

async function renderSet(browser, scenes, device, viewport, dir) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  for (const scene of scenes) {
    await page.setContent(html(scene, device), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(dir, scene.file), fullPage: false });
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  await renderSet(browser, iphoneScenes, 'iphone', { width: 1320, height: 2868 }, iphoneDir);
  await renderSet(browser, ipadScenes, 'ipad', { width: 2048, height: 2732 }, ipadDir);
  await browser.close();

  const manifest = {
    generatedAt: new Date().toISOString(),
    iphone: { size: '1320x2868', files: iphoneScenes.map((s) => s.file) },
    ipad: { size: '2048x2732', files: ipadScenes.map((s) => s.file) },
  };
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(outRoot, 'README.md'), `# Clinicafy - iOS App Store Screenshots

Gerado automaticamente para envio no App Store Connect.

## iPhone 6.9

Tamanho: 1320x2868 px

Arquivos:
${iphoneScenes.map((s) => `- iphone-6-9/${s.file}`).join('\n')}

## iPad 13

Tamanho: 2048x2732 px

Arquivos:
${ipadScenes.map((s) => `- ipad-13/${s.file}`).join('\n')}

## Observacoes

- Textos evitam promessas nao comprovadas como "zero glosas" ou "100% CFM".
- Usar na ordem numerada.
- Regerar com: \`node scripts/generate-ios-store-screenshots.cjs\`.
`);
})();
