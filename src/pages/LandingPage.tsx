import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ChevronRight,
  Users,
  Lock,
  FileWarning,
  Clock,
  Activity,
  FileText,
  FileCheck,
  Globe,
  Database,
  Star,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/FirebaseProvider';
import BrandLogo, { BrandMark } from '@/components/BrandLogo';
import { SEO_BASE_URL, seoLandingPages } from '@/data/seoLandingPages';

const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.55, ease: 'easeOut' },
} as const;

export default function LandingPage() {
  const { user } = useAuth();
  const shareUrl = `${SEO_BASE_URL}/`;
  const shareText = 'Conheça o Clinicafy: prontuário, agenda, recibos e guias TISS/TUSS para clínicas médicas.';
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareText = encodeURIComponent(shareText);

  return (
    <div className="min-h-screen selection:bg-apple-blue/30 selection:text-apple-blue font-sans pb-20 lg:pb-0">
      <Helmet>
        <title>Clinicafy — Prontuário, agenda e gestão para consultórios médicos</title>
        <meta name="description" content="Sistema completo para consultórios e clínicas: prontuário eletrônico, agenda, faturamento TISS/TUSS e financeiro. Comece grátis, sem cartão de crédito." />
        <link rel="canonical" href={`${SEO_BASE_URL}/`} />
      </Helmet>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <BrandLogo markClassName="w-8 h-8" textClassName="text-lg font-black tracking-tight hidden sm:block" />
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-apple-blue hover:bg-blue-600 rounded-full text-white px-4 sm:px-6">Ir para o App</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-apple-gray-dark hover:text-black transition-colors hidden sm:block">
                  Login
                </Link>
                <Link to="/login">
                  <Button className="bg-apple-blue hover:bg-blue-600 rounded-full text-white px-4 sm:px-6 shadow-lg shadow-blue-500/20">
                    Começar agora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 01. Hero Section */}
      <motion.section {...sectionReveal} className="pt-32 pb-20 px-6 overflow-hidden lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          
          {/* Left Column */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 max-w-max mx-auto lg:mx-0 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 shadow-sm mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-amber-900 text-[11px] font-bold uppercase tracking-widest">
                Vagas limitadas
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-apple-blue lg:text-[#0D183D]">
              Sistema inteligente para <span className="text-apple-blue">clínicas que querem crescer.</span>
            </h1>
            <p className="text-xl text-apple-gray-dark leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Prontuário, agenda, recibos e gestão em um só lugar, com visual limpo e rotina pensada para clínicas modernas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
              <Link to="/login">
                <Button size="lg" className="h-14 px-8 rounded-full bg-apple-blue hover:bg-blue-600 text-white text-lg font-bold shadow-2xl shadow-blue-500/30 gap-2 group transition-all">
                  Começar Agora Gratuitamente
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Sem cartão de crédito • Configuração em 5 minutos
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Share2 size={14} /> Compartilhar
              </span>
              <a className="h-9 px-3 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-bold inline-flex items-center gap-2" href={`https://wa.me/?text=${encodedShareText}%20${encodedShareUrl}`} target="_blank" rel="noreferrer">
                <MessageCircle size={15} /> WhatsApp
              </a>
              <a className="h-9 px-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-bold inline-flex items-center gap-2" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`} target="_blank" rel="noreferrer">
                <Facebook size={15} /> Facebook
              </a>
              <a className="h-9 px-3 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 text-sm font-bold inline-flex items-center gap-2" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`} target="_blank" rel="noreferrer">
                <Linkedin size={15} /> LinkedIn
              </a>
            </div>
          </motion.div>

          {/* Right Column — Dashboard Mockup */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 w-full max-w-2xl relative mt-12 lg:mt-0"
          >
            <DashboardMockup />

            {/* Mobile Mockup overlay */}
            <div className="absolute -bottom-6 -left-6 w-32 md:w-40 aspect-[9/19] rounded-[24px] border-[4px] border-gray-900 bg-white shadow-2xl overflow-hidden ring-1 ring-black/10 z-20 hidden sm:block">
              <div className="h-4 w-full bg-gray-900 rounded-b-xl mx-auto absolute top-0 left-0 right-0 max-w-[50%]"></div>
              <div className="mt-6 p-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <div className="h-2 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1.5 space-y-1">
                  <div className="h-2 w-3/4 bg-gray-300 rounded"></div>
                  <div className="h-1.5 w-1/2 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-white border border-gray-100 rounded p-1">
                    <div className="h-1.5 w-3/4 bg-gray-200 rounded mb-0.5"></div>
                    <div className="h-2.5 w-1/2 bg-gray-800 rounded"></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded p-1">
                    <div className="h-1.5 w-3/4 bg-emerald-200 rounded mb-0.5"></div>
                    <div className="h-2.5 w-1/2 bg-gray-800 rounded"></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded p-1 space-y-1">
                  <div className="h-1.5 w-1/2 bg-gray-800 rounded"></div>
                  <div className="h-1 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-1 w-2/3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="absolute -inset-4 bg-gradient-to-tr from-[#1677FF] to-[#00D1B2] rounded-[40px] blur-3xl opacity-20 -z-10 mt-12"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* 02. O Problema */}
      <motion.section {...sectionReveal} className="py-24 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              O software antigo ou o papel estão consumindo a eficiência do seu consultório?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6">
                 <Clock size={24} />
              </div>
              <p className="text-lg font-medium text-gray-800 leading-relaxed">
                Horas gastas digitando prontuários e caçando códigos manualmente.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                 <FileWarning size={24} />
              </div>
              <p className="text-lg font-medium text-gray-800 leading-relaxed">
                Glosas médicas e faturamentos travados por falhas operacionais.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                 <Database size={24} />
              </div>
              <p className="text-lg font-medium text-gray-800 leading-relaxed">
                Descentralização: dados espalhados entre sistemas que não se conversam.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 03. A Agitação */}
      <motion.section {...sectionReveal} className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 bg-blue-50 text-apple-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
          >
            <Activity size={32} />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black tracking-tight mb-8 text-gray-900"
          >
            Sua saúde mental agradece o fim dos atrasos.
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-apple-gray-dark leading-relaxed font-medium"
          >
            Cada minuto gasto preenchendo papelada burocrática ou corrigindo erros de faturamento é um minuto a menos com seu paciente — ou com sua família. Gerenciar múltiplos profissionais não deveria custar a sua paz de espírito.
          </motion.p>
        </div>
      </motion.section>

      {/* 04. A Solução */}
      <motion.section {...sectionReveal} className="py-32 px-6 bg-[#0B1120] text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
          >
            Conheça o Clinicafy: <br />
            <span className="text-blue-400">Plataforma clínica de nova geração.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed"
          >
            Recuperamos horas do seu dia. Tudo o que você precisa para focar apenas na prática médica, centralizado em um único ERP inteligente em nuvem.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
           {/* Antes */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="bg-white/5 border border-red-500/20 p-8 rounded-3xl relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl -mr-10 -mt-10 rounded-full"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                 <FileWarning size={20} />
               </div>
               <h3 className="text-2xl font-bold text-gray-200">Clínicas sem Clinicafy</h3>
             </div>
             <ul className="space-y-4 relative z-10">
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-red-400">✕</div>
                 <p className="text-gray-400">Busca interminável por prontuários de papel ou em sistemas lentos, perdendo o histórico do paciente.</p>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-red-400">✕</div>
                 <p className="text-gray-400">Alto índice de glosas por erros de digitação e códigos CID/TUSS inválidos inseridos manualmente.</p>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-red-400">✕</div>
                 <p className="text-gray-400">Tempo de atendimento prolongado preenchendo as mesmas informações repetidas vezes e emitindo receitas à mão.</p>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-red-400">✕</div>
                 <p className="text-gray-400">Controles financeiros confusos no Excel, ou repasses travados porque a recepção perdeu os recibos de pagamento.</p>
               </li>
             </ul>
           </motion.div>

           {/* Depois */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="bg-gradient-to-br from-blue-600/30 to-apple-blue p-8 rounded-3xl relative overflow-hidden ring-1 ring-blue-400/50"
           >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl -mr-10 -mt-10 rounded-full"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
                 <ShieldCheck size={20} />
               </div>
               <h3 className="text-2xl font-bold text-white">Clínicas com Clinicafy</h3>
             </div>
             <ul className="space-y-4 relative z-10">
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-blue-200">✓</div>
                 <p className="text-blue-50 font-medium">Histórico unificado em um clique. Receita, atestado e anexos em um mesmo painel temporal e seguro.</p>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-blue-200">✓</div>
                 <p className="text-blue-50 font-medium">Faturamento à prova de falhas: Guias formatadas na hora e automação inteligente CID/TUSS.</p>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-blue-200">✓</div>
                 <p className="text-blue-50 font-medium">Atendimento humanizado: modelos de anamnese rápida e atalhos de prescrição para você focar no olho a olho.</p>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-1 text-blue-200">✓</div>
                 <p className="text-blue-50 font-medium">Gestão transparente. Fluxo de caixa, relatórios de produtividade e cálculo automático do repasse de dezenas de profissionais.</p>
               </li>
             </ul>
           </motion.div>
        </div>
      </motion.section>

      {/* 05. Pilares da Plataforma */}
      <motion.section {...sectionReveal} className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Feature 1 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Anamnese Estruturada</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Registre a queixa, história e evolução e o sistema organiza tudo nos campos corretos do prontuário.
              </p>
            </div>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Prontuário Unificado</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Histórico, exames e medicamentos organizados linearmente para uma visão clínica clara e embasada.
              </p>
            </div>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Automação CID-10 e TUSS</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Poupe o esforço de buscar códigos difíceis. O sistema exibe correlações para a conduta de forma ágil.
              </p>
            </div>
          </div>
          {/* Feature 4 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Globe size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Acesse de Qualquer Lugar</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Sincronização em tempo real entre celular, tablet e computador. Suas consultas continuam de onde você parou.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 06. Segurança e Jurídico */}
      <motion.section {...sectionReveal} className="py-24 px-6 bg-slate-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Lock size={28} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900">Segurança Máxima</h3>
            <p className="text-lg font-medium text-gray-600 leading-relaxed">
              Seus dados estão protegidos por criptografia de ponta a ponta. A privacidade de seus pacientes está blindada.
            </p>
          </div>
          <div className="flex-1 space-y-6">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900">Conformidade LGPD</h3>
            <p className="text-lg font-medium text-gray-600 leading-relaxed">
              Software totalmente adequado às normas vigentes de sigilo médico, permitindo total tranquilidade jurídica na sua prática.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 06.5 Preços (Pricing) */}
      <motion.section {...sectionReveal} className="py-24 px-6 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
            Planos sob medida para o seu momento.
          </h2>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-16">
            Free para começar, Profissional para operar melhor e Vitalício para quem quer canais integrados sem mensalidade.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Plan 1 */}
            <div className="p-8 rounded-[32px] border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-shadow text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
              <p className="text-gray-500 mb-6 h-12">Para profissionais começando o consultório próprio.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">R$ 0</span>
                <span className="text-gray-500 font-medium">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Até 50 pacientes</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Prontuário eletrônico básico</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Guias TISS/TUSS liberadas</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Sem WhatsApp ou e-mail marketing</li>
              </ul>
              <Link to={user ? '/dashboard' : '/login?next=%2Fdashboard'}>
                <Button className="w-full h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg">Criar Conta Grátis</Button>
              </Link>
            </div>

            {/* Plan 2 - Highlighted */}
            <div className="p-8 rounded-[32px] border-2 border-apple-blue bg-white shadow-2xl relative transform md:-translate-y-4 text-left z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-apple-blue text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                Mais Escolhido
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Profissional</h3>
              <p className="text-gray-500 mb-6 h-12">Para consultórios em crescimento que precisam de eficiência.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">R$ 149</span>
                <span className="text-gray-500 font-medium">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Pacientes Ilimitados</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Prontuário eletrônico completo</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Guias TISS/TUSS e recibos em PDF</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Controle Financeiro (Fluxo de Caixa)</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Sem WhatsApp ou e-mail marketing</li>
              </ul>
              <Link to={user ? '/billing/checkout?plan=profissional' : '/login?next=%2Fbilling%2Fcheckout%3Fplan%3Dprofissional'}>
                <Button className="w-full h-14 rounded-2xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30">Assinar e Começar</Button>
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-[32px] border border-gray-100 bg-gray-50 shadow-sm hover:shadow-xl transition-shadow text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Vitalício</h3>
              <p className="text-gray-500 mb-6 h-12">Para clínicas que querem compra única e canais próprios.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">R$ 2.497</span>
                <span className="text-gray-500 font-medium"> único</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Tudo do plano Profissional</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Até 10 Profissionais Inclusos</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> WhatsApp e e-mail marketing integrados</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Sem mensalidades</li>
              </ul>
              <Link to={user ? '/billing/checkout?plan=vitalicio' : '/login?next=%2Fbilling%2Fcheckout%3Fplan%3Dvitalicio'}>
                <Button className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg">Comprar Vitalício</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 06.6 Comparativo */}
      <motion.section {...sectionReveal} className="py-24 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight text-center text-gray-900 mb-4">
            Por que trocar pelo Clinicafy.
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Comparação honesta com os sistemas mais usados pelos consultórios brasileiros.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-700">Recurso</th>
                  <th className="p-4 font-bold text-apple-blue">Clinicafy</th>
                  <th className="p-4 font-bold text-gray-500">Outros</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Plano gratuito permanente', '✓ Até 50 pacientes', 'Trial 7–14 dias'],
                  ['Onboarding sem ligação de vendedor', '✓ 5 minutos', 'Demo obrigatória'],
                  ['Mensalidade do plano Profissional', 'R$ 149', 'R$ 199 a R$ 499'],
                  ['WhatsApp/e-mail marketing', 'Só no Vitalício', 'Add-on R$ 49+'],
                  ['Recibo médico em PDF', '✓ Incluso', 'Add-on'],
                  ['Guias TISS/TUSS', '✓ Incluso no Free', 'Add-on'],
                  ['LGPD compliant', '✓', '✓'],
                ].map(([feat, ours, theirs]) => (
                  <tr key={feat}>
                    <td className="p-4 font-medium text-gray-800">{feat}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{ours}</td>
                    <td className="p-4 text-center text-gray-500">{theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* 06.65 Trust badges */}
      <motion.section {...sectionReveal} className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">Segurança e Conformidade</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: 'LGPD', sub: 'Lei Geral de Proteção de Dados' },
              { icon: Lock, label: 'Criptografia', sub: 'TLS 1.3 + em repouso' },
              { icon: Database, label: 'Hospedagem BR', sub: 'Servidores em território nacional' },
              { icon: FileCheck, label: 'Backup diário', sub: 'Histórico de 30 dias' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="w-12 h-12 rounded-xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mb-3">
                  <Icon size={24} />
                </div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 06.7 FAQ */}
      <motion.section {...sectionReveal} className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors bg-gray-50/50">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Existe um plano gratuito de verdade?</h4>
              <p className="text-gray-600 font-medium">Sim. O plano Básico é totalmente gratuito, sem prazo de expiração e sem pedir cartão de crédito, limitado a 50 pacientes cadastrados. Pra consultórios iniciantes já é suficiente.</p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors bg-gray-50/50">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Preciso instalar algo no meu computador?</h4>
              <p className="text-gray-600 font-medium">Não. O Clinicafy é 100% em nuvem. Você pode acessar de qualquer computador, tablet ou celular usando apenas o seu navegador de internet, de forma segura.</p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors bg-gray-50/50">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Posso testar antes de pagar o plano Profissional?</h4>
              <p className="text-gray-600 font-medium">Você pode começar hoje mesmo utilizando as funcionalidades completas sem apresentar o cartão de crédito nos primeiros 14 dias. Após o teste, você decide se quer assinar.</p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors bg-gray-50/50">
              <h4 className="text-xl font-bold text-gray-900 mb-2">E a segurança dos dados dos meus pacientes?</h4>
              <p className="text-gray-600 font-medium">A privacidade é o nosso alicerce essencial. O sistema hospeda todos os dados com criptografia de banco de dados e SSL. Somos 100% aderentes à Lei Geral de Proteção de Dados (LGPD) e normativas do CFM.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 07. Oferta / CTA Final */}
      <motion.section {...sectionReveal} className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-apple-blue to-blue-700 rounded-[40px] shadow-2xl transform rotate-1 opacity-10"></div>
          <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-12 md:p-20 text-center relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
              Experimente a gestão médica sem fricção.
            </h2>
            <p className="text-xl font-medium text-gray-600 mb-10 max-w-2xl">
              Comece a usar o Clinicafy hoje mesmo e recupere o controle do seu tempo.
            </p>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-full bg-apple-blue hover:bg-blue-600 text-white text-lg font-bold shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all">
                Criar Minha Conta Grátis
              </Button>
            </Link>
            <p className="mt-8 text-sm text-gray-500 font-bold uppercase tracking-widest">
              Sem cartão de crédito • LGPD • Hospedagem no Brasil
            </p>
          </div>
        </div>
      </motion.section>

      {/* 08. Rodapé */}
      <motion.footer {...sectionReveal} className="pt-20 pb-12 px-6 border-t border-gray-200 bg-[#0B1120] text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          <div className="flex flex-col gap-6 w-full md:w-1/3">
            <BrandLogo dark markClassName="w-10 h-10" textClassName="font-black text-2xl tracking-tight" />
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              A suíte clínica definitiva para modernizar o seu consultório. Desenvolvida para que profissionais de saúde foquem no que realmente importa: os pacientes.
            </p>
          </div>
          
          <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase">Produto</h4>
              <a href="#features" className="hover:text-blue-400 transition-colors text-sm font-medium">Funcionalidades</a>
              <a href="#pricing" className="hover:text-blue-400 transition-colors text-sm font-medium">Planos e Preços</a>
              <Link to="/login" className="hover:text-blue-400 transition-colors text-sm font-medium">Login</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase">Soluções</h4>
              {seoLandingPages.slice(0, 3).map((page) => (
                <Link key={page.slug} to={`/${page.slug}`} className="hover:text-blue-400 transition-colors text-sm font-medium">
                  {page.keyword}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase">Legal</h4>
              <a href="#" className="hover:text-blue-400 transition-colors text-sm font-medium">Termos de Uso</a>
              <a href="#" className="hover:text-blue-400 transition-colors text-sm font-medium">Política de Privacidade</a>
              <a href="#" className="hover:text-blue-400 transition-colors text-sm font-medium">Compliance LGPD</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium tracking-wide text-gray-500">
            © 2026 Clinicafy. Todos os direitos reservados. Feito no Brasil.
          </p>
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                <Linkedin size={18} />
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                <Facebook size={18} />
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                <Instagram size={18} />
             </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="rounded-[24px] sm:rounded-[30px] border-[6px] border-white/40 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden relative">
      {/* Browser chrome */}
      <div className="h-9 bg-[#F8F9FA] border-b border-gray-100 flex items-center px-4 gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        <div className="ml-3 px-3 py-1 rounded-md bg-white border border-gray-200 text-[10px] text-gray-400 font-medium flex-1 max-w-[260px] truncate">
          clinicafy.app/dashboard
        </div>
      </div>

      <div className="flex bg-[#F8F9FA]">
        {/* Sidebar */}
        <aside className="w-[110px] sm:w-[140px] bg-white border-r border-gray-100 p-2.5 sm:p-3 hidden sm:flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-3 px-1.5">
            <BrandMark className="w-6 h-6" />
            <span className="text-[10px] font-black text-gray-800">Clínica</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-2 py-1.5">
            <div className="w-3 h-3 bg-white/30 rounded"></div>
            <span className="text-[9px] font-bold">Dashboard</span>
          </div>
          {['Clínica', 'Relatórios', 'Marketing', 'Equipe', 'Faturamento', 'Config.'].map((l) => (
            <div key={l} className="flex items-center gap-2 px-2 py-1.5 text-gray-500">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span className="text-[9px] font-semibold">{l}</span>
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 p-3 sm:p-4 space-y-3 min-w-0">
          {/* Hero card */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 p-3 sm:p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-[11px] sm:text-sm font-black text-gray-900 truncate">
                  Olá, Dr(a). Felipe
                </p>
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-0.5">
                  <Star size={7} /> Pro
                </span>
              </div>
              <p className="text-[9px] text-gray-500 hidden sm:block">
                Resumo da sua clínica hoje.
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <div className="px-2 py-1 rounded-md border border-blue-200 text-blue-600 text-[8px] font-bold whitespace-nowrap">
                + Paciente
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: 'Pacientes', v: '147', c: 'blue' },
              { l: 'Realizadas', v: '28', c: 'emerald' },
              { l: 'Desmarcadas', v: '3', c: 'amber' },
              { l: 'Agendadas', v: '12', c: 'purple' },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-white rounded-lg border border-gray-100 p-1.5 sm:p-2"
              >
                <div
                  className={`w-5 h-5 rounded-md mb-1 flex items-center justify-center ${
                    s.c === 'blue'
                      ? 'bg-blue-100 text-blue-600'
                      : s.c === 'emerald'
                      ? 'bg-emerald-100 text-emerald-600'
                      : s.c === 'amber'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  <div className="w-2 h-2 bg-current rounded-sm opacity-70"></div>
                </div>
                <p className="text-[7px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-wider truncate">
                  {s.l}
                </p>
                <p className="text-base sm:text-lg font-black text-gray-900 leading-none mt-0.5">
                  {s.v}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom: recent patients + agenda */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 bg-white rounded-lg border border-gray-100 p-2 sm:p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-xs font-black text-gray-900">
                  Pacientes Recentes
                </p>
                <span className="text-[8px] text-blue-600 font-bold">Ver todos ›</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { n: 'Ana Silva', i: 'AS', c: 'bg-blue-100 text-blue-600', d: 'Há 2h' },
                  { n: 'Carlos Santos', i: 'CS', c: 'bg-emerald-100 text-emerald-600', d: 'Ontem' },
                  { n: 'Maria Oliveira', i: 'MO', c: 'bg-purple-100 text-purple-600', d: '2 dias' },
                ].map((p) => (
                  <div
                    key={p.n}
                    className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black ${p.c}`}
                    >
                      {p.i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-900 truncate">
                        {p.n}
                      </p>
                      <p className="text-[7px] text-gray-400 font-medium">{p.d}</p>
                    </div>
                    <ChevronRight size={10} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs font-black text-gray-900 mb-2">
                Agenda
              </p>
              <div className="space-y-1.5">
                {[
                  { d: '14', m: 'mai', h: '09:00', n: 'João P.', c: 'bg-blue-50 border-blue-100' },
                  { d: '14', m: 'mai', h: '10:30', n: 'Marta L.', c: 'bg-blue-50 border-blue-100' },
                  { d: '15', m: 'mai', h: '14:00', n: 'Lucas T.', c: 'bg-emerald-50 border-emerald-100' },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 p-1 rounded border ${a.c}`}
                  >
                    <div className="flex flex-col items-center bg-white rounded px-1 py-0.5 border border-gray-100">
                      <span className="text-[6px] uppercase font-bold text-gray-400 tracking-wider">
                        {a.m}
                      </span>
                      <span className="text-[9px] font-black leading-none">{a.d}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-bold text-gray-800 truncate">{a.n}</p>
                      <p className="text-[7px] text-gray-500 font-medium">{a.h}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
