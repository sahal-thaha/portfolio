import { useState, useEffect, useRef, useCallback } from 'react'
import { FS, CTF_LEVELS, rot13 } from './fsData'
import s from './Terminal.module.css'

export default function Terminal({ onFlag, unlockedFlags, onOpenFiles, isRoot, onBecomeRoot }) {
  const [lines, setLines] = useState([
    { t: 'sys', v: '╔════════════════════════════════════════════════════╗' },
    { t: 'sys', v: '║        FUN-OS v1.0  ·  Cybersecurity Lab Shell     ║' },
    { t: 'sys', v: '╚════════════════════════════════════════════════════╝' },
    { t: 'sys', v: `sahal@fun-os:~$ ` },
    { t: 'out', v: 'Type `help` for commands. Type `ctf` to start challenges.' },
    { t: 'out', v: 'Try: ls, cd, cat, exiftool, steghide, find, base64, rot13...' },
    { t: 'sys', v: '' },
  ])
  const [inp, setInp] = useState('')
  const [cwd, setCwd] = useState('/home/sahal')
  const [ctfLevel, setCtfLevel] = useState(0)
  const [ctfAnswering, setCtfAnswering] = useState(false)
  const [ctfQuestIdx, setCtfQuestIdx] = useState(0)
  const [ctfAnswers, setCtfAnswers] = useState([])
  const [rootShell, setRootShell] = useState(false)
  const [hist, setHist] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [steghideState, setSteghideState] = useState(null) // waiting for password
  const [extractedFiles, setExtractedFiles] = useState({}) // files extracted by steghide/tools
  const termRef = useRef(null)
  const inpRef = useRef(null)

  const user = rootShell ? 'root' : 'sahal'
  const hostname = 'fun-os'
  const homeDir = rootShell ? '/root' : '/home/sahal'

  const add = useCallback((t, v) => setLines(l => [...l, { t, v }]), [])
  const addMulti = useCallback((t, lines_) => lines_.forEach(v => add(t, v)), [add])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  const promptStr = () => {
    const short = cwd.replace('/home/sahal', '~').replace('/root', '~')
    const symbol = rootShell ? '#' : '$'
    return `${user}@${hostname}:${short}${symbol}`
  }

  const resolvePath = (p, base) => {
    if (!p) return base
    if (p === '~' || p === '') return homeDir
    const abs = p.startsWith('/') ? p : (base === '/' ? '/' : base + '/') + p
    const parts = abs.split('/').filter(Boolean)
    const res = []
    for (const part of parts) {
      if (part === '..') res.pop()
      else if (part !== '.') res.push(part)
    }
    return '/' + res.join('/')
  }

  // Get node from FS, including dynamically extracted files
  const getNode = (path) => {
    const base = FS[path]
    // Check if this is an extracted file (e.g. flag.txt from steghide)
    if (extractedFiles[path]) {
      return FS[path] || {
        type: 'file',
        content: path.endsWith('flag.txt') && path.includes('pictures')
          ? 'You successfully extracted the hidden file!\n\nFLAG{ST3G0_M4ST3R_R0T13_PWN3D}'
          : '[extracted file]'
      }
    }
    // If the node is marked steghide and hasn't been extracted, hide it
    if (base?.steghide && !extractedFiles[path]) return null
    return base
  }

  const listDir = (path, showHidden, longFormat) => {
    const node = FS[path]  // use base FS for dir structure
    if (!node || node.type !== 'dir') return null

    // Get children, adding extracted files if applicable
    let allChildren = [...(node.children || [])]

    // Add dynamically extracted files in this directory
    Object.keys(extractedFiles).forEach(fp => {
      if (extractedFiles[fp]) {
        const parent = fp.slice(0, fp.lastIndexOf('/')) || '/'
        const name = fp.slice(fp.lastIndexOf('/') + 1)
        if (parent === path && !allChildren.includes(name)) {
          allChildren.push(name)
        }
      }
    })

    // Filter hidden files unless -a flag
    const children = allChildren.filter(c => showHidden || !c.startsWith('.'))

    if (!longFormat) {
      return [children.map(c => {
        const fp = path === '/' ? `/${c}` : `${path}/${c}`
        const n = getNode(fp)
        return n?.type === 'dir' ? `${c}/` : c
      }).join('  ')]
    }

    const rows = ['total ' + children.length * 4]
    rows.push(`drwxr-xr-x  2 ${user} ${user}  4096 May  3 10:00 .`)
    rows.push(`drwxr-xr-x  8 ${user} ${user}  4096 May  3 10:00 ..`)
    children.forEach(c => {
      const fp = path === '/' ? `/${c}` : `${path}/${c}`
      const n = getNode(fp)
      const isDir = n?.type === 'dir'
      const isHidden = c.startsWith('.')
      const isSuid = fp === '/usr/bin/find'
      const perms = isSuid ? '-rwsr-xr-x' : isDir ? 'drwxr-xr-x' : isHidden ? '-rw-------' : '-rw-r--r--'
      rows.push(`${perms}  1 ${isDir ? 'root' : user} ${user}  4096 May  3 10:00 ${c}${isDir ? '/' : ''}`)
    })
    return rows
  }

  const handleCTFAnswer = useCallback((inp_) => {
    const lvl = CTF_LEVELS[ctfLevel - 1]
    if (!lvl) { setCtfAnswering(false); return }

    const v = inp_.trim()

    // Level 5 - quiz flow
    if (lvl.id === 5) {
      const qIdx = ctfQuestIdx
      if (qIdx < lvl.questions.length) {
        const q = lvl.questions[qIdx]
        if (v.toLowerCase() === q.answer.toLowerCase()) {
          add('ok', `✓ Correct! "${q.answer}"`)
          if (qIdx === lvl.questions.length - 1) {
            add('sys', '')
            add('sys', '═══ FINAL STEP ═══')
            add('sys', lvl.finalStep)
            add('sys', 'Enter the flag you receive from Instagram DM:')
            setCtfQuestIdx(qIdx + 1)
          } else {
            add('sys', '')
            add('sys', lvl.questions[qIdx + 1].q)
            setCtfQuestIdx(qIdx + 1)
          }
        } else {
          add('err', `✗ Incorrect. Try again. Hint: ${q.hint}`)
        }
        return
      }
      if (lvl.check(v)) { flagSuccess(lvl); return }
      add('err', '✗ Incorrect flag. Check your Instagram DMs carefully.')
      return
    }

    // Regular level: check the flag
    if (lvl.check(v)) {
      flagSuccess(lvl)
    } else {
      add('err', `✗ Incorrect. That's not the right flag yet.`)
      add('sys', `Explore the filesystem and find the flag. Type it when ready.`)
      add('sys', `Type \`hint\` for a nudge, or keep exploring with ls/cat/cd.`)
    }
  }, [ctfLevel, ctfQuestIdx, add])

  const flagSuccess = (lvl) => {
    add('ok', ``)
    add('ok', `  ████ CORRECT! FLAG CAPTURED ████`)
    add('ok', `  ${lvl.flag}`)
    add('ok', ``)
    add('sys', `🏆 Power-up unlocked: ${lvl.reward.name}`)
    add('sys', `   ${lvl.reward.desc} (${lvl.reward.duration}s timer)`)
    add('sys', '')
    lvl.learning.points.forEach(p => add('learn', p))
    add('sys', '')
    onFlag(lvl.id, lvl.flag, lvl.reward)
    setCtfAnswering(false)
    if (ctfLevel < 5) {
      add('sys', `Type \`ctf\` to continue to Level ${ctfLevel + 1}.`)
      setCtfLevel(l => l + 1)
    } else {
      add('sys', '🎉 ALL 5 LEVELS COMPLETE! Elite CTF hacker confirmed.')
      setCtfLevel(0)
    }
  }

  const handleCmd = useCallback((raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    // ── PRE-PROCESS PIPED COMMANDS ──
    // Handle: echo "string" | base64 -d  OR  echo "string" | base64
    if (trimmed.includes('|')) {
      const pipeMatch = trimmed.match(/^echo\s+['"]?(.+?)['"]?\s*\|\s*(base64|tr)\s*(.*)$/)
      if (pipeMatch) {
        const inputStr = pipeMatch[1]
        const pipeCmd = pipeMatch[2]
        const pipeArgs = pipeMatch[3].trim()
        if (pipeCmd === 'base64') {
          const isDecoding = pipeArgs.includes('-d') || pipeArgs.includes('--decode')
          if (isDecoding) {
            try { add('out', atob(inputStr.trim().replace(/\s/g, ''))) }
            catch { add('err', 'base64: invalid base64 input') }
          } else {
            add('out', btoa(inputStr))
          }
        } else if (pipeCmd === 'tr') {
          // ROT13: tr 'A-Za-z' 'N-ZA-Mn-za-m'
          if (pipeArgs.includes('N-ZA-Mn-za-m')) add('out', rot13(inputStr))
          else add('out', inputStr) // generic tr
        }
        return
      }
    }

    // ── base64 -d <<< "string" ──
    if (trimmed.match(/^base64\s+-d\s+<<<\s*['"]?([A-Za-z0-9+/=]+)['"]?$/)) {
      const m = trimmed.match(/<<<\s*['"]?([A-Za-z0-9+/=]+)['"]?$/)
      if (m) {
        try { add('out', atob(m[1].trim())) }
        catch { add('err', 'base64: invalid input') }
        return
      }
    }

    // Steghide password prompt
    if (steghideState === 'waiting_password') {
      setSteghideState(null)
      const password = 'steg_master_2024'
      if (trimmed === password) {
        add('out', 'wrote extracted data to "flag.txt".')
        add('out', '')
        add('out', 'Run: cat flag.txt')
        // Dynamically add flag.txt to the live FS for this session
        setExtractedFiles(f => ({ ...f, '/home/sahal/pictures/flag.txt': true }))
      } else {
        add('err', 'steghide: could not extract any data with that passphrase!')
        add('sys', 'Hint: The password came from decoding the EXIF Comment field with ROT13')
      }
      return
    }

    // CTF answer mode — only intercept FLAG{} submissions or 'submit' command
    const parts = trimmed.match(/(?:'[^']*'|"[^"]*"|[^\s]+)/g) || []
    const cmd = parts[0]?.toLowerCase()

    // If in CTF answering mode and input looks like a flag or 'submit <flag>'
    if (ctfAnswering) {
      const isFlagSubmit = /^FLAG\{[^}]+\}$/.test(trimmed)
      const isSubmitCmd = cmd === 'submit' && parts[1]
      const isAnswer = cmd === 'answer' && parts.slice(1).length
      const isShortAnswer = ctfLevel === 5 && trimmed.length > 0 && !['ls','cd','cat','pwd','whoami','clear','help','uname','echo','base64','grep','find','history','file','strings','xxd','exiftool','steghide','rot13','python3','id','sudo','chmod','stat','head','tail','wc','tr','open','ctf','hint'].includes(cmd)

      if (isFlagSubmit) {
        handleCTFAnswer(trimmed)
        return
      }
      if (isSubmitCmd) {
        handleCTFAnswer(parts.slice(1).join(' '))
        return
      }
      if (isAnswer) {
        handleCTFAnswer(parts.slice(1).join(' '))
        return
      }
      if (isShortAnswer && ctfLevel === 5) {
        handleCTFAnswer(trimmed)
        return
      }
    }

    const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''))

    switch (cmd) {
      case 'help': {
        addMulti('sys', [
          '',
          '╔══════════════════════════════════╗',
          '║    FUN-OS Command Reference       ║',
          '╚══════════════════════════════════╝',
        ])
        addMulti('out', [
          '  FILESYSTEM:',
          '  ls [-la][-a]      list directory (use -a for hidden)',
          '  ls -la            long format with hidden files',
          '  cd <path>         change directory (~, .., /path)',
          '  cat <file>        read file (quote names with spaces)',
          '  cat \'file name\'   read file with spaces in name',
          '  pwd               print working directory',
          '  file <file>       detect file type',
          '  stat <file>       file statistics',
          '  find / -perm -4000  find SUID binaries',
          '  find / -name *.txt  find by name',
          '  head/tail <file>  first/last 10 lines',
          '  wc <file>         word/line/char count',
          '',
          '  ENCODING / DECODING:',
          '  base64 -d <<< "string"     decode base64',
          '  echo "str" | base64        encode to base64',
          '  rot13 "string"             ROT13 decode/encode',
          '  echo "str" | tr A-Za-z N-ZA-Mn-za-m  ROT13 (manual)',
          '  xxd <file>                 hex dump',
          '  strings <file>             extract printable strings',
          '',
          '  SECURITY TOOLS:',
          '  exiftool <image>           read image metadata/EXIF',
          '  steghide extract -sf <img> extract hidden data from image',
          '  grep <pattern> <file>      search text in files',
          '',
          '  SYSTEM:',
          '  id                         current user & groups',
          '  whoami                     current username',
          '  uname -a                   kernel info',
          '  sudo -l                    list sudo permissions',
          '  python3 -c "code"          run python one-liner',
          '',
          '  CTF:',
          '  ctf                        start/continue CTF',
          '  hint                       get current level hint',
          '  open .                     open file browser (GUI)',
          '  open browser               open web browser (CTF Level 3)',
          '  open <path>                open folder in Files app',
          '  clear                      clear terminal',
          '  history                    command history',
        ])
        add('sys', '')
        break
      }

      case 'clear':
        setLines([{ t: 'sys', v: 'FUN-OS v1.0 — cleared' }])
        break

      case 'pwd':
        add('out', cwd)
        break

      case 'id':
        add('out', rootShell
          ? 'uid=0(root) gid=0(root) groups=0(root)'
          : 'uid=1000(sahal) gid=1000(sahal) groups=1000(sahal),4(adm),27(sudo)')
        break

      case 'whoami':
        add('out', user)
        break

      case 'uname': {
        const flag = args[0]
        if (!flag || flag === '-a') add('out', 'Linux fun-os 5.15.0 #1 SMP FUN-OS GNU/Linux')
        else if (flag === '-r') add('out', '5.15.0-fun-os')
        else if (flag === '-m') add('out', 'x86_64')
        else if (flag === '-s') add('out', 'Linux')
        break
      }

      case 'echo':
        add('out', args.join(' '))
        break

      case 'history':
        hist.forEach((h, i) => add('out', `  ${String(i + 1).padStart(3)}  ${h}`))
        break

      case 'sudo': {
        if (args[0] === '-l') {
          add('out', 'Matching Defaults entries for sahal:')
          add('out', '    env_reset, mail_badpass')
          add('out', 'User sahal may run the following commands:')
          add('out', '    (ALL) NOPASSWD: /usr/bin/find')
          add('sys', 'Interesting! sahal can run /usr/bin/find as root without password.')
          add('sys', 'Check GTFOBins: /usr/local/tools/gtfobins.md')
        } else {
          add('err', 'sudo: password required')
        }
        break
      }

      case 'base64': {
        const joined = args.join(' ')
        const isDecoding = args.includes('-d') || args.includes('--decode')
        const match = joined.match(/<<<\s*["']?([A-Za-z0-9+/=\s]+)["']?/) ||
          joined.match(/-d\s+["']?([A-Za-z0-9+/=\s]+)["']?/)
        const isEcho = raw.includes('| base64')
        if (isEcho) {
          const toEncode = raw.split('echo')[1]?.split('|')[0]?.trim().replace(/^["']|["']$/g, '')
          if (toEncode) add('out', btoa(toEncode))
          else add('err', 'base64: no input')
          break
        }
        if (match && isDecoding) {
          try { add('out', atob(match[1].trim().replace(/\s/g, ''))) }
          catch { add('err', 'base64: invalid input') }
        } else if (args[0] && !args[0].startsWith('-')) {
          try { add('out', atob(args[0].replace(/\s/g, ''))) }
          catch { add('err', 'base64: invalid base64 input') }
        } else {
          add('err', 'Usage: base64 -d <<< "encoded_string"  OR  echo "str" | base64')
        }
        break
      }

      case 'rot13': {
        if (raw.includes('| tr') || raw.includes('|tr')) {
          const strMatch = raw.match(/echo\s+["']?(.+?)["']?\s*\|/)
          if (strMatch) add('out', rot13(strMatch[1]))
          else add('err', 'Usage: echo "string" | tr A-Za-z N-ZA-Mn-za-m')
          break
        }
        const str = args.join(' ')
        if (!str) { add('err', 'Usage: rot13 "string"'); break }
        add('out', rot13(str))
        add('sys', `Hint: ROT13 of "${str}" = ${rot13(str)}`)
        break
      }

      case 'tr': {
        // Handle piped tr for ROT13
        const strMatch = raw.match(/echo\s+["']?(.+?)["']?\s*\|/)
        if (strMatch && args.includes('A-Za-z') && args.includes('N-ZA-Mn-za-m')) {
          add('out', rot13(strMatch[1]))
        } else {
          add('err', 'tr: usage in CTF: echo "string" | tr \'A-Za-z\' \'N-ZA-Mn-za-m\'')
        }
        break
      }

      case 'xxd': {
        if (!args[0]) { add('err', 'xxd: missing file'); break }
        const target = resolvePath(args[0], cwd)
        const node = getNode(target)
        if (!node || node.type === 'dir') { add('err', `xxd: ${args[0]}: No such file`); break }
        const content = node.content || ''
        const hex = Array.from(content.slice(0, 64))
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
        add('out', `00000000: ${hex}  |${content.slice(0, 16).replace(/[^\x20-\x7e]/g, '.')}|`)
        if (content.length > 16) add('out', '...')
        break
      }

      case 'strings': {
        if (!args[0]) { add('err', 'strings: missing file'); break }
        const target = resolvePath(args[0], cwd)
        const node = getNode(target)
        if (!node) { add('err', `strings: ${args[0]}: No such file`); break }
        add('out', node.content?.match(/[\x20-\x7e]{4,}/g)?.join('\n') || '(no printable strings)')
        break
      }

      case 'exiftool': {
        if (!args[0]) { add('err', 'exiftool: missing file'); break }
        const cleanArg = args.find(a => !a.startsWith('-')) || args[0]
        const target = resolvePath(cleanArg, cwd)
        const node = getNode(target)
        if (!node) { add('err', `exiftool: File not found - ${cleanArg}`); break }
        if (!node.exif) {
          add('err', `exiftool: "${cleanArg}" is not an image or has no EXIF data`)
          break
        }
        add('sys', `ExifTool Version Number: 12.60`)
        // Show the ACTUAL filename the user typed, not the internal one
        Object.entries(node.exif).forEach(([k, v]) => {
          // Override File Name to show what user actually typed
          const displayVal = k === 'File Name' ? cleanArg : v
          add('out', `${k.padEnd(28, ' ')}: ${displayVal}`)
        })
        add('sys', '')
        add('sys', '⚠ Notice: The "Comment" field contains encoded data!')
        add('sys', `Try: rot13 "${node.exif['Comment']}"`)
        break
      }

      case 'steghide': {
        const subCmd = args[0]
        if (subCmd === 'extract' || subCmd === 'extract') {
          const sfIdx = args.indexOf('-sf')
          const imgArg = sfIdx !== -1 ? args[sfIdx + 1] : args[1]
          if (!imgArg) { add('err', 'steghide extract -sf <image.jpg>'); break }
          const target = resolvePath(imgArg, cwd)
          const node = getNode(target)
          if (!node?.exif) { add('err', `steghide: "${imgArg}" is not a supported image`); break }
          add('out', `steghide: trying to extract data from "${imgArg}"...`)
          add('out', 'Enter passphrase:')
          setSteghideState('waiting_password')
        } else if (subCmd === 'info') {
          const sfIdx = args.indexOf('-sf')
          const img = sfIdx !== -1 ? args[sfIdx + 1] : args[1]
          if (img) {
            add('out', `"${img}":\n  format: jpeg\n  capacity: 50.0 KB\nTry to get information about embedded data ? (y/n)`)
            add('sys', 'Type `steghide extract -sf ${img}` to extract.')
          }
        } else {
          add('err', 'Usage: steghide extract -sf <image.jpg>')
          add('sys', 'The passphrase comes from ROT13-decoding the EXIF Comment field.')
        }
        break
      }

      case 'file': {
        if (!args[0]) { add('err', 'file: missing operand'); break }
        const target = resolvePath(args[0], cwd)
        const node = getNode(target)
        if (!node) { add('err', `file: ${args[0]}: No such file or directory`); break }
        if (node.type === 'dir') { add('out', `${args[0]}: directory`); break }
        if (node.isImage) { add('out', `${args[0]}: JPEG image data, JFIF standard 1.01`); break }
        if (node.isPDF) { add('out', `${args[0]}: PDF document, version 1.4`); break }
        add('out', `${args[0]}: ASCII text`)
        break
      }

      case 'stat': {
        if (!args[0]) { add('err', 'stat: missing operand'); break }
        const target = resolvePath(args[0], cwd)
        const node = getNode(target)
        if (!node) { add('err', `stat: cannot stat '${args[0]}': No such file or directory`); break }
        add('out', `  File: ${args[0]}`)
        add('out', `  Size: ${node.type === 'dir' ? '4096' : (node.content?.length || 0) * 10}  Blocks: 8  IO Block: 4096`)
        add('out', `  Type: ${node.type === 'dir' ? 'directory' : 'regular file'}`)
        add('out', `Access: ${node.type === 'dir' ? 'drwxr-xr-x' : node.hidden ? '-rw-------' : '-rw-r--r--'}  Uid: (1000/sahal)`)
        add('out', `Modify: 2025-05-03 10:00:00.000000`)
        break
      }

      case 'head':
      case 'tail': {
        if (!args[0]) { add('err', `${cmd}: missing operand`); break }
        const target = resolvePath(args[0], cwd)
        const node = getNode(target)
        if (!node || node.type === 'dir') { add('err', `${cmd}: ${args[0]}: No such file`); break }
        const lns = (node.content || '').split('\n')
        const n = parseInt(args[args.indexOf('-n') + 1]) || 10
        const slice = cmd === 'head' ? lns.slice(0, n) : lns.slice(-n)
        slice.forEach(l => add('out', l))
        break
      }

      case 'wc': {
        if (!args[0]) { add('err', 'wc: missing operand'); break }
        const target = resolvePath(args[0], cwd)
        const node = getNode(target)
        if (!node || node.type === 'dir') { add('err', `wc: ${args[0]}: No such file`); break }
        const c = node.content || ''
        const lines_ = c.split('\n').length, words = c.split(/\s+/).filter(Boolean).length, chars = c.length
        add('out', `  ${lines_}  ${words}  ${chars}  ${args[0]}`)
        break
      }

      case 'python3': {
        if (!args[0]) { add('err', 'python3: interactive mode not supported. Use -c "code"'); break }
        if (args[0] === '-c') {
          const code = args.slice(1).join(' ')
          if (code.includes('os.execl') || code.includes('pty') || code.includes('shell')) {
            if (rootShell || args.some(a => a.includes('-p'))) {
              add('sys', '# root shell spawned via python3 SUID exploit')
              add('out', 'root@fun-os:/# ')
              setRootShell(true)
              onBecomeRoot?.()
              setCwd('/root')
            } else {
              add('out', 'python3: executing... (needs SUID python3 to escalate)')
              add('sys', 'Tip: /usr/bin/find has SUID. Try exploiting that instead.')
            }
          } else if (code.includes('print')) {
            add('out', '[python3]: ' + code.replace(/print\(["']?|["']?\)/g, ''))
          } else {
            add('out', '[python3]: executed')
          }
        }
        break
      }

      case 'ls': {
        const flags = args.filter(a => a.startsWith('-')).join('')
        const hasA = flags.includes('a')
        const hasL = flags.includes('l')
        const showHidden = hasA
        const longFmt = hasL
        const pathArg = args.find(a => !a.startsWith('-'))
        const target = pathArg ? resolvePath(pathArg, cwd) : cwd
        const node = getNode(target)

        if (!node) { add('err', `ls: cannot access '${target}': No such file or directory`); break }
        if (node.restricted && !rootShell) { add('err', `ls: cannot open directory '${target}': Permission denied`); break }

        const rows = listDir(target, showHidden, longFmt)
        if (!rows) { add('err', `ls: ${target}: Not a directory`); break }
        rows.forEach(r => add('out', r))
        break
      }

      case 'cd': {
        const to = args[0] || homeDir
        const target = resolvePath(to, cwd)
        const node = getNode(target)
        if (!node) { add('err', `cd: ${to}: No such file or directory`); break }
        if (node.type !== 'dir') { add('err', `cd: ${to}: Not a directory`); break }
        if (node.restricted && !rootShell) { add('err', `cd: ${to}: Permission denied`); break }
        setCwd(target)
        break
      }

      case 'cat': {
        // Handle quoted args and space-containing filenames
        const rawArgs = raw.slice(3).trim()
        let filePath
        let usedQuotes = false

        // Parse quoted or escaped filenames
        if (rawArgs.startsWith("'") && rawArgs.includes("'", 1)) {
          filePath = rawArgs.slice(1, rawArgs.indexOf("'", 1))
          usedQuotes = true
        } else if (rawArgs.startsWith('"') && rawArgs.includes('"', 1)) {
          filePath = rawArgs.slice(1, rawArgs.indexOf('"', 1))
          usedQuotes = true
        } else if (rawArgs.includes('\\ ')) {
          // Escaped space - valid
          filePath = rawArgs.replace(/\\ /g, ' ')
          usedQuotes = true
        } else {
          // NO quotes - if there's a space, shell sees multiple args
          // Simulate shell splitting: cat .level 1 → cat tries to open ".level" and "1" separately
          filePath = rawArgs
        }

        if (!filePath) { add('err', 'cat: missing operand'); break }

        // If the file has a space in name and user didn't use quotes, simulate the error
        const isSpaceName = filePath.includes(' ')
        if (isSpaceName && !usedQuotes) {
          const parts2 = rawArgs.split(' ')
          add('err', `cat: ${parts2[0]}: No such file or directory`)
          add('err', `cat: ${parts2.slice(1).join(' ')}: No such file or directory`)
          // add('sys', '💡 Tip: Filename has a space! Use quotes:  cat \'.level 1\'')
          // add('sys', '   Or escape the space:  cat .level\\ 1')
          break
        }

        let target
        if (filePath.startsWith('/')) {
          target = filePath
        } else {
          target = (cwd === '/' ? '' : cwd) + '/' + filePath
        }

        // Normalize
        const norm = target.split('/').filter(Boolean)
        const res = []
        for (const p of norm) { if (p === '..') res.pop(); else if (p !== '.') res.push(p) }
        target = '/' + res.join('/')

        const node = getNode(target)
        if (!node) { add('err', `cat: ${filePath}: No such file or directory`); break }
        if (node.type === 'dir') { add('err', `cat: ${filePath}: Is a directory`); break }
        if (node.restricted && !rootShell) { add('err', `cat: ${filePath}: Permission denied`); break }

        node.content.split('\n').forEach(line => add('out', line))

        // Special: if this is the level1 file, hint about base64
        if (target.includes('.level 1') || target.includes('level 1')) {
          add('sys', '')
          // add('sys', '📌 The content above is Base64 encoded!')
          // add('sys', `Try: base64 -d <<< "${node.content.split('\n')[0]}"`)
        }
        break
      }

      case 'find': {
        const permIdx = args.indexOf('-perm')
        const nameIdx = args.indexOf('-name')
        const typeIdx = args.indexOf('-type')
        const execIdx = args.indexOf('-exec')

        // SUID exploit simulation
        if (execIdx !== -1 && args.slice(execIdx).some(a => a.includes('sh'))) {
          add('sys', '# Executing: find . -exec /bin/sh \\; -quit')
          add('sys', '# /usr/bin/find has SUID bit — runs as root!')
          add('out', 'root@fun-os:/# ')
          add('sys', 'You are now root! Read /root/level5.txt for the flag.')
          setRootShell(true)
          onBecomeRoot?.()
          setCwd('/root')
          break
        }

        if (permIdx !== -1) {
          const perm = args[permIdx + 1]
          if (perm === '-4000' || perm === '-u=s') {
            add('out', '/usr/bin/find')
            add('out', '/usr/bin/sudo')
            add('sys', '')
            // add('sys', '⚠ Found SUID binaries! /usr/bin/find can be abused.')
            // add('sys', 'Check GTFOBins: find . -exec /bin/sh \\; -quit')
          }
          break
        }

        if (nameIdx !== -1) {
          const pattern = args[nameIdx + 1]?.replace(/\*/g, '')
          // Filter out steghide files that haven't been extracted
          const matches = Object.keys(FS).filter(k => {
            if (!k.includes(pattern)) return false
            const node = FS[k]
            if (node?.steghide && !extractedFiles[k]) return false // hide until extracted
            return true
          })
          // Add extracted files too
          const extracted = Object.keys(extractedFiles).filter(k => k.includes(pattern) && extractedFiles[k])
          const all = [...new Set([...matches, ...extracted])]
          if (all.length) all.forEach(m => add('out', m))
          else add('out', `find: no results for '${pattern}'`)
          break
        }

        // Generic find
        const searchBase = args.find(a => !a.startsWith('-')) || cwd
        const target2 = resolvePath(searchBase, cwd)
        const allPaths = [
          ...Object.keys(FS).filter(k => {
            if (!k.startsWith(target2)) return false
            const n = FS[k]
            if (n?.steghide && !extractedFiles[k]) return false
            return true
          }),
          ...Object.keys(extractedFiles).filter(k => k.startsWith(target2) && extractedFiles[k])
        ]
        ;[...new Set(allPaths)].forEach(k => add('out', k))
        break
      }

      case 'grep': {
        const pattern = args[0]
        const fileArg = args[1]
        if (!pattern) { add('err', 'grep: missing pattern'); break }
        if (fileArg) {
          const target = resolvePath(fileArg, cwd)
          const node = getNode(target)
          if (!node || node.type === 'dir') { add('err', `grep: ${fileArg}: No such file`); break }
          const matches = (node.content || '').split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase()))
          if (matches.length) matches.forEach(l => add('out', l))
          else add('out', `(no match for '${pattern}')`)
        } else {
          // Grep across FS
          Object.entries(FS).forEach(([path, node]) => {
            if (node.type === 'file' && node.content?.toLowerCase().includes(pattern.toLowerCase())) {
              add('out', `${path}: ${node.content.split('\n').find(l => l.toLowerCase().includes(pattern.toLowerCase()))}`)
            }
          })
        }
        break
      }

      case 'open': {
        const pathArg = args[0] || cwd
        // Special: open browser or web
        if (pathArg === 'browser' || pathArg === 'web' || pathArg === 'firefox' || pathArg === 'chrome') {
          add('sys', 'Opening Web Browser...')
          onOpenFiles?.('__browser__')
          break
        }
        const target = pathArg === '.' ? cwd : resolvePath(pathArg, cwd)
        onOpenFiles?.(target)
        add('sys', `Opening ${target} in Files...`)
        break
      }

      case 'chmod':
        add('err', 'chmod: Operation not permitted (need root)')
        break

      case 'ctf': {
        const startLevel = ctfLevel === 0 ? 1 : ctfLevel
        const lvl = CTF_LEVELS[startLevel - 1]
        if (!lvl) { add('sys', '✓ All CTF levels complete! All power-ups unlocked.'); break }

        if (ctfLevel === 0) setCtfLevel(1)

        add('sys', '')
        add('sys', `╔${'═'.repeat(50)}╗`)
        add('sys', `║  ${lvl.title.padEnd(48)}║`)
        add('sys', `║  Category: ${lvl.category.padEnd(37)}║`)
        add('sys', `╚${'═'.repeat(50)}╝`)
        add('sys', '')
        lvl.description.split('\n').forEach(l => add('out', l))
        add('sys', '')
        add('sys', `🎯 Objective: ${lvl.objective}`)
        add('sys', `🏆 Reward: ${lvl.reward.name}`)
        add('sys', '')
        add('sys', '📌 HOW TO SUBMIT:')
        add('sys', '   Type the flag directly:   FLAG{your_flag_here}')
        add('sys', '   Or use submit command:    submit FLAG{your_flag_here}')
        add('sys', '   Explore freely with ls, cd, cat, exiftool etc.')
        add('sys', '   Type `hint` for a clue anytime.')
        add('sys', '')

        if (lvl.id === 5) {
          add('sys', '━━━ OSINT QUESTIONS — answer each one ━━━')
          add('sys', lvl.questions[0].q)
          setCtfQuestIdx(0)
        } else if (lvl.id === 3) {
          add('sys', '🔍 Start exploring the web application...')
        } else {
          add('sys', '🔍 Start exploring the filesystem...')
        }
        setCtfAnswering(true)
        break
      }

      case 'submit':
      case 'answer': {
        const payload = args.join(' ').trim()
        if (!payload) { add('err', 'Usage: submit FLAG{...}'); break }
        if (!ctfAnswering) { add('sys', 'No active CTF challenge. Type `ctf` to start.'); break }
        handleCTFAnswer(payload)
        break
      }

      case 'hint': {
        if (!ctfAnswering || ctfLevel === 0) { add('sys', 'Start CTF with `ctf`'); break }
        const lvl = CTF_LEVELS[ctfLevel - 1]
        add('sys', `💡 Level ${ctfLevel} Hint:`)
        if (lvl.id === 1) {
          add('sys', '1. Use `ls -a` to see hidden directories')
          add('sys', '2. Spaces break arguments — use quotes: `cat \'.file abc\'`')
          add('sys', '3. base64 is a cipher that replaces letters with A-Z,a-z,0-9,+,/ and = for padding and it is commonly used to obfuscate text.')
        } else if (lvl.id === 2) {
          add('sys', '1. cd /home/sahal/pictures — there are cool pics + educational files')
          add('sys', '2. exiftool is a tool to read metadata from images')
          add('sys', '3. ROT13 is a another cipher like base64 and it is a simple letter substitution cipher that replaces each letter with the one 13 positions after it in the alphabet. It is often used to obfuscate text, especially in CTFs.')
          add('sys', '4. steghide is a tool to hide/extract data in images')
        } else if (lvl.id === 3) {
          add('sys', '1. click the browser icon or type `open browser` to see the vulnerable web app running on the system')
          add('sys', '2. Some websites hide paths from search bots — check what robots are not allowed to visit.')
          add('sys', '3. Some areas are vulnerable to SQL Injection. it is a vulnerability where user input changes how a database query works. Some requests fail to properly filter input.\n "Research how authentication bypass happens using SQL queries — you can use the external browser for reference."')
        } else if (lvl.id === 4) {
          add('sys', '1. The flag is in /root/level5.txt — but you need root access')
          add('sys', '2. "HackTools" is a browser extension that provides useful payloads, encoding helpers, request tools, and quick references commonly used during web security testing and CTF challenges.')
          add('sys', '3. Look for special permissions on files and binaries — they can be exploited to gain higher access!')
          add('sys', '4. "GTFOBins" is a curated list of Unix binaries that can be used to bypass local security restrictions in misconfigured systems. It provides various techniques to exploit these binaries for privilege escalation, file access, and more. , use "https://gtfobins.org/"')
          // add('sys', '3. The "s" in -rwsr-xr-x means SUID — runs as owner (root)!, read more about /usr/share/doc/')
          // add('sys', '4. Exploit find: `find . -exec /bin/sh \\; -quit`')
          // add('sys', '5. Then: cat /root/level5.txt')
        } else if (lvl.id === 5) {
          const q = lvl.questions[ctfQuestIdx]
          if (q) add('sys', `Hint for current question: ${q.hint}`)
        }
        break
      }

      default:
        // Handle FLAG{...} typed directly in terminal
        if (/^FLAG\{[^}]+\}$/.test(trimmed)) {
          if (ctfAnswering) {
            // In CTF answering mode - validate as answer
            handleCTFAnswer(trimmed)
          } else {
            // Outside CTF mode - check as cheat code
            const found = CTF_LEVELS.find(l => l.flag === trimmed)
            if (found && !unlockedFlags[found.id]) {
              add('ok', `✓ Flag accepted! ${found.flag}`)
              add('sys', `🏆 ${found.reward.name} unlocked! (${found.reward.duration}s)`)
              onFlag?.(found.id, found.flag, found.reward)
            } else if (found) {
              add('sys', `Power-up already unlocked: ${found.reward.name}`)
            } else {
              add('err', 'Unrecognized flag. Solve the CTF to earn valid flags.')
              add('sys', 'Type `ctf` to start a challenge.')
            }
          }
        } else if (trimmed.startsWith('echo') && trimmed.includes('| tr')) {
          const strMatch = trimmed.match(/echo\s+["']?(.+?)["']?\s*\|/)
          if (strMatch) add('out', rot13(strMatch[1]))
          else add('err', `${cmd}: command not found`)
        } else {
          add('err', `${cmd}: command not found. Type 'help' for available commands.`)
        }
    }
  }, [cwd, rootShell, ctfAnswering, ctfLevel, ctfQuestIdx, hist, add, addMulti, steghideState, onFlag, onOpenFiles, onBecomeRoot, handleCTFAnswer, unlockedFlags, extractedFiles])

  const onKey = (e) => {
    if (e.key === 'Enter') {
      const cmd = inp.trim()
      add('cmd', `${promptStr()} ${inp}`)
      if (cmd) {
        setHist(h => [cmd, ...h.slice(0, 49)])
        setHistIdx(-1)
        handleCmd(cmd)
      }
      setInp('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, hist.length - 1)
      setHistIdx(next); setInp(hist[next] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next); setInp(next === -1 ? '' : hist[next])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const parts = inp.split(' ')
      const last = parts[parts.length - 1]
      const base = last.includes('/') ? resolvePath(last.slice(0, last.lastIndexOf('/') + 1), cwd) : cwd
      const partial = last.includes('/') ? last.slice(last.lastIndexOf('/') + 1) : last
      const node = getNode(base)
      if (node?.type === 'dir') {
        const matches = (node.children || []).filter(c => c.toLowerCase().startsWith(partial.toLowerCase()))
        if (matches.length === 1) {
          parts[parts.length - 1] = (last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '') + matches[0]
          setInp(parts.join(' '))
        }
      }
    }
  }

  return (
    // FIX: Add preventScroll: true to stop the window from jumping when clicked
    <div className={s.terminal} onClick={() => inpRef.current?.focus({ preventScroll: true })}>
      <div className={s.lines} ref={termRef}>
        {lines.map((l, i) => (
          <div key={i} className={`${s.line} ${s['t_' + l.t]}`}>
            {l.t === 'cmd' ? <span>{l.v}</span> : l.v}
          </div>
        ))}
        <div className={s.inputRow}>
          <span className={s.prompt}>{promptStr()} </span>
          <input
            ref={inpRef}
            className={s.termInput}
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <span className={s.cursor} />
        </div>
      </div>
    </div>
  )
}