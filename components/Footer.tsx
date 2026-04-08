import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <nav className="footer-links">
        <a href="#about">À propos</a>
        <a href="#formules">Formules</a>
        <a href="#galerie">Galerie</a>
        <a href="#partenaires">Partenaires</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="footer-social">
        <a href="https://www.instagram.com/tsaratraiteur/" className="social-btn" aria-label="Instagram">
          <Image
            src="/img/svg/instagram-brands-solid-full.svg"
            alt="Logo Facebook"
            width={32}
            height={32}
          />
        </a>
        <a href="" className="social-btn" aria-label="Facebook">
          <Image
            src="/img/svg/facebook-brands-solid-full.svg"
            alt="Logo Facebook"
            width={32}
            height={32}
          />
        </a>
      </div>
      <div className="footer-legal">
        <Link href="/cgv">Conditions Générales de Vente</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
      </div>
    </footer>
  );
}
