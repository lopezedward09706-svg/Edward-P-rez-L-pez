
import React, { useRef, useEffect } from 'react';
import { GlobalState } from '../types';

interface SimulationPanelProps {
    metrics: any; 
    simulationStateRef: React.MutableRefObject<GlobalState>;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ metrics, simulationStateRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId: number;

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const state = simulationStateRef.current;
            const scaleFactor = 300 / (state.parameters.scale + 1); // Zoom out as scale increases

            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, w, h);

            // 1. Draw Gravity Fabric (Grid)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            const gridRes = state.fabricDeformation.length;
            
            // Horizontal lines
            for (let i = 0; i < gridRes; i++) {
                ctx.beginPath();
                for (let j = 0; j < gridRes; j++) {
                    const deform = state.fabricDeformation[i][j];
                    const x = ((i / gridRes) * 2 - 1) * 350 + cx;
                    const y = ((j / gridRes) * 2 - 1) * 350 + cy;
                    // Visualize depth via y-offset or color intensity based on deform
                    // Simple radial pull
                    const pull = deform * 50; 
                    const dirX = cx - x;
                    const dirY = cy - y;
                    const dist = Math.sqrt(dirX*dirX + dirY*dirY) || 1;
                    
                    ctx.lineTo(x + (dirX/dist)*pull, y + (dirY/dist)*pull);
                }
                ctx.stroke();
            }

            // 2. Snell's Law / Refraction Boundary
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(cx, cy, 0.5 * 350, 0, Math.PI*2); // Boundary
            ctx.stroke();

            // 3. Draw ABC Nodes as "Vibrating Rays" (Strings)
            // Scale 0 (Planck): Big wavy lines. Scale 8: Tiny points.
            state.nodes.forEach(node => {
                const nx = cx + node.x * 350;
                const ny = cy + node.y * 350;

                ctx.strokeStyle = node.color;
                ctx.lineWidth = 2;
                ctx.beginPath();

                // Draw sine wave ray
                const rayLen = 15;
                const angle = Math.atan2(node.velocity.y, node.velocity.x);
                
                // Rotate perpendicular for vibration
                const perpX = -Math.sin(angle);
                const perpY = Math.cos(angle);

                // Draw string segment
                for(let t=0; t<=1; t+=0.2) {
                    const vib = Math.sin(node.vibrationPhase + t * 10) * 3; // Vibration Amplitude
                    const px = nx + Math.cos(angle) * (t - 0.5) * rayLen + perpX * vib;
                    const py = ny + Math.sin(angle) * (t - 0.5) * rayLen + perpY * vib;
                    if (t===0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            });

            // 4. Draw Quarks (Triangles holding 3 nodes)
            state.quarks.forEach(q => {
                const qx = cx + q.position.x * 350;
                const qy = cy + q.position.y * 350;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.arc(qx, qy, 10, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = q.color;
                ctx.stroke();
            });

            // 5. Draw Relativistic Spaceship
            // Length contraction: L = L0 * sqrt(1 - v^2/c^2)
            const ship = state.spaceship;
            const sx = cx + ship.x * 350;
            const sy = cy + ship.y * 350;
            const vRatio = ship.v; // v/c
            const gammaInv = Math.sqrt(1 - vRatio*vRatio);
            
            const shipW = 40 * gammaInv; // Contracted width
            const shipH = 20;

            ctx.save();
            ctx.translate(sx, sy);
            // Draw Ship
            ctx.fillStyle = '#FFAA00';
            ctx.beginPath();
            ctx.moveTo(shipW/2, 0); // Nose
            ctx.lineTo(-shipW/2, -shipH/2);
            ctx.lineTo(-shipW/2 + 5, 0); // Engine indent
            ctx.lineTo(-shipW/2, shipH/2);
            ctx.closePath();
            ctx.fill();
            
            // Draw Light Cone / Shockwave
            ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
            ctx.beginPath();
            ctx.moveTo(shipW/2, 0);
            ctx.lineTo(-shipW * 2, -shipH * 2);
            ctx.moveTo(shipW/2, 0);
            ctx.lineTo(-shipW * 2, shipH * 2);
            ctx.stroke();

            ctx.restore();


            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [simulationStateRef]);

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                <h3 className="font-bold text-cyan-400">VISUALIZADOR CUÁNTICO</h3>
                <div className="text-xs text-gray-400">Geometría ABC • Tensor Métrico • Cuerdas</div>
            </div>
            
            <div className="flex-1 bg-black rounded-lg border border-white/20 overflow-hidden relative">
                <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />
                
                {/* Overlay Metrics */}
                <div className="absolute top-2 left-2 bg-black/50 p-2 rounded text-xs font-mono text-green-400">
                    <div>E (Mean): {metrics.meanEnergy?.toExponential(2)} J</div>
                    <div>Entropy: {metrics.entropy?.toFixed(4)}</div>
                    <div>Nodes: {metrics.nodeCount} | Quarks: {metrics.quarkCount}</div>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/50 p-2 rounded text-xs text-right">
                    <div className="text-orange-400 font-bold">NAVE (Velocidad Luz)</div>
                    <div className="text-white">v = 0.80c</div>
                    <div className="text-blue-300">Dilatación: {metrics.dilation?.toFixed(4)}x</div>
                </div>
            </div>
        </div>
    );
};

export default SimulationPanel;
