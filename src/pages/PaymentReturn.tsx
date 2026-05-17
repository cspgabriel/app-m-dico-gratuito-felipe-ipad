import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { getSubscription, type Subscription } from '../lib/billing';

type Variant = 'success' | 'failure' | 'pending';

export default function PaymentReturn({ variant }: { variant: Variant }) {
  const [params] = useSearchParams();
  const plan = params.get('plan');
  const { user, refreshProfile } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [polling, setPolling] = useState(variant === 'success');

  useEffect(() => {
    if (!user || variant !== 'success') return;
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts++;
      const data = await getSubscription(user.uid);
      if (cancelled) return;
      setSub(data);
      const active = data?.status === 'active' || data?.status === 'authorized';
      if (active) {
        setPolling(false);
        await refreshProfile();
      } else if (attempts < 8) {
        setTimeout(tick, 2000);
      } else {
        setPolling(false);
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [user, variant, refreshProfile]);

  const config = {
    success: {
      icon: <CheckCircle2 className="text-green-500" size={56} />,
      title: 'Pagamento aprovado!',
      description: polling
        ? 'Estamos confirmando seu pagamento com o Mercado Pago. Isso pode levar alguns segundos…'
        : sub?.status === 'active' || sub?.status === 'authorized'
          ? `Seu plano ${plan || ''} está ativo. Bem-vindo!`
          : 'O pagamento foi processado. Caso seu plano não esteja ativo em alguns minutos, confira em Faturamento.',
    },
    failure: {
      icon: <AlertCircle className="text-red-500" size={56} />,
      title: 'Pagamento não concluído',
      description: 'Algo deu errado durante o pagamento. Nenhum valor foi cobrado. Você pode tentar novamente.',
    },
    pending: {
      icon: <Clock className="text-amber-500" size={56} />,
      title: 'Pagamento pendente',
    description: 'Estamos aguardando a confirmação do seu pagamento. Pix e boleto podem levar até 1 dia útil para liberar o plano.',
    },
  }[variant];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] p-6">
      <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl">
        <CardContent className="p-10 text-center space-y-5">
          {polling && variant === 'success' ? <Loader2 className="mx-auto animate-spin text-apple-blue" size={56} /> : config.icon}
          <h1 className="text-2xl font-black tracking-tight">{config.title}</h1>
          <p className="text-gray-600">{config.description}</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/billing">
              <Button className="w-full h-12 rounded-2xl bg-apple-blue hover:bg-blue-600 text-white font-bold">
                Ir para Faturamento
              </Button>
            </Link>
            {variant !== 'success' && plan && (
              <Link to={`/billing/checkout?plan=${plan}`}>
                <Button variant="outline" className="w-full h-12 rounded-2xl">Tentar novamente</Button>
              </Link>
            )}
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full h-12 rounded-2xl">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
