import useInView from '../hooks/useInView';

/**
 * Wraps children with a scroll-triggered animation.
 *
 * Props:
 *   animation  – 'fade-up' (default) | 'fade-in' | 'fade-left' | 'fade-right' | 'zoom-in'
 *   delay      – CSS delay string, e.g. '100ms', '200ms'
 *   className  – extra classes on the wrapper
 */
const Reveal = ({ children, animation = 'fade-up', delay = '0ms', className = '' }) => {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`reveal reveal-${animation} ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? delay : '0ms' }}
    >
      {children}
    </div>
  );
};

export default Reveal;
