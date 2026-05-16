import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, Plus, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DAYS = 7;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // @ts-ignore — iOS Safari
  window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const recentlyDismissed = () => {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  const days = (Date.now() - Number(ts)) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
};

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => {
      setShowBanner(false);
      setDeferred(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    // iOS fallback (não dispara beforeinstallprompt)
    if (isIos()) {
      const t = setTimeout(() => setShowBanner(true), 2500);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onPrompt);
        window.removeEventListener('appinstalled', onInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowBanner(false);
    setShowIosSheet(false);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferred(null);
      }
    } else if (isIos()) {
      setShowIosSheet(true);
    }
  };

  if (isStandalone()) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm z-[60]"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-black/5 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                <Smartphone size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Instalar MedSystem</p>
                <p className="text-xs text-gray-500 truncate">
                  Acesso rápido direto da tela inicial
                </p>
              </div>
              <Button
                size="sm"
                onClick={install}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1 shrink-0"
              >
                <Download size={14} />
                Instalar
              </Button>
              <button
                onClick={dismiss}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIosSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/30">
                  <Smartphone size={28} />
                </div>
                <h3 className="text-xl font-black">Instalar no iPad / iPhone</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Adicione à tela inicial em 2 passos
                </p>
              </div>

              <ol className="space-y-3">
                <li className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    1
                  </div>
                  <p className="text-sm">
                    Toque no botão <Share size={14} className="inline -mt-1" />{' '}
                    <strong>Compartilhar</strong> no Safari
                  </p>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    2
                  </div>
                  <p className="text-sm">
                    Escolha <Plus size={14} className="inline -mt-1" />{' '}
                    <strong>Adicionar à Tela de Início</strong>
                  </p>
                </li>
              </ol>

              <Button
                onClick={dismiss}
                className="w-full mt-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Entendi
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Botão reutilizável (use onde quiser, ex.: Settings) */
export function PWAInstallButton({ className }: { className?: string }) {
  const [supported, setSupported] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (isIos()) {
      setSupported(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setSupported(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!supported) return null;

  const click = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setSupported(false);
    } else {
      setShowIos(true);
    }
  };

  return (
    <>
      <Button onClick={click} className={className} variant="outline">
        <Download size={16} className="mr-2" /> Instalar como app
      </Button>
      {showIos && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowIos(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm">
              No Safari, toque em <Share size={14} className="inline" /> e em seguida em{' '}
              <Plus size={14} className="inline" /> <strong>Adicionar à Tela de Início</strong>.
            </p>
            <Button
              onClick={() => setShowIos(false)}
              className="w-full mt-4 rounded-xl bg-blue-600 text-white font-bold"
            >
              Ok
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
