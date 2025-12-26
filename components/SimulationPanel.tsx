
import React, { useRef, useEffect } from 'react';
import { GlobalState, ABCNode } from '../types';
import { SCALE_LABELS } from '../constants';

interface SimulationPanelProps {
    metrics: any; 
    simulationStateRef: React.MutableRefObject<GlobalState>;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ metrics, simulationStateRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let frameId: number;
        const render = () => {
            const state = simulationStateRef.current;
            if (!state || !state.parameters) {
                frameId = requestAnimationFrame(render);
                return;
            }

            const { width: w, height: h } = canvas;
            const cx = w / 2; const cy = h / 2;
            const scaleIndex = state.parameters.scale;
            const zoomBase = 300;
            const zoom = zoomBase * Math.pow(0.7, scaleIndex - 6);

            ctx.fillStyle = '#010108';
            ctx.fillRect(0, 0, w, h);

            // 1. Quarks (Materia Localizada)
            state.quarks.forEach(q => {
                const qx = cx + q.position.x * zoom;
                const qy = cy + q.position.y * zoom;
                
                // Núcleo del Quark
                ctx.shadowBlur = 15;
                ctx.shadowColor = q.type === 'up' ? '#ff3333' : '#3333ff';
                ctx.fillStyle = q.type === 'up' ? '#ff3333' : '#3333ff';
                ctx.beginPath();
                ctx.arc(qx, qy, 6 * (zoom/zoomBase), 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // 2. Ondas de Colapso (Efectos Transitorios)
            state.recentCollapses.forEach(c => {
                const elapsed = state.time - c.time;
                const opacity = 1 - elapsed;
                const radius = elapsed * 300 * (zoom/zoomBase);
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx + c.x * zoom, cy + c.y * zoom, radius, 0, Math.PI * 2);
                ctx.stroke();
            });

            // 3. Nodos en Superposición / Vacío
            state.nodes.forEach(n => {
                if (n.isCollapsed) return;
                
                let nx = cx + n.x * zoom; 
                let ny = cy + n.y * zoom;
                
                // Jitter cuántico si tiene alta superposición
                if (n.superposition > 0.2) {
                    nx += (Math.random() - 0.5) * n.superposition * 10;
                    ny += (Math.random() - 0.5) * n.superposition * 10;
                }

                const size = 2 * (zoom/zoomBase);
                
                // Aura de superposición (Incertidumbre)
                if (n.superposition > 0.1) {
                    const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.superposition * 15 * (zoom/zoomBase));
                    grad.addColorStop(0, `rgba(255, 255, 255, ${n.superposition * 0.4})`);
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(nx, ny, n.superposition * 15 * (zoom/zoomBase), 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = n.color;
                ctx.beginPath();
                ctx.arc(nx, ny, size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#00FFCC';
            ctx.fillText(`FASE: ${state.currentPhase}`, 20, 25);
            ctx.fillText(`COLAPSOS (Ψ): ${state.quarks.length}`, 20, 40);

            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [simulationStateRef]);

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 h-full relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 right-4 flex flex-col gap-1 items-end pointer-events-none">
                <div className="px-2 py-0.5 bg-black/60 rounded border border-purple-500/30 text-[8px] text-purple-400 font-bold uppercase tracking-tighter">WFC Engine v1.0</div>
            </div>
            <canvas ref={canvasRef} width={800} height={500} className="w-full h-full bg-[#00000a] rounded-lg shadow-inner" />
        </div>
    );
};

export default SimulationPanel;
