import React from 'react';
import { IAState } from '../types';
import { IA_COLORS } from '../constants';

interface ResultsPanelProps {
    iaStates: Record<number, IAState>;
    globalConsensus: number;
    notifications: string[];
    onExport: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ iaStates, globalConsensus, notifications, onExport }) => {
    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 mt-5">
            <h3 className="text-xl font-bold border-b-2 border-white/20 pb-3 mb-5 flex items-center">
                📊 RESULTADOS COMBINADOS & DESCUBRIMIENTOS
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                     <div>
                        <div className="text-sm font-semibold mb-2">🎯 CONSENSO GLOBAL:</div>
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 transition-all duration-1000"
                                style={{ width: `${globalConsensus * 100}%` }}
                            />
                        </div>
                        <div className="text-right text-xs mt-1 text-gray-400">{(globalConsensus * 100).toFixed(1)}%</div>
                     </div>

                     <div className="bg-black/30 rounded-lg p-4 min-h-[150px] space-y-2">
                        <div className="text-cyan-400 font-bold text-sm mb-2">📊 RESULTADOS COMBINADOS:</div>
                        {Object.entries(iaStates).map(([key, state]) => {
                            const id = parseInt(key);
                            const s = state as IAState;
                            const conf = (s.confidence * 100).toFixed(1);
                            const color = s.confidence > 0.7 ? 'text-green-400' : s.confidence > 0.4 ? 'text-orange-400' : 'text-red-400';
                            return (
                                <div key={key} className="text-sm flex justify-between border-b border-white/5 pb-1">
                                    <span style={{ color: IA_COLORS[`ia${id}` as keyof typeof IA_COLORS] }}>IA{id}:</span>
                                    <span className={color}>{conf}% de confianza</span>
                                </div>
                            );
                        })}
                     </div>
                     
                     <button 
                        onClick={onExport}
                        className="px-6 py-2 bg-gradient-to-r from-teal-600 to-green-600 rounded font-bold hover:shadow-lg transition-transform hover:-translate-y-0.5 text-sm"
                     >
                        📥 EXPORTAR RESULTADOS (.txt)
                     </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-black/30 rounded-lg p-4">
                         <div className="text-sm font-bold mb-3">⚡ ESTADO DE LAS IAS:</div>
                         {Object.entries(iaStates).map(([key, state]) => {
                             const id = parseInt(key);
                             const s = state as IAState;
                             const status = s.running ? '🟡 Ejecutando...' : s.confidence > 0.7 ? '🟢 Alta confianza' : '🔴 Baja confianza';
                             return (
                                 <div key={key} className="flex justify-between text-xs mb-1.5">
                                     <span style={{ color: IA_COLORS[`ia${id}` as keyof typeof IA_COLORS] }}>IA{id} Experimental:</span>
                                     <span>{status}</span>
                                 </div>
                             );
                         })}
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 flex flex-col h-40">
                        <div className="text-sm font-bold mb-2">🔔 NOTIFICACIONES:</div>
                        <div className="flex-1 overflow-y-auto text-xs space-y-1 text-orange-400 font-mono">
                            {notifications.map((note, i) => (
                                <div key={i}>{note}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsPanel;