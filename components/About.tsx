"use client";
import Image from "next/image";
import { useLang } from "@/context/LangContext";

export default function About() {
  const { t } = useLang();

  return (
    <section id="about">
      <div className="about-block reveal">
        <div className="about-img">
          <Image
            src="/img/Photos/about.jpg"
            alt="Portrait Tsara Traiteur"
            fill
            className="about-portrait"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="about-text-wrap">
          <div className="section-label">{t.about.label}</div>
          <h2>
            {t.about.titre} <em>{t.about.titreEm}</em>
          </h2>
          <p>
            {t.about.p1}
          </p>
          <p>
            {t.about.p2}
          </p>
          <div className="about-values">
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>{t.about.valeur1Titre}</h4>
                <p>{t.about.valeur1Texte}</p>
              </div>
            </div>
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>{t.about.valeur2Titre}</h4>
                <p>{t.about.valeur2Texte}</p>
              </div>
            </div>
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>{t.about.valeur3Titre}</h4>
                <p>{t.about.valeur3Texte}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* AFTERWORK — 2e bloc : devient nth-child(even), donc l'image passe
          à droite automatiquement grâce à la règle .about-block:nth-child(even) */}
      <div className="about-block afterwork reveal">
        <div className="about-img afterwork-img">
          {/* wrapper intermédiaire : porte le position:relative dont <Image fill>
              a besoin, ce qui permet de mettre le padding sur le parent */}
          <div className="afterwork-img-inner">
            <Image
              src="/img/Photos/plancheAfterWork.jpeg"
              alt="Planche de charcuteries et fromages locaux pour un afterwork"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className="afterwork-badge">
              <div className="afterwork-badge-main">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" />
                </svg>
                <span>Dès 17 h</span>
              </div>
              <div className="afterwork-badge-sub">livré • prêt à partager</div>
            </div>
          </div>
        </div>
        <div className="about-text-wrap">
          <div className="section-label">{t.afterwork.label}</div>
          <h2>
            {t.afterwork.titre}
            <br />
            <em>{t.afterwork.titreEm}</em>
          </h2>
          <p>{t.afterwork.texte}</p>
          <ul className="afterwork-tags">
            {/* La liste vit dans le dictionnaire : elle n’a pas le même
                nombre d’entrées dans toutes les langues si un jour on en
                ajoute, et une clé par tag serait ingérable. */}
            {t.afterwork.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className="afterwork-cards">
            <div className="afterwork-card">
              <svg
                className="afterwork-card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
                <circle cx="10" cy="8" r="3" />
                <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 5.2a3 3 0 0 1 0 5.6" />
              </svg>
              <h4>{t.afterwork.carte1Titre}</h4>
              <p>{t.afterwork.carte1Texte}</p>
            </div>
            <div className="afterwork-card">
              <svg
                className="afterwork-card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <h4>{t.afterwork.carte2Titre}</h4>
              <p>{t.afterwork.carte2Texte}</p>
            </div>
          </div>
          <a href="#contact" className="btn-lime about-cta">
            {t.afterwork.cta}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
      <div className="about-block reveal">
        <div className="about-img dark">
          <Image
            src="/img/Photos/seminaire2.png"
            alt="Prestation séminaire Tsara"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="about-text-wrap">
          <div className="section-label">{t.prestations.label}</div>
          <h2>
            {t.prestations.titre1} <em>{t.prestations.titreEm1}</em>{" "}
            {t.prestations.titre2} <em>{t.prestations.titreEm2}</em>
          </h2>
          <p>
            {t.prestations.p1}
          </p>
          <p>
            {t.prestations.p2}
          </p>
          {/* Même destination que le CTA du hero : l'ancre #contact du
              formulaire. Un visiteur qui a fait défiler jusqu'ici n'a plus
              le hero sous les yeux — sans ce bouton, il devrait remonter
              toute la page pour demander son devis. */}
          <a href="#contact" className="btn-lime about-cta">
            {t.prestations.cta}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
