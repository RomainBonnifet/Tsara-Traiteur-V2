"use client"

// Ce layout enveloppe toutes les pages du dashboard.
// Il affiche la sidebar fixe à gauche et le contenu principal à droite.
// "use client" est nécessaire ici car on utilise usePathname() qui est un hook React.

import Link from "next/link"
import { usePathname } from "next/navigation"

// Définition des liens de navigation
// On les met dans un tableau pour faciliter l'ajout de nouveaux liens à l'avenir
const navLinks = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/commandes", label: "Commandes" },
  { href: "/dashboard/formules", label: "Formules" },
  { href: "/dashboard/articles", label: "Articles" },
  { href: "/dashboard/extras", label: "Extras" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // usePathname() retourne l'URL courante, ex: "/dashboard/commandes"
  // On s'en sert pour savoir quel lien est "actif" et lui appliquer un style différent
  const pathname = usePathname()

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <Link href="/">Tsara Traiteur</Link>
        </div>
        <nav className="dashboard-nav">
          {navLinks.map((link) => {
            // Un lien est actif si :
            // - c'est exactement "/dashboard" ET qu'on est exactement sur cette page
            // - OU si c'est une sous-page ET que l'URL commence par ce chemin
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`dashboard-nav-link${isActive ? " active" : ""}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="dashboard-sidebar-footer">
          <Link href="/" className="dashboard-nav-link">
            ← Retour au site
          </Link>
        </div>
      </aside>

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  )
}
