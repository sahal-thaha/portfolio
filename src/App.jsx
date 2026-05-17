import { useState, useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Hero from './components/sections/Hero'
import ComputerDesk from './components/sections/ComputerDesk'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Experience from './components/sections/Experience'
import Projects from './components/sections/Projects'
import Certifications from './components/sections/Certifications'
import Contact from './components/sections/Contact'
import Footer from './components/layout/Footer'
import GlitterSection from './components/ui/GlitterSection'
import SEO from './components/ui/SEO'
import './index.css'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const curRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0, raf
    const mv = e => {
      mx = e.clientX; my = e.clientY
      if (curRef.current) { curRef.current.style.left = mx + 'px'; curRef.current.style.top = my + 'px' }
    }
    const loop = () => {
      rx += (mx - rx) * .13; ry += (my - ry) * .13
      if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px' }
      raf = requestAnimationFrame(loop)
    }
    document.addEventListener('mousemove', mv); raf = requestAnimationFrame(loop)
    const on = () => { curRef.current?.classList.add('h'); ringRef.current?.classList.add('h') }
    const off = () => { curRef.current?.classList.remove('h'); ringRef.current?.classList.remove('h') }
    const attach = () => document.querySelectorAll('a,button,[data-h]').forEach(el => {
      el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off)
    })
    attach()
    const obs = new MutationObserver(attach); obs.observe(document.body, { childList: true, subtree: true })
    return () => { document.removeEventListener('mousemove', mv); cancelAnimationFrame(raf); obs.disconnect() }
  }, [])

  return (
    <>
      <SEO />
      <div className="cur" ref={curRef} />
      <div className="cur-r" ref={ringRef} />
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--card-solid)',
          color: 'var(--ink)',
          border: '1px solid var(--border-gold)',
          fontFamily: 'Space Grotesk, sans-serif'
        }
      }} />
      <Navbar theme={theme} toggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <main>
        {/* Hero has its own particle canvas, wrap with glitter too */}
        <Hero />

        {/* Lab - computer desk */}
        <ComputerDesk />

        {/* All sections from About → Contact get the glitter canvas */}
        <GlitterSection style={{ width: '100%' }}>
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Certifications />
          <Contact />
        </GlitterSection>
      </main>
      <Footer />
    </>
  )
}
