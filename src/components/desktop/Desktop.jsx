import { useState, useRef, useCallback, useEffect } from 'react'
import Terminal from './Terminal'
import FileBrowser from './FileBrowser'
import { DinoGame, SnakeGame, BreakoutGame } from './Games'
import WebBrowser from './WebBrowser'
import { CTF_LEVELS } from './fsData'
import s from './Desktop.module.css'

const WALLPAPER = `
  linear-gradient(135deg,
    #0a0a1a 0%,
    #0d0d20 20%,
    #0f0f28 40%,
    #0a0f1a 60%,
    #080d18 80%,
    #060810 100%
  )
`

const ICONS = [
  { id: 'terminal', label: 'Terminal', emoji: '⌨️', x: 20, y: 20 },
  { id: 'files',    label: 'Files',    emoji: '📁', x: 20, y: 110 },
  { id: 'browser',  label: 'Browser',  emoji: '🌐', x: 20, y: 200 },
  { id: 'dino',     label: 'Dino',     emoji: '🦕', x: 20, y: 290 },
  { id: 'snake',    label: 'Snake',    emoji: '🐍', x: 20, y: 380 },
  { id: 'breakout', label: 'Breakout', emoji: '⚽', x: 20, y: 470 },
]

let nextZIndex = 10

function Window({ id, title, emoji, children, onClose, onFocus, onMinimize, zIndex, defaultW, defaultH, minW, minH, minimized }) {
  const isMobile = window.innerWidth < 700
  const [pos, setPos] = useState({ x: isMobile ? 0 : 60 + Math.random() * 60, y: isMobile ? 0 : 20 + Math.random() * 30 })
  const [size, setSize] = useState({ w: defaultW || 680, h: defaultH || 440 })
  const [maximized, setMaximized] = useState(isMobile)
  const dragging = useRef(false)
  const resizing = useRef(false)
  const dragOff = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const windowRef = useRef(null)

  const onMouseDownTitle = (e) => {
    if (maximized) return
    onFocus()
    dragging.current = true
    dragOff.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  const onTouchTitle = (e) => {
    if (maximized || e.touches.length !== 1) return
    onFocus()
    dragging.current = true
    dragOff.current = { x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y }
  }

  const onMouseDownResize = (e) => {
    e.stopPropagation()
    resizing.current = true
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }
  }

  useEffect(() => {
    const getContainer = () => windowRef.current?.offsetParent || document.body
    const mm = e => {
      if (dragging.current) {
        const cx = e.clientX || e.touches?.[0]?.clientX
        const cy = e.clientY || e.touches?.[0]?.clientY
        if (cx == null) return
        const container = getContainer()
        const maxX = container.offsetWidth - size.w
        const maxY = container.offsetHeight - 38
        setPos({
          x: Math.max(0, Math.min(maxX, cx - dragOff.current.x)),
          y: Math.max(0, Math.min(maxY, cy - dragOff.current.y))
        })
      }
      if (resizing.current) {
        const dw = e.clientX - resizeStart.current.x
        const dh = e.clientY - resizeStart.current.y
        setSize({ w: Math.max(minW || 380, resizeStart.current.w + dw), h: Math.max(minH || 280, resizeStart.current.h + dh) })
      }
    }
    const mu = () => { dragging.current = false; resizing.current = false }
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    window.addEventListener('touchmove', mm, { passive: true })
    window.addEventListener('touchend', mu)
    return () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      window.removeEventListener('touchmove', mm)
      window.removeEventListener('touchend', mu)
    }
  }, [size.w, minW, minH])

  // When minimized, render nothing but keep the component mounted
  if (minimized) return null

  const style = maximized
    ? { position: 'absolute', inset: '0 0 38px 0', width: '100%', height: 'calc(100% - 38px)', zIndex }
    : { position: 'absolute', left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex }

  return (
    <div className={s.window} style={style} onMouseDown={onFocus} ref={windowRef}>
      <div className={s.titleBar}
        onMouseDown={onMouseDownTitle}
        onTouchStart={onTouchTitle}>
        <div className={s.winBtns}>
          <span className={s.winBtn} style={{ background: '#ff5f57' }} onClick={onClose} title="Close" />
          <span className={s.winBtn} style={{ background: '#febc2e' }} onClick={onMinimize} title="Minimize" />
          <span className={s.winBtn} style={{ background: '#28c840' }} onClick={() => setMaximized(m => !m)} title="Maximize" />
        </div>
        <span className={s.winTitle}>{emoji} {title}</span>
        <div style={{ width: 52 }} />
      </div>
      <div className={s.winContent}>{children}</div>
      {!maximized && <div className={s.resizeHandle} onMouseDown={onMouseDownResize} />}
    </div>
  )
}

export default function FunOSDesktop({ onFlag, flags }) {
  const [windows, setWindows] = useState([])
  const [isRoot, setIsRoot] = useState(false)
  const [notify, setNotify] = useState(null)
  const [cheatInp, setCheatInp] = useState('')
  // activePowers: set of power IDs currently active (activated by cheat code input)
  const [activePowers, setActivePowers] = useState(new Set())
  // powerTimers: { [powerId]: remaining seconds }
  const [powerTimers, setPowerTimers] = useState({})
  const timerRefs = useRef({})

  // Called when CTF level completed — just notifies, does NOT activate power
  const handleFlag = useCallback((lvlId, flag, reward) => {
    onFlag?.(lvlId, flag, reward)
    setNotify({
      msg: `🏆 Level ${lvlId} cleared! Use cheat box to activate: ${reward.name}`,
      type: 'success'
    })
    setTimeout(() => setNotify(null), 6000)
  }, [onFlag])

  // Activate a power — called when cheat code is entered in cheat box
  const activatePower = useCallback((powerId, name, duration) => {
    setActivePowers(prev => new Set([...prev, powerId]))
    if (duration > 0) {
      setPowerTimers(t => ({ ...t, [powerId]: duration }))
      clearInterval(timerRefs.current[powerId])
      timerRefs.current[powerId] = setInterval(() => {
        setPowerTimers(t => {
          const rem = (t[powerId] || 0) - 1
          if (rem <= 0) {
            clearInterval(timerRefs.current[powerId])
            setActivePowers(prev => { const n = new Set(prev); n.delete(powerId); return n })
            const next = { ...t }; delete next[powerId]; return next
          }
          return { ...t, [powerId]: rem }
        })
      }, 1000)
    }
    setNotify({ msg: `✅ ${name} activated!`, type: 'success' })
    setTimeout(() => setNotify(null), 3000)
  }, [])

  const powerArr = [...activePowers]

  const openWindow = useCallback((id, extraPath) => {
    setWindows(ws => {
      const exists = ws.find(w => w.id === id)
      if (exists) {
        // Un-minimize and bring to front if already open
        return ws.map(w => w.id === id ? { ...w, z: nextZIndex++, minimized: false } : w)
      }
      const isMobile = window.innerWidth < 700
      const dw = isMobile ? window.innerWidth - 20 : undefined
      const configs = {
        terminal: { title: 'Terminal',       emoji: '⌨️', w: dw || 700, h: isMobile ? 420 : 460 },
        files:    { title: 'Files — Home',   emoji: '📁', w: dw || 680, h: isMobile ? 400 : 420 },
        browser:  { title: 'Web Browser',    emoji: '🌐', w: dw || 760, h: isMobile ? 440 : 480 },
        dino:     { title: 'Dino Runner',    emoji: '🦕', w: dw || 720, h: isMobile ? 320 : 340 },
        snake:    { title: 'Snake',          emoji: '🐍', w: dw || 720, h: isMobile ? 420 : 400 },
        breakout: { title: 'Breakout',       emoji: '⚽', w: dw || 720, h: isMobile ? 380 : 380 },
      }
      const cfg = configs[id] || { title: id, emoji: '📄', w: dw || 600, h: 400 }
      return [...ws, { id, title: cfg.title, emoji: cfg.emoji, w: cfg.w, h: cfg.h, z: nextZIndex++, extraPath }]
    })
  }, [])

  const closeWindow  = (id) => setWindows(ws => ws.filter(w => w.id !== id))

  const focusWindow  = (id) => setWindows(ws => ws.map(w =>
    w.id === id ? { ...w, z: nextZIndex++, minimized: false } : w
  ))

  const minimizeWindow = (id) => setWindows(ws => ws.map(w =>
    w.id === id ? { ...w, minimized: true } : w
  ))

  // Taskbar click: open if missing, restore if minimized, bring to front if buried, minimize if focused
  const handleTaskbarClick = (id) => {
    const existing = windows.find(w => w.id === id)
    if (!existing) {
      openWindow(id)
    } else if (existing.minimized) {
      focusWindow(id)
    } else {
      const isTopmost = !windows.some(w => w.z > existing.z && !w.minimized)
      if (isTopmost) {
        minimizeWindow(id)
      } else {
        focusWindow(id)
      }
    }
  }

  const submitCheat = (e) => {
    e.preventDefault()
    const v = cheatInp.trim()
    const found = CTF_LEVELS.find(l => l.flag === v)
    if (found) {
      if (!flags[found.id]) {
        setNotify({ msg: 'Solve the CTF level first to earn this power-up!', type: 'err' })
        setTimeout(() => setNotify(null), 3000)
      } else if (activePowers.has(found.id) && found.reward.duration === 0) {
        setNotify({ msg: `${found.reward.name} — no timer needed (charges based)`, type: 'info' })
        setTimeout(() => setNotify(null), 2500)
      } else {
        activatePower(found.id, found.reward.name, found.reward.duration)
      }
      setCheatInp('')
    } else {
      setNotify({ msg: 'Invalid cheat code. Solve CTF challenges to earn flags.', type: 'err' })
      setTimeout(() => setNotify(null), 2500)
    }
  }

  return (
    <div 
      className={s.desktop} 
      style={{ background: WALLPAPER }}
      onScroll={(e) => { 
        // FIX: Forcefully stop the browser from auto-scrolling the hidden container
        e.target.scrollTop = 0; 
        e.target.scrollLeft = 0; 
      }}
    >
      {/* Wallpaper decorations */}
      <div className={s.wpDeco1} />
      <div className={s.wpDeco2} />
      <div className={s.wpText}>FUN-OS</div>
      <div className={s.wpSub}>Cybersecurity Lab Edition</div>
      {/* Grid overlay */}
      <div className={s.wpGrid} />

      {/* Desktop Icons */}
      {ICONS.map(ic => (
        <div key={ic.id} className={s.deskIcon}
          style={{ left: ic.x, top: ic.y }}
          onDoubleClick={() => openWindow(ic.id)}
          onClick={(e) => e.detail === 2 && openWindow(ic.id)}>
          <span className={s.deskIconEmoji}>{ic.emoji}</span>
          <span className={s.deskIconLabel}>{ic.label}</span>
        </div>
      ))}

      {/* Notification */}
      {notify && (
        <div className={`${s.notif} ${s['notif_' + notify.type]}`}>{notify.msg}</div>
      )}

      {/* Power-up status bar — shows active timers */}
      {(Object.keys(powerTimers).length > 0 || activePowers.size > 0) && (
        <div className={s.powerBar}>
          {[...activePowers].map(id => {
            const lvl = CTF_LEVELS.find(l => l.reward.id === id)
            const rem = powerTimers[id]
            return (
              <div key={id} className={s.powerItem}>
                <span>{lvl?.reward.name || `Power ${id}`}</span>
                {rem > 0 && <span className={s.powerTimer}>{rem}s</span>}
                {!rem && <span className={s.powerTimer}>∞</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Earned flags — shows what flags you have but haven't activated */}
      {Object.keys(flags).length > 0 && (
        <div className={s.earnedBar}>
          {Object.entries(flags).map(([lvlId, flag]) => {
            const lvl = CTF_LEVELS.find(l => l.id === +lvlId)
            const isActive = activePowers.has(lvl?.reward.id)
            return (
              <div key={lvlId} className={`${s.earnedItem} ${isActive ? s.earnedActive : ''}`}
                title={isActive ? 'Active!' : 'Enter in cheat box to activate'}>
                {lvl?.reward.name.split(' ')[0]} {isActive ? '✓' : '→ activate'}
              </div>
            )
          })}
        </div>
      )}

      {/* Cheat input */}
      <div className={s.cheatZone}>
        <form onSubmit={submitCheat} className={s.cheatForm}>
          <input
            className={s.cheatInp}
            value={cheatInp}
            onChange={e => setCheatInp(e.target.value)}
            placeholder="Enter FLAG{...} cheat code"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
          <button type="submit" className={s.cheatBtn}>UNLOCK</button>
        </form>
      </div>

      {/* Windows */}
      {windows.map(w => (
        <Window
          key={w.id}
          id={w.id}
          title={w.title}
          emoji={w.emoji}
          zIndex={w.z}
          defaultW={w.w}
          defaultH={w.h}
          minimized={!!w.minimized}
          onClose={() => closeWindow(w.id)}
          onFocus={() => focusWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
        >
          {w.id === 'terminal' && (
            <Terminal
              onFlag={handleFlag}
              unlockedFlags={flags}
              onOpenFiles={(path) => {
                if (path === '__browser__') openWindow('browser')
                else openWindow('files', path)
              }}
              isRoot={isRoot}
              onBecomeRoot={() => setIsRoot(true)}
            />
          )}
          {w.id === 'files' && (
            <FileBrowser
              initialPath={w.extraPath || '/home/sahal'}
              onOpenApp={(app) => openWindow(app.toLowerCase())}
              isRoot={isRoot}
            />
          )}
          {w.id === 'browser' && <WebBrowser />}
          {w.id === 'dino' && <DinoGame activePowers={powerArr} />}
          {w.id === 'snake' && <SnakeGame activePowers={powerArr} />}
          {w.id === 'breakout' && <BreakoutGame activePowers={powerArr} />}
        </Window>
      ))}

      {/* Taskbar */}
      <div className={s.taskbar}>
        <div className={s.tbLeft}>
          <span className={s.tbLogo}>🛡 FUN-OS</span>
        </div>
        <div className={s.tbCenter}>
          {ICONS.map(ic => {
            const win = windows.find(w => w.id === ic.id)
            const isOpen = !!win
            const isMinimized = win?.minimized
            return (
              <button
                key={ic.id}
                className={`${s.tbApp} ${isOpen ? s.tbOpen : ''} ${isMinimized ? s.tbMinimized : ''}`}
                onClick={() => handleTaskbarClick(ic.id)}
                title={isMinimized ? `${ic.label} (minimized — click to restore)` : ic.label}
              >
                {ic.emoji} <span className={s.tbLabel}>{ic.label}</span>
                {isMinimized && <span className={s.tbDot}>●</span>}
              </button>
            )
          })}
        </div>
        <div className={s.tbRight}>
          <span className={s.tbUser}>{isRoot ? '👑 root' : '👤 sahal'}</span>
          <span className={s.tbTime}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}