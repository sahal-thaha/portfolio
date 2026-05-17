import { ExternalLink, Shield, Terminal, Play, Lock, Clock } from 'lucide-react'
import { GithubIcon } from '../ui/SocialIcons'
import s from './Projects.module.css'

const projects = [
  { title:'Custom Security Testing Suite', desc:'IDOR detection, debug misconfiguration scanning, endpoint exposure mapping. RabbitMQ task queuing, MinIO object storage, Playwright screenshot automation. Built to reduce manual testing overhead.', tags:['Python','RabbitMQ','MinIO','Playwright','Security'], icon:<Shield size={22}/>, color:'#d4820a', github:'https://github.com/sahal-thaha', featured:true, status:'done' },
  { title:'CTF Challenge Platform', desc:'Multi-layer cryptography & digital forensics challenges designed for Offenso R&D. Requires manual reasoning, cryptographic analysis, and forensic investigation — used in real security training.', tags:['Cryptography','Forensics','CTF','Python'], icon:<Lock size={22}/>, color:'#22c55e', github:'https://github.com/sahal-thaha', status:'done' },
  { title:'Multimedia Sync System', desc:'Real-time cross-location watch/listen sync with room-code authentication. WebSocket-based playback synchronisation for seamless multi-user sessions.', tags:['Node.js','WebSockets','React','Real-time'], icon:<Play size={22}/>, color:'#38bdf8', github:'https://github.com/sahal-thaha', status:'done' },
  { title:'Recon & Attack Surface Mapper', desc:'Target crawling, endpoint enumeration, and attack surface mapping. Playwright-powered automated screenshot capture and visual recon reporting.', tags:['Python','Playwright','OSINT','Automation'], icon:<Terminal size={22}/>, color:'#a78bfa', github:'https://github.com/sahal-thaha', status:'done' },
  { title:'Android Security Scanner', desc:'Upcoming: Static & dynamic analysis tool for Android APKs. Will detect insecure data storage, hardcoded secrets, and vulnerable API calls in mobile apps.', tags:['Python','Android','Mobile Security','APK Analysis'], icon:<Shield size={22}/>, color:'#f43f5e', github:'https://github.com/sahal-thaha', status:'progress' },
  { title:'Threat Intelligence Dashboard', desc:'Upcoming: Real-time threat feed aggregator with MITRE ATT&CK mapping, IOC extraction, and automated alert correlation for SOC workflows.', tags:['React','Python','MITRE','SOC','ELK'], icon:<Terminal size={22}/>, color:'#06b6d4', github:'https://github.com/sahal-thaha', status:'progress' },
]

export default function Projects() {
  return (
    <section id="projects" className="sec">
      <div className="wrap">
        <div style={{textAlign:'center',marginBottom:52}}>
          <span className="lbl" style={{justifyContent:'center'}}>What I've Built</span>
          <h2 className="stitle">Selected <span className="gld">Projects</span></h2>
        </div>
        <div className={s.grid}>
          {projects.map(p => (
            <div key={p.title} className={`${s.card} ${p.featured?s.feat:''} ${p.status==='progress'?s.prog:''}`}>
              <div className={s.top}>
                <div className={s.icon} style={{color:p.color,borderColor:`${p.color}38`,background:`${p.color}10`}}>{p.icon}</div>
                <div className={s.badges}>
                  {p.featured && <span className={s.featBadge}>Featured</span>}
                  {p.status==='progress' && <span className={s.progBadge}><Clock size={10}/> In Progress</span>}
                </div>
                <div className={s.links}>
                  <a href={p.github} target="_blank" rel="noreferrer" className={s.lnk}><GithubIcon size={15}/></a>
                  {p.live && <a href={p.live} target="_blank" rel="noreferrer" className={s.lnk}><ExternalLink size={15}/></a>}
                </div>
              </div>
              <h3 className={s.title}>{p.title}</h3>
              <p className={s.desc}>{p.desc}</p>
              <div className={s.tags}>{p.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
              <div className={s.accentBar} style={{background:p.color}}/>
              <div className="c-tl"/><div className="c-br"/>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:44}}>
          <a href="https://github.com/sahal-thaha" target="_blank" rel="noreferrer" className="btn btn-o">
            <GithubIcon size={15}/> View All on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
