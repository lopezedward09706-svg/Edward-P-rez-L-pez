import React from 'react';
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
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    params, onParamChange, onStart, onPause, onReset, onRunAllIAs, onLoadPreset 
}) => {
    
    const renderSlider = (
        label: string, 
        id: keyof SimulationParameters, 
        min: number, 
        max: number, 
        step: number, 
        displayValue: string | number
    ) => (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1 text-gray-300">
                <span>{label}</span>
                <span className="text-blue-300">{displayValue}</span>
            </div>
            <input 
                type="range" 
                min={min} max={max} step={step} 
                value={params[id]}
                onChange={(e) => onParamChange(id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
        </div>
    );

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-full overflow-y-auto">
            <h3 className="text-lg font-semibold border-b-2 border-white/20 pb-2 mb-4">🎛️ PARÁMETROS ABC</h3>
            
            {renderSlider('Escala', 'scale', 0, 8, 1, SCALE_LABELS[params.scale])}
            {renderSlider('Masa Central (log)', 'mass', -5, 5, 0.1, params.mass.toFixed(1))}
            {renderSlider('Velocidad (% c)', 'velocity', 0, 99, 1, `${params.velocity}%`)}
            {renderSlider('Densidad', 'density', 0.3, 3, 0.1, params.density.toFixed(1))}
            {renderSlider('N_abc (Triadas)', 'n_abc', 1, 9, 1, params.n_abc)}
            {renderSlider('Energía Fuerte', 'strongEnergy', 0.1, 10, 0.1, params.strongEnergy.toFixed(1))}
            {renderSlider('Energía Débil', 'weakEnergy', 0.001, 1, 0.001, params.weakEnergy.toFixed(3))}
            {renderSlider('Radio/π', 'radioPi', 0.1, 3, 0.1, params.radioPi.toFixed(1))}

            <div className="space-y-2 mt-4">
                <button onClick={onStart} className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">▶ INICIAR SIMULACIÓN</button>
                <button onClick={onPause} className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-md font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">⏸ PAUSAR</button>
                <button onClick={onReset} className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">🔄 REINICIAR TODO</button>
                <button onClick={onRunAllIAs} className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-md font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">🤖 EJECUTAR 7 IAS</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
                {Object.entries(PRESETS).map(([key, preset]) => (
                    <button 
                        key={key}
                        onClick={() => onLoadPreset(preset)}
                        className="p-2 text-xs bg-gradient-to-br from-purple-700 to-indigo-800 rounded hover:from-purple-600 hover:to-indigo-700 transition-colors uppercase font-semibold tracking-wider"
                    >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ControlPanel;