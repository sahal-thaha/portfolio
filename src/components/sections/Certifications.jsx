import { Award, CheckCircle } from 'lucide-react'
import s from './Certifications.module.css'

const certs = [
  { short:'OCSP', title:'Offenso Certified Security Professional', issuer:'Offenso Hackers Academy', color:'#d4820a', desc:'Advanced offensive security: penetration testing, exploitation, and red team methodologies.' },
  { short:'FSOAR', title:'FortiSOAR 7.6 Administrator', issuer:'Fortinet Training Institute', color:'#22c55e', desc:'Security orchestration, automation, and incident response administration using FortiSOAR.' },
  { short:'FSIEM', title:'FortiSIEM 7.2 Administrator', issuer:'Fortinet Training Institute', color:'#38bdf8', desc:'SIEM administration, log monitoring, correlation, and threat detection workflows.' },
  { short:'FNDR', title:'FortiNDR On-Premises 7.4 Administrator', issuer:'Fortinet Training Institute', color:'#a78bfa', desc:'Network detection and response administration for on-premises environments.' },
  { short:'FSB', title:'FortiSandbox 5.0 Administrator', issuer:'Fortinet Training Institute', color:'#f59e0b', desc:'Sandbox administration for malware analysis and threat detonation workflows.' },
  { short:'FMG', title:'FortiManager Administrator', issuer:'Fortinet Training Institute', color:'#fb7185', desc:'Centralized network and security policy management administration.' },
  { short:'NET', title:'Networking Basics', issuer:'Cisco Networking Academy', color:'#06b6d4', desc:'Foundational networking concepts, protocols, and infrastructure principles.' },
  { short:'CCEP', title:'Certified Cybersecurity Educator Professional', issuer:'RED TEAM LEADERS', color:'#22c55e', desc:'Cybersecurity education design focused on real-world threat scenarios and training frameworks.' },
  { short:'PY', title:'Python Course for Beginners', issuer:'Perfect eLearning Private Limited', color:'#38bdf8', desc:'Python scripting, automation, and application development fundamentals.' },
  { short:'LX', title:'Linux 100 Fundamentals', issuer:'TCM Security Academy', color:'#a78bfa', desc:'Linux system administration, CLI mastery, and security-focused OS configuration.' },
]

export default function Certifications() {
  return (
    <section id="certifications" className="sec">
      <div className="wrap">
        <div style={{textAlign:'center',marginBottom:52}}>
          <span className="lbl" style={{justifyContent:'center'}}>Credentials</span>
          <h2 className="stitle">Certifications & <span className="gld">Achievements</span></h2>
        </div>
        <div className={s.grid}>
          {certs.map(c => (
            <div key={c.short} className={s.card}>
              <div className={s.top}>
                <span className={s.short} style={{color:c.color}}>{c.short}</span>
                <Award size={20} style={{color:c.color,opacity:.5}}/>
              </div>
              <div className={s.issuerRow}>
                <CheckCircle size={13} style={{color:c.color,flexShrink:0}}/>
                <span className={s.issuer} style={{color:c.color}}>{c.issuer}</span>
              </div>
              <h3 className={s.title}>{c.title}</h3>
              <p className={s.desc}>{c.desc}</p>
              <div className={s.bar} style={{background:c.color}}/>
            </div>
          ))}
        </div>

        <div className={s.langs}>
          <h3 className={s.langTitle}>Languages</h3>
          <div className={s.langGrid}>
            {[{l:'Malayalam',lvl:'Native',pct:100},{l:'English',lvl:'Professional',pct:90},{l:'Hindi',lvl:'Conversational',pct:58}].map(lg=>(
              <div key={lg.l} className={s.langItem}>
                <div className={s.langHead}><span className={s.langName}>{lg.l}</span><span className={s.langLvl}>{lg.lvl}</span></div>
                <div className={s.langTrack}><div className={s.langFill} style={{width:`${lg.pct}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
