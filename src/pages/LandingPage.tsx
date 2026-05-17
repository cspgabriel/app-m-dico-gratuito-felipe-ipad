import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import {
  ClipboardList,
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
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/FirebaseProvider';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen selection:bg-apple-blue/30 selection:text-apple-blue font-sans pb-20 lg:pb-0">
      <Helmet>
        <title>MedSystem — Prontuário, agenda e gestão para consultórios médicos</title>
        <meta name="description" content="Sistema completo para consultórios e clínicas: prontuário eletrônico, agenda, faturamento TISS/TUSS e financeiro. Comece grátis, sem cartão de crédito." />
        <link rel="canonical" href="https://medsystem.app/" />
      </Helmet>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-apple-blue rounded-lg flex shrink-0 items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ClipboardList size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">MedSystem</span>
          </div>
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
      <section className="pt-32 pb-20 px-6 overflow-hidden lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          
          {/* Left Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 max-w-max mx-auto lg:mx-0 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 shadow-sm mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-amber-900 text-[11px] font-bold uppercase tracking-widest">
                Beta aberto • Vagas limitadas
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Foque no paciente, nós cuidamos <span className="text-apple-blue">da gestão.</span>
            </h1>
            <p className="text-xl text-apple-gray-dark leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transforme a rotina do seu consultório com um sistema inteligente, rápido e sem complicações. Todas as ferramentas em um só lugar.
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
          </motion.div>

          {/* Right Column — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
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

            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-[40px] blur-3xl opacity-20 -z-10 mt-12"></div>
          </motion.div>
        </div>
      </section>

      {/* 02. O Problema */}
      <section className="py-24 px-6 bg-gray-50 border-y border-gray-100">
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
      </section>

      {/* 03. A Agitação */}
      <section className="py-24 px-6 relative overflow-hidden">
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
      </section>

      {/* 04. A Solução */}
      <section className="py-32 px-6 bg-[#0B1120] text-white overflow-hidden relative">
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
            Conheça o MedSystem: <br />
            <span className="text-blue-400">Plataforma Multi-Clínicas de Nova Geração.</span>
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
               <h3 className="text-2xl font-bold text-gray-200">Clínicas sem MedSystem</h3>
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
               <h3 className="text-2xl font-bold text-white">Clínicas com MedSystem</h3>
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
      </section>

      {/* 05. Pilares da Plataforma */}
      <section className="py-24 px-6 bg-white">
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
      </section>

      {/* 06. Segurança e Jurídico */}
      <section className="py-24 px-6 bg-slate-50 border-y border-gray-200">
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
      </section>

      {/* 06.5 Preços (Pricing) */}
      <section className="py-24 px-6 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
            Planos sob medida para o seu momento.
          </h2>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-16">
            Do consultório individual à rede de clínicas, escale a sua operação sem atritos. Não pedimos cartão de crédito antes de você testar.
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
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Prescrição digital simples</li>
                <li className="flex items-center gap-3 text-gray-400 font-medium"><ChevronRight size={18} className="text-gray-300"/> <span className="line-through">Faturamento TISS/TUSS</span></li>
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
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Faturamento TISS/TUSS Automático</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Controle Financeiro (Fluxo de Caixa)</li>
              </ul>
              <Link to={user ? '/billing/checkout?plan=profissional' : '/login?next=%2Fbilling%2Fcheckout%3Fplan%3Dprofissional'}>
                <Button className="w-full h-14 rounded-2xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30">Assinar e Começar</Button>
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-[32px] border border-gray-100 bg-gray-50 shadow-sm hover:shadow-xl transition-shadow text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Multi-Clínicas</h3>
              <p className="text-gray-500 mb-6 h-12">Para clínicas com vários profissionais, recepção e gestão.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">R$ 349</span>
                <span className="text-gray-500 font-medium">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Tudo do plano Profissional</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Até 10 Profissionais Inclusos</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Níveis de permissão Granulares</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><ChevronRight size={18} className="text-blue-500"/> Repasses e Split de Pagamentos</li>
              </ul>
              <Link to={user ? '/billing/checkout?plan=multi' : '/login?next=%2Fbilling%2Fcheckout%3Fplan%3Dmulti'}>
                <Button className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg">Assinar Plano Clínica</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 06.6 Comparativo */}
      <section className="py-24 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight text-center text-gray-900 mb-4">
            Por que trocar pelo MedSystem.
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Comparação honesta com os sistemas mais usados pelos consultórios brasileiros.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-700">Recurso</th>
                  <th className="p-4 font-bold text-apple-blue">MedSystem</th>
                  <th className="p-4 font-bold text-gray-500">Outros</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Plano gratuito permanente', '✓ Até 50 pacientes', 'Trial 7–14 dias'],
                  ['Onboarding sem ligação de vendedor', '✓ 5 minutos', 'Demo obrigatória'],
                  ['Mensalidade do plano Profissional', 'R$ 149', 'R$ 199 a R$ 499'],
                  ['Lembretes WhatsApp', '✓ Incluso', 'Add-on R$ 49+'],
                  ['Recibo médico em PDF', '✓ Incluso', 'Add-on'],
                  ['Faturamento TISS/TUSS', '✓ Incluso', 'Add-on'],
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
      </section>

      {/* 06.65 Trust badges */}
      <section className="py-16 px-6 bg-white">
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
      </section>

      {/* 06.7 FAQ */}
      <section className="py-24 px-6 bg-white">
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
              <p className="text-gray-600 font-medium">Não. O MedSystem é 100% em nuvem. Você pode acessar de qualquer computador, tablet ou celular usando apenas o seu navegador de internet, de forma segura.</p>
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
      </section>

      {/* 07. Oferta / CTA Final */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-apple-blue to-blue-700 rounded-[40px] shadow-2xl transform rotate-1 opacity-10"></div>
          <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-12 md:p-20 text-center relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
              Experimente a gestão médica sem fricção.
            </h2>
            <p className="text-xl font-medium text-gray-600 mb-10 max-w-2xl">
              Comece a usar o MedSystem hoje mesmo e recupere o controle do seu tempo.
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
      </section>

      {/* 08. Rodapé */}
      <footer className="pt-20 pb-12 px-6 border-t border-gray-200 bg-[#0B1120] text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          <div className="flex flex-col gap-6 w-full md:w-1/3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <ClipboardList size={22} />
              </div>
              <span className="font-bold text-2xl tracking-tight">MedSystem</span>
            </div>
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
              <h4 className="text-white font-bold text-sm tracking-widest uppercase">Empresa</h4>
              <a href="#" className="hover:text-blue-400 transition-colors text-sm font-medium">Sobre nós</a>
              <a href="#" className="hover:text-blue-400 transition-colors text-sm font-medium">Blog</a>
              <a href="#" className="hover:text-blue-400 transition-colors text-sm font-medium">Contato</a>
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
            © 2026 MedSystem Clinical Suite. Todos os direitos reservados. Feito no Brasil.
          </p>
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></svg>
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>
             </div>
          </div>
        </div>
      </footer>
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
          medsystem.app/dashboard
        </div>
      </div>

      <div className="flex bg-[#F8F9FA]">
        {/* Sidebar */}
        <aside className="w-[110px] sm:w-[140px] bg-white border-r border-gray-100 p-2.5 sm:p-3 hidden sm:flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-3 px-1.5">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <ClipboardList size={12} />
            </div>
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
