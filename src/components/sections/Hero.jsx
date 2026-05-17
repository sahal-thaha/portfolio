import { useEffect, useRef, useState } from 'react'
import { Download, ArrowRight } from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon } from '../ui/SocialIcons'
import s from './Hero.module.css'

const ROLES = ['Cybersecurity Engineer','SOC Analyst','Penetration Tester','API Security Tester','Android Security Researcher','Full-Stack Developer','Product Builder','CTF Creator']

export default function Hero() {
  const [ri, setRi] = useState(0)
  const [txt, setTxt] = useState('')
  const [del, setDel] = useState(false)
  const canvRef = useRef(null)

  // typewriter
  useEffect(() => {
    const r = ROLES[ri]
    const t = setTimeout(() => {
      if (!del && txt.length < r.length) setTxt(r.slice(0, txt.length + 1))
      else if (!del && txt.length === r.length) setDel(true)
      else if (del && txt.length > 0) setTxt(r.slice(0, txt.length - 1))
      else { setDel(false); setRi(i => (i + 1) % ROLES.length) }
    }, del ? 35 : txt.length === r.length ? 1800 : 72)
    return () => clearTimeout(t)
  }, [txt, del, ri])

  // glittering particles canvas
  useEffect(() => {
    const cv = canvRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); let raf
    let pts = []

    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; initPts() }

    const initPts = () => {
      pts = Array.from({ length: 120 }, () => ({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        vx: (Math.random() - .5) * .35,
        vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.4 + .3,
        baseA: Math.random() * .55 + .1,
        phase: Math.random() * Math.PI * 2,
        speed: .015 + Math.random() * .025,
        // some bigger glitter stars
        star: Math.random() < .15,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    let tick = 0
    const draw = () => {
      tick++
      ctx.clearRect(0, 0, cv.width, cv.height)
      const dk = document.documentElement.getAttribute('data-theme') === 'dark'

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > cv.width) p.vx *= -1
        if (p.y < 0 || p.y > cv.height) p.vy *= -1

        const a = p.baseA * (.5 + .5 * Math.sin(tick * p.speed + p.phase))

        if (p.star) {
          // glitter star — draw 4-point cross
          const sz = p.r * 3
          ctx.fillStyle = dk ? `rgba(255,215,100,${a * 1.3})` : `rgba(200,130,0,${a})`
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(tick * p.speed * .5)
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(-sz * .15, -sz, sz * .3, sz * 2)
            ctx.rotate(Math.PI / 4)
          }
          ctx.restore()
        } else {
          ctx.fillStyle = dk ? `rgba(212,130,10,${a})` : `rgba(180,100,0,${a * .7})`
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        }
      })

      // connections
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 85) {
          const dk2 = document.documentElement.getAttribute('data-theme') === 'dark'
          ctx.strokeStyle = dk2 ? `rgba(204,122,8,${.05 * (1 - d / 85)})` : `rgba(180,100,0,${.04 * (1 - d / 85)})`
          ctx.lineWidth = .5
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      }))

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="home" className={s.hero}>
      <canvas ref={canvRef} className={s.canvas} />
      {/* brush strokes */}
      <div className={s.brush1} /><div className={s.brush2} />

      <div className={`wrap ${s.layout}`}>
        {/* LEFT */}
        <div className={s.left}>
          <p className={s.tagline3}>CREATIVE. STRATEGIC. <span className="gld">IMPACTFUL.</span></p>
          <span className={s.helloScript}>Hello,</span>
          <h1 className={s.name}>
            <span className={s.im}>I'M </span>
            <span className={s.nameGold}>SAHAL</span>
          </h1>
          <div className={s.roles}>
            <span>CYBERSECURITY ENGINEER</span>
            <span className={s.div}>|</span>
            <span>FULL-STACK DEVELOPER</span>
            {/* <span className={s.div}>|</span>
            <span>DEVELOPER</span> */}
          </div>

          {/* BIG typewriter — replaces icon boxes */}
          <div className={s.typeBlock}>
            <span className={s.typePrefix}>&gt;</span>
            <span className={s.typeTxt}>{txt}</span>
            <span className={s.typeCur} />
          </div>

          <div className={s.quoteRow}>
            <a href="mailto:sahal.bin.thaha@gmail.com" className={s.mailBox}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,12 2,6"/>
              </svg>
              sahal.bin.thaha@gmail.com
            </a>
            <div className={s.quote}>
              <span className={s.qq}>"</span>
              I don't just write code, I build <span className="gld">secure</span>,{' '}
              <span className="gld">scalable</span> and <span className="gld">smart</span> solutions.
              <span className={s.qq2}>"</span>
            </div>
          </div>

          <div className={s.ctas}>
            <a href="#contact" className="btn btn-g">Collaborate <ArrowRight size={14} /></a>
            <a href="/SAHAL_CYBERSECURITY.pdf" download className="btn btn-o"><Download size={14} /> Resume</a>
          </div>
          <div className={s.socials}>
            {[
              { ic: <GithubIcon size={17} />, h: 'https://github.com/sahal-thaha', l: 'GitHub' },
              { ic: <LinkedinIcon size={17} />, h: 'https://linkedin.com/in/sahal-thaha', l: 'LinkedIn' },
              { ic: <InstagramIcon size={17} />, h: 'https://www.instagram.com/sahal_thaha/', l: 'Instagram' },
              { ic: <XIcon size={17} />, h: 'https://x.com/sahal_thaha', l: 'X' },
            ].map(soc => (
              <a key={soc.l} href={soc.h} target="_blank" rel="noreferrer" className={s.soc} aria-label={soc.l}>{soc.ic}</a>
            ))}
          </div>
        </div>

        {/* CENTER PHOTO */}
        <div className={s.photoCenter}>
          <div className={s.photoWrap}>
            <div className={s.photoGlow} />
            <img src="/sahal-day.jpg" alt="Sahal P T" className={s.photo}
              onError={e => { e.target.style.display = 'none' }} />
            <div className={s.photoShine} />
          </div>
        </div>

        {/* RIGHT */}
        <div className={s.right}>
          {/* Decorative stats/badges above the text */}
          {/* <div className={s.rightBadges}>
            <div className={s.rightBadge}>
              <span className={s.badgeNum}>1+</span>
              <span className={s.badgeLbl}>YRS EXP</span>
            </div>
            <div className={s.rightBadge}>
              <span className={s.badgeNum}>15+</span>
              <span className={s.badgeLbl}>TOOLS</span>
            </div>
            <div className={s.rightBadge}>
              <span className={s.badgeNum}>5+</span>
              <span className={s.badgeLbl}>PROJECTS</span>
            </div>
          </div> */}

          {/* Decorative vertical line accent */}
          {/* <div className={s.rightAccent}>
            <div className={s.accentLine} />
            <div className={s.accentDot} />
            <div className={s.accentLine} />
          </div> */}

          <p className={s.rightTxt}>
            BUILDING <span className="gld">SECURE</span><br />
            SYSTEMS AND<br />
            <span className="gld">SCALABLE</span> SOLUTIONS<br />
            FOR A <span className="gld">SMARTER</span><br />
            DIGITAL FUTURE.
          </p>

          <div className={s.letsCreate}>
            <span className={s.letsScript}>Let's create</span>
            <span className={s.something}>SOMETHING MEANINGFUL.</span>
          </div>
        </div>
      </div>

      <div className={s.scroll}>
        <div className={s.scrollLine} />
        <span className={s.scrollTxt}>SCROLL</span>
      </div>
    </section>
  )
}
