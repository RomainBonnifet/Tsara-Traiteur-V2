'use client'
import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav id="mainNav" className={scrolled ? 'scrolled' : ''}>
      <a href="#" className="nav-logo">Tsara</a>
      <ul className="nav-links">
        <li><a href="#formules">Formules</a></li>
        <li><a href="#galerie">Galerie</a></li>
        <li><a href="#partenaires">Partenaires</a></li>
        <li><a href="#contact" className="nav-cta">Réserver</a></li>
      </ul>
    </nav>
  )
}
