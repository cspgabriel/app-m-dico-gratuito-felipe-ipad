import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import { SEO_BASE_URL } from '@/data/seoLandingPages';

type InfoPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  icon: React.ElementType;
  sections: Array<{ title: string; items: string[] }>;
  cta?: string;
};

const pages: InfoPage[] = [
  {
    slug: 'app',
    title: 'App Clinicafy | PWA para clínicas e consultórios',
    description: 'Instale o Clinicafy como app no celular, tablet ou computador e acesse prontuário, agenda, recibos e gestão clínica pelo navegador.',
    eyebrow: 'App Clinicafy',
    h1: 'Clinicafy como app: gestão clínica no celular, tablet e computador.',
    lead: 'O Clinicafy já funciona como PWA instalável. A publicação nas lojas Android e iOS fica como canal adicional de aquisição e confiança.',
    icon: Smartphone,
    sections: [
      {
        title: 'O que já existe',
        items: ['PWA instalável pelo navegador', 'Ícone e manifest configurados', 'Login, dashboard, pacientes, agenda, recibos e guias no app web'],
      },
      {
        title: 'Páginas públicas de suporte às lojas',
        items: ['Política de privacidade', 'Termos de uso', 'Suporte', 'Segurança e LGPD', 'Páginas Google Play e App Store'],
      },
      {
        title: 'Próxima etapa',
        items: ['Gerar screenshots reais', 'Criar builds Android/iOS', 'Cadastrar contas de desenvolvedor', 'Validar claims legais antes do envio'],
      },
    ],
    cta: 'Criar conta grátis',
  },
  {
    slug: 'google-play',
    title: 'Clinicafy no Google Play | Página de cadastro Android',
    description: 'Página pública com posicionamento, recursos e checklist para publicação do Clinicafy no Google Play.',
    eyebrow: 'Google Play',
    h1: 'Preparação do Clinicafy para publicação Android.',
    lead: 'Página de apoio para a listagem do Google Play com texto seguro, links públicos exigidos e próximos requisitos técnicos.',
    icon: Store,
    sections: [
      {
        title: 'Nome e descrição curta',
        items: ['Nome sugerido: Clinicafy - Prontuário e Gestão Médica', 'Descrição curta: Prontuário, agenda, recibos e gestão clínica em um só lugar.', 'Categoria: Médico e Saúde / Produtividade'],
      },
      {
        title: 'Recursos destacáveis',
        items: ['Prontuário eletrônico e histórico do paciente', 'Agenda médica online', 'Recibos em PDF', 'Guias TISS/TUSS operacionais', 'Relatórios e gestão da clínica'],
      },
      {
        title: 'Falta para publicar',
        items: ['AAB assinado', 'Ícone 512x512', 'Feature graphic 1024x500', 'Screenshots Android reais', 'Questionário de conteúdo e dados'],
      },
    ],
  },
  {
    slug: 'app-store',
    title: 'Clinicafy na App Store | Página de cadastro iOS',
    description: 'Página pública com posicionamento, links e checklist para publicação do Clinicafy na App Store.',
    eyebrow: 'App Store',
    h1: 'Preparação do Clinicafy para publicação iOS.',
    lead: 'Página de apoio para App Store Connect, com suporte, termos, privacidade e checklist do que ainda falta antes do review.',
    icon: Store,
    sections: [
      {
        title: 'Metadados sugeridos',
        items: ['Nome: Clinicafy: Prontuário Médico', 'Subtítulo: Agenda, Gestão e Faturamento', 'Categoria: Médico / Produtividade'],
      },
      {
        title: 'Compras e planos',
        items: ['Plano Básico gratuito', 'Plano Profissional mensal', 'Plano Vitalício como compra única', 'Revisar se compras serão Apple IAP ou checkout web conforme política aplicável'],
      },
      {
        title: 'Falta para publicar',
        items: ['Build iOS', 'Conta Apple Developer', 'Screenshots iPhone/iPad', 'Privacy Nutrition Labels', 'Conta demo para revisão Apple'],
      },
    ],
  },
  {
    slug: 'suporte',
    title: 'Suporte Clinicafy | Ajuda para usuários',
    description: 'Canais de suporte do Clinicafy para acesso, cobrança, dados, privacidade e funcionamento do sistema.',
    eyebrow: 'Suporte',
    h1: 'Suporte Clinicafy.',
    lead: 'Central simples para orientar usuários, revisores das lojas e clientes sobre ajuda, cobrança e privacidade.',
    icon: HelpCircle,
    sections: [
      {
        title: 'Contato',
        items: ['E-mail: suporte@clinicafy.com.br', 'Site: https://www.clinicafy.com.br', 'Informe e-mail da conta, plano, tela afetada e print do erro quando possível'],
      },
      {
        title: 'Assuntos atendidos',
        items: ['Acesso e login', 'Assinatura e checkout', 'Dúvidas de prontuário, agenda, recibos e guias', 'Solicitações de privacidade e dados'],
      },
      {
        title: 'Prioridade',
        items: ['Incidentes de acesso e cobrança têm prioridade', 'Solicitações LGPD devem conter identificação do titular ou representante', 'Demandas clínicas seguem responsabilidade do profissional usuário'],
      },
    ],
  },
  {
    slug: 'politica-de-privacidade',
    title: 'Política de Privacidade | Clinicafy',
    description: 'Política de privacidade do Clinicafy: dados tratados, finalidade, segurança, retenção e direitos do titular.',
    eyebrow: 'Privacidade',
    h1: 'Política de Privacidade do Clinicafy.',
    lead: 'Esta página resume como o Clinicafy trata dados de conta, uso e registros inseridos pelos profissionais de saúde.',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Dados tratados',
        items: ['Dados da conta do profissional, como nome, e-mail, clínica e CRM quando informado', 'Dados operacionais inseridos pelo usuário, como pacientes, consultas, agenda, recibos e guias', 'Dados técnicos necessários para login, segurança, diagnóstico e funcionamento do serviço'],
      },
      {
        title: 'Finalidades',
        items: ['Prestar o serviço contratado', 'Autenticar usuários e controlar acesso', 'Gerar documentos solicitados pelo usuário', 'Melhorar estabilidade, segurança e suporte'],
      },
      {
        title: 'Direitos e contato',
        items: ['O usuário pode solicitar acesso, correção ou exclusão conforme legislação aplicável', 'Pedidos devem ser enviados para suporte@clinicafy.com.br', 'O profissional de saúde é responsável pela base legal e consentimentos dos dados de seus pacientes'],
      },
    ],
  },
  {
    slug: 'termos-de-uso',
    title: 'Termos de Uso | Clinicafy',
    description: 'Termos de uso do Clinicafy para profissionais, clínicas e usuários da plataforma.',
    eyebrow: 'Termos',
    h1: 'Termos de Uso do Clinicafy.',
    lead: 'Regras básicas para uso da plataforma, planos, responsabilidades e limites do serviço.',
    icon: FileText,
    sections: [
      {
        title: 'Uso permitido',
        items: ['Uso por profissionais e equipes de saúde autorizadas', 'Cadastro de informações verdadeiras da clínica e dos usuários', 'Responsabilidade do usuário sobre conteúdo clínico inserido'],
      },
      {
        title: 'Planos e cobrança',
        items: ['Plano Básico gratuito conforme limites publicados', 'Plano Profissional mensal com recursos adicionais', 'Plano Vitalício como oferta comercial sem mensalidade recorrente para os recursos incluídos'],
      },
      {
        title: 'Limites',
        items: ['O Clinicafy é ferramenta de gestão e não substitui julgamento clínico', 'Integrações externas podem depender de provedores terceiros', 'Recursos em evolução podem mudar com aviso razoável quando aplicável'],
      },
    ],
  },
  {
    slug: 'seguranca-lgpd',
    title: 'Segurança e LGPD | Clinicafy',
    description: 'Medidas de segurança e orientações LGPD do Clinicafy para clínicas, consultórios e profissionais de saúde.',
    eyebrow: 'Segurança e LGPD',
    h1: 'Segurança, controle de acesso e rotina alinhada à LGPD.',
    lead: 'O Clinicafy centraliza dados sensíveis em ambiente autenticado e ajuda a reduzir planilhas soltas, prints e arquivos sem controle.',
    icon: LockKeyhole,
    sections: [
      {
        title: 'Medidas atuais',
        items: ['Login autenticado por usuário', 'Dados vinculados à clínica/usuário', 'Separação de permissões por regras do banco', 'Páginas privadas bloqueadas para robôs de busca'],
      },
      {
        title: 'Boas práticas para clínicas',
        items: ['Crie contas individuais para equipe', 'Evite compartilhar senha', 'Revise acessos quando alguém sair da clínica', 'Use termos e consentimentos adequados ao seu atendimento'],
      },
      {
        title: 'Próximas melhorias recomendadas',
        items: ['Auditoria detalhada de acesso', 'Exportação LGPD por paciente', 'Página de subprocessadores', 'Política formal de retenção e backup'],
      },
    ],
  },
];

export const publicInfoSlugs = pages.map((page) => page.slug);

export default function PublicInfoPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '');
  const page = pages.find((item) => item.slug === slug);

  if (!page) return <Navigate to="/" replace />;

  const Icon = page.icon;
  const canonical = `${SEO_BASE_URL}/${page.slug}`;

  return (
    <div className="min-h-screen bg-white text-[#0D183D]">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" aria-label="Clinicafy">
            <BrandLogo markClassName="w-8 h-8" textClassName="hidden text-lg font-black tracking-tight sm:block" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/app" className="hidden text-sm font-bold text-gray-600 hover:text-[#1677FF] sm:block">
              App
            </Link>
            <Link to="/suporte" className="hidden text-sm font-bold text-gray-600 hover:text-[#1677FF] sm:block">
              Suporte
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
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
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
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login">
                  <Button className="h-14 rounded-full bg-[#1677FF] px-8 text-base font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600">
                    {page.cta || 'Acessar Clinicafy'} <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
                <Link to="/suporte">
                  <Button variant="outline" className="h-14 rounded-full px-8 text-base font-black">
                    Falar com suporte
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-8 shadow-2xl shadow-blue-900/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1677FF] text-white shadow-xl shadow-blue-500/25">
                <Icon size={30} />
              </div>
              <p className="mt-8 text-sm font-black uppercase tracking-widest text-blue-600">Clinicafy</p>
              <h2 className="mt-2 text-3xl font-black">Página pública pronta para lojas, SEO e revisão.</h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-gray-600">
                Conteúdo objetivo, rastreável e sem promessas técnicas não comprovadas.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-gray-50 px-5 py-16">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {page.sections.map((section) => (
              <div key={section.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black">{section.title}</h2>
                <ul className="mt-5 space-y-4">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-medium leading-relaxed text-gray-600">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#1677FF]" size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-16">
          <div className="mx-auto max-w-4xl rounded-[32px] bg-[#0D183D] p-8 text-white md:p-12">
            <h2 className="text-3xl font-black">Próximo passo operacional</h2>
            <p className="mt-4 text-blue-100">
              Revisar texto jurídico final, gerar assets reais das lojas e validar fluxo de compra conforme política Google/Apple.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/google-play" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
                Google Play
              </Link>
              <Link to="/app-store" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
                App Store
              </Link>
              <Link to="/seguranca-lgpd" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
                Segurança/LGPD
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
