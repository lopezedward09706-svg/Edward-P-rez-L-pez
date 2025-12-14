import React, { useState, useEffect, useRef, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import SimulationPanel from './components/SimulationPanel';
import IAPanel from './components/IAPanel';
import ResultsPanel from './components/ResultsPanel';
import { SimulationEngine } from './services/simulationEngine';
import { INITIAL_PARAMETERS, IA_COLORS } from './constants';
import { SimulationParameters, ChatMessage, IAState, GlobalState } from './types';

function App() {
    const [params, setParams] = useState<SimulationParameters>(INITIAL_PARAMETERS);
    const [metrics, setMetrics] = useState<ReturnType<SimulationEngine['getMetrics']>>({
        nodeCount: 0, quarkCount: 0, atomCount: 0, totalEnergy: 0, avgCurvature: 0, temperature: 0,
        dilation: 1, earthTime: 0, rocketTime: 0, earthState: 'a', rocketState: 'a'
    });
    
    // Using refs for mutable simulation state to avoid React render loop overhead
    const engineRef = useRef<SimulationEngine>(new SimulationEngine(INITIAL_PARAMETERS));
    const simulationStateRef = useRef<GlobalState>(engineRef.current.state);

    // AI States
    const [iaStates, setIaStates] = useState<Record<number, IAState>>({
        1: { confidence: 0.5, running: false, results: [] },
        2: { confidence: 0.5, running: false, results: [] },
        3: { confidence: 0.5, running: false, results: [] },
        4: { confidence: 0.5, running: false, results: [], equations: [] },
        5: { confidence: 0.5, running: false, results: [], matter: [] },
        6: { confidence: 0.5, running: false, results: [], coordination: {} },
        7: { confidence: 0.5, running: false, results: [], modifications: [] },
    });

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{
        sender: 'Sistema',
        message: 'Bienvenido al Sistema ABC Evolutivo. Puedes hablar con cualquiera de las 7 IAs especializadas.',
        color: IA_COLORS.system,
        timestamp: new Date()
    }]);

    const [iaLogs, setIaLogs] = useState<Record<number, string[]>>({
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    });

    const [notifications, setNotifications] = useState<string[]>(['Sistema inicializado correctamente.']);
    const [globalConsensus, setGlobalConsensus] = useState(0.5);

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            engineRef.current.update();
            setMetrics(engineRef.current.getMetrics());
            simulationStateRef.current = engineRef.current.state; // Sync ref for canvas
        }, 16); // ~60fps logic update
        return () => clearInterval(interval);
    }, []);

    const updateParams = (key: keyof SimulationParameters, value: number) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        engineRef.current.updateParams({ [key]: value });
    };

    const handleStart = () => { engineRef.current.state.running = true; addNotification('Simulación iniciada.'); };
    const handlePause = () => { engineRef.current.state.running = false; addNotification('Simulación pausada.'); };
    const handleReset = () => { engineRef.current.reset(); setParams(engineRef.current.state.parameters); addNotification('Simulación reiniciada.'); };
    const handleLoadPreset = (preset: SimulationParameters) => {
        setParams(preset);
        engineRef.current.updateParams(preset);
        engineRef.current.reset(); // usually presets imply a fresh start with those params
        engineRef.current.state.running = true;
        addNotification('Preset cargado.');
    };

    const addNotification = (msg: string) => {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setNotifications(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
    };

    const addLog = (iaId: number, msg: string, color: string) => {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const html = `<span style="color: #888;">[${time}]</span> <span style="color: ${color};">${msg}</span>`;
        setIaLogs(prev => ({ ...prev, [iaId]: [...(prev[iaId] || []), html].slice(-20) }));
    };

    const updateIAState = (id: number, partial: Partial<IAState>) => {
        setIaStates(prev => ({ ...prev, [id]: { ...prev[id], ...partial } }));
    };

    // Chat Logic
    const handleSendMessage = (msg: string) => {
        const newMsg: ChatMessage = { sender: 'Tú', message: msg, color: IA_COLORS.user, timestamp: new Date() };
        setChatHistory(prev => [...prev, newMsg]);

        // Simple Simulated Response Logic
        setTimeout(() => {
            let targetIA = 0;
            for(let i=1; i<=7; i++) {
                if (msg.toLowerCase().includes(`ia${i}`) || msg.toLowerCase().includes(`ia ${i}`)) {
                    targetIA = i; break;
                }
            }
            
            let responseMsg = '';
            let sender = 'Sistema';
            let color = IA_COLORS.system;

            if (targetIA > 0) {
                sender = `IA${targetIA}`;
                color = IA_COLORS[`ia${targetIA}` as keyof typeof IA_COLORS];
                responseMsg = `IA${targetIA} aquí. He recibido tu solicitud: "${msg.substring(0, 20)}..."`;
            } else {
                const responses = [
                    "He recibido tu mensaje. ¿En qué puedo ayudarte?",
                    "Procesando tu consulta. Las 7 IAs están disponibles.",
                    "Sistema operativo. Menciona a una IA específica para interactuar directamente."
                ];
                responseMsg = responses[Math.floor(Math.random() * responses.length)];
            }

            setChatHistory(prev => [...prev, { sender, message: responseMsg, color, timestamp: new Date() }]);
        }, 500);
    };

    // IA Logic Functions (Simulated)
    const runIA = async (id: number, args?: string) => {
        updateIAState(id, { running: true });
        const color = IA_COLORS[`ia${id}` as keyof typeof IA_COLORS];
        
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        switch(id) {
            case 1: // Experimental
                addLog(1, '🔬 Iniciando validación experimental...', color);
                await delay(800);
                const chargeMatch = Math.random() > 0.1 ? 0.95 : 0.8;
                updateIAState(1, { running: false, confidence: chargeMatch });
                addLog(1, `✅ Validación completada: ${(chargeMatch*100).toFixed(1)}%`, color);
                break;
            case 2: // Theoretical
                addLog(2, '🧮 Iniciando análisis teórico...', color);
                await delay(600);
                const symScore = 0.9;
                updateIAState(2, { running: false, confidence: symScore });
                addLog(2, `✅ Análisis completado. Simetrías: ${(symScore*100).toFixed(1)}%`, color);
                break;
            case 3: // Observer
                addLog(3, '👁️ Iniciando evaluación independiente...', color);
                await delay(1000);
                updateIAState(3, { running: false, confidence: 0.88 });
                addLog(3, `✅ Evaluación: Consenso estable`, color);
                break;
            case 4: // Seeker
                addLog(4, '🔍 Buscando constantes fundamentales...', color);
                await delay(1200);
                const eqs = ["G_μν + Λg_μν = 8πGT_μν/c⁴", "E = mc²"];
                updateIAState(4, { running: false, confidence: 0.92, equations: eqs });
                addLog(4, `✅ ${eqs.length} ecuaciones encontradas`, color);
                break;
            case 5: // Integrator
                addLog(5, '⚛️ Integrando materia...', color);
                await delay(1200);
                updateIAState(5, { running: false, confidence: 0.85 });
                addLog(5, `✅ Materia generada: ${engineRef.current.state.atoms.length} átomos`, color);
                break;
            case 6: // Mediator
                addLog(6, '🤝 Coordinando IAs...', color);
                await delay(500);
                updateIAState(6, { running: false, confidence: 0.98 });
                addLog(6, `✅ Sincronización completa`, color);
                break;
            case 7: // Programmer
                if (!args) {
                    addLog(7, '❌ Error: Falta instrucción', color);
                    updateIAState(7, { running: false });
                    return;
                }
                addLog(7, `💻 Modificando código: "${args}"`, color);
                await delay(1500);
                updateIAState(7, { running: false, confidence: 0.7 });
                addLog(7, `✅ Modificación aplicada`, color);
                addNotification(`IA7 aplicó parche: ${args}`);
                break;
        }

        // Update Consensus
        setTimeout(() => {
            let total = 0;
            let count = 0;
            Object.values(iaStates).forEach(s => { 
                const state = s as IAState;
                total += state.confidence; 
                count++; 
            });
            setGlobalConsensus(total / count);
        }, 100);
    };

    const handleRunAllIAs = async () => {
        addNotification('Ejecutando las 7 IAs simultáneamente...');
        // Simple sequential trigger for effect
        for(let i=1; i<=6; i++) {
            runIA(i);
            await new Promise(r => setTimeout(r, 200));
        }
    };

    const handleExport = () => {
        const data = {
            timestamp: new Date().toISOString(),
            params,
            metrics,
            iaStates
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abc_simulation_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addNotification('Resultados exportados.');
    };

    return (
        <div className="container mx-auto p-4 max-w-[1920px]">
            <div className="text-center mb-6 p-6 bg-glass rounded-2xl border border-white/10 shadow-2xl shadow-blue-900/20">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
                    🌀 Simulador ABC Evolutivo - 7 IAs Especializadas
                </h1>
                <p className="text-gray-300">Sistema Cuántico-Cosmológico con Generación de Materia Emergente</p>
                <div className="flex justify-center gap-4 mt-4 text-xs font-semibold">
                    {[
                        {c: 'bg-ia1', t: 'IA1: Exp'}, {c: 'bg-ia2', t: 'IA2: Teó'}, {c: 'bg-ia3', t: 'IA3: Obs'},
                        {c: 'bg-ia4', t: 'IA4: Bus'}, {c: 'bg-ia5', t: 'IA5: Int'}, {c: 'bg-ia6', t: 'IA6: Med'}, {c: 'bg-ia7', t: 'IA7: Pro'}
                    ].map((badge, i) => (
                         <div key={i} className="flex items-center gap-1">
                             <span className={`w-2 h-2 rounded-full ${badge.c}`}></span>
                             <span>{badge.t}</span>
                         </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_380px] gap-4 min-h-[800px]">
                <ControlPanel 
                    params={params} 
                    onParamChange={updateParams} 
                    onStart={handleStart}
                    onPause={handlePause}
                    onReset={handleReset}
                    onRunAllIAs={handleRunAllIAs}
                    onLoadPreset={handleLoadPreset}
                />
                
                <SimulationPanel 
                    metrics={metrics}
                    simulationStateRef={simulationStateRef}
                />

                <IAPanel 
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    onRunIA={runIA}
                    iaLogs={iaLogs}
                />
            </div>

            <ResultsPanel 
                iaStates={iaStates}
                globalConsensus={globalConsensus}
                notifications={notifications}
                onExport={handleExport}
            />

            <div className="text-center mt-8 text-white/50 text-sm pb-4">
                <div>🌀 SIMULADOR ABC EVOLUTIVO v3.0 - TEORÍA DE REDES TRIANGULARES CUÁNTICAS</div>
                <div className="mt-1">a = +6/9 e (0.666...), b = -2/9 e (-0.222...), c = -1/9 e (-0.111...)</div>
            </div>
        </div>
    );
}

export default App;