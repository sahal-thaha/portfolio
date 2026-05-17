import { useState } from 'react'
import s from './WebBrowser.module.css'

/* ═══════════════════════════════════════════════════
   Simulated web browser for CTF Level 3
   Pages: / → robots.txt → /login → /dashboard?id=X
═══════════════════════════════════════════════════ */

const SITE_ORIGIN = 'http://10.0.0.1'

// User database for IDOR
const USERS = {
  0: { id: 0, name: 'admin',  email: 'admin@site.com',   data: 'FLAG{W3B_H4CK3R_SQL1_1D0R_CH41N}', role: 'Administrator' },
  1: { id: 1, name: 'sahal',  email: 'sahal@site.com',   data: 'Nothing interesting here.', role: 'User' },
  2: { id: 2, name: 'guest',  email: 'guest@site.com',   data: 'Just a guest account.', role: 'Guest' },
  3: { id: 3, name: 'test',   email: 'test@site.com',    data: 'Test user account.', role: 'Tester' },
  4: { id: 4, name: 'demo',   email: 'demo@site.com',    data: 'Demo account only.', role: 'Demo' },
}

function renderPage(url, loggedIn, setLoggedIn, navigate, loginError, setLoginError) {
  const path = url.replace(SITE_ORIGIN, '')
  const params = new URLSearchParams(path.includes('?') ? path.split('?')[1] : '')
  const cleanPath = path.split('?')[0]

  // HOME
  if (cleanPath === '/' || cleanPath === '') {
    return (
      <div className={s.page}>
        <div className={s.siteNav}>
          <span className={s.siteBrand}>MyPersonalSite</span>
          <div className={s.siteLinks}>
            <a onClick={()=>navigate('/')} className={s.siteLink}>Home</a>
            <a onClick={()=>navigate('/about')} className={s.siteLink}>About</a>
            <a onClick={()=>navigate('/contact')} className={s.siteLink}>Contact</a>
            {loggedIn && <a onClick={()=>navigate('/dashboard?id=1')} className={s.siteLink}>Dashboard</a>}
          </div>
        </div>
        <div className={s.siteBody}>
          <h1 className={s.siteH1}>Welcome to My Personal Site</h1>
          <p className={s.siteP}>A simple website. Nothing to see here.</p>
          <p className={s.siteP}>Built with passion. Completely secure. Definitely.</p>
          {/* Hidden comment - OSINT Level 5 keyword */}
          {/* OSINT-KEYWORD: curious_hacker */}
          <div className={s.siteCard}>
            <h2>About Me</h2>
            <p>I'm just a regular person with a regular website.</p>
          </div>
        </div>
      </div>
    )
  }

  // ABOUT
  if (cleanPath === '/about') {
    return (
      <div className={s.page}>
        <div className={s.siteNav}>
          <span className={s.siteBrand}>MyPersonalSite</span>
          <div className={s.siteLinks}>
            <a onClick={()=>navigate('/')} className={s.siteLink}>Home</a>
            <a onClick={()=>navigate('/about')} className={s.siteLink}>About</a>
            <a onClick={()=>navigate('/contact')} className={s.siteLink}>Contact</a>
          </div>
        </div>
        <div className={s.siteBody}>
          <h1 className={s.siteH1}>About This Site</h1>
          <p className={s.siteP}>A simple personal website. Nothing suspicious.</p>
          <p className={s.siteP} style={{color:'#888',fontSize:'12px'}}>
            {/* user table: id=0 admin, id=1 sahal, id=2 guest, id=3 test, id=4 demo */}
            {/* FLAG is at /dashboard?id=0 */}
          </p>
        </div>
      </div>
    )
  }

  // CONTACT
  if (cleanPath === '/contact') {
    return (
      <div className={s.page}>
        <div className={s.siteNav}>
          <span className={s.siteBrand}>MyPersonalSite</span>
          <div className={s.siteLinks}>
            <a onClick={()=>navigate('/')} className={s.siteLink}>Home</a>
            <a onClick={()=>navigate('/about')} className={s.siteLink}>About</a>
            <a onClick={()=>navigate('/contact')} className={s.siteLink}>Contact</a>
          </div>
        </div>
        <div className={s.siteBody}>
          <h1 className={s.siteH1}>Contact</h1>
          <p className={s.siteP}>Email: admin@mysite.com</p>
        </div>
      </div>
    )
  }

  // ROBOTS.TXT
  if (cleanPath === '/robots.txt') {
    return (
      <div className={s.pageRaw}>
        <pre className={s.rawContent}>{`User-agent: *
Disallow: /login
Disallow: /admin
Disallow: /backup
`}</pre>
      </div>
    )
  }

  // LOGIN
  if (cleanPath === '/login') {
    const handleLogin = (e) => {
      e.preventDefault()
      const username = e.target.username.value
      const password = e.target.password.value
      // Check for SQL injection payloads
      const sqliPayloads = ["' or 1=1--", "' or 1=1 --", "' or '1'='1", "admin'--", "1' or '1'='1", "' or 1=1#", "or 1=1--"]
      const isSqli = sqliPayloads.some(p => username.toLowerCase().includes(p.toLowerCase().trim()) || username.includes("' OR") || username.includes("' or"))
      if (isSqli || username.includes("'") && (username.includes('--') || username.includes('1=1'))) {
        setLoggedIn(true)
        setLoginError('')
        navigate('/dashboard?id=1')
      } else if (username === 'admin' && password === 'admin123') {
        setLoggedIn(true)
        setLoginError('')
        navigate('/dashboard?id=0')
      } else {
        setLoginError('Invalid credentials. Authentication failed.')
      }
    }
    return (
      <div className={s.page}>
        <div className={s.loginBox}>
          <h2 className={s.loginTitle}>🔐 Login</h2>
          <p className={s.loginSub}>Members only area</p>
          <form onSubmit={handleLogin} className={s.loginForm}>
            <label className={s.loginLabel}>Username</label>
            <input name="username" className={s.loginInput} placeholder="username" autoComplete="off"/>
            <label className={s.loginLabel}>Password</label>
            <input name="password" type="password" className={s.loginInput} placeholder="password"/>
            {loginError && <p className={s.loginErr}>{loginError}</p>}
            <button type="submit" className={s.loginBtn}>LOGIN</button>
          </form>
          {/* <p className={s.loginHint}>💡 Hint: Check what the robots.txt reveals first</p> */}
        </div>
      </div>
    )
  }

  // DASHBOARD (IDOR vulnerable)
  if (cleanPath === '/dashboard') {
    if (!loggedIn) {
      navigate('/login')
      return null
    }
    const idStr = params.get('id')
    const id = parseInt(idStr)
    const user = USERS[id]
    const isAdmin = id === 0
    return (
      <div className={s.page}>
        <div className={s.siteNav}>
          <span className={s.siteBrand}>MyPersonalSite</span>
          <div className={s.siteLinks}>
            <a onClick={()=>navigate('/')} className={s.siteLink}>Home</a>
            <a onClick={()=>navigate('/dashboard?id=1')} className={s.siteLink}>Dashboard</a>
            <a onClick={()=>{setLoggedIn(false);navigate('/')}} className={s.siteLink} style={{color:'#ff5533'}}>Logout</a>
          </div>
        </div>
        {!user ? (
          <div className={s.siteBody}>
            <div className={s.dashError}>User id={idStr} not found. Try id=0 to id=4</div>
          </div>
        ) : (
          <div className={s.siteBody}>
            <div className={s.dashCard} style={{borderColor: isAdmin ? '#ff5533' : '#5599ff'}}>
              {isAdmin && <div className={s.adminBadge}>⚠ ADMIN ACCOUNT</div>}
              <h2 className={s.dashTitle}>User Profile</h2>
              <table className={s.dashTable}>
                <tbody>
                  <tr><td className={s.dashKey}>ID</td><td className={s.dashVal}>{user.id}</td></tr>
                  <tr><td className={s.dashKey}>Name</td><td className={s.dashVal}>{user.name}</td></tr>
                  <tr><td className={s.dashKey}>Email</td><td className={s.dashVal}>{user.email}</td></tr>
                  <tr><td className={s.dashKey}>Role</td><td className={s.dashVal}>{user.role}</td></tr>
                  <tr><td className={s.dashKey}>Data</td><td className={s.dashVal} style={{color:isAdmin?'#ffd700':'inherit',fontWeight:isAdmin?'bold':'normal'}}>{user.data}</td></tr>
                </tbody>
              </table>
              {!isAdmin && (
                <p className={s.idorHint}>
                  💡 URL: <code style={{color:'#5599ff'}}>/dashboard?id={id}</code> — Think out of the box
                </p>
              )}
              {isAdmin && (
                <div className={s.flagBox}>
                  <p>🎉 You found the admin account via IDOR!</p>
                  <p>Flag: <strong style={{color:'#ffd700',letterSpacing:'1px'}}>FLAG{'W3B_H4CK3R_SQL1_1D0R_CH41N'.replace(/^/, '{').replace(/$/, '}')}</strong></p>
                  <p style={{fontSize: '13px', color: '#333'}}>Learned: IDOR (Insecure Direct Object Reference) vulnerability allows unauthorized access to resources by manipulating object references.</p>
                </div>
              )}
            </div>
            <div className={s.userList}>
              <p className={s.ulTitle}>Navigate to other users:</p>
              <div className={s.ulBtns}>
                {[1,2,3,4].map(i => (
                  <button key={i} className={`${s.ulBtn} ${i===id?s.ulBtnActive:''}`}
                    onClick={()=>navigate(`/dashboard?id=${i}`)}>id={i}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 404
  return (
    <div className={s.page}>
      <div className={s.siteBody}>
        <h1 className={s.siteH1} style={{color:'#ff5533'}}>404 — Not Found</h1>
        <p className={s.siteP}>The page <code>{cleanPath}</code> does not exist.</p>
        <button className={s.navBtn} onClick={()=>navigate('/')}>← Go Home</button>
      </div>
    </div>
  )
}

export default function WebBrowser() {
  const [url, setUrl] = useState(`${SITE_ORIGIN}/`)
  const [inputUrl, setInputUrl] = useState(`${SITE_ORIGIN}/`)
  const [history, setHistory] = useState([`${SITE_ORIGIN}/`])
  const [histIdx, setHistIdx] = useState(0)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  const navigate = (path) => {
    const full = path.startsWith('http') ? path : `${SITE_ORIGIN}${path}`
    setUrl(full)
    setInputUrl(full)
    setHistory(h => [...h.slice(0, histIdx + 1), full])
    setHistIdx(i => i + 1)
    setLoginError('')
  }

  const goBack = () => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1
      setHistIdx(newIdx)
      setUrl(history[newIdx])
      setInputUrl(history[newIdx])
    }
  }

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1
      setHistIdx(newIdx)
      setUrl(history[newIdx])
      setInputUrl(history[newIdx])
    }
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    const v = inputUrl.trim()
    if (!v.startsWith(SITE_ORIGIN) && !v.startsWith('/')) {
      // Only allow internal site
      navigate('/')
      return
    }
    navigate(v.startsWith('/') ? v : v.replace(SITE_ORIGIN, ''))
  }

  return (
    <div className={s.browser}>
      {/* Browser chrome */}
      <div className={s.toolbar}>
        <button className={s.navBtn} onClick={goBack} disabled={histIdx === 0} title="Back">◀</button>
        <button className={s.navBtn} onClick={goForward} disabled={histIdx >= history.length - 1} title="Forward">▶</button>
        <button className={s.navBtn} onClick={()=>navigate(url.replace(SITE_ORIGIN,'') || '/')} title="Refresh">↺</button>
        <form onSubmit={handleUrlSubmit} className={s.urlForm}>
          <div className={s.urlBar}>
            <span className={s.lockIcon}>{url.includes('/login') || url.includes('/dashboard') ? '🔐' : '🌐'}</span>
            <input
              className={s.urlInput}
              value={inputUrl}
              onChange={e=>setInputUrl(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </form>
        {/* <button className={s.navBtn} onClick={()=>navigate('/robots.txt')} title="robots.txt" style={{fontSize:'9px',padding:'4px 8px'}}>robots</button> */}
      </div>

      {/* Page content */}
      <div className={s.pageArea}>
        {renderPage(url, loggedIn, setLoggedIn, navigate, loginError, setLoginError)}
      </div>

      {/* Status bar */}
      <div className={s.statusBar}>
        <span>{SITE_ORIGIN}{url.replace(SITE_ORIGIN,'')}</span>
        {loggedIn && <span style={{color:'#22c55e'}}>● Logged in</span>}
        <span style={{marginLeft:'auto',color:'#4a5a4a'}}>CTF Level 3 — Web App</span>
      </div>
    </div>
  )
}
