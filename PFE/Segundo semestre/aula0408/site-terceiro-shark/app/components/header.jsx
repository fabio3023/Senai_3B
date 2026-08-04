"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./header.module.css";

const navigationItems = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/fotos", label: "Fotos" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" onClick={closeMenu}>
          <span className={styles.brandMark} aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M8 31c8-2 13-8 17-19 2 8 7 14 15 18-8 0-14 2-19 7-3-3-7-5-13-6Z" />
            </svg>
          </span>
          <span>
            <strong>Terceiro</strong>
            <small>Shark</small>
          </span>
        </Link>

        <button
          className={[styles.menuButton, isMenuOpen ? styles.menuButtonOpen : ""]
            .filter(Boolean)
            .join(" ")}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="menu-principal"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="menu-principal"
          className={[styles.nav, isMenuOpen ? styles.navOpen : ""]
            .filter(Boolean)
            .join(" ")}
          aria-label="Navegação principal"
        >
          <ul>
            {navigationItems?.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    className={[styles.navLink, isActive ? styles.active : ""]
                      .filter(Boolean)
                      .join(" ")}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link className={styles.headerCta} href="/fotos" onClick={closeMenu}>
            Ver galeria
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
