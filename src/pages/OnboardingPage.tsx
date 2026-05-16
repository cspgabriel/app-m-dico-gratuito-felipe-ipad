import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth, UserProfile } from '../components/FirebaseProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Building,
  Stethoscope,
  UserCircle,
  Phone,
  MapPin,
  Image as ImageIcon,
  Palette,
  Check,
  ArrowLeft,
  ArrowRight,
  Upload,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type FormState = {
  name: string;
  crm: string;
  specialty: string;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  logoUrl: string;
  primaryColor: string;
};

const SPECIALTIES = [
  'Clínica Geral',
  'Cardiologia',
  'Dermatologia',
  'Pediatria',
  'Ginecologia',
  'Ortopedia',
  'Psiquiatria',
  'Odontologia',
  'Nutrição',
  'Outra',
];

const COLOR_PRESETS = [
  { name: 'Azul Apple', value: '#0A84FF' },
  { name: 'Roxo', value: '#5856D6' },
  { name: 'Verde', value: '#34C759' },
  { name: 'Rosa', value: '#FF2D55' },
  { name: 'Laranja', value: '#FF9500' },
  { name: 'Grafite', value: '#1C1C1E' },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: userProfile?.name ?? '',
    crm: userProfile?.crm ?? '',
    specialty: userProfile?.specialty ?? '',
    clinicName: userProfile?.clinicName ?? '',
    clinicPhone: userProfile?.clinicPhone ?? '',
    clinicAddress: userProfile?.clinicAddress ?? '',
    logoUrl: userProfile?.logoUrl ?? '',
    primaryColor: userProfile?.primaryColor ?? '#0A84FF',
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canAdvance = () => {
    if (step === 1) return form.name.trim().length > 1;
    if (step === 2) return form.clinicName.trim().length > 1;
    return true;
  };

  const next = () => {
    if (!canAdvance()) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleLogoFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 2MB).');
      return;
    }
    setUploading(true);
    try {
      const path = `tenants/${user.uid}/logo-${Date.now()}-${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      update('logoUrl', url);
      toast.success('Logo enviada!');
    } catch (err: any) {
      console.error(err);
      toast.error('Falha no upload. Você pode colar uma URL no campo abaixo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profile: UserProfile = {
        name: form.name.trim(),
        crm: form.crm.trim(),
        specialty: form.specialty,
        clinicName: form.clinicName.trim(),
        clinicPhone: form.clinicPhone.trim(),
        clinicAddress: form.clinicAddress.trim(),
        logoUrl: form.logoUrl.trim(),
        primaryColor: form.primaryColor,
        role: 'admin',
        tenantId: user.uid,
        onboardingComplete: true,
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      await refreshProfile();
      toast.success('Tudo pronto! Bem-vindo(a) ao MedSystem.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: form.name.trim() || userProfile?.name || user.displayName || '',
          crm: form.crm.trim() || userProfile?.crm || '',
          specialty: form.specialty || userProfile?.specialty || '',
          clinicName: form.clinicName.trim() || userProfile?.clinicName || '',
          clinicPhone: form.clinicPhone.trim() || userProfile?.clinicPhone || '',
          clinicAddress: form.clinicAddress.trim() || userProfile?.clinicAddress || '',
          logoUrl: form.logoUrl.trim() || userProfile?.logoUrl || '',
          primaryColor: form.primaryColor || userProfile?.primaryColor || '#0A84FF',
          role: userProfile?.role || 'admin',
          tenantId: userProfile?.tenantId || user.uid,
          onboardingComplete: true,
        } satisfies UserProfile,
        { merge: true },
      );
      await refreshProfile();
      toast.success('Você pode terminar a personalização depois em Configurações.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao pular a configuração inicial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F2F7] to-[#E5E5EA] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-black/5 overflow-hidden"
      >
        {/* Header com progresso */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-apple-gray-dark">
                Passo {step} de {TOTAL_STEPS}
              </span>
              <p className="text-xs text-apple-gray-dark mt-1">
                Configure agora ou ignore e finalize depois em Configurações.
              </p>
            </div>
            <span className="text-xs font-semibold text-apple-gray-dark shrink-0">
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: form.primaryColor }}
              initial={false}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            />
          </div>
        </div>

        <div className="px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">Quem é você?</h1>
                    <p className="text-apple-gray-dark mt-1">
                      Vamos começar pelo profissional responsável.
                    </p>
                  </div>

                  <Field
                    icon={UserCircle}
                    label="Seu nome completo"
                    required
                    value={form.name}
                    onChange={(v) => update('name', v)}
                    placeholder="Dr(a). Fulano de Tal"
                  />
                  <Field
                    icon={Stethoscope}
                    label="CRM / Registro profissional (opcional)"
                    value={form.crm}
                    onChange={(v) => update('crm', v)}
                    placeholder="Ex: 123456/SP"
                  />
                  <div>
                    <label className="text-sm font-bold flex items-center gap-2 mb-2">
                      <Sparkles size={16} style={{ color: form.primaryColor }} />
                      Especialidade
                    </label>
                    <select
                      value={form.specialty}
                      onChange={(e) => update('specialty', e.target.value)}
                      className="w-full h-12 rounded-xl border border-black/10 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/40"
                    >
                      <option value="">Selecione...</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">Sobre a clínica</h1>
                    <p className="text-apple-gray-dark mt-1">
                      Esses dados vão aparecer em relatórios, PDFs e na interface.
                    </p>
                  </div>

                  <Field
                    icon={Building}
                    label="Nome da clínica / empresa"
                    required
                    value={form.clinicName}
                    onChange={(v) => update('clinicName', v)}
                    placeholder="Clínica Saúde & Vida"
                  />
                  <Field
                    icon={Phone}
                    label="Telefone de contato"
                    value={form.clinicPhone}
                    onChange={(v) => update('clinicPhone', v)}
                    placeholder="(11) 99999-0000"
                  />
                  <Field
                    icon={MapPin}
                    label="Endereço"
                    value={form.clinicAddress}
                    onChange={(v) => update('clinicAddress', v)}
                    placeholder="Rua, número, cidade - UF"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">Identidade visual</h1>
                    <p className="text-apple-gray-dark mt-1">
                      Adicione sua logo e escolha a cor principal do sistema.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold flex items-center gap-2 mb-2">
                      <ImageIcon size={16} style={{ color: form.primaryColor }} />
                      Logo da clínica
                    </label>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl border border-dashed border-black/15 bg-apple-gray flex items-center justify-center overflow-hidden shrink-0">
                        {form.logoUrl ? (
                          <img
                            src={form.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={24} className="text-apple-gray-dark" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoFile(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-xl gap-2"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          <Upload size={16} />
                          {uploading ? 'Enviando...' : 'Enviar imagem (até 2MB)'}
                        </Button>
                        <Input
                          placeholder="...ou cole uma URL"
                          value={form.logoUrl}
                          onChange={(e) => update('logoUrl', e.target.value)}
                          className="rounded-xl h-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold flex items-center gap-2 mb-2">
                      <Palette size={16} style={{ color: form.primaryColor }} />
                      Cor principal
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => update('primaryColor', c.value)}
                          className={`h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                            form.primaryColor === c.value
                              ? 'border-black/40 scale-105'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.value }}
                          aria-label={c.name}
                        >
                          {form.primaryColor === c.value && (
                            <Check size={16} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">Confirme tudo</h1>
                    <p className="text-apple-gray-dark mt-1">
                      Revise os dados antes de finalizar.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-apple-gray p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0"
                        style={{ backgroundColor: form.primaryColor }}
                      >
                        {form.logoUrl ? (
                          <img
                            src={form.logoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          form.clinicName.charAt(0).toUpperCase() || 'M'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{form.clinicName || '—'}</p>
                        <p className="text-xs text-apple-gray-dark truncate">
                          {form.name} {form.crm && `· ${form.crm}`}
                        </p>
                      </div>
                    </div>

                    <SummaryRow label="Especialidade" value={form.specialty} />
                    <SummaryRow label="Telefone" value={form.clinicPhone} />
                    <SummaryRow label="Endereço" value={form.clinicAddress} />
                    <SummaryRow
                      label="Cor"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: form.primaryColor }}
                          />
                          {form.primaryColor}
                        </span>
                      }
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-8">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-apple-gray-dark"
              onClick={handleSkip}
              disabled={loading}
            >
              Ignorar por agora
            </Button>
            {step > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl gap-2"
                onClick={back}
                disabled={loading}
              >
                <ArrowLeft size={16} /> Voltar
              </Button>
            )}
            <Button
              type="button"
              className="flex-1 h-12 rounded-xl font-bold text-white shadow-lg gap-2"
              style={{ backgroundColor: form.primaryColor }}
              onClick={next}
              disabled={loading}
            >
              {loading
                ? 'Salvando...'
                : step === TOTAL_STEPS
                ? 'Finalizar e entrar'
                : 'Continuar'}
              {step < TOTAL_STEPS && <ArrowRight size={16} />}
              {step === TOTAL_STEPS && !loading && <Check size={16} />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold flex items-center gap-2 mb-2">
        <Icon size={16} className="text-apple-blue" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl h-12"
        required={required}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-apple-gray-dark font-semibold">{label}</span>
      <span className="font-bold text-right truncate">{value || '—'}</span>
    </div>
  );
}
