import { useState, useEffect } from 'react'
import { FS } from './fsData'
import s from './FileBrowser.module.css'

const ICONS = {
  dir: '📁', pdf: '📄', jpg: '🖼️', txt: '📝', py: '🐍', sh: '⚙️',
  md: '📋', lnk: '🔗', default: '📄'
}

const getIcon = (name, type) => {
  if (type === 'dir') return ICONS.dir
  const ext = name.split('.').pop().toLowerCase()
  return ICONS[ext] || ICONS.default
}

export default function FileBrowser({ initialPath = '/home/sahal', onOpenApp, isRoot }) {
  const [path, setPath] = useState(initialPath)
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [error, setError] = useState('')

  const resolvePath = (p, base) => {
    if (!p) return base
    if (p.startsWith('/')) return p
    return (base === '/' ? '' : base) + '/' + p
  }

  const node = FS[path]
  const children = node?.type === 'dir' ? (node.children || []) : []

  useEffect(() => {
  if (node?.restricted && !isRoot) {
    setPath('/home/sahal')
    setSelected(null)
    setPreview(null)
    }
  }, [path, isRoot])

  const showHidden = isRoot

  const visibleChildren = children.filter(c => showHidden || !c.startsWith('.'))

  const pathParts = path.split('/').filter(Boolean)

  const openItem = (name) => {
    const fullPath = path === '/' ? `/${name}` : `${path}/${name}`
    const item = FS[fullPath]
    if (!item) return
    if (item.restricted && !isRoot) {
      return
    }

    if (name.endsWith('.lnk')) {
      const appName = name.replace('.lnk', '')
      onOpenApp?.(appName)
      return
    }

    if (item.type === 'dir') {
      setPath(fullPath)
      setSelected(null)
      setPreview(null)
      return
    }

    setSelected(fullPath)
    
    // FIX: Show preview if it's a file, an image, OR a directory with explicit content
    if (item.type !== 'dir' || item.content) {
        setPreview(item)
    } else {
        setPreview(null)
    }
  }

  const goUp = () => {
    const parts = path.split('/').filter(Boolean)
    parts.pop()
    setPath(parts.length === 0 ? '/' : '/' + parts.join('/'))
    setSelected(null); setPreview(null)
  }

  const breadcrumb = ['/', ...pathParts]

  return (
    <div className={s.browser}>
      {/* Toolbar */}
      <div className={s.toolbar}>
        <button className={s.tbBtn} onClick={goUp} title="Go Up" disabled={path === '/'}>↑</button>
        <div className={s.breadcrumb}>
          {breadcrumb.map((part, i) => {
            const navPath = i === 0 ? '/' : '/' + pathParts.slice(0, i).join('/')
            return (
              <span key={i} className={s.crumb} onClick={() => { setPath(navPath); setSelected(null); setPreview(null) }}>
                {i > 0 && <span className={s.sep}>/</span>}
                {part === '/' ? '🖥 FUN-OS' : part}
              </span>
            )
          })}
        </div>
        <div className={s.viewBtns}>
          <button className={`${s.tbBtn} ${viewMode === 'grid' ? s.active : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
          <button className={`${s.tbBtn} ${viewMode === 'list' ? s.active : ''}`} onClick={() => setViewMode('list')}>☰</button>
        </div>
      </div>
      
      <div className={s.main}>
        {/* Sidebar */}
        <div className={s.sidebar}>
          <div className={s.sideSection}>PLACES</div>
          {[
            { label: '🏠 Home', path: '/home/sahal' },
            { label: '🖥 Desktop', path: '/home/sahal/Desktop' },
            { label: '📄 Documents', path: '/home/sahal/Documents' },
            { label: '🖼 Pictures', path: '/home/sahal/pictures' },
            { label: '⬇ Downloads', path: '/home/sahal/Downloads' },
            { label: '🔧 Tools', path: '/home/sahal/tools' },
          ].map(item => (
            <div key={item.path}
              className={`${s.sideItem} ${path === item.path ? s.sideActive : ''}`}
              onClick={() => {
            const target = FS[item.path]
            if (target?.restricted && !isRoot) {
              setError(`Permission denied: ${item.path}`)
              setTimeout(() => {
                setError('')
              }, 2500)
              return
            }
            setPath(item.path)
            setSelected(null)
            setPreview(null)
            }}>
              {item.label}
            </div>
          ))}
          {isRoot && (
            <>
              <div className={s.sideSection}>SYSTEM</div>
              {[
                { label: '👑 Root', path: '/root' },
                { label: '⚙ etc', path: '/etc' },
                { label: '📦 var', path: '/var' },
              ].map(item => (
                <div key={item.path}
                  className={`${s.sideItem} ${path === item.path ? s.sideActive : ''}`}
                  onClick={() => {
                    const target = FS[item.path]
                    if (target?.restricted && !isRoot) {
                      setError(`Permission denied: ${item.path}`)
                      setTimeout(() => {
                        setError('')
                      }, 2500)
                      return
                    }
                    setPath(item.path)
                    setSelected(null)
                    setPreview(null)
                  }}>
                  {item.label}
                </div>
              ))}
            </>
          )}
        </div>

        {/* File grid/list */}
        <div className={s.content}>
          {visibleChildren.length === 0 && <p className={s.empty}>This folder is empty.</p>}
          <div className={viewMode === 'grid' ? s.grid : s.list}>
            {visibleChildren.map(name => {
              const fullPath = path === '/' ? `/${name}` : `${path}/${name}`
              const item = FS[fullPath]
              if (!item) return null
              const icon = getIcon(name, item.type)
              const isSelected = selected === fullPath

              return (
                <div key={name}
                  className={`${viewMode === 'grid' ? s.gridItem : s.listItem} ${isSelected ? s.selectedItem : ''}`}
                  onClick={() => { 
                    setSelected(fullPath); 
                    // FIX: Show preview if it's a file, an image, OR a directory with explicit content
                    if (item.type !== 'dir' || item.content) {
                      setPreview(item);
                    } else {
                      setPreview(null);
                    }
                  }}
                  onDoubleClick={() => openItem(name)}>
                  <span className={s.icon}>{icon}</span>
                  <span className={s.name}>{name}</span>
                  {viewMode === 'list' && (
                    <>
                      <span className={s.type}>{item.type === 'dir' ? 'Folder' : name.split('.').pop().toUpperCase()}</span>
                      <span className={s.size}>{item.type === 'dir' ? '—' : `${(item.content?.length || 0) * 0.01 | 0} KB`}</span>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Preview panel */}
        {preview && (
          <div className={s.preview}>
            <div className={s.previewHeader}>
              <span>{selected?.split('/').pop()}</span>
              <button onClick={() => { setPreview(null); setSelected(null) }} className={s.closePreview}>✕</button>
            </div>
            
            {/* Show image if it is an image */}
            {preview.isImage && (
              <img src={preview.src} alt="preview" className={s.previewImg} />
            )}
            
            {/* FIX: Only show the text content area if the item is NOT an image */}
            {!preview.isImage && (
              <div className={s.previewContent}>
                {preview.content?.split('\n').map((l, i) => (
                  <div key={i} className={s.previewLine}>{l}</div>
                ))}
              </div>
            )}

            {preview.download && (
              <a href="/SAHAL_CYBERSECURITY.pdf" download className={s.downloadBtn}>
                ⬇ Download Resume
              </a>
            )}
            {preview.isPDF && (
              <div className={s.pdfBtns}>
                <a href="/SAHAL_SOC.pdf" download="Sahal_Soc_Resume.pdf" className={s.downloadBtn}>
                  ⬇ SOC CV
                </a>
                <a href="/SAHAL____FULL_STACK_DEVELOPER.pdf" download="Sahal_WebDev_Resume.pdf" className={s.downloadBtn}>
                  ⬇ Web Dev CV
                </a>
                <a href="/SAHAL_CYBERSECURITY.pdf" download="Sahal_VAPT_Resume.pdf" className={s.downloadBtn}>
                  ⬇ VAPT CV
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={s.statusBar}>
        {visibleChildren.length} items{selected ? ` · Selected: ${selected.split('/').pop()}` : ''}
      </div>
    </div>
  )
}