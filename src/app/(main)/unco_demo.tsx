"use client";

import React, { useRef, useEffect, useState } from 'react';

// Define types for better type safety
type Agent = {
  id: number;
  x: number;
  y: number;
  color: string;
  targetId: number | null;
  vx: number;
  vy: number;
};

type Target = {
  id: number;
  x: number;
  y: number;
  completed: boolean;
};

const NUM_AGENTS = 5;
const NUM_TARGETS = 10;
const AGENT_SPEED = 2;
const AGENT_SIZE = 10;
const TARGET_SIZE = 15;

const UncoordinatedDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [completionTimes, setCompletionTimes] = useState<number[]>([]);
  const [averageTime, setAverageTime] = useState<number | null>(null);

  const resetSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    startTimeRef.current = Date.now();
    
    const newAgents: Agent[] = [];
    for (let i = 0; i < NUM_AGENTS; i++) {
      newAgents.push({
        id: i,
        x: canvas.width / 2,
        y: canvas.height / 2,
        color: `hsl(${i * 360 / NUM_AGENTS}, 70%, 50%)`,
        targetId: null,
        vx: 0,
        vy: 0,
      });
    }
    setAgents(newAgents);

    const newTargets: Target[] = [];
    for (let i = 0; i < NUM_TARGETS; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * (canvas.width - TARGET_SIZE * 2) + TARGET_SIZE,
        y: Math.random() * (canvas.height - TARGET_SIZE * 2) + TARGET_SIZE,
        completed: false,
      });
    }
    setTargets(newTargets);
    setIsSimulationRunning(true);
    setCompletionTime(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = Math.min(window.innerHeight * 0.7, 600);
      if (agents.length === 0) {
        resetSimulation();
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!ctx || !isSimulationRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw targets
      targets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, TARGET_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = target.completed ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.7)';
        ctx.fill();
        ctx.closePath();
      });

      // Update and draw agents
      setAgents(prevAgents => {
        const newAgents = prevAgents.map(agent => {
          const target = targets.find(t => t.id === agent.targetId);

          if (!target || target.completed) {
            // Find a new target
            const availableTargets = targets.filter(t => !t.completed);
            if (availableTargets.length > 0) {
              const newTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
              agent.targetId = newTarget.id;
            } else {
              agent.targetId = null;
            }
          }

          const currentTarget = targets.find(t => t.id === agent.targetId);
          if (currentTarget) {
            const dx = currentTarget.x - agent.x;
            const dy = currentTarget.y - agent.y;
            const dist = Math.hypot(dx, dy);

            if (dist < AGENT_SIZE + TARGET_SIZE) {
              // Agent reached target, mark as completed
              setTargets(prevTargets => prevTargets.map(t =>
                t.id === currentTarget.id ? { ...t, completed: true } : t
              ));
              agent.targetId = null;
            } else {
              // Move towards target
              const velX = (dx / dist) * AGENT_SPEED;
              const velY = (dy / dist) * AGENT_SPEED;
              agent.x += velX;
              agent.y += velY;
            }
          }
          return agent;
        });

        const allCompleted = newAgents.every(agent => agent.targetId === null) && targets.every(t => t.completed);
        if (allCompleted && isSimulationRunning) {
          setIsSimulationRunning(false);
          if (startTimeRef.current) {
            const endTime = Date.now();
            const timeElapsed = (endTime - startTimeRef.current) / 1000;
            setCompletionTime(timeElapsed);
            setCompletionTimes(prevTimes => {
              const newTimes = [...prevTimes, timeElapsed];
              const total = newTimes.reduce((acc, curr) => acc + curr, 0);
              setAverageTime(total / newTimes.length);
              return newTimes;
            });
          }
        }
        return newAgents;
      });

      agents.forEach(agent => {
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, AGENT_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = agent.color;
        ctx.fill();
        ctx.closePath();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    if (isSimulationRunning) {
      animationFrameId = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [agents, targets, isSimulationRunning]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex-grow relative">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-500" style={{ opacity: isSimulationRunning ? 0 : 1 }}>
          <div className="absolute inset-0 text-white text-center rounded-2xl flex flex-col items-center justify-center">
            <p className="text-3xl font-bold mb-2">Uncoordinated Mode Complete!</p>
            <p className="text-2xl">
              Last Time: <span className="text-blue-400 font-bold">{completionTime?.toFixed(2) || '0.00'}s</span>
            </p>
            <p className="text-xl mt-2">
              Average Time: <span className="text-blue-400 font-bold">{averageTime?.toFixed(2) || '0.00'}s</span>
            </p>
            <button
              onClick={resetSimulation}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors mt-6"
            >
              Restart Simulation
            </button>
          </div>
        </div>
        
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full bg-gray-800 rounded-2xl border border-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default UncoordinatedDemo;
