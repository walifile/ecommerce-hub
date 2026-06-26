"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE =
  "a[href], button, [role='button'], label[for], summary, select, [data-cursor='hover']";
const TEXT_FIELDS =
  "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']";

/**
 * Minimal premium cursor: a precise brand dot + a smooth trailing ring that
 * grows over interactive elements. Theme-aware (uses --brand), respects
 * reduced-motion, fine-pointer only, and yields to the native caret in inputs.
 */
export function CursorEffects() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let visible = false;
    let hovering = false;
    let overText = false;
    let down = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      visible = true;
      const t = e.target as Element | null;
      hovering = Boolean(t?.closest?.(INTERACTIVE));
      overText = Boolean(t?.closest?.(TEXT_FIELDS));
    };
    const onDown = () => {
      down = true;
    };
    const onUp = () => {
      down = false;
    };
    const onLeave = () => {
      visible = false;
    };

    const loop = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      const targetScale = (hovering ? 1.85 : 1) * (down ? 0.82 : 1);
      scale += (targetScale - scale) * 0.2;

      const show = visible && !overText;
      dot.style.opacity = show ? "1" : "0";
      ring.style.opacity = show ? (hovering ? "1" : "0.55") : "0";
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      ring.style.backgroundColor = hovering
        ? "color-mix(in srgb, var(--brand) 14%, transparent)"
        : "transparent";

      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 size-9 rounded-full border-[1.5px] transition-[opacity,background-color] duration-200 will-change-transform"
        style={{
          opacity: 0,
          borderColor: "color-mix(in srgb, var(--brand) 65%, transparent)",
        }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 size-1.5 rounded-full transition-opacity duration-200 will-change-transform"
        style={{
          opacity: 0,
          backgroundColor: "var(--brand)",
          boxShadow: "0 0 10px color-mix(in srgb, var(--brand) 60%, transparent)",
        }}
      />
    </div>
  );
}
