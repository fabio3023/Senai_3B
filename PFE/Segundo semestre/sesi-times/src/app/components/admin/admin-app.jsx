"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./admin-app.module.css";

const DEFAULT_SEASON = new Date().getFullYear();

const STATUS_LABELS = {
  activity: "Atividade",
  approved: "Aprovada",
  cancelled: "Cancelado",
  completed: "Concluído",
  game: "Jogo",
  pending: "Pendente",
  rejected: "Recusada",
  scheduled: "Agendado",
  training: "Treino",
};

function statusLabel(value) {
  return STATUS_LABELS[value] || value;
}

const tabs = [
  { id: "overview", label: "Visão geral" },
  { id: "teams", label: "Times" },
  { id: "events", label: "Agenda" },
  { id: "news", label: "Notícias" },
  { id: "gallery", label: "Galeria" },
  { id: "requests", label: "Solicitações" },
];

async function requestJson(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.error?.details?.message ||
      payload.error?.message ||
      (typeof payload.error === "string" ? payload.error : "") ||
      payload.message ||
      "Não foi possível concluir a operação.",
    );
  }

  return payload;
}

function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

function LoginPanel({ configured, onAuthenticated }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      const result = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      onAuthenticated(result.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.loginSection}>
      <div className={styles.loginIntro}>
        <span className={styles.eyebrow}>Área restrita</span>
        <h1>Administração do portal</h1>
        <p>
          Entre para publicar informações verificadas, organizar a agenda e analisar
          solicitações de novos times.
        </p>
        <ul>
          <li>Conteúdo persistido no banco local</li>
          <li>Sessão protegida por cookie assinado</li>
          <li>Páginas públicas atualizadas pela API</li>
        </ul>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.lockIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="3" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </svg>
        </div>
        <h2>Acessar o painel</h2>
        <p>Use as credenciais configuradas no ambiente do projeto.</p>

        {configured === false ? (
          <div className={styles.setupNotice} role="alert">
            <strong>Configuração necessária</strong>
            <p>
              Defina <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code> e
              <code> SESSION_SECRET</code> no arquivo <code>.env.local</code>.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">E-mail</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            disabled={configured === false || submitting}
          />
          <label htmlFor="admin-password">Senha</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={12}
            disabled={configured === false || submitting}
          />
          <button type="submit" disabled={configured === false || submitting}>
            {submitting ? <><Spinner /> Entrando...</> : "Entrar com segurança"}
          </button>
        </form>
        <p className={styles.formMessage} aria-live="polite">{message}</p>
      </div>
    </section>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <article className={styles.statCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function EmptyList({ children }) {
  return <p className={styles.emptyList}>{children}</p>;
}

function DeleteButton({ onClick, label }) {
  return (
    <button type="button" className={styles.deleteButton} onClick={onClick}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />
      </svg>
      <span className={styles.srOnly}>{label}</span>
    </button>
  );
}

function ContentForm({ type, teams, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submitContent = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const values = Object.fromEntries(form.entries());

    Object.keys(values).forEach((key) => {
      if (values[key] === "") delete values[key];
    });

    if (type === "teams") values.active = form.get("active") === "on";
    if (["events", "news", "gallery"].includes(type)) {
      values.published = form.get("published") === "on";
    }

    try {
      const result = await requestJson(`/api/admin/content/${type}`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      formElement.reset();
      setMessage(result.message || "Conteúdo salvo com sucesso.");
      await onSaved();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.contentForm} onSubmit={submitContent}>
      {type === "teams" ? (
        <>
          <div className={styles.fieldGrid}>
            <label>Nome do time<input name="name" required maxLength={80} /></label>
            <label>Apelido<input name="nickname" maxLength={60} /></label>
            <label>Categoria<input name="category" required maxLength={60} placeholder="Ensino Médio" /></label>
            <label>Temporada<input name="season" type="number" required min="2000" max="2100" defaultValue={DEFAULT_SEASON} /></label>
          </div>
          <label>Descrição<textarea name="description" required maxLength={500} rows={4} /></label>
          <label className={styles.checkField}><input type="checkbox" name="active" defaultChecked /> Publicar time no catálogo</label>
        </>
      ) : null}

      {type === "events" ? (
        <>
          <div className={styles.fieldGrid}>
            <label>Time<select name="teamId" required defaultValue=""><option value="" disabled>Selecione</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
            <label>Título<input name="title" required maxLength={100} placeholder="Jogo amistoso" /></label>
            <label>Tipo<select name="kind" defaultValue="game"><option value="game">Jogo</option><option value="training">Treino</option><option value="activity">Atividade</option></select></label>
            <label>Situação<select name="status" defaultValue="scheduled"><option value="scheduled">Agendado</option><option value="completed">Finalizado</option><option value="cancelled">Cancelado</option></select></label>
            <label>Início<input name="startsAt" type="datetime-local" required /></label>
            <label>Término<input name="endsAt" type="datetime-local" /></label>
            <label>Local<input name="location" maxLength={120} /></label>
            <label>Resultado<input name="result" maxLength={80} placeholder="Ex.: SESI 3 × 2 Visitante" /></label>
          </div>
          <label>Descrição<textarea name="description" maxLength={500} rows={3} placeholder="Adversário, modalidade ou observações..." /></label>
          <label className={styles.checkField}><input type="checkbox" name="published" defaultChecked /> Publicar na agenda</label>
        </>
      ) : null}

      {type === "news" ? (
        <>
          <div className={styles.fieldGrid}>
            <label>Título<input name="title" required maxLength={120} /></label>
            <label>Time relacionado<select name="teamId" defaultValue=""><option value="">Portal geral</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
            <label>Publicação<input name="publishedAt" type="datetime-local" /></label>
          </div>
          <label>Resumo<textarea name="summary" required maxLength={280} rows={3} /></label>
          <label>Conteúdo<textarea name="body" required maxLength={5000} rows={8} /></label>
          <label className={styles.checkField}><input type="checkbox" name="published" defaultChecked /> Publicar notícia</label>
        </>
      ) : null}

      {type === "gallery" ? (
        <>
          <div className={styles.fieldGrid}>
            <label>Título<input name="title" required maxLength={100} /></label>
            <label>Endereço da imagem<input name="imageUrl" type="url" required placeholder="https://..." /></label>
            <label>Time relacionado<select name="teamId" defaultValue=""><option value="">Portal geral</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
          </div>
          <label>Descrição acessível<input name="altText" required maxLength={180} /></label>
          <label>Legenda<input name="caption" maxLength={300} /></label>
          <label className={styles.checkField}><input type="checkbox" name="published" defaultChecked /> Publicar na galeria</label>
        </>
      ) : null}

      <div className={styles.formFooter}>
        <button type="submit" className={styles.primaryButton} disabled={submitting}>
          {submitting ? <><Spinner /> Salvando...</> : "Salvar conteúdo"}
        </button>
        <p aria-live="polite">{message}</p>
      </div>
    </form>
  );
}

function ContentList({ type, items, onDelete }) {
  if (!items.length) return <EmptyList>Nenhum item cadastrado nesta seção.</EmptyList>;

  return (
    <div className={styles.itemList}>
      {items.map((item) => (
        <article className={styles.listItem} key={item.id}>
          <div>
            <span>{statusLabel(item.category || item.kind || item.status || "Conteúdo")}</span>
            <strong>{item.name || item.title}</strong>
            <p>
              {item.nickname || item.summary || item.location || item.altText || "Sem informação adicional."}
            </p>
          </div>
          {type === "teams" && item.slug === "3b" ? (
            <small className={styles.protectedTag}>Time principal</small>
          ) : (
            <DeleteButton label={`Excluir ${item.name || item.title}`} onClick={() => onDelete(type, item.id)} />
          )}
        </article>
      ))}
    </div>
  );
}

function RequestsPanel({ requests, onStatus }) {
  if (!requests.length) return <EmptyList>Nenhuma solicitação recebida.</EmptyList>;

  return (
    <div className={styles.requestList}>
      {requests.map((request) => (
        <article className={styles.requestCard} key={request.id}>
          <div className={styles.requestTop}>
            <div><span>{request.category}</span><h3>{request.teamName}</h3></div>
            <span className={styles.statusTag} data-status={request.status}>{statusLabel(request.status)}</span>
          </div>
          <dl>
            <div><dt>Apelido</dt><dd>{request.nickname || "—"}</dd></div>
            <div><dt>Responsável</dt><dd>{request.requesterName}</dd></div>
            <div><dt>Contato</dt><dd>{request.requesterEmail}</dd></div>
          </dl>
          {request.description ? <p>{request.description}</p> : null}
          {request.status === "pending" ? (
            <div className={styles.requestActions}>
              <button type="button" onClick={() => onStatus(request.id, "approved")}>Aprovar</button>
              <button type="button" onClick={() => onStatus(request.id, "rejected")}>Recusar</button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState({ loading: true, authenticated: false, configured: true });
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const data = await requestJson("/api/admin/dashboard");
      setDashboard({
        teams: data.teams || [],
        events: data.events || [],
        news: data.news || [],
        gallery: data.gallery || [],
        requests: data.requests || [],
      });
    } catch (error) {
      setNotice(error.message);
      if (/autoriz|sessão|sessao/i.test(error.message)) {
        setSession((current) => ({ ...current, authenticated: false }));
      }
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    requestJson("/api/auth/session")
      .then(async (result) => {
        if (!active) return;
        setSession({ loading: false, ...result });
        if (result.authenticated) await loadDashboard();
      })
      .catch((error) => {
        if (active) setSession({ loading: false, authenticated: false, configured: true, error: error.message });
      });

    return () => { active = false; };
  }, [loadDashboard]);

  const stats = useMemo(() => {
    if (!dashboard) return { teams: 0, scheduled: 0, news: 0, pending: 0 };
    return {
      teams: dashboard.teams.filter((team) => team.active !== false).length,
      scheduled: dashboard.events.filter((event) => event.status === "scheduled").length,
      news: dashboard.news.length,
      pending: dashboard.requests.filter((request) => request.status === "pending").length,
    };
  }, [dashboard]);

  const authenticate = async (user) => {
    setSession({ loading: false, authenticated: true, configured: true, user });
    await loadDashboard();
  };

  const logout = async () => {
    await requestJson("/api/auth/logout", { method: "POST" }).catch(() => null);
    setDashboard(null);
    setSession({ loading: false, authenticated: false, configured: true });
  };

  const deleteContent = async (type, id) => {
    if (!window.confirm("Deseja realmente excluir este item?")) return;
    setNotice("");
    try {
      await requestJson(`/api/admin/content/${type}/${id}`, { method: "DELETE" });
      setNotice("Item excluído com sucesso.");
      await loadDashboard();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const updateRequest = async (id, status) => {
    setNotice("");
    try {
      const result = await requestJson(`/api/admin/team-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setNotice(result.message || "Solicitação atualizada.");
      await loadDashboard();
    } catch (error) {
      setNotice(error.message);
    }
  };

  if (session.loading) {
    return <div className={styles.loadingPage}><Spinner /><p>Verificando sessão segura...</p></div>;
  }

  if (!session.authenticated) {
    return <LoginPanel configured={session.configured} onAuthenticated={authenticate} />;
  }

  return (
    <section className={styles.dashboardSection}>
      <div className={styles.dashboardHeader}>
        <div>
          <span className={styles.eyebrow}>Painel de conteúdo</span>
          <h1>Olá, administração</h1>
          <p>Gerencie o que aparece nas páginas públicas do SESI Times.</p>
        </div>
        <button type="button" className={styles.logoutButton} onClick={logout}>Sair do painel</button>
      </div>

      <div className={styles.adminLayout}>
        <nav className={styles.tabNavigation} aria-label="Seções administrativas">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "requests" && stats.pending ? <span>{stats.pending}</span> : null}
            </button>
          ))}
        </nav>

        <div className={styles.dashboardContent}>
          <p className={styles.globalNotice} aria-live="polite">{notice}</p>
          {loadingDashboard && !dashboard ? <div className={styles.inlineLoading}><Spinner /> Carregando dados...</div> : null}

          {dashboard && activeTab === "overview" ? (
            <>
              <div className={styles.statsGrid}>
                <StatCard label="Times ativos" value={stats.teams} detail="visíveis no catálogo" />
                <StatCard label="Próximos eventos" value={stats.scheduled} detail="na agenda pública" />
                <StatCard label="Notícias" value={stats.news} detail="publicadas no portal" />
                <StatCard label="Solicitações" value={stats.pending} detail="aguardando análise" />
              </div>
              <div className={styles.welcomePanel}>
                <div><span>Fluxo editorial</span><h2>Publique somente informações confirmadas</h2></div>
                <ol>
                  <li><strong>1</strong> Receba ou prepare o conteúdo.</li>
                  <li><strong>2</strong> Confirme dados e autorizações.</li>
                  <li><strong>3</strong> Publique e confira a página pública.</li>
                </ol>
              </div>
            </>
          ) : null}

          {dashboard && ["teams", "events", "news", "gallery"].includes(activeTab) ? (
            <section className={styles.managementPanel}>
              <div className={styles.panelHeading}>
                <span>Novo conteúdo</span>
                <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
              </div>
              <ContentForm type={activeTab} teams={dashboard.teams} onSaved={loadDashboard} />
              <div className={styles.existingContent}>
                <h3>Conteúdo cadastrado</h3>
                <ContentList type={activeTab} items={dashboard[activeTab]} onDelete={deleteContent} />
              </div>
            </section>
          ) : null}

          {dashboard && activeTab === "requests" ? (
            <section className={styles.managementPanel}>
              <div className={styles.panelHeading}>
                <span>Participação da comunidade</span>
                <h2>Solicitações de times</h2>
              </div>
              <RequestsPanel requests={dashboard.requests} onStatus={updateRequest} />
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
