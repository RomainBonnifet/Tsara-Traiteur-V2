import Link from "next/link"

export default function MentionsLegalesPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <Link href="/" className="commander-back">← Retour au site</Link>

        <h1>Mentions légales &amp; Politique de confidentialité</h1>

        {/* ── Mentions légales ── */}
        <section className="legal-section">
          <h2>1. Éditeur du site</h2>
          <ul>
            <li><strong>Nom / Prénom :</strong> Jeanjean Lucas</li>
            <li><strong>Statut :</strong> Micro-entrepreneur</li>
            <li><strong>Adresse :</strong> Chemin des bergeries, 33230 Saint-Médard-de-Guizières</li>
            <li><strong>SIRET :</strong> 80527385100024</li>
            <li><strong>Email :</strong> contact@tsara-rural.fr</li>
            <li><strong>Téléphone :</strong> 05 40 20 72 43</li>
            <li><strong>Site web :</strong> www.tsara-rural.fr</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. Directeur de la publication</h2>
          <p>Jeanjean Lucas</p>
        </section>

        <section className="legal-section">
          <h2>3. Hébergement</h2>
          <ul>
            <li><strong>Hébergeur :</strong> LWS (Ligne Web Services)</li>
            <li><strong>Adresse :</strong> 10 Rue Penthièvre, 75008 Paris, France</li>
            <li><strong>Site web :</strong> <a href="https://www.lws.fr" target="_blank" rel="noopener noreferrer">www.lws.fr</a></li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Activité du site</h2>
          <p>
            Le site www.tsara-rural.fr est un site vitrine proposant un service de commande en ligne
            de petits-déjeuners. Les ventes sont encadrées par des{" "}
            <Link href="/cgv">Conditions Générales de Vente</Link> accessibles sur le site.
            Les paiements sont effectués via la plateforme sécurisée Stripe.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Propriété intellectuelle</h2>
          <p>
            Tous les contenus du site (textes, images, graphismes, logo, etc.) sont protégés par
            le Code de la propriété intellectuelle. Toute reproduction, représentation ou exploitation
            sans autorisation est interdite.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Responsabilité</h2>
          <p>
            L&apos;éditeur s&apos;efforce de fournir des informations fiables et à jour. Toutefois,
            il ne saurait être tenu responsable des erreurs, omissions ou indisponibilités du site.
          </p>
        </section>

        {/* ── Politique de confidentialité ── */}
        <div className="legal-divider" />
        <h2 className="legal-chapter">Politique de confidentialité (RGPD)</h2>

        <section className="legal-section">
          <h2>7. Responsable du traitement</h2>
          <p>Le responsable du traitement est : Jeanjean Lucas</p>
        </section>

        <section className="legal-section">
          <h2>8. Données collectées</h2>
          <p>Les données suivantes peuvent être collectées :</p>
          <ul>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison</li>
            <li>Données de transaction (via Stripe, sans accès aux données bancaires)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Finalités et bases légales</h2>
          <p>Les données sont traitées pour :</p>
          <ul>
            <li>gestion des commandes → <strong>exécution du contrat</strong></li>
            <li>gestion client (suivi, support) → <strong>intérêt légitime</strong></li>
            <li>obligations comptables → <strong>obligation légale</strong></li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>10. Destinataires des données</h2>
          <p>
            Les données sont destinées uniquement à l&apos;éditeur du site. Elles peuvent être
            transmises aux sous-traitants suivants :
          </p>
          <ul>
            <li><strong>Stripe Payments Europe Ltd.</strong> (paiement)</li>
            <li><strong>LWS</strong> (hébergement)</li>
          </ul>
          <p>Ces prestataires respectent la réglementation RGPD.</p>
        </section>

        <section className="legal-section">
          <h2>11. Transferts hors Union européenne</h2>
          <p>
            Certains prestataires (notamment Stripe) peuvent transférer des données en dehors de
            l&apos;Union européenne. Ces transferts sont encadrés par des mécanismes conformes au
            RGPD (clauses contractuelles types ou décisions d&apos;adéquation).
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Sécurité des données</h2>
          <p>
            Des mesures techniques et organisationnelles appropriées sont mises en œuvre pour protéger
            les données (HTTPS, paiements sécurisés, accès restreint).
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Durée de conservation</h2>
          <ul>
            <li><strong>Données clients (commandes) :</strong> 3 ans à compter de la dernière interaction</li>
            <li><strong>Données de facturation :</strong> 10 ans (obligation légale comptable)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>14. Droits des utilisateurs</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li>droit d&apos;accès</li>
            <li>droit de rectification</li>
            <li>droit à l&apos;effacement</li>
            <li>droit d&apos;opposition</li>
            <li>droit à la limitation du traitement</li>
          </ul>
          <p>
            Vous pouvez exercer vos droits à :{" "}
            <a href="mailto:contact@tsara-rural.fr">contact@tsara-rural.fr</a>
          </p>
          <p>
            Vous avez également le droit d&apos;introduire une réclamation auprès de la CNIL :{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>15. Cookies</h2>
          <p>Le site utilise uniquement des cookies strictement nécessaires :</p>
          <ul>
            <li>fonctionnement du site</li>
            <li>sécurisation des paiements (Stripe)</li>
          </ul>
          <p>Ces cookies ne nécessitent pas de consentement préalable.</p>
        </section>

        <section className="legal-section">
          <h2>16. Liens vers les politiques tierces</h2>
          <ul>
            <li>
              Politique de confidentialité Stripe :{" "}
              <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer">
                stripe.com/fr/privacy
              </a>
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>17. Droit applicable</h2>
          <p>Le site est soumis au droit français.</p>
        </section>

        <section className="legal-section">
          <h2>18. Contact</h2>
          <ul>
            <li><strong>Email :</strong> <a href="mailto:contact@tsara-rural.fr">contact@tsara-rural.fr</a></li>
            <li><strong>Téléphone :</strong> 05 40 20 72 43</li>
            <li><strong>Adresse :</strong> Chemin des bergeries, 33230 Saint-Médard-de-Guizières</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
