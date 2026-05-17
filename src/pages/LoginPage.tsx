import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { ClipboardList, Mail, Lock, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../components/FirebaseProvider';
import { Navigate, useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={next || '/dashboard'} />;

  const handleAnonymousLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInAnonymously(auth);
    } catch (err: any) {
      const code = err?.code ?? '';
      let msg = 'Erro ao entrar como visitante.';
      if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
        msg = 'Login anônimo não está habilitado no Firebase Console (Authentication → Sign-in method → Anonymous).';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Falha de rede. Verifique sua conexão.';
      } else if (code) {
        msg = `Erro ao entrar como visitante (${code}).`;
      }
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        const code = popupErr?.code ?? '';
        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request' ||
          code === 'auth/operation-not-supported-in-this-environment'
        ) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      const code = err?.code ?? '';
      let msg = 'Erro ao fazer login com Google. Tente novamente.';
      if (code === 'auth/unauthorized-domain') {
        msg = 'Domínio não autorizado no Firebase. Adicione este domínio em Authentication → Settings → Authorized domains.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Login com Google não está habilitado no Firebase Console.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Falha de rede. Verifique sua conexão.';
      } else if (code) {
        msg = `Erro ao fazer login com Google (${code}).`;
      }
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('E-mail ou senha incorretos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center text-white shadow-blue-500/20 shadow-xl mb-4">
              <ClipboardList size={32} />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">MedSystem</CardTitle>
            <CardDescription className="text-apple-gray-dark italic">
              Seu consultório inteligente no iPad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-10">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-apple-gray-dark" size={18} />
                  <Input 
                    type="email" 
                    placeholder="E-mail profissional" 
                    className="pl-10 h-12 rounded-xl bg-apple-gray border-none focus-visible:ring-apple-blue"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-apple-gray-dark" size={18} />
                  <Input 
                    type="password" 
                    placeholder="Sua senha" 
                    className="pl-10 h-12 rounded-xl bg-apple-gray border-none focus-visible:ring-apple-blue"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <Button 
                type="submit" 
                className="w-full h-12 bg-apple-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? 'Acessando...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/5"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-apple-gray-dark">Ou continue com</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 border-black/5 hover:bg-black/5 rounded-xl flex items-center justify-center gap-3 transition-all"
              onClick={handleAnonymousLogin}
              disabled={loading}
            >
              <UserCog className="text-apple-gray-dark" size={18} />
              <span>Entrar como Visitante</span>
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-12 border-black/5 hover:bg-black/5 rounded-xl flex items-center justify-center gap-3 transition-all"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Entrar com Google</span>
            </Button>
          </CardContent>
          <CardFooter className="pb-10 pt-4 text-center justify-center">
            <p className="text-xs text-apple-gray-dark">
              Ao entrar, você concorda com os nossos <br /> 
              <span className="underline cursor-pointer">Termos de Serviço</span> e <span className="underline cursor-pointer">Política de Privacidade</span>.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
