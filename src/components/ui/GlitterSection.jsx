import { useEffect, useRef } from 'react'

export default function GlitterSection({ children, className = '', style = {} }) {
  const canvRef = useRef(null)

  useEffect(() => {
    const cv = canvRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); let raf
    let pts = []
    let tick = 0

    const resize = () => {
      cv.width = cv.offsetWidth; cv.height = cv.offsetHeight
      pts = Array.from({ length: 80 }, () => ({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        r: Math.random() * 1.4 + .25,
        phase: Math.random() * Math.PI * 2,
        speed: .006 + Math.random() * .014,
        star: Math.random() < .22,
        rot: Math.random() * Math.PI,
        vx: (Math.random() - .5) * .2,
        vy: (Math.random() - .5) * .2,
      }))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)

    const draw = () => {
      tick++
      ctx.clearRect(0, 0, cv.width, cv.height)
      const dk = document.documentElement.getAttribute('data-theme') === 'dark'
      pts.forEach(p => {
        // Drift slowly
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > cv.width) p.vx *= -1
        if (p.y < 0 || p.y > cv.height) p.vy *= -1

        const a = (.18 + .18 * Math.sin(tick * p.speed + p.phase)) * (dk ? 1.1 : .65)
        if (p.star) {
          const sz = p.r * 2.8
          ctx.fillStyle = dk ? `rgba(255,210,80,${a})` : `rgba(200,130,0,${a})`
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot + tick * p.speed * .25)
          // 4-point star cross
          ctx.fillRect(-sz * .1, -sz, sz * .2, sz * 2)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-sz * .1, -sz, sz * .2, sz * 2)
          ctx.restore()
        } else {
          ctx.fillStyle = dk ? `rgba(204,122,8,${a})` : `rgba(180,100,0,${a})`
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      <canvas
        ref={canvRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
