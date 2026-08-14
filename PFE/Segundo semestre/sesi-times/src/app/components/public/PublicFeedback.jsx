import styles from "./PublicFeedback.module.css";

export function LoadingState({ label = "Carregando informações…" }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action = null }) {
  return (
    <section className={styles.feedback} aria-labelledby="empty-state-title">
      <span className={styles.emptyIcon} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <h2 id="empty-state-title">{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <section className={`${styles.feedback} ${styles.error}`} role="alert" aria-labelledby="error-state-title">
      <span className={styles.errorIcon} aria-hidden="true">!</span>
      <h2 id="error-state-title">Não foi possível carregar esta página</h2>
      <p>{message || "Tente novamente em alguns instantes."}</p>
      {onRetry ? (
        <button className={styles.retryButton} type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      ) : null}
    </section>
  );
}
