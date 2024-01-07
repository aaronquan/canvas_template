import {useState, useEffect, useRef} from 'react';
import { Point } from '../geometry/geometry';
export const useMousePosition = () => {
  const [
    mousePosition,
    setMousePosition
  ] = useState<Point>(new Point());
  useEffect(() => {
    const updateMousePosition = (ev:any) => {
      setMousePosition(new Point(ev.clientX, ev.clientY));
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

export const useMouseRefPosition = () => {
  const mousePosition = useRef<Point>(new Point());
  useEffect(() => {
    const updateMousePosition = (ev:any) => {
      mousePosition.current = new Point(ev.clientX, ev.clientY);
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition.current;
};

export const useMouseDown = (mf:any) => {
  useEffect(() => {
      window.addEventListener('mousedown', mf);
      return () => {
      window.removeEventListener('mousedown', mf);
      };
  }, []);
}

export const useMouseMove = (mf:any) => {
  useEffect(() => {
      window.addEventListener('mousemove', mf);
      return () => {
      window.removeEventListener('mousemove', mf);
      };
  }, []);
}

export const useMouseUp = (mf:any) => {
    useEffect(() => {
        window.addEventListener('mouseup', mf);
        return () => {
        window.removeEventListener('mouseup', mf);
        };
    }, []);
}