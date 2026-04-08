import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, isVisible].
 * Once the element enters the viewport it stays "visible" forever (no re-trigger).
 */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.unobserve(el); // fire once
      }
    }, { threshold: 0.12, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

export default useInView;
