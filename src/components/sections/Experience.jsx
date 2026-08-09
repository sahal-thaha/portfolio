import s from './Experience.module.css'

const exps = [
  { role:'SOC L1 Analyst', co:'Alliance Pro IT', loc:'Thiruvananthapuram', period:'July 2026 — Present', type:'Current Role', color:'#d4820a',
    pts:['Undergoing active technical onboarding and specialized training on enterprise defensive security platforms and SOC operational workflows','Developing hands-on proficiency in security orchestration, network detection, endpoint protection, and automated analysis using FortiSOAR, FortiSIEM, FortiNDR, FortiSandbox, FortiManager, and FortiRecon','Training on log aggregation, correlation rule development, and behavioral threat detection using Innspark SIEM integrated with User and Entity Behavior Analytics (UEBA)','Setting up simulated enterprise lab scenarios to practice real-time alert triage, incident containment, and threat intelligence mapping'] },
  { role:'Cybersecurity Intern', co:'Beagle Security', loc:'Thiruvananthapuram', period:'Feb 2026 — May 2026', type:'Internship', color:'#c44fc8',
    pts:['Web & API Penetration Testing using Burp Suite, OWASP ZAP, and Postman — finding Broken Access Control, JWT flaws, rate-limiting vulnerabilities','Manual exploitation beyond automated scanning tools — real offensive security work','CERT-In aligned security assessment processes — professional-grade vulnerability validation','Created detailed VAPT reports with CVSS-based risk scoring and actionable remediation','Engineered custom automation tools to streamline automated testing, reconnaissance and scanning pipelines'] },
  { role:'Cybersecurity Student Trainee', co:'Offenso Hackers Academy', loc:'Calicut', period:'June 2025 — Dec 2025', type:'Training', color:'#22c55e',
    pts:['Selected for the Research & Development team — cybersecurity learning initiatives','Designed CTF challenges in cryptography & digital forensics with multi-layer encryption scenarios','Conducted vulnerability analysis and contributed to hands-on cybersecurity research activities'] },
  { role:'B.Tech Computer Science Engineering', co:'APJ Abdul Kalam Technical University', loc:'Thiruvananthapuram', period:'Nov 2021 — Mar 2025', type:'Education', color:'#38bdf8',
    pts:['Core CS fundamentals: networking, OS, databases, algorithms, software engineering','Applied focus on cybersecurity, penetration testing, and CTF participation','Graduated with project work in multimedia synchronization and security automation'] },
]

export default function Experience() {
  return (
    <section id="experience" className="sec">
      <div className="wrap">
        <div style={{textAlign:'center',marginBottom:52}}>
          <span className="lbl" style={{justifyContent:'center'}}>Track Record</span>
          <h2 className="stitle">Experience & <span className="gld">Education</span></h2>
        </div>
        <div className={s.timeline}>
          {exps.map((e,i) => (
            <div key={e.role} className={s.item}>
              <div className={s.lineCol}>
                <div className={s.dot} style={{background:e.color,boxShadow:`0 0 14px ${e.color}60`}}/>
                {i<exps.length-1 && <div className={s.line}/>}
              </div>
              <div className={s.card}>
                <div className={s.cardTop}>
                  <div>
                    <span className={s.type} style={{color:e.color,borderColor:e.color}}>{e.type}</span>
                    <h3 className={s.role}>{e.role}</h3>
                    <p className={s.co}>{e.co} <span className={s.loc}>— {e.loc}</span></p>
                  </div>
                  <span className={s.period}>{e.period}</span>
                </div>
                <ul className={s.pts}>
                  {e.pts.map(p => (
                    <li key={p} className={s.pt}>
                      <span className={s.ptDot} style={{background:e.color}}/>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="c-tl"/><div className="c-br"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
