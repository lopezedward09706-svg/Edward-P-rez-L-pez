
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

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-full overflow-y-auto">
            <h3 className="text-lg font-semibold border-b-2 border-white/20 pb-2 mb-4">🎛️ CONTROLES UNIVERSALES</h3>
            
            {/* Scale Slider */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Escala Dimensional</span>
                    <span className="text-cyan-400 font-bold">{SCALE_LABELS[params.scale]}</span>
                </div>
                <input 
                    type="range" min="0" max="8" step="1" 
                    value={params.scale}
                    onChange={(e) => onParamChange('scale', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>

            {/* Triangles Slider */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Densidad (Triángulos ABC)</span>
                    <span className="text-purple-400 font-bold">{params.n_abc}</span>
                </div>
                <input 
                    type="range" min="10" max="500" step="10" 
                    value={params.n_abc}
                    onChange={(e) => onParamChange('n_abc', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            <div className="flex gap-2 mb-4">
                 <button onClick={onStart} className="flex-1 py-2 bg-green-600/80 rounded hover:bg-green-500 font-bold text-sm">▶ INICIAR</button>
                 <button onClick={onPause} className="flex-1 py-2 bg-yellow-600/80 rounded hover:bg-yellow-500 font-bold text-sm">⏸ PAUSAR</button>
                 <button onClick={onReset} className="flex-1 py-2 bg-red-600/80 rounded hover:bg-red-500 font-bold text-sm">↺ REINICIAR</button>
            </div>
            
            <button onClick={onRunAllIAs} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded font-bold mb-6 hover:shadow-lg transition-all">
                🤖 EJECUTAR 7 IAS (AUTÓNOMOS)
            </button>

            {/* User Deductions */}
            <div className="bg-black/30 p-3 rounded border border-white/10 mb-4">
                <label className="text-xs font-bold text-gray-400 mb-2 block">MIS DEDUCCIONES (PARA IA7):</label>
                <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs h-20 text-white mb-2"
                    placeholder="Escribe tus observaciones sobre la geometría o física..."
                    value={deduction}
                    onChange={(e) => setDeduction(e.target.value)}
                />
                <button 
                    onClick={() => { onSaveDeduction(deduction); setDeduction(""); }}
                    className="w-full py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
                >
                    GUARDAR EN MEMORIA COMPARTIDA
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onLoadPreset(PRESETS.planckSoup)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Sopa Planck</button>
                <button onClick={() => onLoadPreset(PRESETS.atomicFormation)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Átomos</button>
                <button onClick={() => onLoadPreset(PRESETS.blackHole)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Agujero Negro</button>
                <button onClick={() => onLoadPreset(PRESETS.lightSpeedTest)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Velocidad Luz</button>
            </div>
        </div>
    );
};

export default ControlPanel;
