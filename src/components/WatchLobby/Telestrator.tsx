// src/components/WatchLobby/Telestrator.tsx
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Undo, Edit3, X } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

export interface Stroke {
    points: Point[];
    color: string;
    brushSize: number;
}

interface TelestratorProps {
    isActive: boolean;
    isModerator: boolean;
    strokes: Stroke[];
    onStrokeAdded?: (stroke: Stroke) => void;
    onUndo?: () => void;
    onClear?: () => void;
    onToggleActive?: () => void;
}

export default function Telestrator({
    isActive,
    isModerator,
    strokes,
    onStrokeAdded,
    onUndo,
    onClear,
    onToggleActive
}: TelestratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#22c55e'); // neon green
    const [currentBrushSize, setCurrentBrushSize] = useState(4);
    const currentPoints = useRef<Point[]>([]);

    const colors = [
        { name: 'Green', value: '#22c55e', glow: 'rgba(34,197,94,0.6)' },
        { name: 'Yellow', value: '#eab308', glow: 'rgba(234,179,8,0.6)' },
        { name: 'Red', value: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
    ];

    // Redraw canvas whenever strokes change or resizing occurs
    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render all completed strokes
        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.brushSize;

            // Commentator neon glow effect
            ctx.shadowColor = stroke.color;
            ctx.shadowBlur = 8;

            ctx.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * canvas.width, stroke.points[i].y * canvas.height);
            }
            ctx.stroke();
        });

        // Reset shadow settings
        ctx.shadowBlur = 0;
    };

    // Handle canvas resizing
    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            // Set drawing buffer dimensions matching client width/height
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            drawCanvas();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Short timeout to guarantee layout completes
        const timer = setTimeout(resizeCanvas, 500);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            clearTimeout(timer);
        };
    }, [strokes, isActive]);

    // Redraw on strokes update
    useEffect(() => {
        drawCanvas();
    }, [strokes]);

    // Helper to get normalized mouse/touch coordinates [0, 1]
    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            if (e.touches.length === 0) return null;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) / rect.width,
            y: (clientY - rect.top) / rect.height
        };
    };

    // Start drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isActive || !isModerator) return;
        e.preventDefault();

        const coords = getCoordinates(e);
        if (!coords) return;

        setIsDrawing(true);
        currentPoints.current = [coords];

        // Draw initial point locally
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.beginPath();
            ctx.arc(coords.x * canvas.width, coords.y * canvas.height, currentBrushSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = currentColor;
            ctx.fill();
        }
    };

    // Draw move
    const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isActive || !isModerator) return;
        e.preventDefault();

        const coords = getCoordinates(e);
        if (!coords) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const lastPoint = currentPoints.current[currentPoints.current.length - 1];

        // Render stroke in real-time locally
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentBrushSize;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 8;
        ctx.moveTo(lastPoint.x * canvas.width, lastPoint.y * canvas.height);
        ctx.lineTo(coords.x * canvas.width, coords.y * canvas.height);
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;

        currentPoints.current.push(coords);
    };

    // End drawing
    const endDrawing = () => {
        if (!isDrawing || !isActive || !isModerator) return;
        setIsDrawing(false);

        if (currentPoints.current.length > 1) {
            const newStroke: Stroke = {
                points: currentPoints.current,
                color: currentColor,
                brushSize: currentBrushSize
            };
            if (onStrokeAdded) {
                onStrokeAdded(newStroke);
            }
        }
        currentPoints.current = [];
    };

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-35">
            {/* Drawing Canvas */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={drawMove}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={drawMove}
                onTouchEnd={endDrawing}
                className={`absolute inset-0 w-full h-full ${
                    isActive && isModerator ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
                }`}
            />

            {/* Tactical Control Toolbar (For Moderator/Host drawing ONLY) */}
            {isModerator && isActive && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#111113]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl pointer-events-auto shadow-2xl animate-fade-in">
                    
                    {/* Brush Size Toggle */}
                    <button
                        onClick={() => setCurrentBrushSize(prev => prev === 4 ? 8 : prev === 8 ? 12 : 4)}
                        className="p-2 hover:bg-white/5 rounded-xl text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                        title="Brush Size"
                    >
                        <Edit3 size={16} />
                        <span className="text-[10px] font-extrabold uppercase bg-white/10 px-1.5 py-0.5 rounded text-white tracking-widest">
                            {currentBrushSize === 4 ? 'Fine' : currentBrushSize === 8 ? 'Med' : 'Thick'}
                        </span>
                    </button>

                    <div className="h-5 w-px bg-white/10" />

                    {/* Glowing Color Palette */}
                    <div className="flex items-center gap-2">
                        {colors.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setCurrentColor(c.value)}
                                className={`w-6 h-6 rounded-full border transition-all ${
                                    currentColor === c.value 
                                        ? 'border-white scale-110' 
                                        : 'border-transparent hover:scale-105'
                                }`}
                                style={{ 
                                    backgroundColor: c.value,
                                    boxShadow: currentColor === c.value ? `0 0 10px ${c.glow}` : 'none' 
                                }}
                                title={c.name}
                            />
                        ))}
                    </div>

                    <div className="h-5 w-px bg-white/10" />

                    {/* Undo */}
                    <button
                        onClick={onUndo}
                        disabled={strokes.length === 0}
                        className="p-2 hover:bg-white/5 rounded-xl text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Undo stroke"
                    >
                        <Undo size={16} />
                    </button>

                    {/* Clear Board */}
                    <button
                        onClick={onClear}
                        disabled={strokes.length === 0}
                        className="p-2 hover:bg-white/5 rounded-xl text-red-400 hover:text-red-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Clear board"
                    >
                        <Trash2 size={16} />
                    </button>

                    <div className="h-5 w-px bg-white/10" />

                    {/* Close Telestrator overlay button */}
                    <button
                        onClick={onToggleActive}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all"
                        title="Exit Draw Mode"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
