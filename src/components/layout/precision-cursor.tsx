"use client";

import { useEffect, useRef, useState } from "react";

export function PrecisionCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(any-pointer: fine)").matches;
    if (!hasFinePointer) return;

    setEnabled(true);
    setVisible(true);
    document.documentElement.classList.add("cursor-precision-enabled");

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let ringX = targetX;
    let ringY = targetY;

    const animate = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest(
          "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='interactive']"
        )
      );
    };

    const onMove = (event: MouseEvent) => {
      setVisible(true);
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const onOver = (event: MouseEvent) => {
      setInteractive(isInteractiveTarget(event.target));
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onWindowLeave = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        setVisible(false);
      }
    };

    rafRef.current = window.requestAnimationFrame(animate);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseout", onWindowLeave);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseout", onWindowLeave);
      document.documentElement.classList.remove("cursor-precision-enabled");
    };
  }, []);

  if (!enabled) return null;

  const ringClass = `precision-cursor-ring${visible ? " is-visible" : ""}${interactive ? " is-interactive" : ""}${pressed ? " is-pressed" : ""}`;
  const dotClass = `precision-cursor-dot${visible ? " is-visible" : ""}${pressed ? " is-pressed" : ""}`;

  return (
    <div className="precision-cursor-layer" aria-hidden="true">
      <div ref={ringRef} className={ringClass} />
      <div ref={dotRef} className={dotClass} />
    </div>
  );
}