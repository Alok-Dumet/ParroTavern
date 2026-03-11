import { useEffect, useRef } from 'react';
import './css/stars.css';

function setRandomPosition(star) {
  const top = Math.random() * 100;
  const left = Math.random() * 100;
  star.style.top = `${top}%`;
  star.style.left = `${left}%`;
}

export default function Stars({ count = 200, duration = 5000, color = "white"}) {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    container.innerHTML = ''; //clear existing stars

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.classList.add('star');

      const size = Math.random() * 0.6 + 0.4;
      const delay = Math.random() * duration;

      Object.assign(star.style, {
        width: `${size}rem`,
        height: `${size}rem`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        backgroundImage: `url('/images/diamond.svg')`,
        fill: "white"
      });

      // Initial position
      setRandomPosition(star);

      // Listen for the end of the twinkle animation
      star.addEventListener('animationiteration', () => {
        setRandomPosition(star);
      });

      container.appendChild(star);
    }
  }, [count, duration]);

  return <div className="stars-container" style={{backgroundColor: color}} ref={containerRef}></div>;
}
