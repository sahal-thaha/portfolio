import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './DinoGame.module.css'

const CANVAS_W = 800
const CANVAS_H = 200
const GROUND_Y = 160
const DINO_W = 44
const DINO_H = 48
const DINO_X = 60
const GRAVITY = 0.6
const JUMP_FORCE = -14
const OBSTACLE_SPEED_INIT = 5
const OBSTACLE_INTERVAL_INIT = 1600

export default function DinoGame() {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    running: false,
    gameOver: false,
    score: 0,
    hiScore: parseInt(localStorage.getItem('dino-hi') || '0'),
    dinoY: GROUND_Y - DINO_H,
    dinoVY: 0,
    jumping: false,
    obstacles: [],
    frameId: null,
    lastObstacle: 0,
    speed: OBSTACLE_SPEED_INIT,
    tick: 0,
    stars: Array.from({ length: 40 }, () => ({
      x: Math.random() * CANVAS_W,
      y: Math.random() * (GROUND_Y - 40),
      r: Math.random() * 1.2 + 0.3,
      blink: Math.random(),
    })),
  })
  const [displayScore, setDisplayScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle | playing | over
  const [hiScore, setHiScore] = useState(parseInt(localStorage.getItem('dino-hi') || '0'))

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark'

  const getColors = () => ({
    bg: isDark() ? '#080810' : '#f5f3ef',
    ground: isDark() ? '#d4820a' : '#c47f00',
    dino: isDark() ? '#d4820a' : '#c47f00',
    obstacle: isDark() ? '#ff6b35' : '#c0392b',
    text: isDark() ? '#f0ece0' : '#0a0a0a',
    accent: isDark() ? '#d4820a' : '#f0a500',
    grid: isDark() ? 'rgba(212,130,10,0.05)' : 'rgba(200,130,0,0.06)',
  })

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = stateRef.current
    const C = getColors()

    // Clear
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Grid
    ctx.strokeStyle = C.grid
    ctx.lineWidth = 1
    for (let x = 0; x < CANVAS_W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke()
    }
    for (let y = 0; y < CANVAS_H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke()
    }

    // Stars (shown when not running or speed < 8)
    s.stars.forEach(star => {
      const alpha = 0.3 + 0.4 * Math.sin(s.tick * 0.02 + star.blink * 10)
      ctx.fillStyle = `rgba(${isDark() ? '212,130,10' : '180,110,0'},${alpha})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fill()
      if (s.running) star.x -= s.speed * 0.2
      if (star.x < 0) { star.x = CANVAS_W; star.y = Math.random() * (GROUND_Y - 40) }
    })

    // Ground line
    ctx.strokeStyle = C.ground
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(CANVAS_W, GROUND_Y)
    ctx.stroke()

    // Ground details
    ctx.strokeStyle = C.ground
    ctx.lineWidth = 0.5
    for (let i = 0; i < 12; i++) {
      const x = ((s.tick * s.speed * 0.5) + i * 80) % CANVAS_W
      ctx.beginPath()
      ctx.moveTo(x, GROUND_Y + 4)
      ctx.lineTo(x + 30, GROUND_Y + 4)
      ctx.stroke()
    }

    // Draw dino (pixel art style)
    const drawDino = (x, y) => {
      ctx.fillStyle = C.dino
      // Body
      ctx.fillRect(x + 8, y + 10, 26, 24)
      // Head
      ctx.fillRect(x + 16, y, 22, 16)
      // Eye
      ctx.fillStyle = C.bg
      ctx.fillRect(x + 30, y + 4, 4, 4)
      ctx.fillStyle = C.dino
      ctx.fillRect(x + 31, y + 5, 2, 2)
      // Tail
      ctx.fillStyle = C.dino
      ctx.fillRect(x, y + 16, 12, 8)
      ctx.fillRect(x - 4, y + 20, 8, 6)
      // Legs (animated)
      const legOff = s.jumping ? 0 : Math.sin(s.tick * 0.25) * 4
      ctx.fillRect(x + 14, y + 34, 8, 10 + legOff)
      ctx.fillRect(x + 24, y + 34, 8, 10 - legOff)
      // Mouth
      ctx.fillStyle = C.bg
      ctx.fillRect(x + 34, y + 12, 6, 3)
      // Glow effect
      ctx.shadowColor = C.dino
      ctx.shadowBlur = 8
      ctx.fillStyle = C.dino
      ctx.fillRect(x + 8, y + 10, 26, 24)
      ctx.shadowBlur = 0
    }
    drawDino(DINO_X, s.dinoY)

    // Obstacles
    s.obstacles.forEach(ob => {
      ctx.fillStyle = C.obstacle
      ctx.shadowColor = C.obstacle
      ctx.shadowBlur = 10
      // Cactus-style
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h)
      ctx.fillRect(ob.x - ob.w * 0.4, ob.y + ob.h * 0.3, ob.w * 0.4, ob.h * 0.35)
      ctx.fillRect(ob.x + ob.w, ob.y + ob.h * 0.25, ob.w * 0.4, ob.h * 0.4)
      ctx.shadowBlur = 0
    })

    // HUD — Score
    ctx.fillStyle = C.accent
    ctx.font = `bold 16px 'Orbitron', monospace`
    ctx.fillText(`HI ${String(s.hiScore).padStart(5, '0')}`, CANVAS_W - 200, 28)
    ctx.fillStyle = C.text
    ctx.fillText(String(s.score).padStart(5, '0'), CANVAS_W - 60, 28)

    // Status messages
    if (!s.running && !s.gameOver) {
      ctx.fillStyle = C.accent
      ctx.font = `bold 20px 'Orbitron', monospace`
      ctx.textAlign = 'center'
      ctx.fillText('PRESS SPACE / TAP TO START', CANVAS_W / 2, CANVAS_H / 2 - 10)
      ctx.font = `13px 'Space Mono', monospace`
      ctx.fillStyle = C.text
      ctx.fillText('Jump over the obstacles. How long can you survive?', CANVAS_W / 2, CANVAS_H / 2 + 18)
      ctx.textAlign = 'left'
    }

    if (s.gameOver) {
      ctx.fillStyle = C.obstacle
      ctx.font = `bold 22px 'Orbitron', monospace`
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 14)
      ctx.fillStyle = C.text
      ctx.font = `14px 'Space Mono', monospace`
      ctx.fillText('PRESS SPACE / TAP TO RESTART', CANVAS_W / 2, CANVAS_H / 2 + 14)
      ctx.textAlign = 'left'
    }
  }, [])

  const gameLoop = useCallback(() => {
    const s = stateRef.current
    s.tick++

    // Physics
    s.dinoVY += GRAVITY
    s.dinoY += s.dinoVY
    if (s.dinoY >= GROUND_Y - DINO_H) {
      s.dinoY = GROUND_Y - DINO_H
      s.dinoVY = 0
      s.jumping = false
    }

    // Speed ramp
    s.speed = OBSTACLE_SPEED_INIT + Math.floor(s.score / 300) * 0.8

    // Spawn obstacles
    const now = Date.now()
    const interval = Math.max(800, OBSTACLE_INTERVAL_INIT - s.score * 0.5)
    if (now - s.lastObstacle > interval) {
      const h = 30 + Math.random() * 30
      const w = 16 + Math.random() * 14
      s.obstacles.push({ x: CANVAS_W + 20, y: GROUND_Y - h, w, h })
      s.lastObstacle = now
    }

    // Move & remove obstacles
    s.obstacles = s.obstacles
      .map(ob => ({ ...ob, x: ob.x - s.speed }))
      .filter(ob => ob.x + ob.w > -20)

    // Collision
    s.obstacles.forEach(ob => {
      const pad = 6
      if (
        DINO_X + DINO_W - pad > ob.x + pad &&
        DINO_X + pad < ob.x + ob.w - pad &&
        s.dinoY + DINO_H - pad > ob.y + pad
      ) {
        s.running = false
        s.gameOver = true
        if (s.score > s.hiScore) {
          s.hiScore = s.score
          localStorage.setItem('dino-hi', s.score)
          setHiScore(s.score)
        }
        setGameState('over')
        cancelAnimationFrame(s.frameId)
        drawFrame()
        return
      }
    })

    s.score++
    setDisplayScore(s.score)

    drawFrame()
    if (s.running) s.frameId = requestAnimationFrame(gameLoop)
  }, [drawFrame])

  const jump = useCallback(() => {
    const s = stateRef.current
    if (s.gameOver || !s.running) {
      // Start / restart
      s.gameOver = false
      s.running = true
      s.score = 0
      s.dinoY = GROUND_Y - DINO_H
      s.dinoVY = 0
      s.jumping = false
      s.obstacles = []
      s.lastObstacle = Date.now()
      s.speed = OBSTACLE_SPEED_INIT
      s.tick = 0
      setDisplayScore(0)
      setGameState('playing')
      cancelAnimationFrame(s.frameId)
      s.frameId = requestAnimationFrame(gameLoop)
    } else if (!s.jumping && s.dinoY >= GROUND_Y - DINO_H - 2) {
      s.dinoVY = JUMP_FORCE
      s.jumping = true
    }
  }, [gameLoop])

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() } }
    window.addEventListener('keydown', onKey)
    drawFrame()
    return () => window.removeEventListener('keydown', onKey)
  }, [jump, drawFrame])

  useEffect(() => {
    return () => cancelAnimationFrame(stateRef.current.frameId)
  }, [])

  return (
    <section id="game" className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="section-label" style={{ justifyContent: 'center' }}>Mini Game</span>
          <h2 className="section-title">Take a <span className="accent">Break</span></h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
            Because every good portfolio needs a game. Space / ↑ to jump.
          </p>
        </div>

        <div className={styles.gameWrapper}>
          <div className={styles.gameContainer}>
            <div className={styles.scoreBar}>
              <span className={styles.scoreLabel}>SCORE</span>
              <span className={styles.scoreVal}>{String(displayScore).padStart(5, '0')}</span>
              <span className={styles.scoreLabel} style={{ marginLeft: 'auto' }}>BEST</span>
              <span className={styles.scoreVal}>{String(hiScore).padStart(5, '0')}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className={styles.canvas}
              onClick={jump}
              onTouchStart={e => { e.preventDefault(); jump() }}
            />
            <div className={styles.controls}>
              <button className={styles.jumpBtn} onClick={jump}>
                {gameState === 'idle' ? 'START GAME' : gameState === 'over' ? 'RESTART' : 'JUMP ↑'}
              </button>
              <span className={styles.hint}>Space / ↑ Arrow / Tap to jump</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
