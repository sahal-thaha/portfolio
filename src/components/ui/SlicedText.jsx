import s from './SlicedText.module.css';

export default function SlicedText() {
  // const words = ["PLAN.", "SECURE.", "CREATE.", "BUILD.", "PROTECT.", "SCALE."];
  const words = ["SECURE.", "BUILD.", "SCALE."];

  return (
    <div className={s.container}>
      {words.map((word) => (
        <div 
          key={word} 
          className={s.glitchWord} 
          data-text={word}
        >
          {word}
        </div>
      ))}
    </div>
  );
}