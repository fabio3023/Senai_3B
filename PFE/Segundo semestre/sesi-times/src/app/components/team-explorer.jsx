"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import TeamActions from "./team-actions";
import styles from "./team-explorer.module.css";

const FAVORITES_KEY = "sesi-favorite-teams";
const FAVORITES_EVENT = "sesi-favorites-change";
const DEFAULT_SEASON = new Date().getFullYear();

function subscribeFavorites(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(FAVORITES_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(FAVORITES_EVENT, callback);
  };
}

function getFavoritesSnapshot() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.join("|") : "";
  } catch {
    return "";
  }
}

function normalizeTeam(team) {
  return {
    id: team.id,
    slug: String(team.slug || "").trim(),
    name: String(team.name || "Time sem nome").trim(),
    nickname: String(team.nickname || "").trim(),
    category: String(team.category || "Outras equipes").trim(),
    season: String(team.season || DEFAULT_SEASON),
    description: String(team.description || "Conheça a identidade desta equipe.").trim(),
    active: team.active !== false && team.active !== 0,
  };
}

export default function TeamExplorer({ initialTeams }) {
  const [teams, setTeams] = useState(initialTeams.map(normalizeTeam));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const favoriteSnapshot = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    () => "",
  );
  const favorites = useMemo(() => favoriteSnapshot.split("|").filter(Boolean), [favoriteSnapshot]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/public", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error?.message || "Não foi possível atualizar os times.");
        }
        return payload;
      })
      .then((payload) => {
        const nextTeams = Array.isArray(payload.teams)
          ? payload.teams.map(normalizeTeam).filter((team) => team.slug && team.active)
          : [];
        setTeams(nextTeams);
        setError("");
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError("Exibindo os dados disponíveis no portal.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => [...new Set(teams.map((team) => team.category))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [teams],
  );

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return teams.filter((team) => {
      const searchable = `${team.name} ${team.nickname} ${team.category}`.toLocaleLowerCase("pt-BR");
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (category === "all" || team.category === category) &&
        (!favoritesOnly || favorites.includes(team.slug))
      );
    });
  }, [category, favorites, favoritesOnly, query, teams]);

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span className={styles.srOnly}>Buscar time</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={query}
            placeholder="Buscar por time, apelido ou turma..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className={styles.selectField}>
          <span className={styles.srOnly}>Filtrar por categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <button
          type="button"
          className={styles.favoriteFilter}
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((current) => !current)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill={favoritesOnly ? "currentColor" : "none"}>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
          Favoritos
        </button>
      </div>

      <div className={styles.resultMeta}>
        <p aria-live="polite">
          {loading ? "Atualizando catálogo..." : `${filteredTeams.length} ${filteredTeams.length === 1 ? "time encontrado" : "times encontrados"}`}
        </p>
        {error ? <span>{error}</span> : null}
      </div>

      {filteredTeams.length ? (
        <div className={styles.grid}>
          {filteredTeams.map((team, index) => (
            <article className={styles.teamCard} key={team.slug}>
              <Link className={styles.teamLink} href={team.slug === "3b" ? "/times/3b" : `/times/${team.slug}`}>
                <div className={styles.visual} data-variant={(index % 3) + 1}>
                  <span className={styles.category}>{team.category}</span>
                  <strong>{team.slug.slice(0, 3).toUpperCase()}</strong>
                  {team.nickname ? <span className={styles.nickname}>{team.nickname}</span> : null}
                  <i />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}><span><i /> Ativo</span><small>{team.season}</small></div>
                  <h3>{team.name}</h3>
                  <p>{team.description}</p>
                  <span className={styles.viewLink}>
                    Ver página do time
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M8 7h9v9" /></svg>
                  </span>
                </div>
              </Link>
              <div className={styles.cardActions}>
                <TeamActions slug={team.slug} name={team.name} compact />
              </div>
            </article>
          ))}

          <article className={styles.joinCard}>
            <span className={styles.plus}>+</span>
            <h3>Seu time ainda não está aqui?</h3>
            <p>Envie uma solicitação para análise da equipe responsável.</p>
            <Link href="/participar">Solicitar cadastro</Link>
          </article>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span aria-hidden="true">⌕</span>
          <h3>Nenhum time encontrado</h3>
          <p>Ajuste a busca ou remova algum filtro para ver outras equipes.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("all"); setFavoritesOnly(false); }}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
