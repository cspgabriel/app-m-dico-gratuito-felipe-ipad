import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, FileText, CalendarDays, Receipt, ShieldCheck, BarChart3, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import { SEO_BASE_URL, seoLandingPages } from '@/data/seoLandingPages';

const featureIcons = [FileText, CalendarDays, Receipt, BarChart3, UsersRound, ShieldCheck];

export default function SEOLandingPage() {
  const { slug } = useParams();
  const page = seoLandingPages.find((item) => item.slug === slug);

  if (!page) return <Navigate to="/" replace />;

  const canonical = `${SEO_BASE_URL}/${page.slug}`;

  const softwareSchema = {
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

  const faqSchema = {
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SEO_BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: page.keyword, item: canonical },
    ],
  };

  const relatedPages = seoLandingPages.filter((item) => item.slug !== page.slug).slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-[#0D183D]">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.clinicafy.com.br/pwa-512.png" />
        <meta property="og:site_name" content="Clinicafy" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
        <meta name="twitter:image" content="https://www.clinicafy.com.br/pwa-512.png" />
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" aria-label="Clinicafy">
            <BrandLogo markClassName="w-8 h-8" textClassName="text-lg font-black tracking-tight hidden sm:block" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-bold text-gray-600 hover:text-[#1677FF] sm:block">
              Login
            </Link>
            <Link to="/login">
              <Button className="rounded-full bg-[#1677FF] px-5 font-bold text-white hover:bg-blue-600">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="px-5 py-20 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1677FF]">
                {page.eyebrow}
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                {page.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-600 md:text-xl">
                {page.lead}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
                {page.audience}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login">
                  <Button className="h-14 rounded-full bg-[#1677FF] px-8 text-base font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600">
                    Criar conta grátis <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
                <Link to="/#pricing">
                  <Button variant="outline" className="h-14 rounded-full px-8 text-base font-black">
                    Ver planos
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-gray-500">
                <span>Sem cartão</span>
                <span>Plano grátis</span>
                <span>LGPD</span>
                <span>PWA instalável</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-[#F8FAFC] p-5 shadow-2xl shadow-blue-900/10">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Clinicafy</p>
                    <p className="text-xl font-black">Painel da clínica</p>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    Online
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Pacientes', 'Agenda', 'Recibos', 'Guias'].map((label, index) => {
                    const Icon = featureIcons[index];
                    return (
                      <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <Icon className="mb-3 text-[#1677FF]" size={22} />
                        <p className="text-sm font-black">{label}</p>
                        <p className="mt-1 text-xs font-medium text-gray-500">Gestão integrada</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl bg-[#0D183D] p-5 text-white">
                  <p className="text-sm font-black">Rotina clínica sem planilha solta</p>
                  <p className="mt-2 text-sm text-blue-100">
                    Atendimento, documentos e gestão no mesmo fluxo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-gray-50 px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-3">
              {page.pains.map((pain) => (
                <div key={pain} className="rounded-2xl border border-red-100 bg-white p-6">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-red-500">Problema</p>
                  <h2 className="text-xl font-black">{pain}</h2>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#1677FF]">Recursos</p>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                O que o Clinicafy entrega para quem busca {page.keyword}.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {page.features.map((feature, index) => {
                const Icon = featureIcons[index % featureIcons.length];
                return (
                  <div key={feature} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-black">{feature}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      Integrado ao fluxo da clínica para reduzir retrabalho e deixar a operação mais previsível.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#0D183D] px-5 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-300">Resultado prático</p>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Menos operação manual. Mais controle da clínica.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {page.outcomes.map((outcome) => (
                <div key={outcome} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <CheckCircle2 className="mb-4 text-emerald-300" />
                  <p className="font-bold text-blue-50">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Comece pelo plano gratuito e evolua quando sua clínica precisar.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
              O Clinicafy foi pensado para atrair clínicas que querem simplicidade agora e estrutura profissional depois.
            </p>
            <div className="mt-8">
              <Link to="/login">
                <Button className="h-14 rounded-full bg-[#1677FF] px-10 text-base font-black text-white hover:bg-blue-600">
                  Criar minha conta grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-white px-5 py-20">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#1677FF]">Perguntas frequentes</p>
            <h2 className="mb-10 text-3xl font-black tracking-tight md:text-4xl">
              Dúvidas sobre {page.keyword}
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: `O que é ${page.keyword}?`,
                  a: page.lead,
                },
                {
                  q: `Para quem é indicado ${page.keyword}?`,
                  a: page.audience,
                },
                {
                  q: `Quais recursos o Clinicafy oferece para ${page.keyword}?`,
                  a: `Recursos incluídos: ${page.features.join(', ')}. Resultados esperados: ${page.outcomes.join(', ')}.`,
                },
                {
                  q: 'O Clinicafy tem plano gratuito?',
                  a: 'Sim. O plano Básico é gratuito e inclui até 50 pacientes, prontuário eletrônico, agenda e guias TISS/TUSS. Não é necessário cartão de crédito.',
                },
              ].map(({ q, a }) => (
                <details key={q} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer text-lg font-black list-none flex items-center justify-between gap-3">
                    {q}
                    <span className="shrink-0 text-[#1677FF] text-xl font-bold leading-none">+</span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-gray-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50 px-5 py-12">
          <div className="mx-auto max-w-7xl">
            <p className="mb-5 text-sm font-black uppercase tracking-widest text-gray-500">Outras buscas relacionadas</p>
            <div className="flex flex-wrap gap-3">
              {relatedPages.map((item) => (
                <Link
                  key={item.slug}
                  to={`/${item.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-[#1677FF] hover:text-[#1677FF]"
                >
                  {item.keyword}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
