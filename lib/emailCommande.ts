import { Resend } from "resend"
import { prisma } from "@/lib/prisma"
import { libelleUnite } from "@/lib/formule"
import fr from "@/lib/i18n/fr"
import en from "@/lib/i18n/en"
import { estLangueValide, LANGUE_DEFAUT } from "@/lib/i18n/config"
import { traduireContenu } from "@/lib/i18n/contenu"

// Échappe les caractères spéciaux HTML. L'adresse, le téléphone ou les noms
// sont des textes saisis librement : sans ça, un « <b> » tapé dans l'adresse
// serait interprété comme du HTML dans l'email.
function echapper(texte: string) {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Envoie l'email de confirmation d'un panier (une commande par formule).
// Appelée à deux endroits :
// - le webhook Stripe, une fois le paiement en ligne confirmé ;
// - /api/checkout, pour un paiement à la livraison (confirmé immédiatement,
//   puisqu'aucun webhook ne passera jamais pour cette commande).
// Lève une erreur si l'envoi échoue : c'est à l'appelant de décider quoi en faire.
export async function envoyerConfirmationCommande(orderIds: number[]) {
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    orderBy: { id: "asc" },
    include: {
      user: { select: { email: true } },
      formule: true,
      items: { include: { slot: true, article: true } },
      extras: { include: { extra: true } },
    },
  })

  const premiere = orders[0]
  // Order.email est renseigné à chaque commande depuis /api/checkout.
  // Le repli sur user.email couvre les commandes antérieures à ce champ.
  const destinataire = premiere?.email ?? premiere?.user?.email
  if (!destinataire) {
    console.log("[email] aucun email sur la commande, mail non envoyé")
    return
  }

  // La langue vient de la COMMANDE, pas du navigateur : pour un paiement en
  // ligne, cette fonction est appelée par le webhook Stripe, sans aucun lien
  // avec la session du client.
  const langue = estLangueValide(premiere.langue) ? premiere.langue : LANGUE_DEFAUT
  const t = (langue === "en" ? en : fr).email

  const aRegler = premiere.modePaiement === "livraison"

  // Une commande est créée par formule ET par date : plusieurs commandes
  // partagent donc la même date. On dédoublonne pour ne lister chaque
  // jour qu'une fois.
  const formatJour = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(
      langue === "en" ? "en-GB" : "fr-FR",
      { day: "numeric", month: "long", year: "numeric" }
    )

  const datesUniques = Array.from(
    new Set(
      orders
        .map(o => (o.dateLivraison ? new Date(o.dateLivraison).toISOString().slice(0, 10) : null))
        .filter((d): d is string => d !== null)
    )
  ).sort()

  const dateStr = datesUniques.length > 0 ? datesUniques.map(formatJour).join("<br />") : "—"

  // Les creneaux dependent de la categorie : un petit-dejeuner se livre le
  // matin, un plateau apero le soir. Une commande mixte en a donc plusieurs.
  const creneauxUniques = Array.from(
    new Set(orders.map((o) => o.creneauLivraison).filter((c): c is string => !!c))
  )
  const creneauxDifferent = creneauxUniques.length > 1

  const montantTotal = orders.reduce((sum, o) => sum + o.montantTotal, 0)

  const commandesHtml = orders.map((order) => {
    // Regroupement par créneau : « Boissons chaudes : Café × 12, Thé vert × 8 ».
    // La quantité n'est affichée qu'au-delà de 1, pour ne pas alourdir la
    // lecture d'une commande d'une seule personne.
    const parSlot = order.items.reduce<Record<string, string[]>>((acc, item) => {
      const slotNom = traduireContenu(item.slot.nom, langue)
      if (!acc[slotNom]) acc[slotNom] = []
      const quantite = item.quantite ?? 1
      const nomArticle = traduireContenu(item.article.nom, langue)
      acc[slotNom].push(quantite > 1 ? `${nomArticle} × ${quantite}` : nomArticle)
      return acc
    }, {})

    return `
        <div style="margin-bottom:24px;padding:16px;background:#faf8f4;border-radius:6px;">
          <h3 style="margin:0 0 4px;font-size:16px;color:#3a2a1a;">${echapper(order.formule.nom)} — ${order.nbPersonnes} ${libelleUnite(order.formule.unite, order.nbPersonnes, langue)}</h3>
          ${order.dateLivraison ? `<p style="margin:0 0 12px;font-size:13px;color:#777;">${t.livraisonLe} ${formatJour(new Date(order.dateLivraison).toISOString().slice(0, 10))}${creneauxDifferent && order.creneauLivraison ? ` &mdash; <strong style="color:#3a2a1a;">${echapper(traduireContenu(order.creneauLivraison, langue))}</strong>` : ""}</p>` : ""}
          ${Object.entries(parSlot).map(([slot, articles]) => `
            <div style="margin-bottom:6px;">
              <span style="font-weight:600;color:#555;font-size:13px;">${echapper(slot)} :</span>
              <span style="color:#333;font-size:13px;"> ${articles.map((a) => echapper(a)).join(", ")}</span>
            </div>
          `).join("")}
          ${order.extras.length > 0 ? `
            <div style="margin-top:8px;border-top:1px solid #e8e0d4;padding-top:8px;">
              <span style="font-weight:600;color:#555;font-size:13px;">${t.extras}</span>
              ${order.extras.map((e) => `<span style="font-size:13px;color:#333;"> ${echapper(traduireContenu(e.extra.nom, langue))} × ${e.quantite}</span>`).join(",")}
            </div>
          ` : ""}
          <div style="margin-top:10px;text-align:right;font-weight:700;color:#3a2a1a;">${order.montantTotal.toFixed(2)} €</div>
        </div>
      `
  }).join("")

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Le SDK Resend ne lève pas d'exception quand l'API refuse l'envoi : il
  // renvoie { error }. On la transforme en exception pour que l'échec ne
  // passe pas inaperçu.
  const { error } = await resend.emails.send({
    from: "contact@tsara-rural.fr",
    to: destinataire,
    subject: t.sujet,
    html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto;color:#3a2a1a;">
            <div style="background:#2d4a0e;padding:28px 32px;border-radius:8px 8px 0 0;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Tsara Traiteur</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">${t.entete}</p>
            </div>

            <div style="padding:28px 32px;background:#fff;border:1px solid #e8e0d4;border-top:none;">
              <p style="font-size:15px;margin:0 0 24px;">${aRegler ? t.introARegler : t.introPayee}</p>

              ${commandesHtml}

              ${premiere.remarque ? `
                <div style="border-left:3px solid #d9a441;background:#fdf6e8;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
                  <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#8a6a2a;font-weight:600;">${t.remarqueTitre}</p>
                  <p style="margin:0;font-size:14px;color:#3a2a1a;white-space:pre-wrap;">${echapper(premiere.remarque)}</p>
                </div>` : ""}

              <div style="background:#2d4a0e;color:#fff;padding:14px 16px;border-radius:6px;display:flex;justify-content:space-between;margin-bottom:${aRegler ? "8px" : "24px"};">
                <span style="font-size:15px;font-weight:600;">${aRegler ? t.totalARegler : t.totalPaye}</span>
                <span style="font-size:15px;font-weight:700;">${montantTotal.toFixed(2)} €</span>
              </div>
              ${aRegler ? `<p style="margin:0 0 24px;font-size:13px;color:#555;">${t.paiementSurPlace}</p>` : ""}

              <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:0 0 12px;">${t.infosLivraison}</h3>
              <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:#888;">${datesUniques.length > 1 ? t.dates : t.date}</td><td style="padding:5px 0;font-weight:600;">${dateStr}</td></tr>
                <tr><td style="padding:5px 0;color:#888;">${creneauxDifferent ? t.creneaux : t.creneau}</td><td style="padding:5px 0;font-weight:600;">${creneauxUniques.length === 0 ? "—" : creneauxDifferent ? t.creneauxDetail : echapper(traduireContenu(creneauxUniques[0], langue))}</td></tr>
                <tr><td style="padding:5px 0;color:#888;">${t.adresse}</td><td style="padding:5px 0;font-weight:600;">${echapper(premiere.adresse || "—")}</td></tr>
                <tr><td style="padding:5px 0;color:#888;">${t.telephone}</td><td style="padding:5px 0;font-weight:600;">${echapper(premiere.telephone || "—")}</td></tr>
              </table>
            </div>

            <div style="padding:16px 32px;background:#f5f2ed;border-radius:0 0 8px 8px;border:1px solid #e8e0d4;border-top:none;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">${t.question} <a href="mailto:contact@tsara-rural.fr" style="color:#2d4a0e;">contact@tsara-rural.fr</a></p>
            </div>
          </div>
        `,
  })

  if (error) throw new Error(`Resend a refusé l'envoi : ${error.message}`)
  console.log("[email] confirmation envoyée à", destinataire)
}
