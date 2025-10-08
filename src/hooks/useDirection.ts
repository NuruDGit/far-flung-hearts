import { useEffect, useState } from 'react';

export type Direction = 'ltr' | 'rtl';

export const useDirection = () => {
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    const htmlElement = document.documentElement;
    const currentDir = htmlElement.getAttribute('dir') as Direction || 'ltr';
    setDirection(currentDir);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          const newDir = htmlElement.getAttribute('dir') as Direction || 'ltr';
          setDirection(newDir);
        }
      });
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, []);

  const setDir = (newDirection: Direction) => {
    document.documentElement.setAttribute('dir', newDirection);
    setDirection(newDirection);
  };

  return { direction, setDirection: setDir };
};
