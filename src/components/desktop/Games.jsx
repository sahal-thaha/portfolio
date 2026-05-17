import { useState, useEffect, useRef, useCallback } from 'react'
import s from './Games.module.css'

/* ── helper: scale canvas to container width ── */
function useCanvasSize(cvRef, nomW, nomH) {
  useEffect(() => {
    const update = () => {
      const c = cvRef.current; if (!c) return
      const w = c.parentElement?.offsetWidth || nomW
      const scale = Math.min(1, (w - 16) / nomW)
      c.style.width  = nomW * scale + 'px'
      c.style.height = nomH * scale + 'px'
    }
    update()
    const ro = new ResizeObserver(update)
    if (cvRef.current?.parentElement) ro.observe(cvRef.current.parentElement)
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [nomW, nomH])
}

/* ══════════════════════════════════════════════════════════════
   DINO GAME
   Power id 1 → Fire (5 shots, no timer — active until shots used)
   Power id 4 → Invisibility (2 min timer)
══════════════════════════════════════════════════════════════ */
export function DinoGame({ activePowers }) {
  const cv = useRef(null)
  const W = 680, H = 176
  const GY = H - 48, DH = 32, DW = 28, DX = 52

  // State
  const [phase, setPhase] = useState('idle')  // idle | play | paused | over
  const [score, setScore] = useState(0)
  const [fireLeft, setFireLeft] = useState(5)
  const [invisRem, setInvisRem] = useState(0)

  const hasFire  = activePowers?.includes(1)
  const hasInvis = activePowers?.includes(4)

  const invisTimer = useRef(null)

  const st = useRef({
    on: false, over: false, paused: false,
    score: 0, hi: +localStorage.getItem('dhi') || 0,
    y: 0, vy: 0, jumping: false,
    obs: [], fireballs: [], fireCount: 0,
    last: 0, spd: 4, tick: 0, raf: null,
    invis: false, invisRem: 0,
  })

  useCanvasSize(cv, W, H)

  const draw = useCallback(() => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d'), g = st.current
    const dk = document.documentElement.getAttribute('data-theme') === 'dark'
    ctx.fillStyle = dk ? '#0a0f0a' : '#ecf5e8'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = dk ? 'rgba(168,255,120,.04)' : 'rgba(0,100,0,.04)'; ctx.lineWidth = .7
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    ctx.strokeStyle = dk ? '#a8ff78' : '#2a7a00'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, GY + DH); ctx.lineTo(W, GY + DH); ctx.stroke()
    for (let i = 0; i < 12; i++) {
      const x = (g.tick * g.spd * .35 + i * 80) % W
      ctx.strokeStyle = dk ? 'rgba(168,255,120,.15)' : 'rgba(0,120,0,.1)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x, GY + DH + 4); ctx.lineTo(x + 24, GY + DH + 4); ctx.stroke()
    }
    const dy = g.y + GY
    const isInvis = g.invis
    const dc = isInvis ? 'rgba(168,255,120,0.22)' : (dk ? '#a8ff78' : '#2a7a00')
    ctx.fillStyle = dc
    ctx.fillRect(DX + 8, dy + 8, 18, 18); ctx.fillRect(DX + 14, dy, 16, 12)
    if (!isInvis) {
      ctx.fillStyle = dk ? '#0a0f0a' : '#ecf5e8'; ctx.fillRect(DX + 24, dy + 3, 4, 4)
      ctx.fillStyle = dc
    }
    const la = g.jumping ? 0 : Math.sin(g.tick * .28) * 4
    ctx.fillRect(DX + 10, dy + 26, 6, 8 + la); ctx.fillRect(DX + 18, dy + 26, 6, 8 - la)
    g.fireballs.forEach(fb => {
      ctx.fillStyle = '#ff6600'; ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 8
      ctx.beginPath(); ctx.arc(fb.x, fb.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0
    })
    g.obs.forEach(ob => {
      ctx.fillStyle = '#ff5533'
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h)
      ctx.fillRect(ob.x - ob.w*.4, ob.y + ob.h*.4, ob.w*.4, ob.h*.25)
      ctx.fillRect(ob.x + ob.w, ob.y + ob.h*.3, ob.w*.4, ob.h*.28)
    })
    ctx.fillStyle = dk ? '#a8ff78' : '#2a7a00'; ctx.font = "bold 11px 'Space Mono',monospace"
    ctx.fillText(`HI:${String(g.hi).padStart(4,'0')}`, W-180, 18)
    ctx.fillStyle = dk ? '#c8ffc8' : '#1a5a00'
    ctx.fillText(String(g.score).padStart(5,'0'), W-65, 18)
    if (g.paused) {
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H)
      ctx.fillStyle = '#ffd700'; ctx.font = "bold 18px 'Space Mono',monospace"; ctx.textAlign='center'
      ctx.fillText('PAUSED', W/2, H/2-8)
      ctx.font = "9px 'Space Mono',monospace"; ctx.fillStyle='#a8ff78'
      ctx.fillText('click RESUME to continue', W/2, H/2+12); ctx.textAlign='left'
    }
    if (!g.on && !g.over && !g.paused) {
      ctx.fillStyle = dk?'#a8ff78':'#2a7a00'; ctx.font="bold 13px 'Space Mono',monospace"; ctx.textAlign='center'
      ctx.fillText('SPACE / TAP to start', W/2, H/2-8)
      ctx.font="9px 'Space Mono',monospace"; ctx.fillStyle=dk?'#668866':'#446644'
      ctx.fillText('dodge cacti', W/2, H/2+12); ctx.textAlign='left'
    }
    if (g.over) {
      ctx.fillStyle='#ff5533'; ctx.font="bold 15px 'Space Mono',monospace"; ctx.textAlign='center'
      ctx.fillText('GAME OVER', W/2, H/2-10)
      ctx.fillStyle=dk?'#a8ff78':'#2a7a00'; ctx.font="9px 'Space Mono',monospace"
      ctx.fillText('SPACE / TAP to retry', W/2, H/2+12); ctx.textAlign='left'
    }
  }, [])

  const loop = useCallback(() => {
    const g = st.current
    if (g.paused || !g.on) return
    g.tick++
    g.vy += 0.55; g.y += g.vy
    if (g.y >= 0) { g.y = 0; g.vy = 0; g.jumping = false }
    g.spd = 4 + Math.floor(g.score / 500) * .8
    const now = Date.now()
    if (now - g.last > Math.max(700, 1600 - g.score * .4)) {
      const h = 20 + Math.random()*28, w = 14 + Math.random()*10
      g.obs.push({ x: W+10, y: GY+DH-h, w, h }); g.last = now
    }
    g.fireballs = g.fireballs.map(fb=>({...fb,x:fb.x+12})).filter(fb=>fb.x<W+20)
    g.fireballs.forEach(fb => {
      g.obs = g.obs.filter(ob => {
        if (fb.x+5>ob.x && fb.x-5<ob.x+ob.w && fb.y+5>ob.y && fb.y-5<ob.y+ob.h) {
          g.score+=50; setScore(g.score); return false
        }
        return true
      })
    })
    g.obs = g.obs.map(ob=>({...ob,x:ob.x-g.spd})).filter(ob=>ob.x+ob.w>-10)
    if (!g.invis) {
      for (const ob of g.obs) {
        if (DX+DW-5>ob.x+5 && DX+5<ob.x+ob.w-5 && g.y+GY+DH-5>ob.y+5) {
          g.on=false; g.over=true
          if (g.score>g.hi){g.hi=g.score;localStorage.setItem('dhi',g.score)}
          setPhase('over'); draw(); return
        }
      }
    }
    g.score++; setScore(g.score)
    draw()
    g.raf = requestAnimationFrame(loop)
  }, [draw])

  const jump = useCallback(() => {
    const g = st.current
    if (g.paused) return
    if (g.over || !g.on) {
      g.over=false; g.on=true; g.score=0; g.y=0; g.vy=0; g.jumping=false
      g.obs=[]; g.fireballs=[]; g.fireCount=0; g.last=Date.now(); g.spd=4; g.tick=0; g.invis=false
      setScore(0); setFireLeft(hasFire ? 5 : 0); setPhase('play')
      cancelAnimationFrame(g.raf)
      g.raf = requestAnimationFrame(loop)
    } else if (!g.jumping && g.y >= 0) {
      g.vy = -14; g.jumping = true
    }
  }, [loop, hasFire])

  const shootFire = useCallback(() => {
    const g = st.current
    if (!hasFire || g.fireCount >= 5 || !g.on || g.paused) return
    g.fireCount++
    const left = 5 - g.fireCount
    setFireLeft(left)
    g.fireballs.push({ x: DX + DW + 10, y: g.y + GY + DH / 2 })
  }, [hasFire])

  const activateInvis = useCallback(() => {
    if (!hasInvis) return
    const g = st.current; g.invis = true; setInvisRem(120)
    clearInterval(invisTimer.current)
    invisTimer.current = setInterval(() => {
      setInvisRem(r => { if(r<=1){clearInterval(invisTimer.current);st.current.invis=false;return 0} return r-1 })
    }, 1000)
  }, [hasInvis])

  const togglePause = useCallback(() => {
    const g = st.current
    if (!g.on && !g.over) return
    if (g.paused) {
      g.paused = false; setPhase('play')
      cancelAnimationFrame(g.raf)
      g.raf = requestAnimationFrame(loop)
    } else {
      g.paused = true; setPhase('paused')
      cancelAnimationFrame(g.raf)
      draw()
    }
  }, [loop, draw])

  useEffect(() => {
    const kd = e => {
      if (e.code==='Space'||e.code==='ArrowUp') { e.preventDefault(); jump() }
      if (e.code==='KeyF') { e.preventDefault(); shootFire() }
      if (e.code==='KeyI') { e.preventDefault(); activateInvis() }
      if (e.code==='KeyP') { e.preventDefault(); togglePause() }
    }
    window.addEventListener('keydown', kd); draw()
    return () => { window.removeEventListener('keydown', kd); cancelAnimationFrame(st.current.raf) }
  }, [jump, draw, shootFire, activateInvis, togglePause])

  useEffect(() => () => clearInterval(invisTimer.current), [])

  return (
    <div className={s.gameWrap}>
      <canvas ref={cv} width={W} height={H} className={s.canvas}
        onClick={phase==='paused' ? togglePause : jump}
        onTouchStart={e=>{e.preventDefault(); phase==='paused' ? togglePause() : jump()}} />
      <div className={s.ctrl}>
        <button className={s.btn} onClick={phase==='paused'?togglePause:jump}>
          {phase==='idle'?'START':phase==='over'?'RETRY':phase==='paused'?'▶ RESUME':'■ JUMP'}
        </button>
        <button className={`${s.btn} ${s.btnPause}`} onClick={togglePause} disabled={phase==='idle'||phase==='over'}>
          {phase==='paused'?'▶':'⏸'} PAUSE
        </button>
        {hasFire && fireLeft > 0 && <button className={s.btnPow} onClick={shootFire}>🔥 FIRE ×{fireLeft} (F)</button>}
        {hasFire && fireLeft === 0 && <span className={s.powUsed}>🔥 FIRE USED</span>}
        {hasInvis && <button className={s.btnPow} onClick={activateInvis} disabled={invisRem>0}>
          👻 INVIS {invisRem>0?`${invisRem}s`:'(I)'}
        </button>}
        <span className={s.sc}>SCORE: {String(score).padStart(5,'0')}</span>
      </div>
      {/* Mobile jump button */}
      <div className={s.mobileJump}>
        <button className={s.jumpBtn} onPointerDown={e=>{e.preventDefault();jump()}} aria-label="Jump">
          ↑ JUMP
        </button>
        {hasFire && fireLeft > 0 && <button className={s.jumpBtn} style={{background:'#ff6600'}} onPointerDown={e=>{e.preventDefault();shootFire()}} aria-label="Fire">🔥 ×{fireLeft}</button>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SNAKE GAME
   Power id 2 → Shield (pass through walls once)
   Power id 5 → Extra Life
══════════════════════════════════════════════════════════════ */
export function SnakeGame({ activePowers }) {
  const cv = useRef(null)
  const CELL=14, COLS=48, ROWS=12, W=COLS*CELL, H=ROWS*CELL
  const st = useRef({
    on:false,over:false,paused:false,dir:{x:1,y:0},next:{x:1,y:0},
    snake:[{x:10,y:7}],food:{x:20,y:7},score:0,
    hi:+localStorage.getItem('shi')||0,tick:0,raf:null,lives:1,shieldUsed:false,
  })
  const [score,setScore]=useState(0)
  const [phase,setPhase]=useState('idle')
  const touchRef=useRef(null)

  const hasShield = activePowers?.includes(2)
  const hasExtraLife = activePowers?.includes(5)

  useCanvasSize(cv,W,H)

  const rFood=snake=>{
    let f
    do{f={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}}
    while(snake.some(s=>s.x===f.x&&s.y===f.y)); return f
  }

  const draw=useCallback(()=>{
    const c=cv.current;if(!c) return
    const ctx=c.getContext('2d'),g=st.current
    const dk=document.documentElement.getAttribute('data-theme')==='dark'
    ctx.fillStyle=dk?'#0a0f0a':'#ecf5ec';ctx.fillRect(0,0,W,H)
    ctx.strokeStyle=dk?'rgba(168,255,120,.04)':'rgba(0,100,0,.04)';ctx.lineWidth=.5
    for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,H);ctx.stroke()}
    for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(W,y*CELL);ctx.stroke()}
    g.snake.forEach((seg,i)=>{
      ctx.fillStyle=i===0?(dk?'#a8ff78':'#2a8a00'):(dk?'rgba(168,255,120,.65)':'rgba(0,140,0,.65)')
      ctx.fillRect(seg.x*CELL+1,seg.y*CELL+1,CELL-2,CELL-2)
    })
    ctx.fillStyle='#ff5533';ctx.fillRect(g.food.x*CELL+2,g.food.y*CELL+2,CELL-4,CELL-4)
    ctx.fillStyle=dk?'#a8ff78':'#2a7a00';ctx.font="bold 10px 'Space Mono',monospace"
    ctx.fillText(`HI:${g.hi}`,W-110,14);ctx.fillText(`${g.score}`,W-40,14)
    if(g.lives>1){ctx.fillStyle='#ff88ff';ctx.fillText(`❤×${g.lives}`,6,14)}
    if(g.paused){
      ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H)
      ctx.fillStyle='#ffd700';ctx.font="bold 16px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText('PAUSED',W/2,H/2-6)
      ctx.font="8px 'Space Mono',monospace";ctx.fillStyle='#a8ff78'
      ctx.fillText('click RESUME to continue',W/2,H/2+10);ctx.textAlign='left'
    }
    if(!g.on&&!g.over&&!g.paused){
      ctx.fillStyle=dk?'#a8ff78':'#2a7a00';ctx.font="bold 13px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText('TAP / ENTER to start',W/2,H/2-8)
      ctx.font="9px 'Space Mono',monospace";ctx.fillStyle=dk?'#558855':'#446644'
      ctx.fillText('WASD / Arrow / Swipe',W/2,H/2+10);ctx.textAlign='left'
    }
    if(g.over){
      ctx.fillStyle='#ff5533';ctx.font="bold 14px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText('GAME OVER',W/2,H/2-8)
      ctx.fillStyle=dk?'#a8ff78':'#2a7a00';ctx.font="9px 'Space Mono',monospace"
      ctx.fillText('TAP / ENTER to retry',W/2,H/2+10);ctx.textAlign='left'
    }
  },[W,H])

  const loop=useCallback(()=>{
    const g=st.current
    if(g.paused||!g.on) return
    g.tick++
    if(g.tick%8!==0){g.raf=requestAnimationFrame(loop);draw();return}
    g.dir={...g.next}
    let head={x:g.snake[0].x+g.dir.x,y:g.snake[0].y+g.dir.y}
    const hitWall=head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS
    if(hitWall){
      if(hasShield&&!g.shieldUsed){g.shieldUsed=true;head={x:(head.x+COLS)%COLS,y:(head.y+ROWS)%ROWS}}
      else if(g.lives>1){g.lives--;g.snake=[{x:Math.floor(COLS/2),y:Math.floor(ROWS/2)}];g.dir={x:1,y:0};g.next={x:1,y:0};draw();g.raf=requestAnimationFrame(loop);return}
      else{g.on=false;g.over=true;if(g.score>g.hi){g.hi=g.score;localStorage.setItem('shi',g.score)};setPhase('over');draw();return}
    }
    if(g.snake.some(s=>s.x===head.x&&s.y===head.y)){
      if(g.lives>1){g.lives--;g.snake=[{x:Math.floor(COLS/2),y:Math.floor(ROWS/2)}];g.dir={x:1,y:0};g.next={x:1,y:0};draw();g.raf=requestAnimationFrame(loop);return}
      g.on=false;g.over=true;if(g.score>g.hi){g.hi=g.score;localStorage.setItem('shi',g.score)};setPhase('over');draw();return
    }
    const ate=head.x===g.food.x&&head.y===g.food.y
    g.snake=[head,...g.snake];if(!ate)g.snake.pop()
    else{g.score+=10;setScore(g.score);g.food=rFood(g.snake)}
    draw();g.raf=requestAnimationFrame(loop)
  },[draw,hasShield])

  const start=useCallback(()=>{
    const g=st.current;g.over=false;g.on=true;g.paused=false;g.score=0;g.tick=0;g.shieldUsed=false
    g.lives=hasExtraLife?2:1
    g.snake=[{x:Math.floor(COLS/2),y:Math.floor(ROWS/2)}];g.dir={x:1,y:0};g.next={x:1,y:0};g.food=rFood(g.snake)
    setScore(0);setPhase('play');cancelAnimationFrame(g.raf);g.raf=requestAnimationFrame(loop)
  },[loop,hasExtraLife])

  const togglePause=useCallback(()=>{
    const g=st.current;if(!g.on&&!g.over)return
    if(g.paused){g.paused=false;setPhase('play');cancelAnimationFrame(g.raf);g.raf=requestAnimationFrame(loop)}
    else{g.paused=true;setPhase('paused');cancelAnimationFrame(g.raf);draw()}
  },[loop,draw])

  const setDir=useCallback((dx,dy)=>{
    const g=st.current;if(!g.on||g.paused)return
    if(dx!==0&&g.dir.x!==0)return;if(dy!==0&&g.dir.y!==0)return
    g.next={x:dx,y:dy}
  },[])

  useEffect(()=>{
    const kd=e=>{
      if((e.key==='Enter'||e.key===' ')&&(!st.current.on||st.current.over)){start();return}
      if(e.key==='p'||e.key==='P'){togglePause();return}
      if(!st.current.on||st.current.paused)return
      if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){e.preventDefault();setDir(0,-1)}
      if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){e.preventDefault();setDir(0,1)}
      if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){e.preventDefault();setDir(-1,0)}
      if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){e.preventDefault();setDir(1,0)}
    }
    window.addEventListener('keydown',kd);draw()
    return()=>{window.removeEventListener('keydown',kd);cancelAnimationFrame(st.current.raf)}
  },[start,draw,setDir,togglePause])

  useEffect(()=>{
    const el=cv.current;if(!el)return
    const ts=e=>{e.preventDefault();touchRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}
    const te=e=>{
      if(!touchRef.current)return
      const dx=e.changedTouches[0].clientX-touchRef.current.x
      const dy=e.changedTouches[0].clientY-touchRef.current.y
      if(Math.abs(dx)>Math.abs(dy))setDir(dx>0?1:-1,0);else setDir(0,dy>0?1:-1)
      touchRef.current=null
    }
    el.addEventListener('touchstart',ts,{passive:false});el.addEventListener('touchend',te,{passive:true})
    return()=>{el.removeEventListener('touchstart',ts);el.removeEventListener('touchend',te)}
  },[setDir])

  return (
    <div className={s.gameWrap}>
      <canvas ref={cv} width={W} height={H} className={s.canvas}
        onClick={()=>{if(!st.current.on||st.current.over)start()}} />
      <div className={s.ctrl}>
        <button className={s.btn} onClick={()=>{if(!st.current.on||st.current.over)start();else togglePause()}}>
          {phase==='idle'?'START':phase==='over'?'RETRY':phase==='paused'?'▶ RESUME':'●'}
        </button>
        <button className={`${s.btn} ${s.btnPause}`} onClick={togglePause} disabled={phase==='idle'||phase==='over'}>
          {phase==='paused'?'▶':'⏸'} PAUSE
        </button>
        <span className={s.sc}>SCORE: {score} | HI: {st.current.hi}</span>
      </div>
      {/* D-pad for mobile */}
      <div className={s.dpad}>
        <div className={s.dpadRow}><button className={s.dBtn} onPointerDown={e=>{e.preventDefault();setDir(0,-1)}}>▲</button></div>
        <div className={s.dpadRow}>
          <button className={s.dBtn} onPointerDown={e=>{e.preventDefault();setDir(-1,0)}}>◀</button>
          <button className={s.dBtnMid} onPointerDown={e=>{e.preventDefault();start()}}>▶▌</button>
          <button className={s.dBtn} onPointerDown={e=>{e.preventDefault();setDir(1,0)}}>▶</button>
        </div>
        <div className={s.dpadRow}><button className={s.dBtn} onPointerDown={e=>{e.preventDefault();setDir(0,1)}}>▼</button></div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   BREAKOUT GAME
   Power id 3 → Long Paddle (2 min timer)
══════════════════════════════════════════════════════════════ */
export function BreakoutGame({ activePowers }) {
  const cv = useRef(null)
  const W=680, H=200
  const st=useRef({
    on:false,over:false,won:false,paused:false,level:1,
    px:290,pw:80,score:0,hi:+localStorage.getItem('bhi')||0,
    balls:[],bricks:[],raf:null
  })
  const [score,setScore]=useState(0)
  const [phase,setPhase]=useState('idle')
  const [level,setLevel]=useState(1)
  const [paddleRemSec,setPaddleRemSec]=useState(0)
  const paddleTimer=useRef(null)
  const trackRef=useRef(null)  // ref to the slider track DOM element
  const PR=6,PH=7

  const hasLongPaddle = activePowers?.includes(3)

  useCanvasSize(cv,W,H)

  // Activate long paddle when power is granted
  useEffect(()=>{
    if(hasLongPaddle && paddleRemSec===0){
      st.current.pw=130;setPaddleRemSec(120)
      clearInterval(paddleTimer.current)
      paddleTimer.current=setInterval(()=>{
        setPaddleRemSec(r=>{if(r<=1){clearInterval(paddleTimer.current);st.current.pw=80;return 0}return r-1})
      },1000)
    }
  },[hasLongPaddle])
  useEffect(()=>()=>clearInterval(paddleTimer.current),[])

  const mkBricks=lvl=>{
    const b=[]
    const cfgs=[{rows:4,cols:17},{rows:5,cols:17},{rows:6,cols:16},{rows:7,cols:16}]
    const cfg=cfgs[Math.min(lvl-1,cfgs.length-1)]
    const bw=Math.floor((W-20)/cfg.cols)-3
    const colors=['#ff5533','#ffaa00','#a8ff78','#5599ff','#ff88ff','#88ffff','#fff']
    for(let r=0;r<cfg.rows;r++)
      for(let c=0;c<cfg.cols;c++){
        const hp=lvl>=3&&r<2?2:1
        b.push({x:10+c*(bw+3),y:18+r*13,w:bw,h:9,alive:true,hp,maxHp:hp,color:colors[r%colors.length]})
      }
    return b
  }

  const draw=useCallback(()=>{
    const c=cv.current;if(!c)return
    const ctx=c.getContext('2d'),g=st.current
    const dk=document.documentElement.getAttribute('data-theme')==='dark'
    ctx.fillStyle=dk?'#080c14':'#e8ecf5';ctx.fillRect(0,0,W,H)
    ctx.strokeStyle=dk?'rgba(85,153,255,.04)':'rgba(0,50,150,.04)';ctx.lineWidth=.5
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    g.bricks.filter(b=>b.alive).forEach(b=>{
      ctx.globalAlpha=b.hp<b.maxHp?.55:1
      ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h)
      if(b.maxHp>1){ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(b.x+1,b.y+1,b.w-2,3)}
      ctx.globalAlpha=1
    })
    ctx.fillStyle=paddleRemSec>0?'#ffd700':'#5599ff';ctx.fillRect(g.px,H-PH-6,g.pw,PH)
    g.balls.forEach(ball=>{
      ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=6
      ctx.beginPath();ctx.arc(ball.x,ball.y,PR,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0
    })
    ctx.fillStyle=dk?'#5599ff':'#0033aa';ctx.font="bold 10px 'Space Mono',monospace"
    ctx.fillText(`HI:${g.hi}`,W-120,14);ctx.fillText(`${g.score}`,W-42,14);ctx.fillText(`LVL${g.level}`,W/2-14,14)
    if(paddleRemSec>0){ctx.fillStyle='#ffd700';ctx.fillText(`📏${paddleRemSec}s`,6,14)}
    if(g.paused){
      ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H)
      ctx.fillStyle='#ffd700';ctx.font="bold 16px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText('PAUSED',W/2,H/2-6)
      ctx.font="8px 'Space Mono',monospace";ctx.fillStyle='#5599ff'
      ctx.fillText('click RESUME to continue',W/2,H/2+10);ctx.textAlign='left'
    }
    if(!g.on&&!g.over&&!g.won){
      ctx.fillStyle=dk?'#5599ff':'#0033cc';ctx.font="bold 13px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText('TAP TO START',W/2,H/2-6)
      ctx.font="9px 'Space Mono',monospace";ctx.fillStyle=dk?'#336699':'#224488'
      ctx.fillText('drag slider to move paddle',W/2,H/2+10);ctx.textAlign='left'
    }
    if(g.over){
      ctx.fillStyle='#ff5533';ctx.font="bold 14px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText('GAME OVER',W/2,H/2-6)
      ctx.fillStyle=dk?'#5599ff':'#0033cc';ctx.font="9px 'Space Mono',monospace"
      ctx.fillText('tap to retry',W/2,H/2+10);ctx.textAlign='left'
    }
    if(g.won){
      ctx.fillStyle='#a8ff78';ctx.font="bold 14px 'Space Mono',monospace";ctx.textAlign='center'
      ctx.fillText(`LEVEL ${g.level} CLEAR! 🎉`,W/2,H/2-6)
      ctx.fillStyle=dk?'#5599ff':'#0033cc';ctx.font="9px 'Space Mono',monospace"
      ctx.fillText(g.level<4?'tap for next level':'ALL 4 LEVELS DONE!',W/2,H/2+10)
      ctx.textAlign='left'
    }
  },[paddleRemSec])

  const loop=useCallback(()=>{
    const g=st.current
    if(g.paused||!g.on)return
    const spd=1+(g.level-1)*.4
    const next=[]
    for(const ball of g.balls){
      let{x,y,vx,vy}=ball
      x+=vx*spd;y+=vy*spd
      if(x<=PR||x>=W-PR)vx=-vx;if(y<=PR)vy=-vy
      if(y>=H-PR-PH-6&&y<=H-4&&x>=g.px&&x<=g.px+g.pw){
        vy=-Math.abs(vy);vx+=((x-(g.px+g.pw/2))/g.pw)*2.5;vx=Math.max(-6,Math.min(6,vx))
      }
      if(y>H+PR)continue
      for(const b of g.bricks){
        if(!b.alive)continue
        if(x+PR>b.x&&x-PR<b.x+b.w&&y+PR>b.y&&y-PR<b.y+b.h){
          b.hp--;if(b.hp<=0){b.alive=false;g.score+=10*g.level;setScore(g.score)}
          const fromSide=x<b.x||x>b.x+b.w;if(fromSide)vx=-vx;else vy=-vy;break
        }
      }
      next.push({x,y,vx,vy})
    }
    g.balls=next
    if(g.balls.length===0){
      g.on=false;g.over=true;if(g.score>g.hi){g.hi=g.score;localStorage.setItem('bhi',g.score)};setPhase('over');draw();return
    }
    if(g.bricks.every(b=>!b.alive)){g.on=false;g.won=true;setPhase('won');setLevel(g.level);draw();return}
    draw();g.raf=requestAnimationFrame(loop)
  },[draw])

  const startGame=useCallback((lvl=1)=>{
    const g=st.current
    g.over=false;g.won=false;g.on=true;g.paused=false;g.level=lvl
    g.score=lvl===1?0:g.score;g.px=(W-g.pw)/2;g.bricks=mkBricks(lvl)
    const spd=3+(lvl-1)*.5
    g.balls=[{x:W/2,y:H-50,vx:spd,vy:-spd}]
    setScore(g.score);setPhase('play');setLevel(lvl)
    cancelAnimationFrame(g.raf);g.raf=requestAnimationFrame(loop)
  },[loop])

  const togglePause=useCallback(()=>{
    const g=st.current;if(!g.on&&!g.over)return
    if(g.paused){g.paused=false;setPhase('play');cancelAnimationFrame(g.raf);g.raf=requestAnimationFrame(loop)}
    else{g.paused=true;setPhase('paused');cancelAnimationFrame(g.raf);draw()}
  },[loop,draw])

  const handleClick=()=>{
    const g=st.current
    if(g.paused){togglePause();return}
    if(!g.on){if(g.won&&g.level<4)startGame(g.level+1);else startGame(1)}
  }

  // Fix 8: Slider thumb tracks finger position visually
  const [thumbPct, setThumbPct] = useState(0.5)

  const movePaddleFromClient = useCallback((clientX) => {
    const c = cv.current; if (!c) return
    const rect = c.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const g = st.current
    g.px = Math.max(0, Math.min(W - g.pw, pct * W - g.pw / 2))
    setThumbPct(pct)
  }, [])

  const movePaddleFromSlider = useCallback((clientX) => {
    const tr = trackRef.current; if (!tr) return
    const rect = tr.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const g = st.current
    g.px = Math.max(0, Math.min(W - g.pw, pct * W - g.pw / 2))
    setThumbPct(pct)
  }, [])

  useEffect(()=>{
    const c=cv.current;if(!c)return
    const mm=e=>movePaddleFromClient(e.clientX)
    const tm=e=>{e.preventDefault();movePaddleFromClient(e.touches[0].clientX)}
    c.addEventListener('mousemove',mm);c.addEventListener('touchmove',tm,{passive:false});draw()
    return()=>{cancelAnimationFrame(st.current.raf);c.removeEventListener('mousemove',mm);c.removeEventListener('touchmove',tm)}
  },[draw,movePaddleFromClient])

  return (
    <div className={s.gameWrap}>
      <canvas ref={cv} width={W} height={H} className={s.canvas} onClick={handleClick} />
      <div className={s.ctrl}>
        <button className={s.btn} onClick={handleClick}>
          {phase==='idle'?'START':phase==='over'?'RETRY':phase==='won'&&level<4?`LEVEL ${level+1}`:phase==='paused'?'▶ RESUME':'●'}
        </button>
        <button className={`${s.btn} ${s.btnPause}`} onClick={togglePause} disabled={phase==='idle'||phase==='over'}>
          {phase==='paused'?'▶':'⏸'} PAUSE
        </button>
        <span className={s.sc}>SCORE: {score} | LVL {level}/4</span>
      </div>
      {/* Fix 8: Improved slider with moving thumb */}
      <div className={s.paddleBar}>
        <span className={s.paddleLabel}>◀ drag to move paddle ▶</span>
        <div
          ref={trackRef}
          className={s.paddleTrack}
          onMouseMove={e=>movePaddleFromSlider(e.clientX)}
          onTouchMove={e=>{e.preventDefault();movePaddleFromSlider(e.touches[0].clientX)}}
          onTouchStart={e=>{e.preventDefault();movePaddleFromSlider(e.touches[0].clientX)}}
        >
          {/* Moving thumb that tracks finger position */}
          <div className={s.paddleThumb} style={{ left: `calc(${thumbPct*100}% - 30px)` }} />
        </div>
      </div>
    </div>
  )
}
