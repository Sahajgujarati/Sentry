"use client";
import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Subtle tactical scanline
    let scanY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Very subtle single vertical sweep line
      scanY += 0.4;
      if (scanY > height) scanY = 0;

      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      grad.addColorStop(0, "rgba(0, 245, 155, 0)");
      grad.addColorStop(0.5, "rgba(0, 245, 155, 0.015)");
      grad.addColorStop(1, "rgba(0, 245, 155, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 30, width, 60);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.8,
      }}
    />
  );
}
