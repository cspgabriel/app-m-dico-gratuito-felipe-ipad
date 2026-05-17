import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, Receipt, FileCheck, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import MercadoPagoCheckout from '../components/MercadoPagoCheckout';

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faturamento e Cobrança</h2>
          <p className="text-apple-gray-dark">Gerencie sua assinatura, faturas e métodos de pagamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="apple-card md:col-span-2 relative overflow-hidden bg-gradient-to-br from-apple-blue to-blue-700 text-white border-none shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white/90">
              <CreditCard size={20} />
              Resumo do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Plano Atual</p>
              <h3 className="text-4xl font-black mt-1">Clínica Pro</h3>
              <p className="text-sm opacity-90 mt-2">R$ 149,00 / mês • Ciclo mensal</p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-white/20">
              <div className="flex-1">
                <p className="text-xs opacity-80">Próxima renovação</p>
                <p className="font-bold">20 de Julho, 2026</p>
              </div>
              <div className="flex-1">
                <p className="text-xs opacity-80">Profissionais ativos</p>
                <p className="font-bold">2 de 5 vagas</p>
              </div>
              <Button variant="secondary" className="rounded-xl text-apple-blue bg-white hover:bg-gray-100 font-bold border-none">
                Alterar Plano
              </Button>
            </div>
            <div className="pt-2">
              <MercadoPagoCheckout planName="Clínica Pro – Mensal" amount={149.0} label="Renovar com Mercado Pago" />
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
            <div className="p-4 border rounded-2xl bg-gray-50 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <CreditCard size={100} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase">Cartão de Crédito</p>
              <p className="font-mono font-bold text-lg tracking-widest">**** 4242</p>
              <p className="text-xs text-gray-500 mt-2">Vence em 08/29</p>
            </div>
            <Button variant="outline" className="w-full rounded-xl">Atualizar Cartão</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt size={20} />
            Histórico de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'INV-2026-06', date: '20/06/2026', amount: 'R$ 149,00', status: 'Pago' },
              { id: 'INV-2026-05', date: '20/05/2026', amount: 'R$ 149,00', status: 'Pago' },
              { id: 'INV-2026-04', date: '20/04/2026', amount: 'R$ 149,00', status: 'Pago' },
            ].map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{inv.id}</p>
                    <p className="text-xs text-gray-500">{inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold">{inv.amount}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{inv.status}</span>
                  <Button variant="ghost" size="sm" className="text-apple-blue rounded-lg hover:bg-blue-50">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
