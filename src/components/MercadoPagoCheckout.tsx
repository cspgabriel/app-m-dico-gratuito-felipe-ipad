import React, { useState } from "react";
import { Button } from "./ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  planName?: string;
  amount?: number;
  email?: string;
  label?: string;
}

export default function MercadoPagoCheckout({
  planName = "Clínica Pro – Mensal",
  amount = 149.0,
  email,
  label = "Pagar com Mercado Pago",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, amount, email }),
      });

      if (!res.ok) throw new Error("Falha ao criar preferência");

      const { init_point } = await res.json();
      window.location.href = init_point;
    } catch (err) {
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-xl bg-[#009ee3] hover:bg-[#007cbf] text-white font-bold gap-2"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <CreditCard size={18} />
      )}
      {loading ? "Aguarde..." : label}
    </Button>
  );
}
