// FUN-OS Virtual Filesystem
// Level 1: Hidden files + spaces in filenames + base64
// Level 2: EXIF metadata + ROT13 + steghide (simulated)
// Level 3: Web app - robots.txt + SQLi + IDOR
// Level 4: SUID privilege escalation
// Level 5: OSINT quiz

export const FS = {
  '/': { type: 'dir', children: ['home', 'etc', 'var', 'usr', 'root', 'bin', 'proc', 'tmp'] },

  // ── HOME ──
  '/home': { type: 'dir', children: ['sahal'] },
  '/home/sahal': { type: 'dir', children: ['Desktop', 'Documents', 'Downloads', 'pictures', 'tools', '.hidden', '.bashrc', '.profile', 'readme.txt'] },
  '/home/sahal/readme.txt': { type: 'file', content: 'Welcome to FUN-OS!\nYour home directory contains many things.\nTip: Not everything is visible by default ;)' },
  '/home/sahal/.bashrc': { type: 'file', content: '# ~/.bashrc: executed by bash for non-login shells\nexport PATH=$HOME/tools:$PATH\nexport EDITOR=nano\nalias ll="ls -la"\nalias cls="clear"' },
  '/home/sahal/.profile': { type: 'file', content: '# ~/.profile: executed by login shells\n. "$HOME/.bashrc"' },

  // ── DESKTOP ──
  '/home/sahal/Desktop': { type: 'dir', children: ['Terminal.lnk', 'Files.lnk', 'DinoGame.lnk', 'SnakeGame.lnk', 'Breakout.lnk'] },
  '/home/sahal/Desktop/Terminal.lnk': { type: 'file', content: '[Shortcut] Terminal.lnk\nPoints to: /bin/bash\nA shortcut to open the terminal.' },
  '/home/sahal/Desktop/Files.lnk': { type: 'file', content: '[Shortcut] Files.lnk\nPoints to: /home/sahal\nA shortcut to open the home directory.' },
  '/home/sahal/Desktop/DinoGame.lnk': { type: 'file', content: '[Shortcut] DinoGame.lnk\nPoints to: /games/dino\nA shortcut to play the offline dinosaur game.' },
  '/home/sahal/Desktop/SnakeGame.lnk': { type: 'file', content: '[Shortcut] SnakeGame.lnk\nPoints to: /games/snake\nA shortcut to play the classic snake game.' },
  '/home/sahal/Desktop/Breakout.lnk': { type: 'file', content: '[Shortcut] Breakout.lnk\nPoints to: /games/breakout\nA shortcut to play the classic breakout game.' },

  // ── DOCUMENTS ──
  '/home/sahal/Documents': { type: 'dir', children: ['Resume_SOC.pdf', 'Resume_WebDeveloper.pdf', 'Resume_VAPT.pdf'] },
  '/home/sahal/Documents/Resume_SOC.pdf': { type: 'file', content: '[PDF] Sahal P T — SOC Specialist Resume\nDownload: /SAHAL_SOC.pdf', download: '/SAHAL_SOC.pdf', isPDF: true },
  '/home/sahal/Documents/Resume_WebDeveloper.pdf': { type: 'file', content: '[PDF] Sahal P T — Web Developer Resume\nDownload: /SAHAL____FULL_STACK_DEVELOPER.pdf', download: '/SAHAL____FULL_STACK_DEVELOPER.pdf', isPDF: true },
  '/home/sahal/Documents/Resume_VAPT.pdf': { type: 'file', content: '[PDF] Sahal P T — VAPT Specialist Resume\nDownload: /SAHAL_CYBERSECURITY.pdf', download: '/SAHAL_CYBERSECURITY.pdf', isPDF: true },
  // '/home/sahal/Documents/notes.txt': { type: 'file', content: 'Personal notes:\n- Check the pictures folder, some interesting stuff there\n- The .hidden directory has something cool\n- Remember the SUID thing from the lecture' },

  // ── DOWNLOADS ──
  '/home/sahal/Downloads': { type: 'dir', children: ['CTF_notes.txt'] },
  '/home/sahal/Downloads/CTF_notes.txt': { type: 'file', content: 'CTF Research Notes\n==================\nWelcome to this beginner-friendly CTF environment.\nThis challenge was created to help everyone understand cybersecurity concepts in a practical and interactive way. Each level introduces a different category commonly used in real-world cybersecurity and Capture The Flag competitions.\nThis challenge environment contains multiple levels designed to test different areas of cybersecurity knowledge and practical problem-solving skills.\nLevel Structure\n---------------\nLevel 1 -> Linux Enumeration & Basic Commands\nLevel 2 -> Steganography & Digital Forensics\nLevel 3 -> Web Exploitation & Application Security\nLevel 4 -> Special Permissions & Privilege Escalation\nLevel 5 -> OSINT (Open Source Intelligence)\nWhat You Will Learn\n-------------------\n- Linux file system navigation and hidden files\n- Enumeration methodologies\n- Metadata analysis and forensic investigation\n- Steganography concepts and hidden data extraction\n- Web vulnerability discovery and exploitation\n- Misconfigurations and privilege escalation techniques\n- Open-source intelligence gathering\n- Reconnaissance and information analysis\nThroughout this CTF you will discover:\n- Useful tools\n- Helpful websites\n- Common cybersecurity techniques\n- Real-world attack concepts\n- Beginner-friendly learning paths\nThis CTF is designed for learning, exploration, and curiosity.\nRemember:\n-----------\nEnumeration is the key.\nRead carefully.\nThink logically.\nSmall details matter in CTF challenges.\n\n-----------\nYou can play the ctf by enter "ctf" in terminal and following the instructions.\nEach level has hints and learning points to guide you through the process. Don\'t worry if you get stuck — the goal is to learn and have fun exploring the world of cybersecurity!'},
  
  // ── PICTURES (Level 2 CTF) ──
  '/home/sahal/pictures': { type: 'dir', children: ['sahal-day.jpg', 'sahal-night.jpg', 'about_metadata.txt', 'what_is_exif.txt', 'steganography_intro.txt'], _steghide_extracted: false },
  '/home/sahal/pictures/sahal-day.jpg': {
    type: 'file',
    content: '[IMAGE: sahal-day.jpg]\nA Casual daytime photograph.',
    isImage: true,
    src: '/sahal-day.jpg',
    exif: {
      'File Name': 'sahal-day.jpg',
      'File Size': '2.1 MB',
      'Image Width': '2120 px',
      'Image Height': '3204 px',
      'Camera Model': 'Xiaomi 11T',
      'Date Taken': '2025:06:16 15:13:49',
      'GPS Latitude': '10.5276 N',
      'GPS Longitude': '76.2144 E',
      'Artist': 'Sahal P T',
      'Copyright': 'sahal.dev',
    }
  },
  '/home/sahal/pictures/sahal-night.jpg': {
    type: 'file',
    content: '[IMAGE: sahal-night.jpg]\nA moody night-time shot. Great atmosphere.\n\n',
    isImage: true,
    src: '/sahal-night.jpg',
    exif: {
      'File Name': 'sahal-night.jpg',
      'File Size': '3.8 MB',
      'Image Width': '2600 px',
      'Image Height': '4624 px',
      'Camera Model': 'Xiaomi 11T',
      'Date Taken': '2024:04:30 21:13:23',
      'GPS Latitude': '10.5276 N',
      'GPS Longitude': '76.2144 E',
      'Comment': "Pbzr ba, qba'g fgbc urer. Gur cnffjbeq vf: fgrt_znfgre_2024",
      'Artist': 'Sahal P T',
      'Copyright': 'sahalpt.dev',
    }
  },
  '/home/sahal/pictures/about_metadata.txt': { type: 'file', content: 'What is Metadata?\n=================\nMetadata is "data about data". It provides extra information about a file that is not directly visible.\nDigital photos and files can store:\n- Camera or device information\n- Date and time\n- GPS location\n- Author or creator details\n- Software used to edit the file\n- Hidden comments or descriptions\nWhy Metadata Matters\n====================\nMetadata is used to organize, identify, track, and verify digital files in real-world systems.\nReal-world uses of metadata include:\n- Organizing photos by date or location\n- Helping search engines and applications identify files\n- Tracking authorship and ownership of documents\n- Digital forensics and investigations\n- Security monitoring and incident analysis\n- File recovery and system management\n- OSINT and intelligence gathering\n- Verifying when and where a file was created\nIn CTFs and cybersecurity, metadata can sometimes reveal hidden clues, usernames, locations, timestamps, or other sensitive information.\nCommon Metadata Tools\n=====================\n- exiftool\n- strings\n- file\n- binwalk\n' },
  '/home/sahal/pictures/what_is_exif.txt': { type: 'file', content: 'EXIF Data (Exchangeable Image File Format)\n==========================================\nEXIF is a type of metadata stored inside image files.\nIt is mainly used by cameras and smartphones to save information about a photo.\nDifference Between Metadata and EXIF\n====================================\nMetadata is the general information about a file, while EXIF is a specific type of metadata mainly used in images and photographs.\nEXIF data can contain:\n- Camera or device model\n- Date and time the photo was taken\n- GPS coordinates or location\n- Camera settings (ISO, shutter speed, aperture)\n- Software used to edit the image\n- Hidden comments or descriptions\nWhy EXIF Data Matters\n=====================\nEXIF data is useful in digital forensics, investigations, photo management, and cybersecurity analysis.\nIn CTFs and investigations, EXIF data can sometimes reveal:\n- GPS locations\n- Device information\n- Timestamps\n- Hidden messages in comment fields\n- Sensitive information accidentally leaked by users\nCommon EXIF Tools\n=================\n- exiftool\n- strings\n- file\n- identify\n' },
  '/home/sahal/pictures/steganography_intro.txt': { type: 'file', content: 'Introduction to Steganography\n=============================\nSteganography = hiding secret data INSIDE normal files.\nDifferent from encryption: the message existence is hidden.\n\nCommon tools:\n  steghide  - hide/extract files inside JPG/BMP/WAV\n  zsteg     - detect LSB steganography in PNG\n  binwalk   - detect embedded files\n  exiftool  - inspect metadata and hidden comments\n\nUsage:\n  steghide embed -cf image.jpg -sf secret.txt\n  steghide extract -sf image.jpg\n  exiftool image.jpg\n  (will prompt for password)\n\nTip: in CTF The password often comes from another clue' },
  // Level 2 steghide-extracted file (simulated)
  '/home/sahal/pictures/flag.txt': { type: 'file', content: 'You successfully extracted the hidden file!\n\nFLAG{ST3G0_M4ST3R_R0T13_PWN3D}', hidden: true, steghide: true },

  // ── HIDDEN DIRECTORY (Level 1 CTF) ──
  '/home/sahal/.hidden': { type: 'dir', children: ['.level 1'], hidden: true },
  '/home/sahal/.hidden/.level 1': {
    type: 'file',
    content: 'RkxBR3tIMEREME5fRjFMM1NfNFJFX0MwMEx9\n',
    hidden: true,
    spaceName: true,
  },

  // ── TOOLS ──
  '/home/sahal/tools': { type: 'dir', children: ['scanner.py', 'decode.sh', 'enum.sh', 'wordlist.txt', 'about_tools.txt'] },
  '/home/sahal/tools/scanner.py': { type: 'file', content: '#!/usr/bin/env python3\n"""Web scanner tool by Sahal"""\nimport sys\n\ndef scan(target):\n    print(f"[+] Scanning {target}...")\n    print("[+] Checking common paths...")\n    paths = ["/robots.txt", "/login", "/.git", "/admin", "/backup"]\n    for p in paths:\n        print(f"  -> {target}{p}")\n\nif __name__ == "__main__":\n    t = sys.argv[1] if len(sys.argv) > 1 else "http://target.com"\n    scan(t)' },
  '/home/sahal/tools/decode.sh': { type: 'file', content: '#!/bin/bash\n# Decode helper\n# Base64: echo "encoded" | base64 -d\n# ROT13:  echo "encoded" | tr \'A-Za-z\' \'N-ZA-Mn-za-m\'\n# Hex:    echo "hex" | xxd -r -p\n# URL:    python3 -c "import urllib.parse; print(urllib.parse.unquote(\'%41%42\'))"\necho "Decode helper ready. Pass encoded string as argument."' },
  '/home/sahal/tools/enum.sh': { type: 'file', content: '#!/bin/bash\n# System enumeration script\necho "=== SUID Binaries ==="\nfind / -perm -4000 2>/dev/null\necho "\n=== Writable dirs ==="\nfind / -writable -type d 2>/dev/null | head -10\necho "\n=== Cron jobs ==="\ncrontab -l 2>/dev/null' },
  '/home/sahal/tools/wordlist.txt': { type: 'file', content: 'admin\npassword\n123456\nroot\ntest\nletmein\nqwerty\nwelcome\nmonkey\ndragon\nsecret\nsahal\nhacker\nsecurity\npentester' },
  '/home/sahal/tools/about_tools.txt': { type: 'file', content: 'Automation & Enumeration Tools\n==============================\nThis directory contains small helper scripts and tools commonly used in cybersecurity learning environments and CTF challenges.\nFiles Overview\n==============\nscanner.py\n----------\nA simple Python-based web enumeration helper.\nUsed to scan common web paths such as:\n- /robots.txt\n- /admin\n- /.git\n- /backup\nPurpose:\n- Learn basic web enumeration\n- Understand common sensitive endpoints\n- Practice automation with Python\ndecode.sh\n---------\nA helper script for decoding common encoded formats.\nSupports examples for:\n- Base64\n- ROT13\n- Hex decoding\n- URL decoding\nPurpose:\n- Learn common encoding formats used in CTFs\n- Practice basic decoding techniques\n- Understand data transformation methods\nenum.sh\n-------\nA Linux enumeration helper script.\nChecks for:\n- SUID binaries\n- Writable directories\n- Cron jobs\nPurpose:\n- Learn Linux privilege escalation basics\n- Understand system enumeration\n- Identify possible security misconfigurations\nwordlist.txt\n------------\nA small sample wordlist used for practice.\nPurpose:\n- Learn password attacks and wordlists\n- Practice brute-force concepts in safe environments\n- Understand common weak passwords\nNote\n====\nThese tools are created only for educational and study purposes inside this challenge environment.\nThey are not fully functional real-world tools.\n' },

  // ── ETC ──
  '/etc': { type: 'dir', children: ['passwd', 'shadow', 'hosts', 'fstab', 'sudoers', 'crontab'] },
  '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsahal:x:1000:1000:Sahal P T:/home/sahal:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nguest:x:1001:1001:Guest:/home/guest:/bin/sh' },
  '/etc/shadow': { type: 'file', content: 'Permission denied: /etc/shadow\n(Requires root access)' },
  '/etc/hosts': { type: 'file', content: '127.0.0.1   localhost\n127.0.1.1   fun-os\n10.0.0.1    internal.personalsite.com\n::1         localhost ip6-localhost' },
  '/etc/fstab': { type: 'file', content: '# /etc/fstab: static file system information\n/dev/sda1  /     ext4  defaults  0  1\n/dev/sda2  /home ext4  defaults  0  2\ntmpfs      /tmp  tmpfs defaults  0  0' },
  '/etc/sudoers': { type: 'file', content: 'Permission denied: /etc/sudoers' },
  '/etc/crontab': { type: 'file', content: '# /etc/crontab: system-wide crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin\n\n17 * * * * root  cd / && run-parts /etc/cron.hourly\n0 4 * * * root  backup.sh /home/sahal' },

  // ── VAR ──
  '/var': { type: 'dir', children: ['log', 'www', 'tmp'] },
  '/var/log': { type: 'dir', children: ['syslog', 'auth.log', 'access.log'] },
  '/var/log/syslog': { type: 'file', content: 'May  3 10:23:11 fun-os kernel: [    0.000000] Linux version 5.15.0\nMay  3 10:23:15 fun-os systemd[1]: Started FUN-OS.\nMay  3 10:23:20 fun-os sshd[812]: Server listening on 0.0.0.0 port 22' },
  '/var/log/auth.log': { type: 'file', content: 'May  3 10:24:01 fun-os sudo: sahal : TTY=pts/0 ; PWD=/home/sahal\nMay  3 10:24:55 fun-os login[1234]: FAILED LOGIN for root\nMay  3 10:25:10 fun-os sshd: Accepted password for sahal' },
  '/var/log/access.log': { type: 'file', content: '[INFO] GET / - 200 OK\n[INFO] GET /robots.txt - 200 OK\n[WARN] GET /login - 200 OK\n[WARN] POST /login - 200 OK \n[WARN] GET /dashboard?id=1 - 200 OK\n[INFO] GET /about - 200 OK' },
  '/var/www': { type: 'dir', children: ['html'] },
  '/var/www/html': { type: 'dir', children: ['index.html', 'robots.txt', 'login.html', 'about.html'] },
  '/var/www/html/index.html': { type: 'file', content: '<!-- Personal Site by Sahal P T -->\n<!-- OSINT-KEYWORD: curious_hacker -->\n<html><body>\n  <h1>Welcome to My Site</h1>\n  <nav>\n    <a href="/about">About</a>\n    <a href="/contact">Contact</a>\n  </nav>\n</body></html>' },
  '/var/www/html/robots.txt': { type: 'file', content: 'User-agent: *\nDisallow: /login\nDisallow: /admin\nDisallow: /backup\n\n' },
  '/var/www/html/login.html': { type: 'file', content: '\n<form action="/dashboard" method="POST">\n  <input name="username" placeholder="Username">\n  <input name="password" type="password" placeholder="Password">\n  <button>Login</button>\n</form>' },
  '/var/www/html/about.html': { type: 'file', content: '<html><body>\n  <h1>About This Site</h1>\n  <p>A simple personal site. Nothing to see here.</p>\n</body></html>' },
  '/var/tmp': { type: 'dir', children: ['session.tmp', 'about_/var/tmp'] },
  '/var/tmp/session.tmp': { type: 'file', content: 'SessionID=abc123; User=sahal; Expires=2025-06-30T23:59:59Z' },
  '/var/tmp/about_/var/tmp': { type: 'file', content: 'The /var/tmp directory is used for temporary files that need to persist across reboots. It is often world-writable, which can lead to security issues if not properly managed. Always check permissions and contents of /var/tmp when doing system enumeration!' },

  // ── USR / BIN (Level 4 SUID) ──
  '/usr': { type: 'dir', children: ['bin', 'local', 'share'] },
  '/usr/bin': { type: 'dir', children: ['find', 'python3', 'bash', 'nmap', 'curl', 'wget', 'nc', 'base64', 'xxd', 'strings', 'file', 'about_/usr/bin'] },
  '/usr/bin/find': { type: 'file', content: '[SUID BINARY] /usr/bin/find\nPermissions: -rwsr-xr-x (note the "s" = SUID bit set!)\nOwner: root\n\nThis binary runs with root privileges due to SUID.\nAbuse it to escalate: find . -exec /bin/sh \\; -quit\n\nSee: https://gtfobins.github.io/gtfobins/find/' },
  '/usr/bin/python3': { type: 'file', content: '[Binary] /usr/bin/python3\nPermissions: -rwxr-xr-x\nVersion: Python 3.11.2 - used for running Python scripts\nUsage: python3 [options] [script.py]' },
  '/usr/bin/nmap': { type: 'file', content: '[Binary] /usr/bin/nmap\nNmap 7.93 - Network exploration tool\nUsage: nmap [options] {target}' },
  '/usr/bin/curl': { type: 'file', content: '[Binary] /usr/bin/curl\ncurl 8.4.0 (x86_64-pc-linux-gnu) libcurl/8.4.0 - Used for making HTTP requests via terminal\nUsage: curl [options] [URL]' },
  '/usr/bin/wget': { type: 'file', content: '[Binary] /usr/bin/wget\nwget 1.21.2 - The non-interactive network downloader\nUsage: wget [options] [URL]' },
  '/usr/bin/nc': { type: 'file', content: '[Binary] /usr/bin/nc\nnetcat 0.7.1 - Used for network connections\nUsage: nc [<options>] [<host>] [<port>]' },
  '/usr/bin/base64': { type: 'file', content: '[Binary] /usr/bin/base64\nbase64 1.5 - Used for encoding and decoding base64 data\nUsage: base64 [options] [file]' },
  '/usr/bin/xxd': { type: 'file', content: '[Binary] /usr/bin/xxd\nxxd 1.10 - Used for creating hex dumps and reverse\nUsage: xxd [options] [infile [outfile]]' },
  '/usr/bin/strings': { type: 'file', content: '[Binary] /usr/bin/strings\nstrings 2.40 - Used for finding printable strings in binary files\nUsage: strings [options] file' },
  '/usr/bin/file': { type: 'file', content: '[Binary] /usr/bin/file\nfile 5.44 - Used for determining file type\nUsage: file [options] [file]' },
  '/usr/bin/about_/usr/bin': { type: 'file', content: 'The /usr/bin directory contains most of the user-level binaries and executables on a Linux system that means all the commands you use daily are located here. It is one of the standard directories included in the system\'s PATH environment variable, which means that any executable placed here can be run from anywhere in the terminal without specifying its full path.' },
  '/usr/local': { type: 'dir', children: ['tools'] },
  '/usr/local/tools': { type: 'dir', children: ['gtfobins.md'] },
  '/usr/local/tools/gtfobins.md': { type: 'file', content: '# GTFOBins Cheatsheet\n\nGTFOBins: https://gtfobins.github.io\n\nBinaries that can escalate privileges:\n\n## find (SUID)\n  find . -exec /bin/sh \\; -quit\n\n## python3 (SUID)\n  python3 -c \'import os; os.execl("/bin/sh", "sh", "-p")\'\n\n## vim (SUID)\n  vim -c \':!/bin/sh\'\n\n## bash (SUID)\n  bash -p\n\nMore at: https://gtfobins.github.io' },
  '/usr/share': { type: 'dir', children: ['doc'] },
  '/usr/share/doc': { type: 'dir', children: ['suid_explained.txt', 'linux_capabilities.txt'] },
  '/usr/share/doc/suid_explained.txt': { type: 'file', content: 'SUID (Set User ID) Explained\n============================\nWhen a file has SUID bit set, it executes with the\nowner\'s privileges (usually root) instead of the user\'s.\n\nSpot it: look for "s" in permissions:\n  -rwsr-xr-x  <- SUID set (lowercase s)\n  -rwSr-xr-x  <- SUID set but not executable (uppercase S)\n\nFind all SUID binaries:\n  find / -perm -4000 2>/dev/null\n  find / -perm -u=s 2>/dev/null\n\nNote: If that is misconstrued, it could be a security risk.' },
  '/usr/share/doc/linux_capabilities.txt': { type: 'file', content: 'Linux Privilege Escalation Methods\n===================================\n1. SUID Binaries     - find / -perm -4000 2>/dev/null\n2. Sudo Misconfig    - sudo -l\n3. Capabilities      - getcap -r / 2>/dev/null\n4. Cron Jobs         - cat /etc/crontab\n5. Writable /etc     - ls -la /etc/passwd\n6. PATH Hijacking    - echo $PATH\n7. Kernel Exploits   - uname -a -> searchsploit\n\nNote: GTFOBins is your best friend for SUID exploitation!' },

  // ── ROOT (Level 4 - requires privilege escalation) ──
  '/root': { type: 'dir', children: ['level5.txt', '.ssh', 'flag.txt'], restricted: true, content: 'Welcome to the root directory!\nThis is the most restricted area of the filesystem.\nOnly users with root privileges can access this directory and its contents.' },
  '/root/level5.txt': { type: 'file', content: 'Welcome to root!\n\nFLAG{SU1D_3SCAL4T10N_M4ST3R_GTF0B1NS}\n\nYou successfully escalated privileges using SUID find binary!\nMission accomplished, ethical hacker.', restricted: true },
  '/root/flag.txt': { type: 'file', content: 'FLAG{SU1D_3SCAL4T10N_M4ST3R_GTF0B1NS}', restricted: true },
  '/root/.ssh': { type: 'dir', children: ['id_rsa', 'authorized_keys'], restricted: true },
  '/root/.ssh/id_rsa': { type: 'file', content: '-----BEGIN RSA PRIVATE KEY-----\n[REDACTED - This is a simulation]\n-----END RSA PRIVATE KEY-----', restricted: true },
  '/root/.ssh/authorized_keys': { type: 'file', content: 'ssh-rsa AAAA[REDACTED] root@fun-os', restricted: true },

  // ── PROC ──
  '/proc': { type: 'dir', children: ['version', 'cpuinfo', 'meminfo', 'uptime'] },
  '/proc/version': { type: 'file', content: 'Linux version 5.15.0-fun-os (sahal@cybersecurity-researcher) #1 SMP Mon May 3 10:00:00 IST 2025' },
  '/proc/cpuinfo': { type: 'file', content: 'processor   : 0\nmodel name  : FUN-OS Virtual CPU @ 3.20GHz\ncpu cores   : 4\ncache size  : 8192 KB' },
  '/proc/meminfo': { type: 'file', content: 'MemTotal:        8388608 kB\nMemFree:         4194304 kB\nMemAvailable:    6291456 kB\nSwapTotal:       2097152 kB' },
  '/proc/uptime': { type: 'file', content: '3600.42 14200.18' },

  // ── TMP ──
  '/tmp': { type: 'dir', children: ['.session', 'cache'] },
  '/tmp/.session': { type: 'file', content: 'Session token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test\n(Nothing useful here, just a leftover file)' },
  '/tmp/cache': { type: 'dir', children: [] },
  '/bin': { type: 'dir', children: ['about_/bin', 'ls', 'cat', 'pwd', 'cd', 'echo', 'grep', 'find', 'chmod', 'chown', 'mkdir', 'rm', 'cp', 'mv', 'sh', 'bash'] },
  '/bin/about_/bin': { type: 'file', content: 'The /bin directory contains essential user command binaries that are required for the system to boot and run in single-user mode. These commands are fundamental for basic system operation and maintenance, and they are available to all users. Common commands found in /bin include ls, cat, pwd, cd, echo, grep, find, chmod, chown, mkdir, rm, cp, mv, sh, bash, and many more.' },
  '/bin/ls': { type: 'file', content: '[Binary] /bin/ls\nls 8.32 - List directory contents\nUsage: ls [options] [file...]' },
  '/bin/cat': { type: 'file', content: '[Binary] /bin/cat\ncat 8.32 - Concatenate and display file contents in a terminal\nUsage: cat [options] [file...]' },
  '/bin/pwd': { type: 'file', content: '[Binary] /bin/pwd\npwd 8.32 - Print working directory\nUsage: pwd [options]' },
  '/bin/cd': { type: 'file', content: '[Built-in] cd - Change the shell working directory\nUsage: cd [directory]' },
  '/bin/echo': { type: 'file', content: '[Binary] /bin/echo\necho 8.32 - Display a line of text\nUsage: echo [options] [string...]' },
  '/bin/grep': { type: 'file', content: '[Binary] /bin/grep\ngrep 3.7 - Search for patterns in files\nUsage: grep [options] pattern [file...]' },
  '/bin/find': { type: 'file', content: '[Binary] /bin/find\nfind 8.32 - Search for files in a directory hierarchy\nUsage: find [path...] [options] [expression]' },
  '/bin/chmod': { type: 'file', content: '[Binary] /bin/chmod\nchmod 8.32 - Change file modes or Access Control Lists\nUsage: chmod [options] mode file...' },
  '/bin/chown': { type: 'file', content: '[Binary] /bin/chown\nchown 8.32 - Change file owner and group\nUsage: chown [options] owner[:group] file...' },
  '/bin/mkdir': { type: 'file', content: '[Binary] /bin/mkdir\nmkdir 8.32 - Make directories\nUsage: mkdir [options] directory...' },
  '/bin/rm': { type: 'file', content: '[Binary] /bin/rm\nrm 8.32 - Remove files or directories\nUsage: rm [options] file...' },
  '/bin/cp': { type: 'file', content: '[Binary] /bin/cp\ncp 8.32 - Copy files and directories\nUsage: cp [options] source destination' },
  '/bin/mv': { type: 'file', content: '[Binary] /bin/mv\nmv 8.32 - Move (rename) files\nUsage: mv [options] source destination' },
  '/bin/sh': { type: 'file', content: '[Binary] /bin/sh\nsh 8.32 - The Bourne shell\nUsage: sh [options]' },
  '/bin/bash': { type: 'file', content: '[Binary] /bin/bash\nbash 5.1 - GNU Bourne Again SHell\nUsage: bash [options]' }
}

// CTF Level definitions
export const CTF_LEVELS = [
  {
    id: 1,
    title: 'Level 1 — Hidden in Plain Sight',
    category: 'Linux Basics',
    color: '#22c55e',
    description: 'Every Linux filesystem has secrets. Not everything is visible with a plain `ls`. Explore the home directory carefully — some files hide themselves from casual observers.\n\nYour goal: Find the hidden directory, navigate the tricky filename, decode the contents, and submit the flag.',
    objective: 'Find and decode the flag hidden in /home/sahal',
    flag: 'FLAG{H0DD0N_F1L3S_4RE_C00L}',
    base64flag: 'RkxBR3tIMEREME5fRjFMM1NfNFJFX0MwMEx9',
    reward: { id: 1, name: '🔥 DINO FIRE POWER', desc: 'Shoot fire! Press F to use (5 shots)', duration: 0 },
    check: v => v.trim() === 'FLAG{H0DD0N_F1L3S_4RE_C00L}' || v.trim() === 'FLAG{H0DD3N_F1L3S_4RE_CO0L}',
    learning: {
      title: 'What you learned:',
      points: [
        '🔍 Hidden files: In Linux, files/dirs starting with "." are hidden. Use `ls -a` to see them.',
        '📂 ls -la: Shows ALL files including hidden ones, with full permissions and details.',
        '⚠️ Spaces in filenames: `cat .level 1` fails — shell sees two args. Use quotes: `cat \'.level 1\'` or escape: `cat .level\\ 1`',
        '🔐 Base64: A binary-to-text encoding. Used in CTFs to obfuscate flags. Decode with: `base64 -d <<< "string"`',
        '💡 Real-world: Attackers hide malware and scripts in dotfiles/directories to avoid detection.',
      ]
    }
  },
  {
    id: 2,
    title: 'Level 2 — The Image Speaks',
    category: 'Metadata + Steganography',
    color: '#38bdf8',
    description: 'A picture is worth a thousand words — but sometimes it hides more than it shows. Head to the pictures folder. There are some interesting photos and educational files about metadata.\n\nRemember: digital images carry hidden information. The right tools will reveal what the eye cannot see.',
    objective: 'Inspect image metadata, decode the hidden clue, extract the flag',
    flag: 'FLAG{ST3G0_M4ST3R_R0T13_PWN3D}',
    reward: { id: 2, name: '🐍 SNAKE SHIELD', desc: 'Pass through walls once!', duration: 0 },
    check: v => v.trim() === 'FLAG{ST3G0_M4ST3R_R0T13_PWN3D}',
    rot13password: 'steg_master_2024',
    learning: {
      title: 'What you learned:',
      points: [
        '📷 EXIF Metadata: Images store camera model, GPS, date, and custom fields like "Comment". Use `exiftool image.jpg`. read more about metadata and exifdata in /home/sahal/pictures',
        '🔄 ROT13: Each letter shifted 13 places. "Hello" → "Uryyb". Decode: `echo "string" | tr \'A-Za-z\' \'N-ZA-Mn-za-m\'`',
        '🖼️ Steganography: Hiding data INSIDE normal files. `steghide extract -sf image.jpg` extracts hidden content & `steghide embed -sf image.jpg -ef flag.txt` to hide data. read more about steganography in /home/sahal/pictures',
        '🔑 Chaining: CTF challenges often require chaining: find clue → decode → use as password → extract → flag.',
        '⚠️ Real-world: Metadata leaks GPS location, device info & private data. Attackers use steganography to exfiltrate data.',
        '🛠️ Tools-learned: exiftool, tr (for ROT13), steghide',
      ]
    }
  },
  {
    id: 3,
    title: 'Level 3 — The Broken Portal',
    category: 'Broken Logic + Hidden Access',
    color: '#f59e0b',
    description: 'A web application is running on the server. It looks innocent — just a simple personal site. But web apps often hide vulnerabilities behind their polished interface.\n\nStart your reconnaissance. Check what the site doesn\'t want crawlers to see. Then dig deeper.',
    objective: 'Discover hidden paths, bypass authentication, access restricted data',
    flag: 'FLAG{W3B_H4CK3R_SQL1_1D0R_CH41N}',
    reward: { id: 3, name: '⚽ BREAKOUT LONG PADDLE', desc: 'Wider paddle (2 min)', duration: 120 },
    check: v => v.trim() === 'FLAG{W3B_H4CK3R_SQL1_1D0R_CH41N}',
    learning: {
      title: 'What you learned:',
      points: [
        '🤖 robots.txt: Websites use this file to tell search engines which pages or folders should not appear in search results. When an endpoint is placed inside robots.txt, crawlers usually avoid indexing it — but anyone can still view the file and discover those hidden paths.',
        '💉 SQL Injection: Injecting SQL code into login forms. `\' OR 1=1 --` makes the condition always true, bypassing auth.',
        '🚪 IDOR (Insecure Direct Object Reference): Changing `?id=1` to `?id=0` accesses another user\'s data — broken access control.',
        '🔗 Vulnerability Chaining: Real attacks chain multiple vulns: recon → injection → privilege access.',
        '🛡️ Fix: Use parameterized queries (prepared statements) and server-side authorization checks on every request.',
        '⚠️ Real-world: Web vulnerabilities are the most common attack vector. Attackers exploit them to steal data, deface sites, or gain server access.',
        '🧰 sqlmap is a tool used to automate SQL injection attacks, making it easier to find and exploit SQL vulnerabilities in web applications.',
        '🛠️ Tools-learned: sqlmap (for SQLi automation), IDOR',
      ]
    }
  },
  {
    id: 4,
    title: 'Level 4 — Privilege Escalation',
    category: 'Misconfiguration + Linux Privesc',
    color: '#f43f5e',
    description: 'You have a low-privilege shell as user "sahal". The flag is in /root/level5.txt — but you don\'t have permission to read it.\n\nTime to escalate. Enumerate the system. Find what\'s misconfigured. Become root.\n\nHint: Look for files with special permissions. The "s" in permissions means something powerful.',
    objective: 'Escalate privileges to root and read /root/level5.txt',
    flag: 'FLAG{SU1D_3SCAL4T10N_M4ST3R_GTF0B1NS}',
    reward: { id: 4, name: '👻 DINO INVISIBILITY', desc: 'Ghost mode! (2 min)', duration: 120 },
    check: v => v.trim() === 'FLAG{SU1D_3SCAL4T10N_M4ST3R_GTF0B1NS}',
    learning: {
      title: 'What you learned:',
      points: [
        '🔑 SUID Bit: "s" in `-rwsr-xr-x` means the file runs as its owner (root). Find them: `find / -perm -4000 2>/dev/null`',
        '📈 Privilege Escalation: Going from low-privilege user to root/admin. Core concept in pentesting.',
        '⚔️ GTFOBins: https://gtfobins.org/ — database of Unix binaries that can bypass restrictions.',
        '🔧 find SUID exploit: `find . -exec /bin/sh \\; -quit` — spawns root shell because find has SUID.',
        '⚔️ "HackTools" is a browser extension that provides useful payloads, encoding helpers, request tools, and quick references commonly used during web security testing and CTF challenges.',
        '🌍 Real-world: Privesc is used in post-exploitation. After gaining initial access, attackers escalate to full control.',
        '🛡️ Similar techniques: sudo misconfigurations (`sudo -l`), capabilities (`getcap`), writable cron jobs. can find more in hacktools',
        '🛠️ Tools-learned: find (for SUID enumeration), GTFOBins (for SUID exploitation), HackTools extension (for payloads and references)',
      ]
    }
  },
  {
    id: 5,
    title: 'Level 5 — OSINT Investigation',
    category: 'Open Source Intelligence',
    color: '#a78bfa',
    description: 'The final challenge. No files to read, no code to exploit. This is pure intelligence gathering — OSINT.\n\nYou need to find real information about the target (me!) using publicly available sources. Investigate social media, portfolio, GitHub, and more.\n\nThis is how real threat actors profile their targets. Learn it to defend against it.',
    objective: 'Answer all 4 questions using OSINT, then complete the final step',
    flag: 'FLAG{0S1NT_M4ST3R_PR0F1L3R}',
    reward: { id: 5, name: '❤ SNAKE EXTRA LIFE', desc: 'One extra life in Snake!', duration: 0 },
    check: v => v.trim() === 'FLAG{0S1NT_M4ST3R_PR0F1L3R}',
    questions: [
      { q: 'Q1: What username does Sahal use across ALL social media platforms?', answer: 'sahal_thaha', hint: 'Check the social media of the target' },
      { q: 'Q2: Find the hidden keyword in the portfolio HTML source. What is it?', answer: 'curious_hacker', hint: 'Somewhere in the files' },
      { q: 'Q3: What year was Sahal born?', answer: '2003', hint: 'Check the social media of the target' },
      { q: 'Q4: How many participants were in the first CTF Sahal created?', answer: '80', hint: 'Check the social media of the target, Every word, link, and timestamp on their first post holds weight. Miss nothing.' },
    ],
    finalStep: 'All correct! Now send the word "CTF_MASTER_2026" to Sahal\'s Instagram DM (@sahal_thaha) and you\'ll receive the final flag in return. After receiving it, enter it below.',
    learning: {
      title: 'What you learned:',
      points: [
        '🔍 OSINT: Open Source Intelligence — gathering info from publicly available sources without direct access.',
        '🌐 Digital Footprint: Everything you post online is part of your digital footprint — emails, usernames, photos, posts.',
        '🔗 Cross-Platform Correlation: Same username across platforms links all your activity. Use unique usernames!',
        '👁️ Google Dorking: `site:github.com "sahal"`, `"sahal_thaha" site:linkedin.com` — powerful search operators.',
        '⚠️ Real-world Risk: Attackers use OSINT for phishing, social engineering, and targeted attacks.',
        '🛡️ Protect yourself: Privacy settings, unique usernames, minimal public info, separate work/personal accounts.',
        '\n',
        'FOLLOW ME OR CONNECT ON SOCIAL MEDIA FOR MORE CYBERSECURITY CONTENT OR COLLABORATION:\n\nInstagram: @sahal_thaha\nLinkedIn: Sahal P T\nGitHub: sahal-thaha\nTwitter: @sahal_thaha\n\nLet\'s connect and learn together!',
      ]
    }
  }
]

// ROT13 decoder (for level 2)
export const rot13 = str => str.replace(/[A-Za-z]/g, c => 
  String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))
)
