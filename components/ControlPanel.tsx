
import React, { useState } from 'react';
import { SimulationParameters } from '../types';
import { PRESETS, SCALE_LABELS } from '../constants';

interface ControlPanelProps {
    params: SimulationParameters;
    onParamChange: (key: keyof SimulationParameters, value: number) => void;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onRunAllIAs: () => void;
    onLoadPreset: (preset: SimulationParameters) => void;
    onSaveDeduction: (text: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    params, onParamChange, onStart, onPause, onReset, onRunAllIAs, onLoadPreset, onSaveDeduction
}) => {
    const [deduction, setDeduction] = useState("");

    const handleDeductionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setDeduction(text);
        onSaveDeduction(text);
    };

    const slider = (label: string, key: keyof SimulationParameters, min: number, max: number, step: number, color: string, isScale = false) => (
        <div className="mb-3">
            <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-400 uppercase font-black">{label}</span>
                <span className={`font-bold text-${color}-400`}>
                    {isScale ? SCALE_LABELS[Math.round(params[key])] : params[key]}
                </span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step} 
                value={params[key]} 
                onChange={(e) => onParamChange(key, parseFloat(e.target.value))} 
                className={`w-full h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-${color}-500`} 
            />
        </div>
    );

    return (
        <div className="flex flex-col gap-1">
            <h3 className="text-xs font-black border-b border-cyan-500/30 pb-2 mb-4 text-cyan-400 uppercase tracking-widest">🔭 Observador & Zoom</h3>
            {slider('Nivel de Escala', 'scale', 0, 11, 1, 'cyan', true)}
            
            <h3 className="text-xs font-black border-b border-purple-500/30 pb-2 mb-4 text-purple-400 uppercase tracking-widest">⚙️ Dinámica ABC</h3>
            {slider('Acoplamiento (λ)', 'couplingLambda', 0, 1, 0.01, 'purple')}
            {slider('Rigidez de Red (k)', 'rigidityK', 0, 20, 0.1, 'pink')}
            {slider('Límite Estabilidad (Λ)', 'stabilityLimit', 0.1, 5, 0.1, 'red')}

            <h3 className="text-xs font-black border-b border-blue-500/30 pb-2 mb-4 mt-2 text-blue-400 uppercase tracking-widest">💎 Arquitectura Atómica</h3>
            {slider('Fuerza de Valencia', 'atomicLockingStrength', 0, 50, 1, 'blue')}
            {slider('Geometría radioPi', 'radioPi', 0.1, 5, 0.1, 'yellow')}

            <h3 className="text-xs font-black border-b border-green-500/30 pb-2 mb-4 mt-2 text-green-400 uppercase tracking-widest">✍️ Deducciones del Usuario</h3>
            <textarea 
                value={deduction}
                onChange={handleDeductionChange}
                placeholder="Escribe tus hallazgos teóricos aquí para que IA3 los valide..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded p-2 text-[10px] font-mono focus:outline-none focus:border-green-500 mb-2 custom-scrollbar"
            />

            <div className="flex gap-1 mt-2">
                 <button onClick={onStart} className="flex-1 py-2 bg-cyan-600/80 rounded font-black text-[9px] hover:bg-cyan-500 transition-all">▶ EVOLUCIONAR</button>
                 <button onClick={onPause} className="flex-1 py-2 bg-yellow-600/80 rounded font-black text-[9px] hover:bg-yellow-500 transition-all">⏸ CONGELAR</button>
                 <button onClick={onReset} className="flex-1 py-2 bg-red-600/80 rounded font-black text-[9px] hover:bg-red-500 transition-all">↺ BIG BANG</button>
            </div>

            <div className="mt-4 p-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-white/10">
                <button 
                    onClick={onRunAllIAs}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded font-black text-[10px] tracking-widest transition-all active:scale-95"
                >
                    🧠 ANÁLISIS MULTI-AGENTE (IA 1-8)
                </button>
            </div>

            <div className="grid grid-cols-2 gap-1 mt-4">
                <button onClick={() => onLoadPreset(PRESETS.atomicCrystal)} className="p-1.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold hover:bg-white/10 uppercase">Cristal Atómico</button>
                <button onClick={() => onLoadPreset(PRESETS.standardCosmos)} className="p-1.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold hover:bg-white/10 uppercase">Macrocosmos</button>
            </div>
        </div>
    );
};

export default ControlPanel;
