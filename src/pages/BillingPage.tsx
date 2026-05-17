import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, Receipt, FileCheck, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../components/FirebaseProvider';
import { PLAN_LIST, PLANS, type PlanId, formatCurrency } from '../lib/plans';
import { cancelSubscription, ensureFreeSubscription, getSubscription, type Subscription } from '../lib/billing';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, { label: string; tone: 'green' | 'amber' | 'red' | 'gray' }> = {
  active: { label: 'Ativo', tone: 'green' },
  authorized: { label: 'Ativo', tone: 'green' },
  pending: { label: 'Aguardando pagamento', tone: 'amber' },
  paused: { label: 'Pausado', tone: 'amber' },
  cancelled: { label: 'Cancelado', tone: 'red' },
  failed: { label: 'Falha no pagamento', tone: 'red' },
  free: { label: 'Gratuito', tone: 'gray' },
};

export default function BillingPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        await ensureFreeSubscription(user.uid);
        const data = await getSubscription(user.uid);
        setSub(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const currentPlanId: PlanId = (sub?.plan as PlanId) || (userProfile?.plan as PlanId) || 'basico';
  const currentPlan = PLANS[currentPlanId];
  const status = sub?.status || 'free';
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.free;

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você voltará para o plano Básico ao final do período pago.')) return;
    try {
      setCancelling(true);
      await cancelSubscription();
      toast.success('Assinatura cancelada com sucesso.');
      await refreshProfile();
      const data = user ? await getSubscription(user.uid) : null;
      setSub(data);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-apple-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faturamento e Cobrança</h2>
          <p className="text-apple-gray-dark">Gerencie sua assinatura, faturas e métodos de pagamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`apple-card md:col-span-2 relative overflow-hidden text-white border-none shadow-xl ${currentPlan.free ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-apple-blue to-blue-700'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white/90">
              <CreditCard size={20} />
              Resumo do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Plano Atual</p>
                <StatusPill tone={statusInfo.tone}>{statusInfo.label}</StatusPill>
              </div>
              <h3 className="text-4xl font-black mt-1">{currentPlan.name}</h3>
              <p className="text-sm opacity-90 mt-2">
                {currentPlan.free
                  ? 'Grátis para sempre'
                  : currentPlan.id === 'vitalicio'
                    ? `${formatCurrency(currentPlan.price)} • pagamento único`
                    : `${formatCurrency(currentPlan.price)} / mês • Ciclo mensal`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-white/20">
              <div className="flex-1">
                <p className="text-xs opacity-80">Próxima cobrança</p>
                <p className="font-bold">{sub?.nextPaymentDate ? new Date(sub.nextPaymentDate).toLocaleDateString('pt-BR') : '—'}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs opacity-80">Profissionais inclusos</p>
                <p className="font-bold">{currentPlan.limits.profissionais} {currentPlan.limits.profissionais > 1 ? 'vagas' : 'vaga'}</p>
              </div>
              <Button
                onClick={() => navigate('/billing/plans')}
                variant="secondary"
                className="rounded-xl text-apple-blue bg-white hover:bg-gray-100 font-bold border-none"
              >
                {currentPlan.free ? 'Fazer Upgrade' : 'Alterar Plano'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard size={20} className="text-apple-gray-dark" />
              Método de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sub?.mpPreapprovalId ? (
              <>
                <div className="p-4 border rounded-2xl bg-gray-50 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5"><CreditCard size={100} /></div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Cartão via Mercado Pago</p>
                  <p className="font-mono font-bold text-lg tracking-widest">**** ••••</p>
                  <p className="text-xs text-gray-500 mt-2">Gerenciado pelo Mercado Pago</p>
                </div>
                {(status === 'active' || status === 'authorized' || status === 'pending') && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                    disabled={cancelling}
                    onClick={handleCancel}
                  >
                    {cancelling ? 'Cancelando...' : 'Cancelar Assinatura'}
                  </Button>
                )}
              </>
            ) : (
              <div className="p-4 border-2 border-dashed rounded-2xl bg-gray-50 text-center">
                <p className="text-sm text-gray-500 mb-3">Nenhum método de pagamento cadastrado.</p>
                <Link to="/billing/plans">
                  <Button className="w-full rounded-xl bg-apple-blue hover:bg-blue-600 text-white">
                    Escolher um plano
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PlansGrid currentPlanId={currentPlanId} status={status} />

      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt size={20} />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sub?.lastPaymentDate ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Plano {currentPlan.name}</p>
                    <p className="text-xs text-gray-500">{new Date(sub.lastPaymentDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold">{formatCurrency(sub.amount || currentPlan.price)}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Pago</span>
                  <Button variant="ghost" size="sm" className="text-apple-blue rounded-lg hover:bg-blue-50">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">Nenhum pagamento registrado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusPill({ tone, children }: { tone: 'green' | 'amber' | 'red' | 'gray'; children: React.ReactNode }) {
  const map = {
    green: 'bg-green-400/20 text-green-100 border-green-300/30',
    amber: 'bg-amber-400/20 text-amber-100 border-amber-300/30',
    red: 'bg-red-400/20 text-red-100 border-red-300/30',
    gray: 'bg-white/20 text-white border-white/20',
  } as const;
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[tone]}`}>{children}</span>;
}

function PlansGrid({ currentPlanId, status }: { currentPlanId: PlanId; status: string }) {
  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle className="text-lg">Planos Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_LIST.map((p) => {
            const isCurrent = p.id === currentPlanId && (status === 'active' || status === 'authorized' || status === 'free');
            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border-2 flex flex-col ${
                  p.highlighted ? 'border-apple-blue bg-blue-50/30' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Atual
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-black">{p.free ? 'Grátis' : formatCurrency(p.price)}</span>
                  {!p.free && <span className="text-sm text-gray-500">{p.id === 'vitalicio' ? ' único' : '/mês'}</span>}
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-apple-blue mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled className="w-full rounded-xl">Plano atual</Button>
                ) : p.free ? (
                  <Button variant="outline" className="w-full rounded-xl" disabled>
                    Incluído
                  </Button>
                ) : (
                  <Link to={`/billing/checkout?plan=${p.id}`}>
                    <Button className="w-full rounded-xl bg-apple-blue hover:bg-blue-600 text-white">
                      {p.id === 'vitalicio' ? 'Comprar Vitalício' : 'Assinar'}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
          <AlertCircle size={12} /> Pagamentos processados de forma segura pelo Mercado Pago.
        </p>
      </CardContent>
    </Card>
  );
}
