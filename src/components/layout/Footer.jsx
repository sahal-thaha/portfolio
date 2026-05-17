import { Shield } from 'lucide-react'
import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`wrap ${s.inner}`}>
        <div className={s.brand}>
          <Shield size={16} style={{color:'var(--gold)'}}/>
          <span className={s.logo}>SAHAL<span style={{color:'var(--gold)'}}>.</span>PT</span>
        </div>
        <p className={s.copy}>© {new Date().getFullYear()} Sahal P T — Cybersecurity Engineer & Developer, Thrissur, Kerala</p>
        <p className={s.made}>Made with <span style={{color:'var(--gold)'}}>☕ + terminal sessions</span></p>
      </div>
    </footer>
  )
}
