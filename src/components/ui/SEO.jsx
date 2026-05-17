import { useEffect } from 'react'

// Dynamically update meta tags based on viewport section
export default function SEO() {
  useEffect(() => {
    // Preload critical images
    const preloadLink = document.createElement('link')
    preloadLink.rel = 'preload'
    preloadLink.as = 'image'
    preloadLink.href = '/sahal-day.jpg'
    document.head.appendChild(preloadLink)

    // Add structured data for current page view
    const addJsonLd = (data) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(data)
      script.id = 'dynamic-jsonld'
      const existing = document.getElementById('dynamic-jsonld')
      if (existing) existing.remove()
      document.head.appendChild(script)
    }

    // Track section visibility for analytics-friendly updates
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id
          const titles = {
            home: 'Sahal P T | Cybersecurity Engineer & Developer',
            about: 'About Sahal P T | Cybersecurity Expert Kerala',
            skills: 'Technical Skills | Sahal P T Portfolio',
            experience: 'Work Experience | Beagle Security & Offenso',
            projects: 'Security Projects | Sahal P T',
            lab: 'CTF Lab & Games | Sahal P T',
            contact: 'Contact Sahal P T | Collaboration & Work',
          }
          if (titles[id]) document.title = titles[id]
        }
      })
    }, { threshold: 0.5 })

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return null
}
