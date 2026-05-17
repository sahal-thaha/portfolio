import { useState } from 'react'
import FunOSDesktop from '../desktop/Desktop'
import s from './ComputerDesk.module.css'

export default function ComputerDesk() {
  const [flags, setFlags] = useState({})
  const [flagCount, setFlagCount] = useState(0)

  const handleFlag = (lvlId, flag, reward) => {
    setFlags(f => ({ ...f, [lvlId]: flag }))
    setFlagCount(Object.keys({ ...flags, [lvlId]: flag }).length)
  }

  return (
    <section id="lab" className="sec">
      <div className="wrap">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="lbl" style={{ justifyContent: 'center' }}>Interactive Lab</span>
          <h2 className="stitle">THE <span className="gld">TERMINAL</span> & GAMES</h2>
          <p style={{ color: 'var(--muted)', fontFamily: "'Space Mono',monospace", fontSize: 11, marginTop: 6 }}>
            Double-click icons to open apps · Solve CTF challenges to unlock game power-ups · {flagCount}/5 flags captured
          </p>
        </div>

        <div className={s.monitorOuter}>
          {/* Monitor bezel */}
          <div className={s.monitorBezel}>
            {/* OS runs here */}
            <FunOSDesktop onFlag={handleFlag} flags={flags} />
          </div>
          {/* Stand */}
          <div className={s.standPole} />
          <div className={s.standBase} />
        </div>
      </div>
    </section>
  )
}
