
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, LogEntry, Severity, TaskType } from '../types';
import { IA_COLORS } from '../constants';

interface IAPanelProps {
    chatHistory: ChatMessage[];
    onSendMessage: (msg: string) => void;
    onRunIA: (id: number, args?: string) => void;
    iaLogs: Record<number, LogEntry[]>;
    userDeductions?: string;
}

const TaskTypeStyles: Record<TaskType, string> = {
    ANALYSIS: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    GENERATION: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    CORRECTION: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    CODE_SCAN: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    ENTANGLEMENT: 'text-green-400 border-green-500/30 bg-green-500/5',
    OBSERVATION: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    OPTIMIZATION: 'text-teal-400 border-teal-500/30 bg-teal-500/5',
    COLLAPSE: 'text-pink-400 border-pink-500/30 bg-pink-500/5',
};

const IAPanel: React.FC<IAPanelProps> = ({ chatHistory, onSendMessage, onRunIA, iaLogs, userDeductions }) => {
    const [activeTab, setActiveTab] = useState<'chat' | number>('chat');
    const [input, setInput] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<Severity | 'ALL'>('ALL');
    const [filterTask, setFilterTask] = useState<TaskType | 'ALL'>('ALL');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, activeTab]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [iaLogs, activeTab, filterSeverity, filterTask]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    const IATabs = [
        { id: 1, name: 'IA1', label: 'IA1: EXPERIMENTAL', color: 'text-ia1', bg: 'bg-ia1', desc: 'Valida predicciones con datos experimentales simulados.', action: 'EJECUTAR VALIDACIÓN' },
        { id: 2, name: 'IA2', label: 'IA2: TEÓRICA', color: 'text-ia2', bg: 'bg-ia2', desc: 'Analiza consistencia matemática y simetrías.', action: 'ANALIZAR CONSISTENCIA' },
        { id: 3, name: 'IA3', label: 'IA3: OBSERVADOR', color: 'text-ia3', bg: 'bg-ia3', desc: 'Analiza telemetría y valida científicamente las deducciones del usuario.', action: 'VALIDAR HIPÓTESIS', showDeduction: true },
        { id: 4, name: 'IA4', label: 'IA4: BUSCADOR', color: 'text-ia4', bg: 'bg-ia4', desc: 'Genera y prueba ecuaciones para encontrar constantes.', action: 'BUSCAR CONSTANTES' },
        { id: 5, name: 'IA5', label: 'IA5: AUDITOR', color: 'text-ia5', bg: 'bg-ia5', desc: 'Escanea la integridad del código base y genera órdenes de reparación.', action: 'AUDITAR SISTEMA' },
        { id: 6, name: 'IA6', label: 'IA6: MEDIADOR', color: 'text-ia6', bg: 'bg-ia6', desc: 'Analiza estado y sugiere ajustes de parámetros óptimos.', action: 'OPTIMIZAR PARÁMETROS' },
        { id: 7, idStr: 'ia7', name: 'IA7', label: 'IA7: PROGRAMADOR', color: 'text-ia7', bg: 'bg-ia7', desc: 'Analiza archivos específicos y propone parches de código lógicos.', action: 'EJECUTAR MODIFICACIÓN', hasInput: true },
        { id: 8, name: 'IA8', label: 'IA8: CUÁNTICA', color: 'text-ia8', bg: 'bg-ia8', desc: 'Simula entrelazamiento cuántico y colapso de función de onda.', action: 'ANALIZAR CUÁNTICA' },
    ];

    const getSeverityColor = (sev: Severity) => {
        switch(sev) {
            case 'ERROR': return 'text-red-500 border-red-500/50 bg-red-500/5';
            case 'WARN': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/5';
            case 'INFO': return 'text-blue-400 border-blue-400/50 bg-blue-400/5';
            default: return 'text-white border-white/20';
        }
    };

    const taskTypes: (TaskType | 'ALL')[] = [
        'ALL', 'ANALYSIS', 'GENERATION', 'CORRECTION', 'CODE_SCAN', 'ENTANGLEMENT', 'OBSERVATION', 'OPTIMIZATION', 'COLLAPSE'
    ];

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-full overflow-hidden">
             <div className="flex flex-wrap gap-1 mb-4">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 px-1 py-1.5 text-[9px] font-bold rounded border ${activeTab === 'chat' ? 'bg-blue-500/30 border-blue-400' : 'bg-black/30 border-white/10 hover:bg-white/10'}`}
                >
                    💬 CHAT
                </button>
                {IATabs.map(ia => (
                    <button 
                        key={ia.id}
                        onClick={() => setActiveTab(ia.id)}
                        className={`flex-1 px-1 py-1.5 text-[9px] font-bold rounded border transition-all ${activeTab === ia.id ? `bg-white/10 border-white scale-105` : 'bg-black/30 border-white/10 hover:bg-white/10'}`}
                        style={{ color: activeTab === ia.id ? undefined : IA_COLORS[`ia${ia.id}` as keyof typeof IA_COLORS] }}
                    >
                        IA{ia.id}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {activeTab === 'chat' ? (
                    <>
                        <div className="flex-1 overflow-y-auto bg-black/30 rounded-lg p-3 border border-white/10 space-y-2 custom-scrollbar">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className="text-sm animate-in fade-in slide-in-from-bottom-1">
                                    <strong style={{ color: msg.color }}>{msg.sender}:</strong> <span className="text-gray-200">{msg.message}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 bg-black/40 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                            />
                            <button onClick={handleSend} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">📤</button>
                        </div>
                    </>
                ) : (
                    (() => {
                        const ia = IATabs.find(t => t.id === activeTab);
                        if (!ia) return null;
                        const logs = (iaLogs[ia.id] || []).filter(l => 
                            (filterSeverity === 'ALL' || l.severity === filterSeverity) &&
                            (filterTask === 'ALL' || l.taskType === filterTask)
                        );

                        return (
                            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                                <h4 className={`text-lg font-black mb-1 flex items-center gap-2 ${ia.color}`}>
                                    <span className={`w-2 h-2 rounded-full ${ia.bg}`}></span>
                                    {ia.label}
                                </h4>
                                <p className="text-[11px] text-gray-400 mb-4 leading-tight">{ia.desc}</p>
                                
                                {ia.showDeduction && (
                                    <div className="mb-4 p-3 bg-ia3/10 border border-ia3/20 rounded-lg shadow-inner">
                                        <div className="text-[9px] font-black text-ia3 uppercase tracking-tighter mb-1.5 flex justify-between items-center opacity-80">
                                            <span>🎯 Memoria de Trabajo del Observador</span>
                                            {userDeductions ? <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ia3 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-ia3"></span>
                                            </span> : null}
                                        </div>
                                        <div className="text-[11px] text-gray-300 italic leading-relaxed">
                                            {userDeductions || "Esperando entrada de datos Planck..."}
                                        </div>
                                    </div>
                                )}

                                {ia.hasInput && (
                                    <input 
                                        type="text" 
                                        id="ia-target-input"
                                        placeholder={ia.id === 7 ? "Módulo o archivo a parchear..." : "Instrucción específica..."}
                                        className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-xs mb-2 focus:border-white/50 outline-none transition-colors font-mono"
                                    />
                                )}

                                <button 
                                    onClick={() => {
                                        const argInput = document.getElementById('ia-target-input') as HTMLInputElement;
                                        const arg = ia.hasInput ? argInput.value : undefined;
                                        onRunIA(ia.id, arg);
                                        if (argInput) argInput.value = '';
                                    }}
                                    className={`w-full py-2 mb-4 rounded font-black text-[10px] tracking-widest text-black hover:brightness-110 transition-all active:scale-95 ${ia.bg}`}
                                >
                                    {ia.action}
                                </button>

                                <div className="space-y-2 mb-3">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Nivel:</span>
                                        {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(sev => (
                                            <button 
                                                key={sev}
                                                onClick={() => setFilterSeverity(sev)}
                                                className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-bold border transition-all ${filterSeverity === sev ? 'bg-white/20 border-white/40 shadow-glow' : 'bg-black/40 border-white/10 hover:bg-white/5 opacity-60'}`}
                                            >
                                                {sev}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Tarea:</span>
                                        {taskTypes.map(tt => (
                                            <button 
                                                key={tt}
                                                onClick={() => setFilterTask(tt)}
                                                className={`px-1 py-0.5 rounded-[4px] text-[7px] font-bold border transition-all truncate max-w-[60px] ${filterTask === tt ? 'bg-white/20 border-white/40' : 'bg-black/40 border-white/5 hover:bg-white/5 opacity-60'}`}
                                                title={tt}
                                            >
                                                {tt === 'ALL' ? 'ALL' : tt.split('_')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 bg-black/40 rounded-lg p-2 border border-white/10 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar">
                                    {logs.map((log, i) => (
                                        <div key={i} className="p-2 bg-white/[0.02] border border-white/5 rounded hover:bg-white/[0.04] transition-colors group">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-500 text-[7px] font-bold">{log.timestamp}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-[3px] text-[7px] font-black border uppercase ${getSeverityColor(log.severity)}`}>
                                                        {log.severity}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded-[3px] text-[7px] font-black border uppercase ${TaskTypeStyles[log.taskType]}`}>
                                                        {log.taskType}
                                                    </span>
                                                </div>
                                                <span className="text-white/20 group-hover:text-white/40 text-[7px] font-black">#{log.tag}</span>
                                            </div>
                                            <div className="text-gray-300 leading-normal pl-1.5 border-l-2 border-white/10 group-hover:border-white/30 transition-all">
                                                {log.text}
                                            </div>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <div className="text-center text-gray-600 italic py-12 flex flex-col items-center gap-2">
                                            <span className="text-lg opacity-20">📡</span>
                                            <span>No se encontraron registros coincidentes.</span>
                                        </div>
                                    )}
                                    <div ref={logEndRef} />
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
};

export default IAPanel;
