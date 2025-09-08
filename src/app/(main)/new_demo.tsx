"use client";
import React, { useEffect, useRef, useState } from "react";

type Task = {
  x: number;
  y: number;
  done: boolean;
};

type Robot = {
  x: number;
  y: number;
  target: Task | null;
};

const New_Demo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [communicate, setCommunicate] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.6; // not full page, fits better

    // Setup tasks + robots
    const tasks: Task[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      done: false,
    }));

    const robots: Robot[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      target: null,
    }));

    const speed = 1.5;

    const assignTasks = () => {
      robots.forEach((r) => {
        if (!r.target || r.target.done) {
          let nearest: Task | null = null;
          let minDist = Infinity;
          tasks.forEach((t) => {
            if (!t.done) {
              const d = (r.x - t.x) ** 2 + (r.y - t.y) ** 2;
              if (d < minDist) {
                minDist = d;
                nearest = t;
              }
            }
          });
          r.target = nearest;
        }
      });
    };

    const moveRobots = () => {
      robots.forEach((r) => {
        if (r.target && !r.target.done) {
          const dx = r.target.x - r.x;
          const dy = r.target.y - r.y;
          const dist = Math.hypot(dx, dy);
          if (dist < speed) {
            r.x = r.target.x;
            r.y = r.target.y;
            r.target.done = true;
            if (!communicate) {
              // In uncoordinated mode, pretend other robots don't know yet.
              // We simulate this by re-creating their own copy of tasks.
              // But since they share memory in this toy example,
              // just don't reassign until next cycle.
            }
          } else {
            r.x += (dx / dist) * speed;
            r.y += (dy / dist) * speed;
          }
        }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw tasks
      tasks.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = t.done ? "lightgrey" : "orange";
        ctx.fill();
        ctx.stroke();
      });

      // Draw robots
      robots.forEach((r) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.stroke();

        if (r.target && !r.target.done) {
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.target.x, r.target.y);
          ctx.strokeStyle = communicate
            ? "rgba(0,200,0,0.3)"
            : "rgba(0,0,255,0.3)";
          ctx.stroke();
        }
      });

      // Labels
      ctx.fillStyle = "black";
      ctx.font = "16px sans-serif";
      ctx.fillText(
        communicate ? "Mode: Coordinated (Communication ON)" : "Mode: Uncoordinated",
        20,
        30
      );
      ctx.fillText("Click the button below to toggle coordination", 20, 55);
    };

    const step = () => {
      assignTasks();
      moveRobots();
      draw();
      requestAnimationFrame(step);
    };
    step();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [communicate]);

  return (
    <div className="w-full flex flex-col items-center">
      <canvas ref={canvasRef} className="border rounded-lg shadow-lg" />
      <button
        onClick={() => setCommunicate(!communicate)}
        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition"
      >
        Toggle Communication
      </button>
    </div>
  );
};

export default New_Demo;
