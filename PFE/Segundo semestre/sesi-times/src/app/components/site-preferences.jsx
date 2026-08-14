"use client";

import { useSyncExternalStore } from "react";
import styles from "./site-preferences.module.css";

const THEME_EVENT = "sesi-theme-change";
const NOTIFICATION_EVENT = "sesi-notification-change";

function subscribeToTheme(callback) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function subscribeToNotifications(callback) {
  window.addEventListener(NOTIFICATION_EVENT, callback);
  return () => window.removeEventListener(NOTIFICATION_EVENT, callback);
}

function getNotificationSnapshot() {
  if (!("Notification" in window)) return "unsupported";
  return window.Notification.permission;
}

function ThemeIcon({ dark }) {
  return dark ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M20.7 15.1A9 9 0 0 1 8.9 3.3 9 9 0 1 0 20.7 15.1Z" />
    </svg>
  );
}

function BellIcon({ enabled }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      {enabled ? <circle className={styles.notificationDot} cx="18.5" cy="5.5" r="3" /> : null}
    </svg>
  );
}

export default function SitePreferences() {
  const darkTheme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);
  const notificationPermission = useSyncExternalStore(
    subscribeToNotifications,
    getNotificationSnapshot,
    () => "unsupported",
  );

  const toggleTheme = () => {
    const nextTheme = darkTheme ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("sesi-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;

    const permission = await window.Notification.requestPermission();
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));

    if (permission === "granted") {
      new window.Notification("Avisos ativados", {
        body: "O SESI Times poderá mostrar novidades neste navegador.",
        icon: "/sesi-times-mark.svg",
      });
    }
  };

  const notificationsEnabled = notificationPermission === "granted";
  const notificationLabel =
    notificationPermission === "unsupported"
      ? "Notificações indisponíveis"
      : notificationsEnabled
        ? "Notificações ativadas"
        : "Ativar notificações";

  return (
    <div className={styles.preferences} aria-label="Preferências do site">
      <button
        type="button"
        className={styles.iconButton}
        aria-label={darkTheme ? "Usar tema claro" : "Usar tema escuro"}
        aria-pressed={darkTheme}
        onClick={toggleTheme}
      >
        <ThemeIcon dark={darkTheme} />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={notificationLabel}
        aria-pressed={notificationsEnabled}
        disabled={notificationPermission === "unsupported"}
        onClick={requestNotifications}
      >
        <BellIcon enabled={notificationsEnabled} />
      </button>
    </div>
  );
}
