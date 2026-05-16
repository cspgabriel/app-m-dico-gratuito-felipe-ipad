import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ClipboardList, 
  Sparkles, 
  ShieldCheck, 
  Cloud, 
  ChevronRight, 
  MousePointer2, 
  Users, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/FirebaseProvider';

export default function LandingPage() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen selection:bg-apple-blue/30 selection:text-apple-blue">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-apple-blue rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ClipboardList size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">MedSystem</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-apple-blue hover:bg-blue-600 rounded-full text-white px-6">
                  Ir para o App
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-apple-gray-dark hover:text-black transition-colors">
                  Login
                </Link>
                <Link to="/login">
                  <Button className="bg-apple-blue hover:bg-blue-600 rounded-full text-white px-6 shadow-lg shadow-blue-500/20">
                    Começar agora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-8 relative">
          {/* Background blurred circles */}
          <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-[120px] -z-10"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-1.5 rounded-full bg-apple-blue/10 text-apple-blue text-xs font-bold uppercase tracking-wider mb-6 inline-block">
              Inteligência Artificial & UX Premium
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] lg:max-w-4xl mx-auto">
              O prontuário do futuro, hoje no seu <span className="text-apple-blue">iPad.</span>
            </h1>
            <p className="mt-8 text-xl text-apple-gray-dark max-w-2xl mx-auto leading-relaxed">
              Combine a elegância do iPadOS com IA de ponta para organizar suas anamneses, consultas e CID-10 em segundos. 
              Focado 100% na produtividade médica.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Link to="/login">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-apple-blue hover:bg-blue-600 text-white text-lg font-bold shadow-2xl shadow-blue-500/30 gap-3 group transition-all">
                Criar conta gratuita
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-2 border-black/5 bg-white/50 backdrop-blur-md text-lg font-bold hover:bg-white/80 transition-all">
                Ver demonstração
              </Button>
            </Link>
          </motion.div>

          {/* Screenshot Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="pt-20 relative"
          >
             <div className="relative mx-auto rounded-[3rem] border-[12px] border-black p-2 bg-black shadow-2xl overflow-hidden aspect-[4/3] max-w-5xl group">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=2070&auto=format&fit=crop" 
                  alt="Interface MedSystem iPad" 
                  className="w-full h-full object-cover rounded-[2.5rem] brightness-90 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                   <div className="text-white text-left">
                      <p className="text-2xl font-bold">Design que parece Apple.</p>
                      <p className="text-white/60">Experiência nativa otimizada para o toque.</p>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-white/30 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight">Tudo que seu consultório precisa.</h2>
            <p className="text-apple-gray-dark mt-4">Simplicidade na frente, potência por trás.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Sparkles}
              title="Anamnese com IA"
              description="Nossa IA transforma suas falas e anotações em prontuários estruturados automaticamente."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Segurança Máxima"
              description="Seus dados estão protegidos por criptografia de ponta a ponta e login seguro Firebase."
              color="bg-green-500"
            />
            <FeatureCard 
              icon={Cloud}
              title="Sincronização em Nuvem"
              description="Acesse de qualquer iPad, iPhone ou Desktop. Seus dados estão sempre com você."
              color="bg-purple-500"
            />
            <FeatureCard 
              icon={Users}
              title="Gestão de Pacientes"
              description="Histórico completo de consultas, exames e evoluções clínicas em uma só tela."
              color="bg-orange-500"
            />
            <FeatureCard 
              icon={ClipboardList}
              title="CID-10 e TUSS"
              description="Integração nativa com as tabelas CID-10 e TUSS para diagnóstico e faturamento rápido."
              color="bg-red-500"
            />
            <FeatureCard 
              icon={Lock}
              title="Privacidade Garantida"
              description="Conformidade total com a LGPD e sigilo médico rigorosamente respeitado."
              color="bg-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
           <motion.h2 
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
           >
             A medicina evoluiu. <br />
             Seu prontuário também <span className="text-apple-blue italic">deve evoluir.</span>
           </motion.h2>

           <div className="pt-6">
             <Link to="/login">
               <Button size="lg" className="h-20 px-12 rounded-3xl bg-black text-white text-xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-4 mx-auto group">
                 <span>Começar Grátis</span>
                 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
               </Button>
             </Link>
             <p className="mt-6 text-apple-gray-dark font-medium uppercase tracking-widest text-xs">
               Sem cartão de crédito necessário • Grátis para residentes
             </p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-black/5 bg-[#F2F2F7]">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-apple-blue rounded flex items-center justify-center text-white">
              <ClipboardList size={14} />
            </div>
            <span className="font-bold">MedSystem</span>
          </div>
          <div className="flex gap-8 text-sm text-apple-gray-dark">
            <a href="#" className="hover:text-black">Termos</a>
            <a href="#" className="hover:text-black">Privacidade</a>
            <a href="#" className="hover:text-black">Contato</a>
          </div>
          <p className="text-xs text-apple-gray-dark">© 2026 MedSystem Clinical Suite. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="apple-card p-8 group border border-white/60 bg-white/70"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-current/20 mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-apple-gray-dark leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
