import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Heading,
  Text,
  Button,
  Column,
  Row,  
  Card,
  Badge,
  Logo,
  LetterFx,
  Avatar,
  useTheme,
  RevealFx,  
  Media,
  Icon,
  Scroller,
  Line,  
  Carousel,
  TiltFx,
  Flex
} from "@once-ui-system/core";

const GRID_SIZE = 40;
const CELL_SIZE = 15;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE + 120; // Extra space for metrics
const MOVE_DELAY = 1;
const DISCOVERY_PAUSE = 1;

interface Car {
  id: number;
  x: number;
  y: number;
  goalX: number;
  goalY: number;
  color: string;
  knownObstacles: Set<string>;
  path: [number, number][];
  visitedStack: [number, number][];
  stepCooldown: number;
  pauseTicks: number;
  trail: [number, number][];
}

interface Metrics {
  totalSteps: number;
  discoveries: number;
  redundantDiscoveries: number;
  startTime: number;
  endTime: number;
}

type Mode = 'uncoordinated' | 'coordinated';

export default function BlockedRoadLab_Claude() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const frameRef = useRef(0);
  const gridRef = useRef<boolean[][]>([]);
  const carsRef = useRef<Car[]>([]);
  const globalKnowledgeRef = useRef<Set<string>>(new Set());
  const metricsRef = useRef<Metrics>({
    totalSteps: 0,
    discoveries: 0,
    redundantDiscoveries: 0,
    startTime: 0,
    endTime: 0
  });
  
  const [mode, setMode] = useState<Mode>('uncoordinated');
  const [isRunning, setIsRunning] = useState(false);
  const [displayMetrics, setDisplayMetrics] = useState<Metrics>({
    totalSteps: 0,
    discoveries: 0,
    redundantDiscoveries: 0,
    startTime: 0,
    endTime: 0
  });

  // State to store default grid and car positions
  const [defaultGrid, setDefaultGrid] = useState<boolean[][] | null>(null);
  const [defaultCars, setDefaultCars] = useState<Car[] | null>(null);
  // State to lock the current layout
  const [lockLayout, setLockLayout] = useState(false);
  // State to store locked grid and cars
  const [lockedGrid, setLockedGrid] = useState<boolean[][] | null>(null);
  const [lockedCars, setLockedCars] = useState<Car[] | null>(null);

  // Utility functions
  const key = (x: number, y: number): string => `${x},${y}`;
  
  const inBounds = (x: number, y: number): boolean => 
    x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

  // Helper to get the sign of a number
  const sign = (n: number): number => (n > 0 ? 1 : n < 0 ? -1 : 0);

  // Helper to get a random empty cell (never on an obstacle)
  const getRandomEmptyCell = (occupied: Set<string>, grid: boolean[][]): [number, number] => {
    let x = 0, y = 0, tries = 0;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
      tries++;
      if (tries > 2000) throw new Error('Could not find empty cell');
    } while (grid[y][x] || occupied.has(key(x, y)));
    return [x, y];
  };

  // Helper to check if a cell is adjacent (including diagonally) to any obstacle
  const isAdjacentToObstacle = (x: number, y: number, grid: boolean[][]): boolean => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (inBounds(nx, ny) && grid[ny][nx]) return true;
      }
    }
    return false;
  };

  // Helper to check if a shape can be placed at a position without touching other obstacles
  const canPlaceShape = (cells: [number, number][], grid: boolean[][]): boolean => {
    for (const [x, y] of cells) {
      if (!inBounds(x, y)) return false;
      if (grid[y][x] || isAdjacentToObstacle(x, y, grid)) return false;
    }
    return true;
  };

  // Helper to place a shape on the grid
  const placeShape = (cells: [number, number][], grid: boolean[][]) => {
    for (const [x, y] of cells) {
      grid[y][x] = true;
    }
  };

  // Helper to generate obstacle shapes
  const generateShapes = (grid: boolean[][]) => {
    const shapes: ((grid: boolean[][]) => void)[] = [];
    // Horizontal wall (x3)
    for (let h = 0; h < 3; h++) {
      shapes.push((grid) => {
        for (let tries = 0; tries < 50; tries++) {
          const len = 8 + Math.floor(Math.random() * 8);
          const y = Math.floor(Math.random() * GRID_SIZE);
          const x = Math.floor(Math.random() * (GRID_SIZE - len));
          const cells = Array.from({length: len}, (_, i) => [x + i, y] as [number, number]);
          if (canPlaceShape(cells, grid)) { placeShape(cells, grid); break; }
        }
      });
    }
    // Vertical wall (x3)
    for (let v = 0; v < 3; v++) {
      shapes.push((grid) => {
        for (let tries = 0; tries < 50; tries++) {
          const len = 8 + Math.floor(Math.random() * 8);
          const x = Math.floor(Math.random() * GRID_SIZE);
          const y = Math.floor(Math.random() * (GRID_SIZE - len));
          const cells = Array.from({length: len}, (_, i) => [x, y + i] as [number, number]);
          if (canPlaceShape(cells, grid)) { placeShape(cells, grid); break; }
        }
      });
    }
    // L-shape (x1)
    shapes.push((grid) => {
      for (let tries = 0; tries < 50; tries++) {
        const len = 6 + Math.floor(Math.random() * 5);
        const x = Math.floor(Math.random() * (GRID_SIZE - len));
        const y = Math.floor(Math.random() * (GRID_SIZE - len));
        const cells: [number, number][] = [];
        for (let i = 0; i < len; i++) cells.push([x, y + i]);
        for (let i = 0; i < len; i++) cells.push([x + i, y]);
        if (canPlaceShape(cells, grid)) { placeShape(cells, grid); break; }
      }
    });
    // U-shape (x1)
    shapes.push((grid) => {
      for (let tries = 0; tries < 50; tries++) {
        const len = 6 + Math.floor(Math.random() * 4);
        const x = Math.floor(Math.random() * (GRID_SIZE - len - 2));
        const y = Math.floor(Math.random() * (GRID_SIZE - len));
        const cells: [number, number][] = [];
        for (let i = 0; i < len; i++) cells.push([x, y + i]);
        for (let i = 0; i < len; i++) cells.push([x + 2 + len, y + i]);
        for (let i = 0; i < len + 3; i++) cells.push([x + i, y + len]);
        if (canPlaceShape(cells, grid)) { placeShape(cells, grid); break; }
      }
    });
    // Diagonal (x1)
    shapes.push((grid) => {
      for (let tries = 0; tries < 50; tries++) {
        const len = 7 + Math.floor(Math.random() * 6);
        const x = Math.floor(Math.random() * (GRID_SIZE - len));
        const y = Math.floor(Math.random() * (GRID_SIZE - len));
        const cells: [number, number][] = [];
        for (let i = 0; i < len; i++) cells.push([x + i, y + i]);
        if (canPlaceShape(cells, grid)) { placeShape(cells, grid); break; }
      }
    });
    // Add more shapes if desired
    return shapes;
  };

  // Initialize grid with complex obstacles, optionally randomize
  const initializeGrid = useCallback((randomize: boolean = false) => {
    const grid: boolean[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(false)
    );
    if (!randomize) {
      // Static obstacle layout
      // Horizontal wall with many small gaps
      const wallRow1 = Math.floor(GRID_SIZE * 0.3);
      const gapCount1 = 6;
      const gaps1 = Array.from({ length: gapCount1 }, (_, i) =>
        Math.floor((i + 1) * GRID_SIZE / (gapCount1 + 1))
      );
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!gaps1.includes(x)) {
          grid[wallRow1][x] = true;
        }
      }

      // Another horizontal wall with more gaps
      const wallRow2 = Math.floor(GRID_SIZE * 0.7);
      const gapCount2 = 5;
      const gaps2 = Array.from({ length: gapCount2 }, (_, i) =>
        Math.floor((i + 1) * GRID_SIZE / (gapCount2 + 1))
      );
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!gaps2.includes(x)) {
          grid[wallRow2][x] = true;
        }
      }

      // Vertical wall with more gaps
      const wallCol = Math.floor(GRID_SIZE * 0.6);
      const vertGapCount = 7;
      const vertGaps = Array.from({ length: vertGapCount }, (_, i) =>
        Math.floor((i + 1) * GRID_SIZE / (vertGapCount + 1))
      );
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!vertGaps.includes(y)) {
          grid[y][wallCol] = true;
        }
      }

      // Another vertical wall with more gaps
      const wallCol2 = Math.floor(GRID_SIZE * 0.2);
      const vertGapCount2 = 4;
      const vertGaps2 = Array.from({ length: vertGapCount2 }, (_, i) =>
        Math.floor((i + 1) * GRID_SIZE / (vertGapCount2 + 1))
      );
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!vertGaps2.includes(y)) {
          grid[y][wallCol2] = true;
        }
      }
      
      // Diagonal barrier
      for (let i = 0; i < Math.floor(GRID_SIZE * 0.4); i++) {
        const x = Math.floor(GRID_SIZE * 0.1) + i;
        const y = Math.floor(GRID_SIZE * 0.5) + i;
        if (inBounds(x, y) && i % 3 !== 1) { // Leave some gaps
          grid[y][x] = true;
        }
      }
      
      // L-shaped obstacles
      const lStartX = Math.floor(GRID_SIZE * 0.8);
      const lStartY = Math.floor(GRID_SIZE * 0.15);
      for (let i = 0; i < 10; i++) {
        if (inBounds(lStartX, lStartY + i)) grid[lStartY + i][lStartX] = true;
        if (inBounds(lStartX + i, lStartY)) grid[lStartY][lStartX + i] = true;
      }
      
      // Another L-shape
      const l2StartX = Math.floor(GRID_SIZE * 0.05);
      const l2StartY = Math.floor(GRID_SIZE * 0.75);
      for (let i = 0; i < 8; i++) {
        if (inBounds(l2StartX + i, l2StartY)) grid[l2StartY][l2StartX + i] = true;
        if (inBounds(l2StartX, l2StartY + i)) grid[l2StartY + i][l2StartX] = true;
      }
      
      // U-shaped obstacle
      const uStartX = Math.floor(GRID_SIZE * 0.75);
      const uStartY = Math.floor(GRID_SIZE * 0.6);
      for (let i = 0; i < 8; i++) {
        if (inBounds(uStartX, uStartY + i)) grid[uStartY + i][uStartX] = true;
        if (inBounds(uStartX + 6, uStartY + i)) grid[uStartY + i][uStartX + 6] = true;
        if (i < 6 && inBounds(uStartX + i, uStartY + 7)) grid[uStartY + 7][uStartX + i] = true;
      }
      
      return grid;
    } else {
      // Randomized obstacle shapes
      const shapes = generateShapes(grid);
      // Place each shape 2-3 times, shuffled
      const shapeOrder = [...shapes, ...shapes].sort(() => Math.random() - 0.5);
      for (const shapeFn of shapeOrder) {
        shapeFn(grid);
      }
      return grid;
    }
  }, []);

  // Initialize 10 cars
  const initializeCars = useCallback((randomize: boolean = false): Car[] => {
    const colors = [
      '#FF4444', '#4444FF', '#44FF44', '#FF44FF', '#44FFFF', '#FFFF44', '#FF8844', '#8844FF',
      '#FFB347', '#B4FF47'
    ];
    const cars: Car[] = [];
    const grid = gridRef.current;
    const occupied = new Set<string>();
    let positions: { start: [number, number], goal: [number, number] }[] = [];
    const MIN_DIST = 12; // Minimum grid cells apart
    if (randomize) {
      for (let i = 0; i < 10; i++) {
        let start: [number, number], goal: [number, number], tries = 0;
        do {
          start = getRandomEmptyCell(occupied, grid);
          goal = getRandomEmptyCell(occupied, grid);
          tries++;
          if (tries > 2000) throw new Error('Could not find valid start/goal pair');
        } while (
          Math.abs(start[0] - goal[0]) + Math.abs(start[1] - goal[1]) < MIN_DIST ||
          occupied.has(key(start[0], start[1])) ||
          occupied.has(key(goal[0], goal[1])) ||
          grid[start[1]][start[0]] ||
          grid[goal[1]][goal[0]]
        );
        occupied.add(key(start[0], start[1]));
        occupied.add(key(goal[0], goal[1]));
        positions.push({ start, goal });
      }
    } else {
      positions = [
        { start: [2, 2], goal: [GRID_SIZE - 3, GRID_SIZE - 3] },
        { start: [GRID_SIZE - 3, 2], goal: [2, GRID_SIZE - 3] },
        { start: [2, GRID_SIZE - 3], goal: [GRID_SIZE - 3, 2] },
        { start: [GRID_SIZE - 3, GRID_SIZE - 3], goal: [2, 2] },
        { start: [Math.floor(GRID_SIZE/2), 2], goal: [Math.floor(GRID_SIZE/2), GRID_SIZE - 3] },
        { start: [2, Math.floor(GRID_SIZE/2)], goal: [GRID_SIZE - 3, Math.floor(GRID_SIZE/2)] },
        { start: [Math.floor(GRID_SIZE * 0.25), Math.floor(GRID_SIZE * 0.25)], goal: [Math.floor(GRID_SIZE * 0.75), Math.floor(GRID_SIZE * 0.75)] },
        { start: [Math.floor(GRID_SIZE * 0.75), Math.floor(GRID_SIZE * 0.25)], goal: [Math.floor(GRID_SIZE * 0.25), Math.floor(GRID_SIZE * 0.75)] },
        { start: [5, 5], goal: [GRID_SIZE - 6, GRID_SIZE - 6] },
        { start: [GRID_SIZE - 6, 5], goal: [5, GRID_SIZE - 6] }
      ];
    }
    positions.forEach((pos, i) => {
      cars.push({
        id: i,
        x: pos.start[0],
        y: pos.start[1],
        goalX: pos.goal[0],
        goalY: pos.goal[1],
        color: colors[i % colors.length],
        knownObstacles: new Set<string>(),
        path: [],
        visitedStack: [],
        stepCooldown: 0,
        pauseTicks: 0,
        trail: [[pos.start[0], pos.start[1]]]
      });
    });
    return cars;
  }, []);

  // BFS pathfinding
  const bfs = useCallback((
    start: [number, number], 
    goal: [number, number], 
    knownObstacles: Set<string>
  ): [number, number][] => {
    const queue: [[number, number], [number, number][]][] = [[start, []]];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const [current, pathSoFar] = queue.shift()!;
      const [x, y] = current;
      
      if (x === goal[0] && y === goal[1]) {
        return [...pathSoFar, goal];
      }
      
      const currentKey = key(x, y);
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      
      // Check neighbors in preferred order (toward goal first)
      const dx = sign(goal[0] - x);
      const dy = sign(goal[1] - y);
      const neighbors: [number, number][] = [];
      
      // Prefer moves toward goal
      if (dx !== 0) neighbors.push([x + dx, y]);
      if (dy !== 0) neighbors.push([x, y + dy]);
      
      // Add other orthogonal neighbors
      const allNeighbors = [[x+1,y], [x-1,y], [x,y+1], [x,y-1]] as [number, number][];
      allNeighbors.forEach(n => {
        if (!neighbors.some(existing => existing[0] === n[0] && existing[1] === n[1])) {
          neighbors.push(n);
        }
      });
      
      for (const [nx, ny] of neighbors) {
        if (!inBounds(nx, ny)) continue;
        const neighborKey = key(nx, ny);
        if (visited.has(neighborKey)) continue;
        if (knownObstacles.has(neighborKey)) continue;
        
        queue.push([[nx, ny], [...pathSoFar, current]]);
      }
    }
    
    return []; // No path found
  }, []);

  // Car planning
  const carPlanPath = useCallback((car: Car) => {
    const known = mode === 'coordinated' ? globalKnowledgeRef.current : car.knownObstacles;
    const fullPath = bfs([car.x, car.y], [car.goalX, car.goalY], known);
    car.path = fullPath.slice(1); // Exclude current cell
  }, [mode, bfs]);

  // Attempt move with obstacle discovery
  const attemptMove = useCallback((car: Car, targetCell: [number, number]): boolean => {
    const [tx, ty] = targetCell;
    
    if (gridRef.current[ty][tx]) { // Hit obstacle
      // Discovery
      const obstacleKey = key(tx, ty);
      car.knownObstacles.add(obstacleKey);
      metricsRef.current.discoveries++;
      
      if (mode === 'coordinated') {
        if (globalKnowledgeRef.current.has(obstacleKey)) {
          metricsRef.current.redundantDiscoveries++;
        } else {
          globalKnowledgeRef.current.add(obstacleKey);
          // Clear all cars' paths so they replan with new knowledge
          carsRef.current.forEach(c => {
            if (c.id !== car.id) {
              c.path = [];
            }
          });
        }
      }
      
      car.path = [];
      car.pauseTicks = DISCOVERY_PAUSE;
      return false;
    } else {
      // Move succeeds
      car.x = tx;
      car.y = ty;
      car.trail.push([tx, ty]);
      if (car.trail.length > 12) {
        car.trail.shift();
      }
      metricsRef.current.totalSteps++;
      return true;
    }
  }, [mode]);

  // Try local exploration move
  const carTryLocalMove = useCallback((car: Car): boolean => {
    const dx = sign(car.goalX - car.x);
    const dy = sign(car.goalY - car.y);
    const candidates: [number, number][] = [];
    
    // Prefer moves toward goal
    if (dx !== 0) candidates.push([car.x + dx, car.y]);
    if (dy !== 0) candidates.push([car.x, car.y + dy]);
    
    // Add other neighbors
    const allNeighbors = [[car.x+1,car.y], [car.x-1,car.y], [car.x,car.y+1], [car.x,car.y-1]] as [number, number][];
    allNeighbors.forEach(n => {
      if (!candidates.some(c => c[0] === n[0] && c[1] === n[1])) {
        candidates.push(n);
      }
    });
    
    for (const candidate of candidates) {
      const [cx, cy] = candidate;
      if (!inBounds(cx, cy)) continue;
      
      const candidateKey = key(cx, cy);
      if (mode === 'coordinated' && globalKnowledgeRef.current.has(candidateKey)) continue;
      if (mode === 'uncoordinated' && car.knownObstacles.has(candidateKey)) continue;
      
      return attemptMove(car, candidate);
    }
    
    return false;
  }, [mode, attemptMove]);

  // Check if car reached goal
  const carAtGoal = (car: Car): boolean => car.x === car.goalX && car.y === car.goalY;

  // Check if all cars reached goals
  const allCarsAtGoal = (): boolean => carsRef.current.every(carAtGoal);

  // Simulation tick
  const tick = useCallback(() => {
    frameRef.current++;
    
    for (const car of carsRef.current) {
      if (carAtGoal(car)) continue;
      
      if (car.pauseTicks > 0) {
        car.pauseTicks--;
        continue;
      }
      
      if (car.stepCooldown > 0) {
        car.stepCooldown--;
        continue;
      }
      
      // Plan path if needed
      if (car.path.length === 0) {
        carPlanPath(car);
        if (car.path.length === 0) {
          // No BFS path found; try local exploration
          carTryLocalMove(car);
          car.stepCooldown = MOVE_DELAY;
          continue;
        }
      }
      
      // Follow planned path
      const nextCell = car.path.shift()!;
      const success = attemptMove(car, nextCell);
      car.stepCooldown = MOVE_DELAY;
    }
    
    // Check if simulation complete
    if (allCarsAtGoal() && metricsRef.current.endTime === 0) {
      metricsRef.current.endTime = Date.now();
    }
    
    // Update display metrics periodically
    if (frameRef.current % 30 === 0) {
      setDisplayMetrics({...metricsRef.current});
    }
  }, [carPlanPath, attemptMove, carTryLocalMove]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid (lighter lines for large grid)
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i += 3) { // Only every 3rd line to avoid clutter
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw obstacles (show all walls, differentiate discovered vs undiscovered)
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (gridRef.current[y][x]) {
          const obstacleKey = key(x, y);
          let discovered = false;
          
          if (mode === 'coordinated') {
            discovered = globalKnowledgeRef.current.has(obstacleKey);
          } else {
            discovered = carsRef.current.some(car => car.knownObstacles.has(obstacleKey));
          }
          
          if (discovered) {
            // Discovered obstacles - bright red
            ctx.fillStyle = mode === 'coordinated' ? '#CC0000' : '#FF4444';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          } else {
            // Undiscovered obstacles - dark gray (visible to viewer but not to cars)
            ctx.fillStyle = '#666666';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
    
    // Draw car trails
    carsRef.current.forEach(car => {
      if (car.trail.length > 1) {
        ctx.strokeStyle = car.color + '60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(car.trail[0][0] * CELL_SIZE + CELL_SIZE/2, car.trail[0][1] * CELL_SIZE + CELL_SIZE/2);
        for (let i = 1; i < car.trail.length; i++) {
          ctx.lineTo(car.trail[i][0] * CELL_SIZE + CELL_SIZE/2, car.trail[i][1] * CELL_SIZE + CELL_SIZE/2);
        }
        ctx.stroke();
      }
    });
    
    // Draw planned paths
    carsRef.current.forEach(car => {
      if (car.path.length > 0) {
        ctx.strokeStyle = car.color + '80';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(car.x * CELL_SIZE + CELL_SIZE/2, car.y * CELL_SIZE + CELL_SIZE/2);
        car.path.forEach(([px, py]) => {
          ctx.lineTo(px * CELL_SIZE + CELL_SIZE/2, py * CELL_SIZE + CELL_SIZE/2);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    
    // Draw cars
    carsRef.current.forEach(car => {
      const cx = car.x * CELL_SIZE + CELL_SIZE/2;
      const cy = car.y * CELL_SIZE + CELL_SIZE/2;
      
      // Car body
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL_SIZE/2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Car outline
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Car ID
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(car.id.toString(), cx, cy + 2);
      
      // Goal marker
      const gx = car.goalX * CELL_SIZE + CELL_SIZE/2;
      const gy = car.goalY * CELL_SIZE + CELL_SIZE/2;
      ctx.strokeStyle = car.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, CELL_SIZE/3, 0, Math.PI * 2);
      ctx.stroke();
      
      // Goal flag
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.moveTo(gx, gy - CELL_SIZE/3);
      ctx.lineTo(gx + CELL_SIZE/4, gy - CELL_SIZE/6);
      ctx.lineTo(gx, gy - CELL_SIZE/8);
      ctx.fill();
    });
    
    // Draw metrics
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const metricsY = GRID_SIZE * CELL_SIZE + 20;
    ctx.fillText(`Mode: ${mode.toUpperCase()}`, 10, metricsY);
    ctx.fillText(`Steps: ${displayMetrics.totalSteps}`, 150, metricsY);
    ctx.fillText(`Discoveries: ${displayMetrics.discoveries}`, 240, metricsY);
    ctx.fillText(`Redundant: ${displayMetrics.redundantDiscoveries}`, 360, metricsY);
    ctx.fillText(`Cars at Goal: ${carsRef.current.filter(carAtGoal).length}/${carsRef.current.length}`, 10, metricsY + 20);
    
    if (displayMetrics.endTime > 0) {
      const duration = ((displayMetrics.endTime - displayMetrics.startTime) / 1000).toFixed(1);
      ctx.fillText(`Completed in: ${duration}s`, 150, metricsY + 20);
    }
    
    // Discovery efficiency
    const efficiency = displayMetrics.discoveries > 0 ? 
      (((displayMetrics.discoveries - displayMetrics.redundantDiscoveries) / displayMetrics.discoveries) * 100).toFixed(1) + '%' 
      : '0%';
    ctx.fillText(`Discovery Efficiency: ${efficiency}`, 280, metricsY + 20);
    
    if (allCarsAtGoal()) {
      ctx.fillStyle = 'green';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ALL CARS REACHED GOALS!', CANVAS_WIDTH/2, metricsY + 50);
      ctx.textAlign = 'left';
    }
    
    // Legend
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.fillText('Gray = Undiscovered walls | Red = Discovered walls | Circles = Cars/Goals', 10, metricsY + 70);
  }, [mode, displayMetrics]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isRunning) return;
    
    tick();
    draw();
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isRunning, tick, draw]);

  // Utility function to move a goal diagonally until it's not on an obstacle
  const moveGoalOffObstacle = (goal: [number, number], grid: boolean[][]): [number, number] => {
    let [gx, gy] = goal;
    let tries = 0;
    while (grid[gy][gx]) {
      gx = (gx + 1) % GRID_SIZE;
      gy = (gy + 1) % GRID_SIZE;
      tries++;
      if (tries > GRID_SIZE * GRID_SIZE) break; // avoid infinite loop
    }
    return [gx, gy];
  };

  // Start simulation
  const startSimulation = useCallback((randomize: boolean = false) => {
    let cars: Car[];
    if (lockLayout && lockedGrid && lockedCars) {
      gridRef.current = lockedGrid.map(row => [...row]);
      carsRef.current = lockedCars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] }));
      cars = carsRef.current;
    } else if (!randomize && !defaultGrid && !defaultCars) {
      const grid = initializeGrid(false);
      cars = initializeCars(false);
      setDefaultGrid(grid.map(row => [...row]));
      setDefaultCars(cars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] })));
      gridRef.current = grid;
      carsRef.current = cars;
    } else if (!randomize && defaultGrid && defaultCars) {
      gridRef.current = defaultGrid.map(row => [...row]);
      carsRef.current = defaultCars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] }));
      cars = carsRef.current;
    } else {
      const grid = initializeGrid(true);
      cars = initializeCars(true);
      gridRef.current = grid;
      carsRef.current = cars;
      if (lockLayout) {
        setLockedGrid(grid.map(row => [...row]));
        setLockedCars(cars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] })));
      }
    }
    // Move any goal off an obstacle
    cars.forEach(car => {
      if (gridRef.current[car.goalY][car.goalX]) {
        const [newGX, newGY] = moveGoalOffObstacle([car.goalX, car.goalY], gridRef.current);
        car.goalX = newGX;
        car.goalY = newGY;
      }
    });
    globalKnowledgeRef.current = new Set();
    metricsRef.current = {
      totalSteps: 0,
      discoveries: 0,
      redundantDiscoveries: 0,
      startTime: Date.now(),
      endTime: 0
    };
    frameRef.current = 0;
    setDisplayMetrics({...metricsRef.current});
    setIsRunning(true);
  }, [initializeGrid, initializeCars, defaultGrid, defaultCars, lockLayout, lockedGrid, lockedCars]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (lockLayout && lockedGrid && lockedCars) {
      gridRef.current = lockedGrid.map(row => [...row]);
      carsRef.current = lockedCars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] }));
      globalKnowledgeRef.current = new Set();
      metricsRef.current = {
        totalSteps: 0,
        discoveries: 0,
        redundantDiscoveries: 0,
        startTime: 0,
        endTime: 0
      };
      setDisplayMetrics({...metricsRef.current});
      if (canvasRef.current) draw();
    } else if (defaultGrid && defaultCars) {
      gridRef.current = defaultGrid.map(row => [...row]);
      carsRef.current = defaultCars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] }));
      globalKnowledgeRef.current = new Set();
      metricsRef.current = {
        totalSteps: 0,
        discoveries: 0,
        redundantDiscoveries: 0,
        startTime: 0,
        endTime: 0
      };
      setDisplayMetrics({...metricsRef.current});
      if (canvasRef.current) draw();
    }
  }, [defaultGrid, defaultCars, draw, lockLayout, lockedGrid, lockedCars]);

  // Effect for animation
  useEffect(() => {
    if (isRunning) {
      animate();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isRunning, animate]);

  // Effect to lock the current layout when lockLayout is enabled
  useEffect(() => {
    if (lockLayout) {
      setLockedGrid(gridRef.current.map(row => [...row]));
      setLockedCars(carsRef.current.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] })));
    }
    // If unlocking, do not change lockedGrid/lockedCars
    // (they will be ignored by the logic)
  }, [lockLayout]);

  // Initial draw
  useEffect(() => {
    if (!isRunning) {
      if (lockLayout && lockedGrid && lockedCars) {
        gridRef.current = lockedGrid.map(row => [...row]);
        carsRef.current = lockedCars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] }));
      } else if (defaultGrid && defaultCars) {
        gridRef.current = defaultGrid.map(row => [...row]);
        carsRef.current = defaultCars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] }));
      } else {
        gridRef.current = initializeGrid();
        carsRef.current = initializeCars();
      }
      globalKnowledgeRef.current = new Set();
      draw();
    }
  }, [mode, isRunning, initializeGrid, initializeCars, draw, defaultGrid, defaultCars, lockLayout, lockedGrid, lockedCars]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Enhanced Autonomous Vehicle Navigation Lab</h1>
      <p className="text-center mb-4 max-w-4xl text-gray-700">
        This enhanced simulation shows 8 vehicles navigating a complex 36×36 grid with multiple obstacle types. 
        Gray squares are undiscovered walls (visible to you but unknown to cars), while red squares are discovered obstacles. 
        In <strong>uncoordinated</strong> mode, each vehicle only knows what it has personally discovered. 
        In <strong>coordinated</strong> mode, vehicles instantly share discoveries, dramatically reducing redundant exploration.

        Use the buttons below to start/stop the simulation, switch modes, randomize positions, and lock the layout.
        Make sure to lock the layout if you want to compare modes on the same obstacle/course setup.
        Currently, due to a bug, the program only runs normally when you lock the layout... sorry :(
      </p>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={isRunning ? stopSimulation : () => startSimulation(false)}
          className={`px-6 py-2 rounded font-semibold ${
            isRunning 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? 'Stop' : 'Start'} Simulation
        </button>
        <button
          onClick={() => setMode(mode === 'coordinated' ? 'uncoordinated' : 'coordinated')}
          disabled={isRunning}
          className={`px-6 py-2 rounded font-semibold ${
            isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Mode: {mode}
        </button>
        <button
          onClick={() => {
            // Only randomize and lock the layout, do not start simulation
            const grid = initializeGrid(true);
            const cars = initializeCars(true);
            gridRef.current = grid;
            carsRef.current = cars;
            if (lockLayout) {
              setLockedGrid(grid.map(row => [...row]));
              setLockedCars(cars.map(car => ({ ...car, knownObstacles: new Set(), path: [], visitedStack: [], trail: [[car.x, car.y]] })));
            }
            globalKnowledgeRef.current = new Set();
            metricsRef.current = {
              totalSteps: 0,
              discoveries: 0,
              redundantDiscoveries: 0,
              startTime: 0,
              endTime: 0
            };
            setDisplayMetrics({...metricsRef.current});
            if (canvasRef.current) draw();
          }}
          disabled={isRunning}
          className={`px-6 py-2 rounded font-semibold ${
            isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          Randomize Positions
        </button>
        <button
          onClick={() => setLockLayout(l => !l)}
          disabled={lockLayout}
          className={`px-6 py-2 rounded font-semibold ${lockLayout ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {lockLayout ? 'Unlock Layout' : 'Lock Layout'}
        </button>
      </div>
      
      <div className="mb-4 border-2 border-gray-400">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-white"
        />
      </div>
      
      <div className="text-sm text-gray-600 max-w-4xl text-center">
        <p className="mb-2">
          <strong>Legend:</strong> Colored circles are cars (0-7), hollow circles are goals, 
          <span className="bg-gray-600 text-white px-1 rounded">gray squares</span> are undiscovered walls, 
          <span className="bg-red-600 text-white px-1 rounded">red squares</span> are discovered obstacles, 
          dotted lines show planned paths.
        </p>
        <p className="mb-2">
          <strong>Algorithmic Obstacle Design:</strong> Obstacles are placed using a systematic approach with 
          3-4 horizontal walls (5×1), 3-4 vertical walls (1×5), 2-3 L-shapes, 2 diagonals, and small blocks. 
          Each structure has built-in gaps and collision detection prevents overlaps or car entrapments.
        </p>
        <p>
          Watch the dramatic difference: uncoordinated mode shows massive redundant discoveries as each car 
          independently explores the same dead ends. Coordinated mode shows efficient exploration with 
          instant knowledge sharing, leading to much shorter total paths and faster completion.
        </p>
      </div>
    </div>
  );
}