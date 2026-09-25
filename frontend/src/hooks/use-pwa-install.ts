import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) ||
      (/macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1);
    setIsIos(ios);

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = () => {
      const standalone = displayMode.matches ||
        ("standalone" in window.navigator && window.navigator.standalone === true);
      setIsStandalone(standalone);
      if (standalone) {
        setIsInstalled(true);
        deferredPrompt.current = null;
        setCanInstall(false);
      }
    };
    updateStandalone();

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
      setIsInstalled(false);
    };

    const handleInstalled = () => {
      deferredPrompt.current = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", updateStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener("change", updateStandalone);
      deferredPrompt.current = null;
    };
  }, []);

  const promptInstall = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;

    // Each browser prompt can only be used once, including dismissed prompts.
    deferredPrompt.current = null;
    setCanInstall(false);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome;
  };

  return {
    canInstall,
    promptInstall,
    isIos,
    isStandalone,
    isInstalled,
  };
}
