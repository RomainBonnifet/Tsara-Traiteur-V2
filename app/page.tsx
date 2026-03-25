import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Formules from '@/components/Formules'
import Galerie from '@/components/Galerie'
import Partenaires from '@/components/Partenaires'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ScrollRevealInit from '@/components/ScrollRevealInit'

export default function Home() {
  return (
    <>
      <ScrollRevealInit />
      <Nav />
      <Hero />
      <About />
      <Services />
      <Formules />
      <Galerie />
      <Partenaires />
      <Contact />
      <Footer />
    </>
  )
}
