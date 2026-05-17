# 🛡️ SAHAL P T | Cybersecurity & Full-Stack Portfolio

Welcome to the source code of my personal portfolio! I am a Cybersecurity Professional and Full-Stack Web Developer based in Kerala, merging secure coding practices with modern web architecture. My primary focus is on **Vulnerability Assessment and Penetration Testing (VAPT)** and **Full-Stack Development** environments.

---

## 🚀 System Architecture

This portfolio is built from the ground up to showcase both design engineering and resilient infrastructure choices. It utilizes a hybrid, high-availability system design to ensure 100% uptime for recruiter communications:

* **Frontend UI:** Built using **React** and **Vite**, optimizing asset delivery, state management, and smooth interface animations. Hosted via edge delivery on **Vercel**.
* **Primary Backend:** Integrated with a **Node.js (Express)** server and **MongoDB** database infrastructure designed to process, sanitize, and rate-limit contact requests securely.
* **Fault-Tolerant Fallback:** Implements graceful degradation. If the primary backend is handling a cold start or experiencing latency, the frontend client seamlessly reroutes API payloads directly to **EmailJS** to guarantee immediate delivery without degrading user experience.

---

## 🛠️ Tech Stack & Arsenal

| Domain | Tools, Technologies & Frameworks |
| :--- | :--- |
| **Penetration Testing (VAPT)** | Burp Suite, Metasploit, Nmap, OWASP ZAP, Sqlmap, Nikto, Hydra, Gobuster, Nessus, Aircrack-ng, Wpscan, Cmseek, OpenVAS, John the Ripper |
| **SOC & Security Monitoring** | Splunk, ELK Stack, Wazuh, Snort, Wireshark, IDS/IPS, Next-Gen Firewalls, Logstash, Kibana, Elasticsearch |
| **Development & Scripting** | Python, JavaScript, React.js, Node.js, Django, Bash, PowerShell, HTML5, CSS3, REST APIs |
| **Infrastructure & Virtualization** | Docker, AWS, Microsoft Azure, VirtualBox, VMware, Kali Linux, Parrot OS, Ubuntu Server, Windows |
| **Frameworks & Standards** | OWASP Top 10, NIST Risk Management Framework, ISO 27001, CERT-In Guidelines, CVSS Scoring, CVE Vulnerability Tracking |

---

## 💼 Professional Experience & Training

* **Cybersecurity Intern** – *Beagle Security* (VAPT operations, security assessments)
* **Cybersecurity Student Trainee** – *Offenso Hackers Academy, Calicut* (Hands-on training in offensive security tactics)
* **B.Tech in Computer Science Engineering** (Graduated March 2025)

---

## 🔍 Security Features Implemented
* **OSINT Scrubbing:** Public-facing materials (resumes/PDFs) are audited and scrubbed of sensitive personal indicators (exact addresses, phone numbers) to prevent credential mining and targeting.
* **Environment Isolation:** Zero hardcoded secrets. All API routes and service keys are parsed securely via server-side or Vercel environment variables.
* **Sanitization Ready:** Input validation structures built to mitigate injection threats.

---

## 📫 Let's Connect

If you want to discuss security vulnerabilities, CTF challenges, or full-stack web architecture, feel free to reach out!

* **Live Portfolio:** [https://sahalthaha.vercel.app](https://sahalthaha.vercel.app)
* **LinkedIn:** https://www.linkedin.com/in/sahal-thaha/
* **Email:** 777sahal@gmail.com