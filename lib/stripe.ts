import Stripe from "stripe"

// Initialisation PARESSEUSE (lazy).
//
// Le problème qu'on résout : `new Stripe(...)` écrit directement dans un
// fichier de route s'exécute à l'IMPORT du fichier. Or `next build` importe
// chaque route pour l'analyser, sans jamais l'appeler. Sans clé dans
// l'environnement, le build plantait avant même d'avoir démarré.
//
// Ici le client n'est créé qu'au premier appel réel de getStripe(),
// c'est-à-dire au moment où une requête arrive — donc en production,
// où les variables d'environnement existent.

let client: Stripe | null = null

export function getStripe(): Stripe {
  // Mise en cache : une seule instance pour toute la durée de vie du process,
  // au lieu d'en recréer une à chaque requête.
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY

    // Message explicite plutôt que l'erreur cryptique de la librairie
    // ("Neither apiKey nor config.authenticator provided").
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY absente de l'environnement. Vérifiez votre fichier .env."
      )
    }

    client = new Stripe(key)
  }

  return client
}
