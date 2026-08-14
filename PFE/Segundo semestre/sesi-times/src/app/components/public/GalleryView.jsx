"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PublicHero from "./PublicHero";
import { EmptyState, ErrorState, LoadingState } from "./PublicFeedback";
import { formatShortDate, usePublicData } from "./public-data";
import styles from "./GalleryView.module.css";

function PhotoCard({ item, index, onOpen }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      className={styles.photo}
      type="button"
      onClick={(event) => onOpen(index, event.currentTarget)}
      aria-label={`Ampliar ${item.title || item.alt}`}
      aria-haspopup="dialog"
    >
      {!failed ? (
        // URLs locais e HTTP(S) são validadas antes de chegar ao componente.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className={styles.brokenImage}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="m4 18 5-5 3 3 2-2 6 5M8 9h.01" />
          </svg>
          Imagem indisponível
        </span>
      )}
      <span className={styles.overlay} aria-hidden="true">
        <span className={styles.zoomIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg>
        </span>
      </span>
      {(item.title || item.caption) ? (
        <span className={styles.photoCaption}>
          {item.title ? <strong>{item.title}</strong> : null}
          {item.caption ? <small>{item.caption}</small> : null}
        </span>
      ) : null}
    </button>
  );
}

function Lightbox({ items, selectedIndex, onChange, onClose, returnFocusRef }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const item = items[selectedIndex];
  const imageFailed = item ? failedImages.has(item.id) : false;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const returnFocus = returnFocusRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus();
    };
  }, [returnFocusRef]);

  useEffect(() => {
    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && items.length > 1) onChange((selectedIndex + 1) % items.length);
      if (event.key === "ArrowLeft" && items.length > 1) onChange((selectedIndex - 1 + items.length) % items.length);
    }

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [items.length, onChange, onClose, selectedIndex]);

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!item) return null;
  const labelId = `gallery-dialog-title-${item.id}`;

  return (
    <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onKeyDown={trapFocus}
      >
        <div className={styles.dialogTopbar}>
          <span>{selectedIndex + 1} de {items.length}</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar imagem ampliada">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
          </button>
        </div>

        <div className={styles.lightboxImage}>
          {!imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.alt}
              onError={() => setFailedImages((current) => new Set(current).add(item.id))}
            />
          ) : (
            <span className={styles.lightboxBroken}>Não foi possível exibir esta imagem.</span>
          )}

          {items.length > 1 ? (
            <>
              <button
                className={`${styles.navButton} ${styles.previous}`}
                type="button"
                onClick={() => onChange((selectedIndex - 1 + items.length) % items.length)}
                aria-label="Ver imagem anterior"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                className={`${styles.navButton} ${styles.next}`}
                type="button"
                onClick={() => onChange((selectedIndex + 1) % items.length)}
                aria-label="Ver próxima imagem"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </>
          ) : null}
        </div>

        <div className={styles.dialogCaption}>
          <div>
            <h2 id={labelId}>{item.title || item.alt}</h2>
            {item.caption ? <p>{item.caption}</p> : null}
          </div>
          <dl>
            {formatShortDate(item.date) ? <div><dt>Data</dt><dd>{formatShortDate(item.date)}</dd></div> : null}
            {item.credit ? <div><dt>Crédito</dt><dd>{item.credit}</dd></div> : null}
          </dl>
        </div>
        <p className={styles.keyboardHint}>Use as setas para navegar e Esc para fechar.</p>
      </section>
    </div>
  );
}

export default function GalleryView() {
  const { data, error, loading, retry } = usePublicData();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const returnFocusRef = useRef(null);
  const items = data?.gallery || [];

  function openPhoto(index, trigger) {
    returnFocusRef.current = trigger;
    setSelectedIndex(index);
  }

  const closePhoto = useCallback(() => setSelectedIndex(null), []);

  return (
    <main id="conteudo" tabIndex="-1" className={styles.page}>
      <PublicHero
        eyebrow="Galeria"
        title="Momentos que merecem ficar guardados."
        description="Veja os registros publicados dos times, atividades e encontros da comunidade escolar."
        icon="gallery"
      />

      <section className={styles.section} aria-labelledby="gallery-title">
        <div className={styles.container}>
          <div className={styles.heading}>
            <div>
              <span className={styles.kicker}>Registros do portal</span>
              <h2 id="gallery-title">Galeria SESI Times</h2>
              <p>Selecione uma imagem para ampliar e navegar pela coleção.</p>
            </div>
            {!loading && !error && items.length ? (
              <span className={styles.count}>{items.length} {items.length === 1 ? "imagem" : "imagens"}</span>
            ) : null}
          </div>

          {loading ? <LoadingState label="Carregando a galeria…" /> : null}
          {error ? <ErrorState message={error.message} onRetry={retry} /> : null}
          {!loading && !error && !items.length ? (
            <EmptyState
              title="Nenhuma imagem publicada"
              description="A galeria será atualizada quando houver registros disponibilizados no portal."
            />
          ) : null}
          {!loading && !error && items.length ? (
            <div className={styles.grid}>
              {items.map((item, index) => (
                <PhotoCard key={item.id} item={item} index={index} onOpen={openPhoto} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {selectedIndex !== null ? (
        <Lightbox
          items={items}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
          onClose={closePhoto}
          returnFocusRef={returnFocusRef}
        />
      ) : null}
    </main>
  );
}
