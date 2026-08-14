"use client";

import { useEffect, useState } from "react";
import styles from "./back-to-top.module.css";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 560);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      type="button"
      className={styles.backToTop}
      data-visible={visible}
      aria-label="Voltar ao topo"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
