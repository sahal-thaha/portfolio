import s from './HeroMarquee.module.css';

export default function HeroMarquee() {
  const words = [
    "OFFENSIVE SECURITY", "FULL-STACK", "VULNERABILITY ASSESSMENT", 
    "ZERO TRUST ARCHITECTURE", "PENETRATION TESTING", "SECURE CODING"
  ];

  return (
    <div className={s.marqueeContainer}>
      <div className={s.track}>
        {/* We duplicate the list twice so it loops infinitely without jumping */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className={s.textGroup}>
            {words.map((word, index) => (
              <span key={index} className={s.outlineText}>
                {word} <span className={s.separator}>//</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}