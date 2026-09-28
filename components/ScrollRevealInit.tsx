'use client'
import { useEffect } from 'react'

export default function ScrollRevealInit() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    // observe() sur un élément déjà suivi est sans effet : on peut rappeler
    // cette fonction sans risque de doublon.
    function observerTout(racine: ParentNode) {
      racine.querySelectorAll('.reveal:not(.visible)').forEach((el) => obs.observe(el))
    }

    observerTout(document)

    // Certaines sections naissent d'une requête (les formules, par exemple) :
    // elles n'existent pas encore quand cet effet s'exécute. Un seul
    // querySelectorAll au montage les manquerait, et comme .reveal les rend
    // transparentes en attendant leur classe .visible, elles resteraient
    // invisibles pour toujours. Ce MutationObserver rattrape tout ce qui est
    // ajouté au DOM après coup.
    const mut = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.classList.contains('reveal')) obs.observe(node)
          observerTout(node)
        })
      }
    })
    mut.observe(document.body, { childList: true, subtree: true })

    return () => {
      obs.disconnect()
      mut.disconnect()
    }
  }, [])

  return null
}
