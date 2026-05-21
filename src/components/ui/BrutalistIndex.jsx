import { useState } from 'react';
import s from './BrutalistIndex.module.css';

export default function BrutalistIndex() {
  const [hovered, setHovered] = useState(null);

  const items = [
    { num: "01", title: "OFFENSIVE SEC", desc: "Finding the flaw before they do. Web & API Penetration Testing, SOC Monitoring, and Threat Analysis." },
    { num: "02", title: "FULL-STACK", desc: "Building the solution. React, Node.js, and modern architecture with security baked in from day one." },
    { num: "03", title: "THE LAB", desc: "Custom R&D, tool building and CTF challenge creation for the next generation of security engineers." }
  ];

  return (
    <div className={s.container}>
      {items.map((item, i) => (
        <div 
          key={i} 
          className={s.indexItem}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className={`${s.header} ${hovered === i ? s.activeHeader : ''}`}>
            <span className={s.number}>{item.num}</span>
            <span className={s.slash}>//</span>
            <span className={s.title}>{item.title}</span>
          </div>
          
          {/* Smooth CSS Grid Animation for the accordion */}
          <div className={`${s.accordionContent} ${hovered === i ? s.open : ''}`}>
            <div className={s.innerDesc}>
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}