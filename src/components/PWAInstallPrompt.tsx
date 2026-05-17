import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, Plus, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { BrandMark } from './BrandLogo';

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
              <BrandMark className="w-12 h-12 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Instalar Clinicafy</p>
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
                <BrandMark className="w-16 h-16 mx-auto mb-3" />
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

/* Botão sempre visível para instalar o app */
export function PWAInstallButton({
  className,
  variant = 'ghost',
  compact = false,
}: {
  className?: string;
  variant?: 'ghost' | 'outline' | 'default';
  compact?: boolean;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <div
        className={`flex items-center gap-2 text-emerald-600 text-xs font-semibold ${className ?? ''}`}
      >
        <Smartphone size={14} /> App instalado
      </div>
    );
  }

  const click = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === 'accepted') {
          setInstalled(true);
          setDeferred(null);
        }
      } catch {
        setShowHelp(true);
      }
    } else {
      setShowHelp(true);
    }
  };

  return (
    <>
      <Button
        onClick={click}
        variant={variant === 'default' ? undefined : variant}
        className={className}
      >
        <Download size={16} className={compact ? '' : 'mr-2'} />
        {!compact && <span>Instalar app</span>}
      </Button>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ y: 200, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 200, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 pb-8 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BrandMark className="w-12 h-12" />
                  <div>
                    <h3 className="text-lg font-black">Instalar Clinicafy</h3>
                    <p className="text-xs text-gray-500">
                      Como instalar no seu dispositivo
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {isIos() ? (
                <ol className="space-y-2.5">
                  <li className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </div>
                    <p className="text-sm">
                      Toque em <Share size={14} className="inline -mt-1" />{' '}
                      <strong>Compartilhar</strong> no Safari
                    </p>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </div>
                    <p className="text-sm">
                      Toque em <Plus size={14} className="inline -mt-1" />{' '}
                      <strong>Adicionar à Tela de Início</strong>
                    </p>
                  </li>
                </ol>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">
                    Seu navegador ainda não liberou a instalação automática. Tente:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="bg-gray-50 rounded-2xl p-3">
                      <strong>Chrome / Edge:</strong> ícone <Download size={12} className="inline" /> na
                      barra de endereço, ou Menu (⋮) → <em>Instalar Clinicafy</em>.
                    </li>
                    <li className="bg-gray-50 rounded-2xl p-3">
                      <strong>Safari (Mac):</strong> Arquivo → <em>Adicionar ao Dock</em>.
                    </li>
                    <li className="bg-gray-50 rounded-2xl p-3">
                      <strong>Firefox:</strong> ainda não suporta instalação de PWA.
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500">
                    Dica: o botão automático só aparece em HTTPS depois do site ser usado por alguns
                    segundos.
                  </p>
                </div>
              )}

              <Button
                onClick={() => setShowHelp(false)}
                className="w-full mt-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
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
