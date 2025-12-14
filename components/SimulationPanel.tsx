import React, { useRef, useEffect } from 'react';
import { GlobalState } from '../types';

interface SimulationPanelProps {
    metrics: ReturnType<any>; // Using explicit type locally inferred from engine would be better but keeping it loose for simplicity
    simulationStateRef: React.MutableRefObject<GlobalState>;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ metrics, simulationStateRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const scale = Math.min(width, height) * 0.35;
            
            // Clear
            ctx.clearRect(0, 0, width, height);
            
            const state = simulationStateRef.current;

            // Draw connections
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.lineWidth = 1;
            
            // Limit connections drawing for performance if too many nodes
            const maxNodesToConnect = 50;
            const nodesToRender = state.nodes.length > 200 ? state.nodes.slice(0, 200) : state.nodes;

            nodesToRender.forEach((node1, i) => {
                // Optimization: only check neighbors for a subset
                if (i > maxNodesToConnect) return;
                
                state.nodes.forEach((node2, j) => {
                    if (i >= j) return;
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) return; // Simple Bounding Box check first
                    
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 0.2) {
                        ctx.beginPath();
                        ctx.moveTo(centerX + node1.x * scale, centerY + node1.y * scale);
                        ctx.lineTo(centerX + node2.x * scale, centerY + node2.y * scale);
                        ctx.stroke();
                    }
                });
            });

            // Draw Nodes
            nodesToRender.forEach(node => {
                const x = centerX + node.x * scale;
                const y = centerY + node.y * scale;
                
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(x, y, node.radius, 0, Math.PI * 2);
                ctx.fill();

                // Glow
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(x, y, node.radius + 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Text
                if (state.nodes.length < 50) {
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(node.type.toUpperCase(), x, y + 15);
                }
            });

            // Draw Quarks
            state.quarks.forEach(quark => {
                const x = centerX + quark.position.x * scale;
                const y = centerY + quark.position.y * scale;
                
                ctx.fillStyle = quark.color;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Arial';
                ctx.fillText(`q${quark.type.charAt(0)}`, x, y + 4);
            });

            // Draw Atoms
            state.atoms.forEach(atom => {
                const x = centerX + atom.position.x * scale;
                const y = centerY + atom.position.y * scale;
                
                ctx.fillStyle = atom.type === 'proton' ? '#FFAAAA' : '#AAAAFF';
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(atom.type === 'proton' ? 'p+' : 'n0', x, y + 5);
            });

            animationFrameId = requestAnimationFrame(render);
        };
        
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [simulationStateRef]);

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold border-b-2 border-white/20 pb-2 mb-4">🌌 SIMULACIÓN INTERACTIVA</h3>
            
            <div className="flex-1 bg-black rounded-lg border border-white/20 overflow-hidden relative">
                <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-contain" />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                    { label: 'Nodos ABC', value: metrics.nodeCount },
                    { label: 'Quarks Formados', value: metrics.quarkCount },
                    { label: 'Átomos Emergentes', value: metrics.atomCount },
                    { label: 'Energía Total (J)', value: metrics.totalEnergy.toExponential(2) },
                    { label: 'Curvatura Media', value: metrics.avgCurvature.toFixed(4) },
                    { label: 'Temperatura (K)', value: metrics.temperature.toFixed(2) }
                ].map((item, idx) => (
                    <div key={idx} className="bg-black/30 p-2 rounded border border-white/10 text-center">
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="text-lg font-mono text-blue-300">{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                 <div className="bg-black/30 p-3 rounded border border-white/10 text-center">
                     <div className="text-sm font-bold text-green-400">⏱️ RELOJ TIERRA</div>
                     <div className="text-xl font-mono">{metrics.earthTime.toFixed(2)}</div>
                     <div className="text-xs text-gray-400">Estado: {metrics.earthState}</div>
                 </div>
                 <div className="bg-black/30 p-3 rounded border border-white/10 text-center">
                     <div className="text-sm font-bold text-red-400">🚀 RELOJ COHETE</div>
                     <div className="text-xl font-mono">{metrics.rocketTime.toFixed(2)}</div>
                     <div className="text-xs text-gray-400">Estado: {metrics.rocketState}</div>
                 </div>
            </div>

            <div className="mt-4 bg-black/30 p-2 rounded border border-white/10 text-center">
                <div className="text-xs text-gray-400">DILATACIÓN TEMPORAL (γ)</div>
                <div className="text-2xl font-bold text-orange-400">{metrics.dilation.toFixed(4)}</div>
            </div>
        </div>
    );
};

export default SimulationPanel;