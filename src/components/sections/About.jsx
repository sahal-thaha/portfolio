import { useEffect, useRef } from 'react'
import { Shield, Code2, Cpu, Search } from 'lucide-react'
import s from './About.module.css'

const cards = [
  { icon: <Shield size={20}/>, title:'Cybersecurity Engineer', desc:'OWASP Top 10, VAPT, Burp Suite, Metasploit — finding and fixing vulnerabilities before attackers do.' },
  { icon: <Search size={20}/>, title:'SOC Analyst & VAPT Tester', desc:'Splunk, ELK Stack, Wazuh — monitoring threats, analysing incidents, and building detection logic.' },
  { icon: <Code2 size={20}/>, title:'Full-Stack Developer', desc:'React, Django, Node.js — building scalable web, API & Android-ready backends with security baked in.' },
  { icon: <Cpu size={20}/>, title:'Tool Builder & Researcher', desc:'Custom Python security tools, CTF challenges, recon automation, and R&D contributions at Offenso.' },
]

export default function About() {
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add(s.vis) })
    }, {threshold:.15})
    ref.current?.querySelectorAll('[data-a]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="about" className="sec" ref={ref}>
      <div className="wrap">
        <div className={s.grid}>
          <div className={s.left} data-a>
            <span className="lbl">Who I Am</span>
            <h2 className="stitle">Building <span className="gld">Secure</span><br/>Systems &<br/>Scalable Solutions</h2>
            <p className={s.bio}>
              I'm <strong>Sahal P T</strong>, a Cybersecurity Analyst & Developer from Thrissur, Kerala.
              Currently at <span className="gld">Alliance Pro IT</span> as a SOC L1 Analyst, working with FortiSOAR,
              FortiNDR, FortiSandbox, and InnSpark SIEM to monitor threats, investigate alerts, and strengthen security operations.
            </p>
            <p className={s.bio}>
              My work bridges offensive security and product development, with a strong focus on defense as well — I find the vulnerability, build the fix, and help keep systems resilient.
            </p>
            <div className={s.details}>
              {[
                ['Location','Thrissur, Kerala, India'],
                ['Email','sahal.bin.thaha@gmail.com'],
                ['Phone','+91 8943312685'],
                ['Status','Open for Collaborations & Opportunities'],
              ].map(([k,v]) => (
                <div key={k} className={s.detailRow}>
                  <span className={s.dk}>{k}</span>
                  <span className={s.dv}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',marginTop:28}}>
              <a href="#contact" className="btn btn-g">Collaborate</a>
              <a href="https://github.com/sahal-thaha" target="_blank" rel="noreferrer" className="btn btn-o">GitHub</a>
            </div>
          </div>

          <div className={s.cards} data-a style={{transitionDelay:'.15s'}}>
            {cards.map((c,i) => (
              <div key={c.title} className={s.card} style={{animationDelay:`${i*.08}s`}}>
                <div className={s.cardIcon}>{c.icon}</div>
                <h3 className={s.cardTitle}>{c.title}</h3>
                <p className={s.cardDesc}>{c.desc}</p>
                <div className="c-tl"/><div className="c-br"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
