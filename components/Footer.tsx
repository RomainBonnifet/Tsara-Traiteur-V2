"use client";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer>
      <nav className="footer-links">
        <a href="#about">{t.footer.apropos}</a>
        <a href="#formules">{t.footer.formules}</a>
        <a href="#galerie">{t.footer.galerie}</a>
        <a href="#partenaires">{t.footer.partenaires}</a>
        <a href="#contact">{t.footer.contact}</a>
      </nav>
      <div className="footer-social">
        <a href="https://www.instagram.com/tsara_rural/" className="social-btn" aria-label="Instagram" target="blank">
          <Image
            src="/img/svg/instagram-brands-solid-full.svg"
            alt="Logo Facebook"
            width={32}
            height={32}
          />
        </a>
        <a href="https://www.facebook.com/people/Tsara/61586816975312/#" className="social-btn" aria-label="Facebook" target="blank">
          <Image
            src="/img/svg/facebook-brands-solid-full.svg"
            alt="Logo Facebook"
            width={32}
            height={32}
          />
        </a>
      </div>
      <div className="footer-legal">
        <Link href="/cgv">{t.footer.cgv}</Link>
        <Link href="/mentions-legales">{t.footer.mentions}</Link>
      </div>
    </footer>
  );
}
