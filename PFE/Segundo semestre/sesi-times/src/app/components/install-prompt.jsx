"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./install-prompt.module.css";

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return undefined;

    navigator.serviceWorker.register("/sw.js").catch(() => null);

    const captureInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const hidePrompt = () => setInstallEvent(null);

    window.addEventListener("beforeinstallprompt", captureInstall);
    window.addEventListener("appinstalled", hidePrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstall);
      window.removeEventListener("appinstalled", hidePrompt);
    };
  }, []);

  useEffect(() => {
    if (!installEvent || dismissed) return undefined;
    const timer = window.setTimeout(() => setVisible(true), 8000);
    return () => window.clearTimeout(timer);
  }, [dismissed, installEvent]);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (!installEvent || dismissed || !visible) return null;

  return (
    <aside className={styles.prompt} aria-label="Instalar aplicativo SESI Times">
      <Image src="/sesi-times-mark.svg" alt="" width={42} height={42} />
      <div><strong>Leve o SESI Times com você</strong><p>Instale o portal para acessar mais rapidamente.</p></div>
      <button type="button" className={styles.install} onClick={install}>Instalar</button>
      <button type="button" className={styles.close} aria-label="Fechar sugestão" onClick={() => setDismissed(true)}>×</button>
    </aside>
  );
}
