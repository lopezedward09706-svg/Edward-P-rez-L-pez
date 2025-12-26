
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SimulationEngine } from './services/simulationEngine';
import ControlPanel from './components/ControlPanel';
import SimulationPanel from './components/SimulationPanel';
import IAPanel from './components/IAPanel';
import ResultsPanel from './components/ResultsPanel';
import { INITIAL_PARAMETERS } from './constants';
import { GlobalState, ChatMessage, SimulationParameters, IAState, LogEntry, Severity, TaskType } from './types';

const App: React.FC = () => {
    const engineRef = useRef<SimulationEngine>(new SimulationEngine(INITIAL_PARAMETERS));
    const simulationStateRef = useRef<GlobalState>(engineRef.current.state);

    const [params, setParams] = useState<SimulationParameters>(INITIAL_PARAMETERS);
    const [metrics, setMetrics] = useState(engineRef.current.getMetrics());
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [iaLogs, setIaLogs] = useState<Record<number, LogEntry[]>>({});
    const [iaStates, setIaStates] = useState<Record<number, IAState>>({});
    const [notifications, setNotifications] = useState<string[]>([]);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        const initStates: Record<number, IAState> = {};
        for(let i=1; i<=8; i++) initStates[i] = { confidence: 0.5, running: false, status: 'idle' };
        setIaStates(initStates);
    }, []);

    useEffect(() => {
        let id: number;
        const loop = () => {
            if (running) {
                engineRef.current.update();
                const m = engineRef.current.getMetrics();
                setMetrics(m);
                simulationStateRef.current = engineRef.current.state;

                const logs = engineRef.current.state.sharedMemory.evolutionLogs;
                if (logs.length > 0) {
                    const l = logs.shift();
                    if (l) {
                        setNotifications(n => [l, ...n].slice(0, 10));
                        if (l.includes("COLAPSO")) addLog(8, l, "INFO", "COLLAPSE", "WAVE_FUNCTION_REDUCTION");
                        if (l.includes("Transición")) addLog(6, l, "INFO", "OPTIMIZATION", "PHASE_SHIFT");
                    }
                }
            }
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [running]);

    const addLog = (iaId: number, text: string, severity: Severity, taskType: TaskType, tag: string) => {
        const entry: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            text, severity, taskType, tag, iaId
        };
        setIaLogs(prev => ({ ...prev, [iaId]: [...(prev[iaId] || []), entry].slice(-50) }));
    };

    const runIA = async (id: number, args?: string) => {
        setIaStates(s => ({ ...s, [id]: { ...s[id], running: true, status: 'scanning' } }));
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const m = metrics;
        const state = simulationStateRef.current;
        let prompt = "";
        let taskType: TaskType = 'ANALYSIS';

        // Definición de roles específicos para el prompt
        switch(id) {
            case 1:
                taskType = 'ANALYSIS';
                prompt = `IA1 [EXPERIMENTAL]: Analiza la densidad actual (${params.density}) y la energía fuerte (${params.strongEnergy}). ¿Son consistentes los datos experimentales con la fase ${m.phase}?`;
                break;
            case 2:
                taskType = 'GENERATION';
                prompt = `IA2 [TEÓRICA]: Basado en la rigidez k=${m.currentRigidity.toFixed(3)}, propone una extensión a las leyes de torsión de nudo para la fase ${m.phase}.`;
                break;
            case 3:
                taskType = 'OBSERVATION';
                const userText = state.sharedMemory.userDeductions || "Sin datos.";
                prompt = `IA3 [CONSENSO]: Valida científicamente esta deducción del usuario: "${userText}". 
                Contexto: Fase ${m.phase}, Entropía ${m.entropy.toFixed(4)}, Coherencia ${m.quantumCoherence.toFixed(4)}. 
                Determina si es una observación válida bajo la Teoría ABC.`;
                break;
            case 5:
                taskType = 'CODE_SCAN';
                prompt = `IA5 [AUDITOR]: Escanea la lógica del motor de simulación. Estado: k=${m.currentRigidity.toFixed(2)}, escala=${params.scale}. 
                Busca anomalías de integridad. Si encuentras algo, responde con 'ACTION_IA7: [instrucción]' para repararlo.`;
                break;
            case 6:
                taskType = 'OPTIMIZATION';
                prompt = `IA6 [MEDIADOR]: Sugiere ajustes para los parámetros lambda y radioPi para maximizar la estabilidad en la fase ${m.phase}.`;
                break;
            case 7:
                taskType = 'CORRECTION';
                const pending = state.sharedMemory.pendingActions.join(", ") || "Ninguna";
                prompt = `IA7 [PROGRAMADOR]: Ejecuta correcciones sobre el motor. Acciones pendientes: ${pending}. Describe el parche lógico que aplicarías.`;
                break;
            case 8:
                taskType = 'ENTANGLEMENT';
                prompt = `IA8 [CUÁNTICA]: Analiza el entrelazamiento cuántico (Índice: ${m.entanglementIndex.toFixed(4)}) y el nivel de coherencia (${m.quantumCoherence.toFixed(4)}).`;
                break;
            default:
                prompt = `IA${id}: Reporte general del sistema en fase ${m.phase}.`;
        }

        try {
            const resp = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            const text = resp.text || "Análisis completado sin observaciones adicionales.";
            
            // Post-procesamiento de IA5 para generar acciones para IA7
            if (id === 5 && text.includes("ACTION_IA7:")) {
                const action = text.split("ACTION_IA7:")[1].split("\n")[0].trim();
                state.sharedMemory.pendingActions.push(action);
                addLog(5, `⚠️ IA5 detectó vulnerabilidad lógica: Generando orden de reparación -> ${action}`, "WARN", "CODE_SCAN", "SYS_INTEGRITY");
            }

            const confidenceScore = 0.75 + Math.random() * 0.22;
            setIaStates(s => ({ ...s, [id]: { ...s[id], running: false, lastResponse: text, confidence: confidenceScore, status: 'idle' } }));
            
            if (id !== 5 || !text.includes("ACTION_IA7:")) {
                addLog(id, "Reporte neuronal procesado con éxito.", "INFO", taskType, "SUCCESS");
            }

        } catch (e) {
            setIaStates(s => ({ ...s, [id]: { ...s[id], running: false, status: 'error' } }));
            addLog(id, "Fallo en la sincronización del modelo. Error de red neuronal.", "ERROR", taskType, "API_FAILURE");
        }
    };

    return (
        <div className="flex h-screen bg-[#02020a] text-white p-2 gap-2 overflow-hidden font-sans">
            <div className="w-80 flex flex-col gap-2">
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-[55%] overflow-y-auto custom-scrollbar shadow-2xl">
                    <ControlPanel params={params} 
                        onParamChange={(k, v) => { engineRef.current.updateParams({[k]: v}); setParams({...params, [k]: v}); }} 
                        onStart={() => setRunning(true)} 
                        onPause={() => setRunning(false)} 
                        onReset={() => { engineRef.current.reset(); setRunning(false); }} 
                        onRunAllIAs={() => [1,2,3,4,5,6,7,8].forEach(id => runIA(id))} 
                        onLoadPreset={p => { if(p) { setParams(p); engineRef.current.updateParams(p); } }} 
                        onSaveDeduction={d => { simulationStateRef.current.sharedMemory.userDeductions = d; }} 
                    />
                </div>
                <ResultsPanel iaStates={iaStates} globalConsensus={metrics.coherenceLevel} notifications={notifications} onExport={() => {}} />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1">
                    <SimulationPanel metrics={metrics} simulationStateRef={simulationStateRef} />
                </div>
                <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-3 text-[10px] font-mono flex items-center justify-between shadow-2xl">
                    <div className="flex gap-6 overflow-x-auto whitespace-nowrap z-10 custom-scrollbar-h">
                        <span className="text-cyan-400 uppercase font-black">Fase: {metrics.phase}</span>
                        <span className="text-pink-400">Coherencia Ψ: {metrics.quantumCoherence.toFixed(4)}</span>
                        <span className="text-orange-400">Rigidez k: {metrics.currentRigidity.toFixed(3)}</span>
                        <span className="text-yellow-400">Quarks Formados: {simulationStateRef.current.quarks.length}</span>
                        <span className="text-ia7">Parches IA7: {simulationStateRef.current.sharedMemory.pendingActions.length}</span>
                    </div>
                </div>
            </div>
            <div className="w-80">
                <IAPanel chatHistory={chatHistory} onSendMessage={m => setChatHistory([...chatHistory, {sender:'Usuario', message:m, color:'#fff', timestamp:new Date()}])} onRunIA={runIA} iaLogs={iaLogs} userDeductions={simulationStateRef.current.sharedMemory.userDeductions} />
            </div>
        </div>
    );
};

export default App;
