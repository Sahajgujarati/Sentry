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

    // Soft ambient aurora orbs — blue-indigo family only
    const orbs = [
      { x: width * 0.2,  y: height * 0.2,  r: 380, vx: 0.25,  vy: 0.18,  color: "rgba(79, 126, 248, 0.055)" },
      { x: width * 0.8,  y: height * 0.3,  r: 420, vx: -0.22, vy: 0.28,  color: "rgba(129, 140, 248, 0.045)" },
      { x: width * 0.5,  y: height * 0.78, r: 340, vx: 0.18,  vy: -0.22, color: "rgba(79, 126, 248, 0.04)" },
      { x: width * 0.12, y: height * 0.82, r: 300, vx: -0.14, vy: -0.18, color: "rgba(110, 168, 254, 0.035)" },
    ];

    // Minimal floating particles — only blue-indigo dots
    const particleCount = Math.min(28, Math.floor(width / 55));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.2 + 0.6,
      alpha: Math.random() * 0.35 + 0.2,
    }));

    // Very subtle horizontal sweep beams
    const beams = [
      { y: 0,              speed: 1.0,  height: 120, color: "rgba(79, 126, 248, 0.025)" },
      { y: height * 0.55, speed: 0.7,  height: 150, color: "rgba(129, 140, 248, 0.02)" },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Scanning sweep beams
      beams.forEach((beam) => {
        beam.y += beam.speed;
        if (beam.y > height + beam.height) beam.y = -beam.height;

        const beamGrad = ctx.createLinearGradient(0, beam.y, 0, beam.y + beam.height);
        beamGrad.addColorStop(0, "transparent");
        beamGrad.addColorStop(0.5, beam.color);
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, beam.y, width, beam.height);
      });

      // 2. Fluid aurora orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = width + orb.r;
        if (orb.x > width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = height + orb.r;
        if (orb.y > height + orb.r) orb.y = -orb.r;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Particles + constellation lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.fillStyle = `rgba(79, 126, 248, ${p1.alpha})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.strokeStyle = `rgba(79, 126, 248, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

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
        opacity: 1,
      }}
    />
  );
}
