import { useState, useEffect } from 'react'
import { Sun, Moon, Menu, X, Shield } from 'lucide-react'
import s from './Navbar.module.css'

const links = [
  {l:'About',h:'#about'},{l:'Skills',h:'#skills'},{l:'Experience',h:'#experience'},
  {l:'Projects',h:'#projects'},{l:'Lab',h:'#lab'},{l:'Contact',h:'#contact'},
]

export default function Navbar({ theme, toggle }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const secs = document.querySelectorAll('section[id]')
    const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) setActive(e.target.id) }), {threshold:.3})
    secs.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={`wrap ${s.inner}`}>
        <a href="#" className={s.logo}>
          <Shield size={17} className={s.logoIcon}/>
          <span className={s.logoTxt}>SAHAL<span className={s.dot}>.PT</span></span>
        </a>
        <ul className={s.links}>
          {links.map(l=>(
            <li key={l.l}><a href={l.h} className={`${s.link} ${active===l.h.slice(1)?s.active:''}`} onClick={()=>setOpen(false)}>{l.l}</a></li>
          ))}
        </ul>
        <div className={s.acts}>
          <button onClick={toggle} className={s.thBtn}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
          <button className={s.mBtn} onClick={()=>setOpen(!open)}>{open?<X size={21}/>:<Menu size={21}/>}</button>
        </div>
      </div>
      {open && (
        <div className={s.mob}>
          {links.map(l=>(
            <a key={l.l} href={l.h} className={s.mobLink} onClick={()=>setOpen(false)}>{l.l}</a>
          ))}
        </div>
      )}
    </nav>
  )
}
