"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    handler(); // vérifie la position dès le montage, sans attendre un scroll
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
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
          <a href="#formules" onClick={() => setMenuOpen(false)}>Formules</a>
        </li>
        <li>
          <a href="#galerie" onClick={() => setMenuOpen(false)}>Galerie</a>
        </li>
        <li>
          <a href="#partenaires" onClick={() => setMenuOpen(false)}>Partenaires</a>
        </li>
        <li>
          <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
            Réserver
          </a>
        </li>
      </ul>
      <Link href="/panier" className="nav-cart" aria-label="Panier">
        🛒
        {count > 0 && <span className="nav-cart-count">{count}</span>}
      </Link>
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
