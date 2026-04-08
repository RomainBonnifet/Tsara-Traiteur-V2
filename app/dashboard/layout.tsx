"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navLinks = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/commandes", label: "Commandes" },
  { href: "/dashboard/formules", label: "Formules" },
  { href: "/dashboard/articles", label: "Articles" },
  { href: "/dashboard/extras", label: "Extras" },
  { href: "/dashboard/galerie", label: "Galerie" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="dashboard-layout">

      {/* ── Sidebar desktop / Topbar mobile ── */}
      <aside className={`dashboard-sidebar${menuOpen ? " menu-open" : ""}`}>

        <div className="dashboard-topbar">
          <div className="dashboard-brand">
            <Link href="/" onClick={closeMenu}>Tsara</Link>
          </div>
          {/* Bouton burger — visible uniquement sur mobile */}
          <button
            className="dashboard-burger"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Wrapper nav + footer — sur mobile ce bloc est en absolu sous la topbar */}
        <div className="dashboard-menu">
          <nav className="dashboard-nav">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`dashboard-nav-link${isActive ? " active" : ""}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="dashboard-sidebar-footer">
            <Link href="/" className="dashboard-nav-link" onClick={closeMenu}>
              ← Retour au site
            </Link>
          </div>
        </div>

      </aside>

      {/* Overlay sombre derrière le menu mobile */}
      {menuOpen && (
        <div className="dashboard-overlay" onClick={closeMenu} />
      )}

      <main className="dashboard-content">
        {children}
      </main>

    </div>
  )
}
