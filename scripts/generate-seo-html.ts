/**
 * Post-build script: generates pre-rendered HTML files for SEO landing pages.
 *
 * Run after `vite build`. Reads dist/index.html (which contains correct hashed
 * asset references) and produces dist/{slug}.html for each SEO page. Vercel
 * serves these static files directly before applying any rewrites, ensuring
 * crawlers receive correct per-page meta tags and visible content on first load.
 *
 * Usage: tsx scripts/generate-seo-html.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seoLandingPages, SEO_BASE_URL } from '../src/data/seoLandingPages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

type Page = (typeof seoLandingPages)[0];

function escAttr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escText(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSchemas(page: Page, canonical: string) {
  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Clinicafy',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web, iOS, Android',
    url: canonical,
    description: page.description,
    offers: [
      { '@type': 'Offer', name: 'Básico', price: '0', priceCurrency: 'BRL' },
      { '@type': 'Offer', name: 'Profissional', price: '149', priceCurrency: 'BRL' },
      { '@type': 'Offer', name: 'Vitalício', price: '2497', priceCurrency: 'BRL' },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `O que é ${page.keyword}?`,
        acceptedAnswer: { '@type': 'Answer', text: page.lead },
      },
      {
        '@type': 'Question',
        name: `Para quem é indicado ${page.keyword}?`,
        acceptedAnswer: { '@type': 'Answer', text: page.audience },
      },
      {
        '@type': 'Question',
        name: `Quais recursos o Clinicafy oferece para ${page.keyword}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Recursos: ${page.features.join(', ')}. Resultados: ${page.outcomes.join(', ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: 'O Clinicafy tem plano gratuito?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. O plano Básico é gratuito e inclui até 50 pacientes, prontuário eletrônico, agenda e guias TISS/TUSS. Não é necessário cartão de crédito.',
        },
      },
    ],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SEO_BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: page.keyword, item: canonical },
    ],
  };

  return [software, faq, breadcrumb];
}

function buildPrerenderedContent(page: Page): string {
  const relatedPages = seoLandingPages.filter((p) => p.slug !== page.slug).slice(0, 5);

  return `<div id="prerender" style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0D183D;max-width:960px;margin:0 auto;padding:80px 20px 48px">
  <nav style="font-size:.85rem;margin-bottom:24px;color:#6b7280">
    <a href="/" style="color:#1677FF;font-weight:700;text-decoration:none">Clinicafy</a>
    <span style="margin:0 6px">&#x203A;</span>
    <span>${escText(page.keyword)}</span>
  </nav>
  <p style="font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#1677FF;margin:0 0 12px">${escText(page.eyebrow)}</p>
  <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;line-height:1.15;margin:0 0 20px">${escText(page.h1)}</h1>
  <p style="font-size:1.1rem;line-height:1.65;color:#444;max-width:700px;margin:0 0 12px">${escText(page.lead)}</p>
  <p style="font-size:1rem;line-height:1.6;color:#666;max-width:680px;margin:0 0 36px">${escText(page.audience)}</p>
  <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:52px">
    <a href="/login" style="display:inline-flex;align-items:center;gap:6px;background:#1677FF;color:#fff;font-weight:800;font-size:1rem;padding:14px 28px;border-radius:50px;text-decoration:none">Criar conta gr&#225;tis &#8594;</a>
    <a href="/#pricing" style="display:inline-flex;align-items:center;background:#fff;border:2px solid #1677FF;color:#1677FF;font-weight:800;font-size:1rem;padding:14px 28px;border-radius:50px;text-decoration:none">Ver planos</a>
  </div>

  <section style="margin-bottom:48px">
    <h2 style="font-size:1.25rem;font-weight:800;margin:0 0 16px">Problemas comuns que o Clinicafy resolve</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
      ${page.pains
        .map(
          (p) =>
            `<div style="border:1px solid #fee2e2;background:#fff8f8;border-radius:14px;padding:16px 20px"><span style="display:block;font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#dc2626;margin-bottom:8px">Problema</span><strong style="font-size:1rem;line-height:1.4">${escText(p)}</strong></div>`,
        )
        .join('\n      ')}
    </div>
  </section>

  <section style="margin-bottom:48px">
    <h2 style="font-size:1.25rem;font-weight:800;margin:0 0 16px">Recursos do Clinicafy para ${escText(page.keyword)}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
      ${page.features
        .map(
          (f) =>
            `<div style="border:1px solid #dbeafe;background:#eff6ff;border-radius:14px;padding:16px 20px"><strong style="font-size:1rem;display:block;margin-bottom:8px">${escText(f)}</strong><span style="font-size:.875rem;color:#555;line-height:1.5">Integrado ao fluxo da cl&#237;nica para reduzir retrabalho e tornar a opera&#231;&#227;o mais previs&#237;vel.</span></div>`,
        )
        .join('\n      ')}
    </div>
  </section>

  <section style="margin-bottom:48px">
    <h2 style="font-size:1.25rem;font-weight:800;margin:0 0 16px">Resultados pr&#225;ticos para a cl&#237;nica</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
      ${page.outcomes
        .map(
          (o) =>
            `<div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:14px;padding:16px 20px"><span style="font-size:1.2rem;margin-right:8px">&#10003;</span><strong style="font-size:1rem">${escText(o)}</strong></div>`,
        )
        .join('\n      ')}
    </div>
  </section>

  <section style="background:linear-gradient(135deg,#1677FF 0%,#0D183D 100%);border-radius:20px;padding:40px;text-align:center;color:#fff;margin-bottom:40px">
    <h2 style="font-size:1.6rem;font-weight:900;margin:0 0 10px">Comece com o plano gratuito</h2>
    <p style="margin:0 0 24px;opacity:.85;font-size:1.05rem">Sem cart&#227;o de cr&#233;dito &#8226; At&#233; 50 pacientes gr&#225;tis</p>
    <a href="/login" style="display:inline-block;background:#fff;color:#1677FF;font-weight:900;padding:14px 36px;border-radius:50px;font-size:1rem;text-decoration:none">Criar minha conta gr&#225;tis</a>
  </section>

  <section>
    <p style="font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Outros recursos relacionados</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${relatedPages
        .map(
          (p) =>
            `<a href="/${p.slug}" style="border:1px solid #e5e7eb;background:#fff;border-radius:50px;padding:8px 16px;font-size:.875rem;font-weight:700;color:#374151;text-decoration:none">${escText(p.keyword)}</a>`,
        )
        .join('\n      ')}
    </div>
  </section>
</div>
<script>
(function(){var el=document.getElementById('prerender');if(!el)return;var root=document.getElementById('root');if(!root)return;new MutationObserver(function(_,obs){if(root.firstChild){el.style.display='none';obs.disconnect();}}).observe(root,{childList:true});})();
</script>`;
}

function generatePageHtml(templateHtml: string, page: Page): string {
  const canonical = `${SEO_BASE_URL}/${page.slug}`;
  const schemas = buildSchemas(page, canonical);
  const schemaTags = schemas
    .map((s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');

  let html = templateHtml;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(page.title)}</title>`);

  // Replace description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escAttr(page.description)}" />`,
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`,
  );

  // Replace OG title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escAttr(page.title)}" />`,
  );

  // Replace OG description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escAttr(page.description)}" />`,
  );

  // Replace OG URL
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`,
  );

  // Replace Twitter title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escAttr(page.title)}" />`,
  );

  // Replace Twitter description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escAttr(page.description)}" />`,
  );

  // Replace existing ld+json block(s) with per-page schemas
  html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/, schemaTags);

  // Inject pre-rendered body content before React root
  html = html.replace(
    '<div id="root"></div>',
    `${buildPrerenderedContent(page)}\n  <div id="root"></div>`,
  );

  return html;
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error('❌  dist/ not found — run `vite build` first.');
    process.exit(1);
  }
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌  dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  console.log(`\n🔍  Generating ${seoLandingPages.length} SEO landing pages...\n`);

  for (const page of seoLandingPages) {
    const html = generatePageHtml(templateHtml, page);
    const outputPath = path.join(distDir, `${page.slug}.html`);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`  ✓  dist/${page.slug}.html`);
  }

  console.log(`\n✅  Done — ${seoLandingPages.length} pages generated.\n`);
}

main();
