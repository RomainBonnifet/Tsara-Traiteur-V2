"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LangContext";
import LangSwitcher from "./LangSwitcher";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    const isMobile = () => window.innerWidth < 768;
    const handler = () => setScrolled(isMobile() || window.scrollY > 40);
    handler(); // vérifie dès le montage
    window.addEventListener("scroll", handler);
    window.addEventListener("resize", handler); // recalcule si on redimensionne
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <nav id="mainNav" className={`main-nav ${scrolled || menuOpen ? "scrolled" : ""}`}>
      <div className="nav-logo-container">
        <a href="#" className="nav-logo">
          Tsara
        </a>
        <Image
          src="/img/Logo/logoNoBackground.png"
          alt="Tsara logo"
          width={50}
          height={50}
        />
      </div>
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li>
          <a href="#formules" onClick={() => setMenuOpen(false)}>{t.nav.formules}</a>
        </li>
        <li>
          <a href="#galerie" onClick={() => setMenuOpen(false)}>{t.nav.galerie}</a>
        </li>
        <li>
          <a href="#partenaires" onClick={() => setMenuOpen(false)}>{t.nav.partenaires}</a>
        </li>
        <li>
          <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
            {t.nav.contact}
          </a>
        </li>
      </ul>
      <div className="nav-actions">
        <LangSwitcher />
        {user ? (
          <>
            {user.role === "admin" && (
              <Link href="/dashboard" className="nav-admin">{t.nav.admin}</Link>
            )}
            <button onClick={logout} className="nav-logout">{t.nav.deconnexion}</button>
          </>
        ) : (
          <Link href="/connexion" className="nav-login">{t.nav.connexion}</Link>
        )}
        <Link href="/panier" className="nav-cart" aria-label={t.nav.panier}>
          🛒
          {count > 0 && <span className="nav-cart-count">{count}</span>}
        </Link>
      </div>
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={t.nav.menu}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
