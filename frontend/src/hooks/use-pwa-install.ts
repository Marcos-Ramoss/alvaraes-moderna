import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

function getInitialPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window !== "undefined" && window.__pwaPrompt) {
    return window.__pwaPrompt;
  }
  return globalDeferredPrompt;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

function notifyPromptListeners() {
  promptListeners.forEach((listener) => listener(getInitialPrompt()));
}

if (typeof window !== "undefined") {
  if (window.__pwaPrompt) {
    globalDeferredPrompt = window.__pwaPrompt;
  }

  window.addEventListener("pwa-prompt-available", () => {
    if (window.__pwaPrompt) {
      globalDeferredPrompt = window.__pwaPrompt;
      notifyPromptListeners();
    }
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.__pwaPrompt = e as BeforeInstallPromptEvent;
    notifyPromptListeners();
  });

  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    window.__pwaPrompt = null;
    notifyPromptListeners();
  });
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(() => Boolean(getInitialPrompt()));
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(userAgent) ||
      (/macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1);
    setIsIos(ios);

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = () => {
      const standalone =
        displayMode.matches ||
        ("standalone" in window.navigator &&
          (window.navigator as unknown as { standalone?: boolean }).standalone === true);
      setIsStandalone(standalone);
      if (standalone) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    };
    updateStandalone();

    const handlePromptChange = (prompt: BeforeInstallPromptEvent | null) => {
      setCanInstall(Boolean(prompt));
      if (prompt) {
        setIsInstalled(false);
      }
    };

    promptListeners.add(handlePromptChange);
    displayMode.addEventListener("change", updateStandalone);

    return () => {
      promptListeners.delete(handlePromptChange);
      displayMode.removeEventListener("change", updateStandalone);
    };
  }, []);

  const promptInstall = async () => {
    const prompt = getInitialPrompt();
    if (!prompt) return;

    globalDeferredPrompt = null;
    if (typeof window !== "undefined") {
      window.__pwaPrompt = null;
    }
    notifyPromptListeners();
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
