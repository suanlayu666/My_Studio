import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as PWA
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener('change', onChange);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Only show if not already installed
      if (!mq.matches) setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Fallback: if beforeinstallprompt never fires but we have SW, show after delay
    // Never show in standalone mode
    const timeout = setTimeout(() => {
      if (!installPrompt && !mq.matches && !isStandalone && 'serviceWorker' in navigator) {
        setIsInstallable(true);
      }
    }, 3000);

    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, []);

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') setIsInstallable(false);
    } else {
      // Fallback: tell user to use browser menu
      alert('请点击浏览器地址栏的安装图标 ⊕ 或右键菜单选择"安装此网站为应用"');
    }
  };

  return { isInstallable, install, isStandalone };
}
