// "use client";

// import React, { useRef, useEffect, useState } from 'react';

// // Define types for better type safety
// type Agent = {
//   id: number;
//   x: number;
//   y: number;
//   color: string;
//   targetId: number | null;
//   vx: number;
//   vy: number;
// };

// type Target = {
//   id: number;
//   x: number;
//   y: number;
//   completed: boolean;
// };

// const NUM_AGENTS = 5;
// const NUM_TARGETS = 10;
// const AGENT_SPEED = 2;
// const AGENT_SIZE = 10;
// const TARGET_SIZE = 15;
// const SIMULATION_DURATION = 1000; // Time in milliseconds to show completion message

// const Demo = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const startTimeRef = useRef<number | null>(null);

//   const [mode, setMode] = useState<'uncoordinated' | 'coordinated'>('uncoordinated');
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [targets, setTargets] = useState<Target[]>([]);
//   const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
//   const [completionTime, setCompletionTime] = useState<number | null>(null);

//   const resetSimulation = (currentMode: 'uncoordinated' | 'coordinated') => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     startTimeRef.current = Date.now();
//     setMode(currentMode);
    
//     const newAgents: Agent[] = [];
//     for (let i = 0; i < NUM_AGENTS; i++) {
//       newAgents.push({
//         id: i,
//         x: canvas.width / 2,
//         y: canvas.height / 2,
//         color: `hsl(${i * 360 / NUM_AGENTS}, 70%, 50%)`,
//         targetId: null,
//         vx: 0,
//         vy: 0,
//       });
//     }
//     setAgents(newAgents);

//     const newTargets: Target[] = [];
//     for (let i = 0; i < NUM_TARGETS; i++) {
//       newTargets.push({
//         id: i,
//         x: Math.random() * (canvas.width - TARGET_SIZE * 2) + TARGET_SIZE,
//         y: Math.random() * (canvas.height - TARGET_SIZE * 2) + TARGET_SIZE,
//         completed: false,
//       });
//     }
//     setTargets(newTargets);
//     setIsSimulationRunning(true);
//     setCompletionTime(null);
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // Resize canvas on initial load and window resize
//     const resizeCanvas = () => {
//       canvas.width = canvas.parentElement?.clientWidth || 800;
//       canvas.height = Math.min(window.innerHeight * 0.7, 600);
//       if (agents.length === 0) {
//         resetSimulation(mode);
//       }
//     };
//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);

//     return () => window.removeEventListener('resize', resizeCanvas);
//   }, []);

//   useEffect(() => {
//     let animationFrameId: number;
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const draw = () => {
//       if (!ctx || !isSimulationRunning) return;

//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       // Draw targets
//       targets.forEach(target => {
//         ctx.beginPath();
//         ctx.arc(target.x, target.y, TARGET_SIZE / 2, 0, Math.PI * 2);
//         ctx.fillStyle = target.completed ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.7)';
//         ctx.fill();
//         ctx.closePath();
//       });

//       // Update and draw agents
//       setAgents(prevAgents => {
//         const newAgents = prevAgents.map(agent => {
//           const target = targets.find(t => t.id === agent.targetId);

//           if (!target || target.completed) {
//             // Find a new target
//             if (mode === 'uncoordinated') {
//               const availableTargets = targets.filter(t => !t.completed);
//               if (availableTargets.length > 0) {
//                 const newTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
//                 agent.targetId = newTarget.id;
//               } else {
//                 agent.targetId = null;
//               }
//             } else { // Coordinated mode
//               // Find the closest available target that no other agent has claimed
//               const availableTargets = targets.filter(t => !t.completed);
//               let closestTarget: Target | null = null;
//               let minDist = Infinity;
              
//               availableTargets.forEach(t => {
//                 const isClaimed = prevAgents.some(a => a.id !== agent.id && a.targetId === t.id);
//                 if (!isClaimed) {
//                   const dist = Math.hypot(agent.x - t.x, agent.y - t.y);
//                   if (dist < minDist) {
//                     minDist = dist;
//                     closestTarget = t;
//                   }
//                 }
//               });

//               if (closestTarget) {
//                 agent.targetId = closestTarget.id;
//               } else {
//                 agent.targetId = null;
//               }
//             }
//           }

//           const currentTarget = targets.find(t => t.id === agent.targetId);
//           if (currentTarget) {
//             const dx = currentTarget.x - agent.x;
//             const dy = currentTarget.y - agent.y;
//             const dist = Math.hypot(dx, dy);

//             if (dist < AGENT_SIZE + TARGET_SIZE) {
//               // Agent reached target, mark as completed
//               setTargets(prevTargets => prevTargets.map(t =>
//                 t.id === currentTarget.id ? { ...t, completed: true } : t
//               ));
//               agent.targetId = null;
//             } else {
//               // Move towards target
//               const velX = (dx / dist) * AGENT_SPEED;
//               const velY = (dy / dist) * AGENT_SPEED;
//               agent.x += velX;
//               agent.y += velY;
//             }
//           }
//           return agent;
//         });

//         const allCompleted = newAgents.every(agent => agent.targetId === null) && targets.every(t => t.completed);
//         if (allCompleted && isSimulationRunning) {
//           setIsSimulationRunning(false);
//           if (startTimeRef.current) {
//             const endTime = Date.now();
//             setCompletionTime((endTime - startTimeRef.current) / 1000); // in seconds
//           }
//         }
//         return newAgents;
//       });

//       agents.forEach(agent => {
//         ctx.beginPath();
//         ctx.arc(agent.x, agent.y, AGENT_SIZE / 2, 0, Math.PI * 2);
//         ctx.fillStyle = agent.color;
//         ctx.fill();
//         ctx.closePath();
//       });

//       animationFrameId = requestAnimationFrame(draw);
//     };

//     if (isSimulationRunning) {
//       animationFrameId = requestAnimationFrame(draw);
//     }

//     return () => cancelAnimationFrame(animationFrameId);
//   }, [agents, targets, isSimulationRunning, mode]);

//   // Effect to automatically restart the simulation after a delay
//   useEffect(() => {
//     if (!isSimulationRunning && completionTime !== null) {
//       const timer = setTimeout(() => {
//         const nextMode = mode === 'uncoordinated' ? 'coordinated' : 'uncoordinated';
//         resetSimulation(nextMode);
//       }, SIMULATION_DURATION);
//       return () => clearTimeout(timer);
//     }
//   }, [isSimulationRunning, completionTime, mode]);


//   return (
//     <div className="flex flex-col items-center bg-gray-900 rounded-3xl p-8 shadow-xl space-y-4 w-full">
//       <h3 className="text-3xl font-bold mb-4 text-white">Coordinated Systems Demo</h3>
//       <div className="w-full flex-grow relative">
//         <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500" style={{ opacity: isSimulationRunning ? 0 : 1 }}>
//           <div className="absolute inset-0 bg-black bg-opacity-70 text-white text-center rounded-2xl flex flex-col items-center justify-center">
//             <p className="text-3xl font-bold mb-2">
//               {mode === 'coordinated' ? 'Coordinated' : 'Uncoordinated'} Mode Complete!
//             </p>
//             <p className="text-2xl">
//               Completion Time: <span className="text-blue-400 font-bold">{completionTime?.toFixed(2) || '0.00'}s</span>
//             </p>
//             <p className="text-xl mt-4">Communication is key to efficiency.</p>
//           </div>
//         </div>
        
//         {/* Carousel UI */}
//         <div className="relative w-full h-full">
//           <div className="flex justify-center mb-4">
//             <div className="flex w-full overflow-hidden">
//               <div className={`flex-shrink-0 w-full transition-transform duration-500`} style={{ transform: `translateX(${mode === 'uncoordinated' ? '0' : '-100'}%)` }}>
//                 <div className="bg-gray-700 text-white rounded-t-xl py-2 text-center text-lg font-semibold">
//                   Uncoordinated
//                 </div>
//               </div>
//               <div className={`flex-shrink-0 w-full transition-transform duration-500`} style={{ transform: `translateX(${mode === 'uncoordinated' ? '-100' : '0'}%)` }}>
//                 <div className="bg-blue-700 text-white rounded-t-xl py-2 text-center text-lg font-semibold">
//                   Coordinated
//                 </div>
//               </div>
//             </div>
//           </div>
//           <canvas ref={canvasRef} className="w-full h-full bg-gray-800 rounded-2xl border border-gray-700" />
//         </div>

//       </div>
//       <button
//         onClick={() => {
//           const newMode = mode === 'uncoordinated' ? 'coordinated' : 'uncoordinated';
//           resetSimulation(newMode);
//         }}
//         className={`px-8 py-3 font-semibold rounded-full transition-colors mt-4 ${
//           mode === 'uncoordinated' 
//             ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//             : 'bg-red-600 hover:bg-red-700 text-white'
//         }`}
//       >
//         Switch to {mode === 'uncoordinated' ? 'Coordinated' : 'Uncoordinated'} Mode
//       </button>
//       <div className="mt-4 text-center text-gray-400">
//         <p>
//           This demo illustrates the impact of communication. In Uncoordinated mode, agents may visit the same target, wasting effort. In Coordinated mode, they share information to assign unique targets, completing the task more efficiently.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Demo;
