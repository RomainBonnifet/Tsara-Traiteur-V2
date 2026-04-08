import Image from "next/image"

export default function About() {
  return (
    <section id="about">
      <div className="about-block reveal">
        <div className="about-img">
          <Image
            src="/img/Photos/portrait.jpg"
            alt="Portrait Tsara Traiteur"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="about-text-wrap">
          <div className="section-label">Qui sommes-nous</div>
          <h2>Un traiteur au service des <em>saveurs locales</em></h2>
          <p>
            Tsara est un traiteur spécialisé dans les petits-déjeuners fermiers artisanaux,
            élaborés à partir de produits locaux, frais et de saison.
          </p>
          <p>
            Chaque composition est pensée pour garantir qualité, goût et équilibre, tout en
            respectant les circuits courts et une démarche responsable.
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
                <p>À domicile, en gîte ou en séminaire</p>
              </div>
            </div>
            <div className="about-value">
              <div className="about-value-dot"></div>
              <div className="about-value-text">
                <h4>Artisanal &amp; responsable</h4>
                <p>Pains, confitures et produits de la ferme</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about-block reveal">
        <div className="about-img dark">
          <Image
            src="/img/Photos/seminaire-hotel.jpg"
            alt="Prestation séminaire Tsara"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="about-text-wrap">
          <div className="section-label">Nos prestations</div>
          <h2>À domicile ou pour vos <em>séminaires</em></h2>
          <p>
            En famille, entre amis ou entre collègues — Tsara s&apos;adapte à chaque occasion.
            Livraison clé en main pour que vous profitiez pleinement.
          </p>
          <p>
            Basés à Saint-Médard-de-Guizières, nous intervenons sur le Libournais, Bordeaux
            et toute la région girondine.
          </p>
        </div>
      </div>
    </section>
  )
}
