import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Video,
  Clock,
  X,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../components/FirebaseProvider';
import {
  addDoc,
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month';

interface AgendaEvent {
  id: string;
  pacienteId: string;
  patientName: string;
  start: Date;
  durationMin: number;
  tipo: string;
  local: 'Presencial' | 'Telemedicina';
  source: 'agendamento' | 'consulta';
  status: 'confirmed' | 'pending';
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfWeek = (d: Date) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - r.getDay());
  return r;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const fmtTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

export default function AgendaPage() {
  const { user, tenantId } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewModal, setShowNewModal] = useState(false);

  const [patients, setPatients] = useState<{ id: string; nome: string }[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);

  // Subscribe patients
  useEffect(() => {
    if (!tenantId) return;
    const q = query(collection(db, 'pacientes'), where('userId', '==', tenantId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, nome: (d.data() as any).nome }));
      list.sort((a, b) => a.nome.localeCompare(b.nome));
      setPatients(list);
    });
  }, [tenantId]);

  // Subscribe agendamentos
  useEffect(() => {
    if (!tenantId) return;
    const q = query(collection(db, 'agendamentos'), where('userId', '==', tenantId));
    return onSnapshot(
      q,
      (snap) => {
        setAgendamentos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (err) => console.error('agendamentos', err)
    );
  }, [tenantId]);

  // Subscribe consultas (for showing past/today's done visits on the agenda)
  useEffect(() => {
    if (!tenantId) return;
    const q = query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId));
    return onSnapshot(
      q,
      (snap) => {
        setConsultas(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (err) => console.error('consultas', err)
    );
  }, [tenantId]);

  const patientName = (id: string) =>
    patients.find((p) => p.id === id)?.nome || 'Paciente removido';

  const events: AgendaEvent[] = useMemo(() => {
    const out: AgendaEvent[] = [];
    for (const a of agendamentos) {
      if (!a.data) continue;
      out.push({
        id: a.id,
        pacienteId: a.pacienteId,
        patientName: patientName(a.pacienteId),
        start: new Date(a.data),
        durationMin: a.duracao ?? 30,
        tipo: a.tipo || 'Consulta',
        local: a.local || 'Presencial',
        source: 'agendamento',
        status: a.status || 'confirmed',
      });
    }
    for (const c of consultas) {
      if (!c.data) continue;
      out.push({
        id: c.id,
        pacienteId: c.pacienteId,
        patientName: patientName(c.pacienteId),
        start: new Date(c.data),
        durationMin: 30,
        tipo: c.queixa ? `Consulta: ${c.queixa.slice(0, 30)}` : 'Consulta realizada',
        local: 'Presencial',
        source: 'consulta',
        status: 'confirmed',
      });
    }
    out.sort((a, b) => a.start.getTime() - b.start.getTime());
    return out;
  }, [agendamentos, consultas, patients]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const key = `${e.start.getFullYear()}-${e.start.getMonth()}-${e.start.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const getEventsFor = (d: Date) => eventsByDay.get(dayKey(d)) ?? [];

  const navigatePeriod = (dir: -1 | 1) => {
    if (view === 'day') setCurrentDate(addDays(currentDate, dir));
    else if (view === 'week') setCurrentDate(addDays(currentDate, dir * 7));
    else {
      const r = new Date(currentDate);
      r.setMonth(r.getMonth() + dir);
      setCurrentDate(r);
    }
  };

  const headerLabel = useMemo(() => {
    if (view === 'day')
      return currentDate
        .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .replace(/^\w/, (c) => c.toUpperCase());
    if (view === 'week') {
      const s = startOfWeek(currentDate);
      const e = addDays(s, 6);
      return `${s.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${e.toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: 'short', year: 'numeric' }
      )}`;
    }
    return currentDate
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase());
  }, [view, currentDate]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Agenda</h2>
          <p className="text-gray-500 font-medium mt-1">
            {events.length} evento{events.length === 1 ? '' : 's'} no total
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-500/20 font-bold"
        >
          <Plus size={18} />
          Novo Agendamento
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => navigatePeriod(-1)}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => navigatePeriod(1)}
          >
            <ChevronRight size={18} />
          </Button>
          <span className="font-bold text-gray-800 ml-2">{headerLabel}</span>
        </div>

        <div className="bg-gray-100 rounded-xl p-1 flex">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {view === 'day' && (
          <DayView
            date={currentDate}
            events={getEventsFor(currentDate)}
            onEventClick={(e) => navigate(`/patients/${e.pacienteId}`)}
          />
        )}
        {view === 'week' && (
          <WeekView
            date={currentDate}
            getEvents={getEventsFor}
            onEventClick={(e) => navigate(`/patients/${e.pacienteId}`)}
            onDayClick={(d) => {
              setCurrentDate(d);
              setView('day');
            }}
          />
        )}
        {view === 'month' && (
          <MonthView
            date={currentDate}
            getEvents={getEventsFor}
            onDayClick={(d) => {
              setCurrentDate(d);
              setView('day');
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {showNewModal && (
          <NewAppointmentModal
            patients={patients}
            tenantId={tenantId}
            defaultDate={currentDate}
            onClose={() => setShowNewModal(false)}
            onCreated={() => {
              setShowNewModal(false);
              toast.success('Agendamento criado!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Day View ---------------- */

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 - 19:00

function DayView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: AgendaEvent[];
  onEventClick: (e: AgendaEvent) => void;
}) {
  return (
    <div className="p-6 lg:p-8">
      <h3 className="text-2xl font-black text-gray-900 mb-6">
        {date
          .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
          .replace(/^\w/, (c) => c.toUpperCase())}
      </h3>
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-16 w-px bg-gray-100" />
        <div className="space-y-6">
          {HOURS.map((h) => {
            const hourEvents = events.filter((e) => e.start.getHours() === h);
            return (
              <div key={h} className="flex relative">
                <div className="w-16 pt-2 text-xs font-bold tracking-wider text-gray-400">
                  {h.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 pl-6 min-h-[4rem]">
                  {hourEvents.length === 0 ? (
                    <div className="border-t border-dashed border-gray-100 mt-4" />
                  ) : (
                    hourEvents.map((ev, i) => (
                      <motion.button
                        key={ev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onEventClick(ev)}
                        className={`mt-2 w-full text-left p-4 rounded-2xl border flex flex-col gap-2 cursor-pointer transition hover:shadow-md ${
                          ev.source === 'consulta'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
                            : ev.status === 'confirmed'
                            ? 'bg-blue-50 border-blue-100 text-blue-900'
                            : 'bg-amber-50 border-amber-100 text-amber-900'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold">{ev.patientName}</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white/60">
                            {ev.source === 'consulta' ? 'Realizada' : ev.status === 'confirmed' ? 'Confirmado' : 'Aguardando'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs font-medium opacity-80">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {fmtTime(ev.start)} ({ev.durationMin}min)
                          </span>
                          <span className="flex items-center gap-1">
                            {ev.local === 'Telemedicina' ? <Video size={14} /> : <MapPin size={14} />}
                            {ev.local}
                          </span>
                          <span className="font-bold">• {ev.tipo}</span>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Week View ---------------- */

function WeekView({
  date,
  getEvents,
  onEventClick,
  onDayClick,
}: {
  date: Date;
  getEvents: (d: Date) => AgendaEvent[];
  onEventClick: (e: AgendaEvent) => void;
  onDayClick: (d: Date) => void;
}) {
  const start = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = new Date();
  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-[60px_repeat(7,minmax(120px,1fr))] min-w-[800px]">
        {/* Header */}
        <div />
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => onDayClick(d)}
            className="p-3 border-b border-l border-gray-100 text-center hover:bg-gray-50 transition"
          >
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
              {WEEKDAYS[d.getDay()]}
            </p>
            <p
              className={`text-2xl font-black mt-1 ${
                sameDay(d, today) ? 'text-blue-600' : 'text-gray-800'
              }`}
            >
              {d.getDate()}
            </p>
          </button>
        ))}

        {/* Hours rows */}
        {HOURS.map((h) => (
          <React.Fragment key={h}>
            <div className="text-[10px] font-bold text-gray-400 text-right pr-2 pt-1 border-t border-gray-100">
              {h.toString().padStart(2, '0')}:00
            </div>
            {days.map((d, i) => {
              const cellEvents = getEvents(d).filter((e) => e.start.getHours() === h);
              return (
                <div
                  key={i}
                  className="min-h-[60px] border-t border-l border-gray-100 p-1 space-y-1"
                >
                  {cellEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      className={`w-full text-left text-[11px] p-1.5 rounded-md font-semibold truncate ${
                        ev.source === 'consulta'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title={`${fmtTime(ev.start)} ${ev.patientName}`}
                    >
                      <span className="font-bold">{fmtTime(ev.start)}</span> {ev.patientName}
                    </button>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Month View ---------------- */

function MonthView({
  date,
  getEvents,
  onDayClick,
}: {
  date: Date;
  getEvents: (d: Date) => AgendaEvent[];
  onDayClick: (d: Date) => void;
}) {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const gridStart = startOfWeek(first);
  const cells: Date[] = [];
  let cursor = new Date(gridStart);
  while (cursor <= last || cells.length % 7 !== 0) {
    cells.push(new Date(cursor));
    cursor = addDays(cursor, 1);
    if (cells.length > 42) break;
  }
  const today = new Date();
  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-[10px] uppercase font-bold tracking-widest text-gray-400 text-center py-2"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === date.getMonth();
          const dayEvents = getEvents(d);
          const isToday = sameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => onDayClick(d)}
              className={`min-h-[90px] rounded-xl p-2 border text-left flex flex-col gap-1 transition hover:border-blue-300 ${
                inMonth ? 'bg-white border-gray-100' : 'bg-gray-50/50 border-transparent text-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full ${
                    isToday ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {d.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={`text-[10px] truncate px-1.5 py-0.5 rounded font-semibold ${
                      ev.source === 'consulta'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ev.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {fmtTime(ev.start)} {ev.patientName}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500 font-semibold">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- New Appointment Modal ---------------- */

function NewAppointmentModal({
  patients,
  tenantId,
  defaultDate,
  onClose,
  onCreated,
}: {
  patients: { id: string; nome: string }[];
  tenantId: string | null;
  defaultDate: Date;
  onClose: () => void;
  onCreated: () => void;
}) {
  const navigate = useNavigate();
  const [pacienteId, setPacienteId] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date(defaultDate);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  });
  const [time, setTime] = useState('09:00');
  const [duracao, setDuracao] = useState(30);
  const [tipo, setTipo] = useState('Primeira Consulta');
  const [local, setLocal] = useState<'Presencial' | 'Telemedicina'>('Presencial');
  const [telemedicineUrl, setTelemedicineUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!tenantId) {
      toast.error('Sessão não identificada.');
      return;
    }
    if (!pacienteId) {
      toast.error('Selecione um paciente.');
      return;
    }
    if (!date || !time) {
      toast.error('Informe data e hora.');
      return;
    }
    setSaving(true);
    try {
      const iso = new Date(`${date}T${time}:00`).toISOString();
      await addDoc(collection(db, 'agendamentos'), {
        pacienteId,
        data: iso,
        duracao,
        tipo,
        local,
        telemedicineUrl: local === 'Telemedicina' ? telemedicineUrl.trim() : '',
        status: 'confirmed',
        userId: tenantId,
        createdAt: new Date().toISOString(),
      });
      onCreated();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar agendamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Novo Agendamento</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
              Paciente
            </label>
            {patients.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">
                Nenhum paciente cadastrado.{' '}
                <button
                  onClick={() => navigate('/patients')}
                  className="font-bold underline"
                >
                  Cadastrar agora
                </button>
              </div>
            ) : (
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Selecione...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Data
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Hora
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Duração
              </label>
              <select
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 bg-white"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h30</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Modalidade
              </label>
              <select
                value={local}
                onChange={(e) => setLocal(e.target.value as any)}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 bg-white"
              >
                <option value="Presencial">Presencial</option>
                <option value="Telemedicina">Telemedicina</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
              Tipo
            </label>
            <Input
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ex: Primeira Consulta, Retorno..."
              className="rounded-xl h-11"
            />
          </div>

          {local === 'Telemedicina' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Link da consulta (Teams / Meet / Zoom)
              </label>
              <div className="flex gap-2">
                <Input
                  value={telemedicineUrl}
                  onChange={(e) => setTelemedicineUrl(e.target.value)}
                  placeholder="Cole o link aqui"
                  className="rounded-xl h-11 flex-1"
                />
                <a
                  href="https://teams.microsoft.com/l/meeting/new?subject=Consulta%20m%C3%A9dica"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 h-11 rounded-xl bg-[#5059C9] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#3F47A8]"
                  title="Abrir Teams e gerar link"
                >
                  Teams ↗
                </a>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Clique em "Teams ↗" pra criar a reunião e cole o link gerado aqui.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
          >
            {saving ? 'Salvando...' : 'Agendar'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
