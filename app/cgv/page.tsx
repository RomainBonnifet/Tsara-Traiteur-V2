import Link from "next/link"

export default function CGVPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <Link href="/" className="commander-back">← Retour au site</Link>

        <h1>Conditions Générales de Vente</h1>

        <section className="legal-section">
          <h2>1. Identification du vendeur</h2>
          <ul>
            <li><strong>Nom :</strong> Jeanjean Lucas</li>
            <li><strong>Statut :</strong> Micro-entrepreneur</li>
            <li><strong>SIRET :</strong> 80527385100024</li>
            <li><strong>Siège social :</strong> Chemin des bergeries, 33230 Saint-Médard-de-Guizières</li>
            <li><strong>Email :</strong> contact@tsara-rural.fr</li>
            <li><strong>Téléphone :</strong> 05 40 20 72 43</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) ont pour objet de définir les modalités
            de vente et de livraison des prestations de petits-déjeuners proposées par le Vendeur
            à destination de clients particuliers et professionnels.
          </p>
          <p>Toute commande implique l&apos;acceptation pleine et entière des présentes CGV.</p>
        </section>

        <section className="legal-section">
          <h2>3. Zone d&apos;intervention</h2>
          <p>
            Le service de livraison est assuré en région Nouvelle-Aquitaine, dans un périmètre défini
            autour de Saint-Médard-de-Guizières. Le Vendeur se réserve le droit de refuser toute
            commande située hors de cette zone.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Produits et prestations</h2>
          <p>
            Les petits-déjeuners proposés sont composés de produits prêts à consommer, sélectionnés
            auprès de producteurs, fermes et artisans locaux.
          </p>
          <p>
            Les produits sont transportés dans des caissons ou sacs isothermes garantissant le maintien
            de la qualité et de la chaîne de fraîcheur jusqu&apos;à la livraison.
          </p>
          <p>Les photographies et descriptions présentées sur le site sont non contractuelles.</p>
        </section>

        <section className="legal-section">
          <h2>5. Commande</h2>
          <p>Les commandes s&apos;effectuent exclusivement en ligne via le site internet du Vendeur.</p>
          <p>Le client sélectionne :</p>
          <ul>
            <li>la formule souhaitée</li>
            <li>la date de livraison</li>
            <li>le créneau horaire souhaité</li>
            <li>l&apos;adresse de livraison</li>
          </ul>
          <p>La commande est considérée comme ferme et définitive après validation du paiement.</p>

          <h3>5.1 Organisation des créneaux de livraison</h3>
          <p>
            Lors de la commande, le client sélectionne un créneau de livraison souhaité. Toutefois,
            ce créneau est donné à titre indicatif et ne constitue pas un engagement contractuel sur
            l&apos;heure effective de livraison. Les horaires précis de livraison ne sont pas choisis
            par le client, ils sont définis par le Vendeur en fonction de l&apos;organisation de sa tournée.
          </p>
          <p>
            Le créneau horaire de passage est communiqué au client par email, SMS ou téléphone au plus
            tard la veille de la livraison.
          </p>
          <p>
            Le client s&apos;engage à être disponible sur le créneau communiqué ou à prévoir une solution
            de réception (tiers, dépôt sécurisé, etc.).
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Tarifs</h2>
          <p>Les prix sont exprimés en euros (€), toutes taxes comprises (TTC).</p>
          <p>
            Le Vendeur se réserve le droit de modifier ses tarifs à tout moment. Toutefois, les prix
            appliqués sont ceux en vigueur au moment de la commande.
          </p>
          <p>Des frais de livraison peuvent être appliqués selon la distance.</p>
        </section>

        <section className="legal-section">
          <h2>7. Paiement</h2>
          <p>Le paiement est exigible en totalité au moment de la commande.</p>
          <p>Les paiements s&apos;effectuent en ligne via des solutions sécurisées.</p>
          <p>Aucune commande ne sera préparée sans règlement préalable.</p>
        </section>

        <section className="legal-section">
          <h2>8. Livraison</h2>
          <p>
            Les livraisons sont effectuées entre 6h30 et 11h30 à la date choisie lors de la commande.
            Le client s&apos;engage à être présent ou à désigner une personne habilitée à réceptionner
            la commande.
          </p>
          <p>En cas d&apos;absence :</p>
          <ul>
            <li>la commande pourra être déposée sur place (si les conditions le permettent),</li>
            <li>ou sera considérée comme livrée sans possibilité de remboursement.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Clause de retard</h2>
          <p>Le Vendeur s&apos;engage à respecter les créneaux de livraison indiqués.</p>
          <p>
            Toutefois, des retards peuvent survenir en raison de circonstances indépendantes de sa
            volonté, notamment : conditions de circulation, accidents, conditions météorologiques,
            imprévus logistiques.
          </p>
          <p>Dans ce cadre :</p>
          <ul>
            <li>un retard raisonnable ne pourra donner lieu à aucune indemnisation</li>
            <li>le Vendeur s&apos;engage à informer le client dans les meilleurs délais</li>
          </ul>
          <p>
            En cas de retard important impactant significativement la prestation, une solution
            commerciale pourra être proposée à titre de geste commercial, sans caractère obligatoire.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Modification et annulation</h2>
          <p>
            Toute demande de modification ou d&apos;annulation doit être effectuée au minimum 24 heures
            avant la date de livraison.
          </p>
          <p>Passé ce délai :</p>
          <ul>
            <li>la commande est due dans sa totalité</li>
            <li>aucun remboursement ne sera effectué</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>11. Responsabilité</h2>
          <p>Le Vendeur est responsable de la conformité de la commande jusqu&apos;à la livraison.</p>
          <p>Après livraison, la responsabilité du Vendeur ne saurait être engagée en cas de :</p>
          <ul>
            <li>mauvaise conservation des produits</li>
            <li>consommation différée</li>
            <li>allergies ou intolérances alimentaires</li>
          </ul>
          <p>Le client est tenu de vérifier la composition des produits avant consommation.</p>
        </section>

        <section className="legal-section">
          <h2>12. Réclamations</h2>
          <p>
            Toute réclamation devra être formulée dans un délai de 24 heures après la livraison
            par email ou téléphone. Des justificatifs (photos notamment) pourront être demandés.
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Données personnelles</h2>
          <p>Les informations collectées sont nécessaires au traitement des commandes.</p>
          <p>
            Elles sont traitées de manière confidentielle et ne sont pas cédées à des tiers.
            Conformément à la réglementation en vigueur, le client dispose d&apos;un droit d&apos;accès,
            de rectification et de suppression de ses données.
          </p>
        </section>

        <section className="legal-section">
          <h2>14. Droit applicable et litiges</h2>
          <p>Les présentes CGV sont soumises au droit français.</p>
          <p>
            En cas de litige, une solution amiable sera privilégiée. À défaut, les tribunaux compétents
            seront ceux du ressort du siège social du Vendeur.
          </p>
        </section>

        <section className="legal-section">
          <h2>15. Mentions fiscales</h2>
          <p>TVA non applicable, article 293B du CGI.</p>
        </section>
      </div>
    </main>
  )
}
