"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SitePreferences from "./site-preferences";

const navigation = [
  { href: "/", label: "Início" },
  { href: "/times", label: "Times" },
  { href: "/agenda", label: "Agenda" },
  { href: "/noticias", label: "Notícias" },
  { href: "/galeria", label: "Galeria" },
  { href: "/participar", label: "Participar", accent: true },
];

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      viewBox="0 0 48 48"
      fill="none"
    >
      <path
        d="M24 3.5 42 14v20L24 44.5 6 34V14L24 3.5Z"
        fill="currentColor"
      />
      <path
        d="m24 11 4 8.1 9 1.3-6.5 6.3 1.5 8.9-8-4.2-8 4.2 1.5-8.9-6.5-6.3 9-1.3L24 11Z"
        fill="white"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-container">
          <Link
            className="brand"
            href="/"
            aria-label="SESI Times — página inicial"
            onClick={() => setMenuOpen(false)}
          >
            <BrandMark />
            <span className="brand-copy">
              <strong>SESI Times</strong>
              <small>Mirandópolis</small>
            </span>
          </Link>

          <button
            ref={menuButtonRef}
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="header-actions">
            <nav
              id="main-navigation"
              className="main-navigation"
              aria-label="Navegação principal"
              data-open={menuOpen}
            >
              <ul>
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={item.accent ? "nav-accent" : undefined}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <SitePreferences />
          </div>
        </div>
      </header>
    </>
  );
}
