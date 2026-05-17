import { useEffect, useRef, useState } from 'react'
import s from './Skills.module.css'

const groups = [
  { label:'Penetration Testing', color:'#d4820a', skills:['Burp Suite','Metasploit','Nmap','OWASP ZAP','Sqlmap','Nikto','Hydra','Gobuster','Nessus','Aircrack-ng','Wpscan','Cmseek','OpenVAS','John the Ripper'] },
  { label:'SOC & Monitoring',    color:'#22c55e', skills:['Splunk','ELK Stack','Wazuh','Snort','Wireshark','IDS/IPS','Firewall','Elasticsearch','Logstash','Kibana'] },
  { label:'Development',         color:'#38bdf8', skills:['Python','JavaScript','React','Django','Node.js','Bash','PowerShell','HTML','CSS','REST API'] },
  { label:'Infrastructure',      color:'#a78bfa', skills:['Docker','AWS','Azure','VirtualBox','VMware','Kali Linux','Parrot OS','Ubuntu Server','Windows'] },
]

const core = [
  { name:'Web & API Penetration Testing', pct:88 },
  { name:'SOC Analysis & Threat Detection', pct:78 },
  { name:'Python Automation & Tool Building', pct:82 },
  { name:'Vulnerability Assessment (VAPT)', pct:85 },
  { name:'Full-Stack Development', pct:75 },
  { name:'OSINT & Reconnaissance', pct:80 },
]

export default function Skills() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(e => e.forEach(en => { if(en.isIntersecting) setVis(true) }), {threshold:.2})
    if(ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="skills" className="sec" ref={ref}>
      <div className="wrap">
        <div style={{textAlign:'center',marginBottom:52}}>
          <span className="lbl" style={{justifyContent:'center'}}>Technical Arsenal</span>
          <h2 className="stitle">Skills & <span className="gld">Expertise</span></h2>
        </div>
        <div className={s.grid}>
          <div className={s.left}>
            <h3 className={s.sub}>Core Competencies</h3>
            {core.map(c => (
              <div key={c.name} className={s.barWrap}>
                <div className={s.barHead}>
                  <span className={s.barName}>{c.name}</span>
                  <span className={s.barPct}>{c.pct}%</span>
                </div>
                <div className={s.track}>
                  <div className={s.fill} style={{width:vis?`${c.pct}%`:'0%'}}/>
                  <div className={s.glow} style={{left:vis?`${c.pct}%`:'0%'}}/>
                </div>
              </div>
            ))}
          </div>
          <div className={s.right}>
            {groups.map(g => (
              <div key={g.label} className={s.group}>
                <div className={s.groupHead}>
                  <span className={s.groupDot} style={{background:g.color}}/>
                  <span className={s.groupLabel} style={{color:g.color}}>{g.label}</span>
                </div>
                <div className={s.tags}>
                  {g.skills.map(sk => (
                    <span key={sk} className={s.tag} style={{'--c':g.color}}>{sk}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className={s.group}>
              <div className={s.groupHead}>
                <span className={s.groupDot} style={{background:'var(--gold)'}}/>
                <span className={s.groupLabel} style={{color:'var(--gold)'}}>Frameworks & Standards</span>
              </div>
              <div className={s.tags}>
                {['OWASP Top 10','NIST','ISO 27001','CERT-In','CVSS','CVE'].map(f=>(
                  <span key={f} className={s.tag}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
