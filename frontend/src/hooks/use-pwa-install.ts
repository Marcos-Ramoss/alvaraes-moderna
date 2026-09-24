import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);
    
    // Verifica se está rodando em modo standalone (PWA)
    const checkStandalone = () => window.matchMedia("(display-mode: standalone)").matches || ("standalone" in window.navigator && (window.navigator as any).standalone === true);
    const standalone = checkStandalone();
    setIsStandalone(standalone);

    // Salva e lê do localStorage para lembrar que já foi instalado mesmo se abrir no navegador
    const locallyInstalled = localStorage.getItem("pwa_installed") === "true";
    setIsInstalled(standalone || locallyInstalled);
    if (standalone) {
      localStorage.setItem("pwa_installed", "true");
    }

    // Verifica compatibilidade com a API de instalação
    const supportsPrompt = 'onbeforeinstallprompt' in window || 'BeforeInstallPromptEvent' in window;
    setIsSupported(supportsPrompt || ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstalled(true);
      localStorage.setItem("pwa_installed", "true");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstalled(true);
      localStorage.setItem("pwa_installed", "true");
    }
  };

  return {
    canInstall: !!deferredPrompt,
    promptInstall,
    isIos,
    isStandalone,
    isInstalled,
    isSupported
  };
}
