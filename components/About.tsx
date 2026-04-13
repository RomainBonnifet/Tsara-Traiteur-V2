import Image from "next/image";

export default function About() {
  return (
    <section id="about">
      <div className="about-block reveal">
        <div className="about-img">
          <Image
            src="/img/Photos/portrait.jpg"
            alt="Portrait Tsara Traiteur"
            fill
            className="about-portrait"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="about-text-wrap">
          <div className="section-label">Qui sommes-nous</div>
          <h2>
            Un traiteur au service des <em>saveurs locales</em>
          </h2>
          <p>
            Tsara est un traiteur spécialisé dans les petits-déjeuners fermiers
            artisanaux, élaborés à partir de produits locaux, frais et de
            saison, directement issus de fermes et artisans partenaires.
          </p>
          <p>
            Chaque composition est 100 % faite maison, pensée pour garantir
            qualité, goût et équilibre, tout en valorisant les circuits courts
            et une démarche responsable.
          </p>
          <div className="about-values">
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>Circuits courts</h4>
                <p>Producteurs locaux sélectionnés avec soin</p>
              </div>
            </div>
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>Livraison flexible</h4>
                <p>
                  À domicile, en gîte, en chambre d'hôtes ou pour vos séminaires
                </p>
              </div>
            </div>
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>Artisanal &amp; responsable</h4>
                <p>Viennoiseries maison, jus local et produits de la ferme</p>
              </div>
            </div>
          </div>
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
          <div className="section-label">Nos prestations</div>
          <h2>
            Pour vos <em>évènements privés</em> ou <em>professionnels</em>
          </h2>
          <p>
            Pour un lendemain de mariage, un baptême, un anniversaire, EVG ou
            bien au bureau ou en séminaire entre collègues, Tsara s’adapte à
            chaque occasion. Profitez d’une livraison clé en main, pensée pour
            vous simplifier l’organisation et vous laisser savourer pleinement
            le moment.
          </p>
          <p>
            Basés à Saint-Médard-de-Guizières, nous intervenons sur le
            Libournais, Bordeaux et l’ensemble de la région girondine.
          </p>
        </div>
      </div>
    </section>
  );
}
