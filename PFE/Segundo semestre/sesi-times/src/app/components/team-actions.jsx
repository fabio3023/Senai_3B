"use client";

import { useState, useSyncExternalStore } from "react";
import styles from "./team-actions.module.css";

const FAVORITES_KEY = "sesi-favorite-teams";
const FAVORITES_EVENT = "sesi-favorites-change";

function readFavorites() {
  try {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(FAVORITES_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(FAVORITES_EVENT, callback);
  };
}

export default function TeamActions({ slug, name, compact = false }) {
  const favoritesSnapshot = useSyncExternalStore(
    subscribe,
    () => readFavorites().join("|"),
    () => "",
  );
  const [message, setMessage] = useState("");
  const isFavorite = favoritesSnapshot.split("|").includes(slug);

  const toggleFavorite = () => {
    const current = readFavorites();
    const next = current.includes(slug)
      ? current.filter((favorite) => favorite !== slug)
      : [...current, slug];

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
    setMessage(current.includes(slug) ? "Time removido dos favoritos." : "Time salvo nos favoritos.");

    if (!current.includes(slug) && "Notification" in window && window.Notification.permission === "granted") {
      new window.Notification(`${name} está nos seus favoritos`, {
        body: "Você encontra este time mais rapidamente no catálogo.",
        icon: "/sesi-times-mark.svg",
      });
    }
  };

  const shareTeam = async () => {
    const teamUrl = new URL(`/times/${encodeURIComponent(slug)}`, window.location.origin).href;
    const shareData = {
      title: `${name} | SESI Times`,
      text: `Conheça o time ${name} no SESI Times.`,
      url: teamUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setMessage("Compartilhamento aberto.");
      } else {
        await navigator.clipboard.writeText(teamUrl);
        setMessage("Link copiado para a área de transferência.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") setMessage("Não foi possível compartilhar agora.");
    }
  };

  return (
    <div className={styles.wrapper} data-compact={compact}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          aria-pressed={isFavorite}
          onClick={toggleFavorite}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"}>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
          {isFavorite ? "Favoritado" : "Favoritar"}
        </button>
        <button type="button" className={styles.actionButton} onClick={shareTeam}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
          </svg>
          Compartilhar
        </button>
      </div>
      <p className={styles.liveMessage} aria-live="polite">{message}</p>
    </div>
  );
}
