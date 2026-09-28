// Renumérotation des positions de créneaux.
//
// Pourquoi : la route de création de créneau omettait le champ "position",
// qui retombait donc sur son @default(0). Tout nouveau créneau naissait à
// égalité avec le premier de la liste. Or le réordonnancement comparait des
// positions « strictement inférieures / supérieures » : deux créneaux à
// égalité étaient sautés ensemble, et descendre un créneau le faisait
// franchir deux lignes.
//
// Ce script remet chaque formule sur des positions 0, 1, 2… uniques et
// contiguës, en conservant l'ordre actuellement affiché (position, puis id
// pour départager les ex aequo — exactement le tri des routes de lecture).
//
// IDEMPOTENT : sur une formule déjà propre, aucune écriture n'est émise.
//
// Lancer avec :  node --env-file=.env prisma/renumerote-slots.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const formules = await prisma.formule.findMany({
  orderBy: { id: "asc" },
  include: {
    slots: {
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true, nom: true, position: true },
    },
  },
})

let formulesCorrigees = 0
let creneauxEcrits = 0

for (const formule of formules) {
  // On ne réécrit que les créneaux dont la position ne correspond PAS déjà à
  // leur rang. Sans ce filtre, le script réécrirait toute la base à chaque
  // exécution — bruyant, et inutilement coûteux.
  const aCorriger = formule.slots
    .map((slot, rang) => ({ slot, rang }))
    .filter(({ slot, rang }) => slot.position !== rang)

  if (aCorriger.length === 0) continue

  formulesCorrigees++
  console.log(`\n  ── ${formule.nom} ──`)
  for (const { slot, rang } of aCorriger) {
    console.log(`     ${slot.nom.padEnd(34)} ${slot.position} -> ${rang}`)
  }

  // Une transaction par formule : une renumérotation à moitié écrite
  // laisserait la formule dans un état pire que celui qu'on répare.
  await prisma.$transaction(
    aCorriger.map(({ slot, rang }) =>
      prisma.slot.update({ where: { id: slot.id }, data: { position: rang } })
    )
  )
  creneauxEcrits += aCorriger.length
}

if (formulesCorrigees === 0) {
  console.log("  Toutes les positions étaient déjà correctes. Rien à faire.")
} else {
  console.log(`\n${creneauxEcrits} créneau(x) renuméroté(s) sur ${formulesCorrigees} formule(s).`)
}

// ── Contrôle final : plus aucun doublon ni trou ──
const verif = await prisma.formule.findMany({
  orderBy: { id: "asc" },
  include: { slots: { orderBy: { position: "asc" }, select: { position: true } } },
})
const fautives = verif.filter((f) =>
  f.slots.some((s, i) => s.position !== i)
)
console.log(
  fautives.length === 0
    ? "\nContrôle : toutes les formules ont des positions 0..n-1 uniques."
    : `\nCONTRÔLE EN ÉCHEC sur : ${fautives.map((f) => f.nom).join(", ")}`
)

await prisma.$disconnect()
