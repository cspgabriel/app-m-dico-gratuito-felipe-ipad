import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, CreditCard, AlertCircle, LockKeyhole, BadgeCheck, Landmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { PLANS, formatCurrency, type PlanId } from '../lib/plans';
import { createSubscriptionPreapproval, createCheckoutPreference } from '../lib/billing';
import { toast } from 'sonner';

type Mode = 'subscription' | 'single';

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const planId = (params.get('plan') as PlanId) || 'profissional';
  const plan = PLANS[planId];

  const [mode, setMode] = useState<Mode>(planId === 'vitalicio' ? 'single' : 'subscription');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      const next = `/billing/checkout?plan=${planId}`;
      navigate(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [authLoading, user, planId, navigate]);

  const handleCheckout = async () => {
    if (!plan || plan.free) return;
    setSubmitting(true);
    setError(null);
    try {
      let result: { initPoint: string; preapprovalId?: string; preferenceId?: string };
      if (mode === 'subscription') {
        try {
          result = await createSubscriptionPreapproval(planId, user!.email!);
        } catch (subscriptionErr) {
          console.warn('[checkout] subscription failed, falling back to Checkout Pro', subscriptionErr);
          toast.info('Assinatura recorrente indisponível agora. Abrindo pagamento seguro único pelo Mercado Pago.');
          result = await createCheckoutPreference(planId);
        }
      } else {
        result = await createCheckoutPreference(planId);
      }
      const initPoint = (result as any).initPoint;
      if (!initPoint) throw new Error('Não foi possível iniciar o pagamento.');
      window.location.href = initPoint;
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Erro ao iniciar checkout.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  if (!plan || plan.free) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="mx-auto text-amber-500" size={40} />
            <h2 className="text-xl font-bold">Plano não disponível para checkout</h2>
            <p className="text-sm text-gray-600">O plano selecionado não requer pagamento.</p>
            <Link to="/billing"><Button>Voltar para faturamento</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/billing" className="inline-flex items-center gap-2 text-sm font-medium text-apple-gray-dark hover:text-black mb-6">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="md:col-span-3 border-none shadow-xl rounded-3xl">
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-apple-blue mb-2">Checkout seguro</p>
                <h1 className="text-3xl font-black tracking-tight">Plano {plan.name}</h1>
                <p className="text-gray-600 mt-2">{plan.description}</p>
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <TrustBadge icon={LockKeyhole} label="SSL" sub="Conexão segura" />
                  <TrustBadge icon={Landmark} label="Mercado Pago" sub="Pix, cartão e boleto" />
                  <TrustBadge icon={BadgeCheck} label="Ativação" sub="Plano liberado no app" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700">Modalidade de pagamento</p>
                {planId !== 'vitalicio' && (
                  <button
                    type="button"
                    onClick={() => setMode('subscription')}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${mode === 'subscription' ? 'border-apple-blue bg-blue-50/40' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={mode === 'subscription' ? 'text-apple-blue' : 'text-gray-300'} size={20} />
                      <div className="flex-1">
                        <p className="font-bold">Assinatura recorrente <span className="text-[10px] font-bold uppercase bg-apple-blue text-white px-2 py-0.5 rounded-full ml-1">Recomendado</span></p>
                        <p className="text-xs text-gray-600 mt-1">Cobrança automática todo mês. Cancele quando quiser.</p>
                      </div>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${mode === 'single' ? 'border-apple-blue bg-blue-50/40' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={mode === 'single' ? 'text-apple-blue' : 'text-gray-300'} size={20} />
                    <div className="flex-1">
                      <p className="font-bold">{planId === 'vitalicio' ? 'Pagamento único vitalício' : 'Pagamento único (1 mês)'}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {planId === 'vitalicio' ? 'Sem mensalidades. Libera o plano vitalício após aprovação.' : 'Pague uma vez via Pix, boleto ou cartão. Sem renovação automática.'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full h-14 rounded-2xl bg-apple-blue hover:bg-blue-600 text-white text-lg font-bold shadow-xl shadow-blue-500/30"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <><CreditCard className="mr-2" size={20} /> Pagar com Mercado Pago</>}
              </Button>
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Pagamento protegido pelo Mercado Pago
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-none shadow-xl rounded-3xl bg-gradient-to-br from-apple-blue to-blue-700 text-white h-fit">
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase opacity-80">Resumo</p>
                <h2 className="text-2xl font-bold mt-1">{plan.name}</h2>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm flex items-start gap-2 opacity-95">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/20 space-y-1">
                <div className="flex justify-between text-sm opacity-90">
                  <span>{mode === 'subscription' ? 'Mensalidade' : 'Cobrança única'}</span>
                  <span>{formatCurrency(plan.price)}</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-2">
                  <span>Total hoje</span>
                  <span>{formatCurrency(plan.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
      <div className="w-8 h-8 rounded-xl bg-white text-apple-blue flex items-center justify-center mb-2 shadow-sm">
        <Icon size={17} />
      </div>
      <p className="text-xs font-black text-gray-900 leading-tight">{label}</p>
      <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">{sub}</p>
    </div>
  );
}
