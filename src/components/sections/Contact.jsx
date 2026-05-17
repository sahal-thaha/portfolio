import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send, Mail, Phone, MapPin } from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon } from '../ui/SocialIcons'
import s from './Contact.module.css'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Contact() {
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({name:'',email:'',subject:'',message:''})

  // Input sanitization - strip HTML tags, limit lengths
  const sanitize = (val, maxLen = 500) => {
    return val
      .replace(/<[^>]*>/g, '')           // strip HTML
      .replace(/javascript:/gi, '')       // strip JS protocol
      .replace(/on\w+\s*=/gi, '')        // strip event handlers
      .slice(0, maxLen)
  }

  const chg = e => {
    const limits = { name: 100, email: 254, subject: 200, message: 2000 }
    const val = sanitize(e.target.value, limits[e.target.name] || 500)
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const isValidEmail = (email) => /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email)

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Fill all required fields'); return
    }
    if (!isValidEmail(form.email)) {
      toast.error('Please enter a valid email address'); return
    }
    if (form.message.trim().length < 10) {
      toast.error('Message is too short'); return
    }
    setSending(true)
    try {
      const ep = API_URL ? `${API_URL}/api/contact` : 'https://formspree.io/f/xdoqnqjq'
      const res = await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(form)})
      const d = await res.json()
      if(!res.ok) throw new Error(d.error||'Failed')
      toast.success("Message sent! I'll reply within 24 hours.")
      setForm({name:'',email:'',subject:'',message:''})
    } catch(err) {
      toast.error('Could not send. Email: sahal.bin.thaha@gmail.com')
    } finally { setSending(false) }
  }

  return (
    <section id="contact" className="sec">
      <div className="wrap">
        <div style={{textAlign:'center',marginBottom:52}}>
          <span className="lbl" style={{justifyContent:'center'}}>Let's Talk</span>
          <h2 className="stitle">Contact for <span className="gld">Collaboration</span></h2>
          <p style={{color:'var(--muted)',maxWidth:460,margin:'10px auto 0',fontSize:15,lineHeight:1.7}}>
            Open for cybersecurity work, development projects, freelance, or just a good conversation about security.
          </p>
        </div>
        <div className={s.grid}>
          <div className={s.info}>
            <div className={s.items}>
              {[
                {icon:<Mail size={18}/>,lbl:'Primary',val:'sahal.bin.thaha@gmail.com',href:'mailto:sahal.bin.thaha@gmail.com'},
                {icon:<Mail size={18}/>,lbl:'Alternate',val:'777sahal@gmail.com',href:'mailto:777sahal@gmail.com'},
                {icon:<Phone size={18}/>,lbl:'Phone',val:'+91 8943312685',href:'tel:+918943312685'},
                {icon:<MapPin size={18}/>,lbl:'Location',val:'Thrissur, Kerala, India',href:null},
              ].map(it=>(
                <div key={it.lbl} className={s.item}>
                  <div className={s.iIcon}>{it.icon}</div>
                  <div><p className={s.iLbl}>{it.lbl}</p>
                    {it.href?<a href={it.href} className={s.iVal}>{it.val}</a>:<p className={s.iVal}>{it.val}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className={s.socSec}>
              <p className={s.socTitle}>Online Presence</p>
              {[
                {ic:<GithubIcon size={17}/>,h:'https://github.com/sahal-thaha',l:'GitHub'},
                {ic:<LinkedinIcon size={17}/>,h:'https://linkedin.com/in/sahal-thaha',l:'LinkedIn'},
                {ic:<InstagramIcon size={17}/>,h:'https://www.instagram.com/sahal_thaha/',l:'Instagram'},
                {ic:<XIcon size={17}/>,h:'https://x.com/sahal_thaha',l:'X / Twitter'},
              ].map(soc=>(
                <a key={soc.l} href={soc.h} target="_blank" rel="noreferrer" className={s.socLink}>
                  {soc.ic}<span>{soc.l}</span>
                </a>
              ))}
            </div>
            <div className={s.avail}>
              <div className={s.availDot}/>
              {/* <div><p className={s.availT}>Open to Work</p><p className={s.availS}>Full-time · Part-time · Freelance</p></div> */}
              <p className={s.availT}>Driven by Curiosity</p><p className={s.availS}>Always Learning</p>
            </div>
          </div>
          <div className={s.formWrap}>
            <form onSubmit={submit} className={s.form} noValidate>
              <div className={s.row}>
                <div className={s.field}><label className={s.lbl2}>Name *</label><input name="name" type="text" value={form.name} onChange={chg} className={s.inp} placeholder="Your name" maxLength={100} autoComplete="name" required/></div>
                <div className={s.field}><label className={s.lbl2}>Email *</label><input name="email" type="email" value={form.email} onChange={chg} className={s.inp} placeholder="your@email.com" required/></div>
              </div>
              <div className={s.field}><label className={s.lbl2}>Subject</label><input name="subject" type="text" value={form.subject} onChange={chg} className={s.inp} placeholder="What's this about?"/></div>
              <div className={s.field}><label className={s.lbl2}>Message *</label><textarea name="message" value={form.message} onChange={chg} className={`${s.inp} ${s.ta}`} placeholder="Tell me about your project or opportunity..." rows={5} maxLength={2000} required/></div>
              <button type="submit" className="btn btn-g" disabled={sending} style={{width:'100%',justifyContent:'center'}}>
                {sending?<>Sending... <span className={s.spin}/></>:<>Send Message <Send size={14}/></>}
              </button>
              <p className={s.note}>Messages go directly to my inbox. Expect a reply within 24 hours.</p>
            </form>
            <div className="c-tl"/><div className="c-br"/>
          </div>
        </div>
      </div>
    </section>
  )
}
