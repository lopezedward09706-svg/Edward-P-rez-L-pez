
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SimulationEngine } from './services/simulationEngine';
import ControlPanel from './components/ControlPanel';
import SimulationPanel from './components/SimulationPanel';
import IAPanel from './components/IAPanel';
import ResultsPanel from './components/ResultsPanel';
import { INITIAL_PARAMETERS, IA_COLORS } from './constants';
import { GlobalState, ChatMessage, SimulationParameters, IAState } from './types';

const App: React.FC = () => {
    const engineRef = useRef<SimulationEngine>(new SimulationEngine(INITIAL_PARAMETERS));
    const simulationStateRef = useRef<GlobalState>(engineRef.current.state);

    const [params, setParams] = useState<SimulationParameters>(INITIAL_PARAMETERS);
    const [metrics, setMetrics] = useState(engineRef.current.getMetrics());
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [iaLogs, setIaLogs] = useState<Record<number, string[]>>({});
    const [iaStates, setIaStates] = useState<Record<number, IAState>>({});
    const [globalConsensus, setGlobalConsensus] = useState(0.0);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [running, setRunning] = useState(false);

    // Initialize IA states
    useEffect(() => {
        const initialStates: Record<number, IAState> = {};
        for(let i=1; i<=7; i++) {
            initialStates[i] = { confidence: 0.0, running: false, results: [], status: 'idle' };
        }
        setIaStates(initialStates);
    }, []);

    // Animation Loop
    useEffect(() => {
        let animationId: number;
        const animate = () => {
            if (running) {
                engineRef.current.update();
                setMetrics(engineRef.current.getMetrics());
                simulationStateRef.current = engineRef.current.state;
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationId);
    }, [running]);

    // --- AUTONOMOUS AI LOOPS ---
    useEffect(() => {
        if (!running) return;

        // IA6: The Scanner (Mediator)
        // Checks simulation health every 5 seconds
        const ia6Interval = setInterval(() => {
            const m = engineRef.current.getMetrics();
            const memory = engineRef.current.state.sharedMemory;
            
            // Logic: Scan for physical anomalies
            const anomalies = [];
            if (m.meanEnergy > 10e10 || isNaN(m.meanEnergy)) anomalies.push("Energy Divergence Detected");
            if (m.nodeCount < 10) anomalies.push("Matter Collapse Risk");
            if (m.entropy < 0) anomalies.push("Entropy Violation (Negative)");

            if (anomalies.length > 0) {
                const errorMsg = `[IA6 SCAN] Anomalies: ${anomalies.join(', ')}`;
                memory.errors.push(errorMsg);
                addLog(6, errorMsg, "WARN", "SCAN");
                setNotifications(prev => [errorMsg, ...prev].slice(0, 5));
            } else {
                // Occasional healthy check log
                if (Math.random() < 0.2) addLog(6, "System Nominal. Geometry Stable.", "INFO", "CHECK");
            }
        }, 5000);

        // IA7: The Repairer
        // Checks shared memory for errors every 7 seconds
        const ia7Interval = setInterval(() => {
            const memory = engineRef.current.state.sharedMemory;
            if (memory.errors.length > 0) {
                const error = memory.errors.shift(); // Take oldest error
                addLog(7, `Attempting repair for: ${error}`, "WARN", "FIX");
                
                // Simulate "Self-Repair" logic
                if (error?.includes("Energy")) {
                    // Fix: Reduce time speed or mass
                    engineRef.current.updateParams({ timeSpeed: 0.5 });
                    const fixMsg = "Applied Patch: Reduced Time Dilation Factor to stabilize Energy.";
                    memory.patches.push(fixMsg);
                    addLog(7, fixMsg, "SUCCESS", "PATCH");
                    setNotifications(prev => [fixMsg, ...prev].slice(0, 5));
                } else if (error?.includes("Matter")) {
                    engineRef.current.updateParams({ n_abc: params.n_abc + 20 });
                    const fixMsg = "Applied Patch: Injected Mass (N_abc increased).";
                    memory.patches.push(fixMsg);
                    addLog(7, fixMsg, "SUCCESS", "PATCH");
                } else {
                    // Unknown error -> Request Human Help
                    const helpMsg = `IA7 LIMITATION: Cannot fix '${error}'. User deduction required.`;
                    setNotifications(prev => [helpMsg, ...prev].slice(0, 5));
                    addLog(7, helpMsg, "ERROR", "ESCALATE");
                    setChatHistory(prev => [...prev, {
                        sender: 'IA7',
                        message: `Critical Error: ${error}. I cannot resolve this algorithmically. Please input your deduction in the Control Panel.`,
                        color: IA_COLORS.ia7,
                        timestamp: new Date()
                    }]);
                }
            } else if (memory.userDeductions) {
                // Process User Deduction
                const ded = memory.userDeductions;
                addLog(7, `Compiling User Deduction: "${ded.substring(0, 20)}..."`, "INFO", "COMPILE");
                memory.userDeductions = ""; // Clear
                // Simulate applying user logic
                addLog(7, "User Logic Integrated into core loop.", "SUCCESS", "UPDATE");
            }
        }, 7000);

        return () => {
            clearInterval(ia6Interval);
            clearInterval(ia7Interval);
        };
    }, [running, params.n_abc]);

    const addLog = (iaId: number, text: string, type: string, tag: string) => {
        const time = new Date().toLocaleTimeString();
        const colorClass = type === 'ERROR' ? 'text-red-400' : type === 'WARN' ? 'text-orange-400' : type === 'SUCCESS' ? 'text-green-400' : 'text-blue-400';
        const html = `<span class="text-gray-500">[${time}]</span> <span class="${colorClass} font-bold">[${tag}]</span> ${text}`;
        setIaLogs(prev => ({
            ...prev,
            [iaId]: [...(prev[iaId] || []), html].slice(-20)
        }));
    };

    const handleParamChange = (key: keyof SimulationParameters, value: number) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        engineRef.current.updateParams(newParams);
    };

    const handleStart = () => {
        engineRef.current.state.running = true;
        setRunning(true);
    };

    const handlePause = () => {
        engineRef.current.state.running = false;
        setRunning(false);
    };

    const handleReset = () => {
        engineRef.current.reset();
        setParams(INITIAL_PARAMETERS);
        setRunning(false);
        setMetrics(engineRef.current.getMetrics());
        setNotifications([]);
        setChatHistory([]);
    };

    const handleRunAllIAs = () => {
        // Trigger all IAs to do a manual "Sweep"
        for(let i=1; i<=7; i++) runIA(i);
    };

    const handleLoadPreset = (preset: SimulationParameters) => {
        setParams(preset);
        engineRef.current.updateParams(preset);
        setMetrics(engineRef.current.getMetrics());
    };

    const handleSaveDeduction = (text: string) => {
        if (!text) return;
        engineRef.current.state.sharedMemory.userDeductions = text;
        addLog(6, "New User Deduction received in Shared Memory.", "INFO", "INPUT");
        setNotifications(prev => ["User Deduction Queued for IA7", ...prev].slice(0, 5));
    };

    const handleSendMessage = (msg: string) => {
        setChatHistory(prev => [...prev, {
            sender: 'User',
            message: msg,
            color: IA_COLORS.user,
            timestamp: new Date()
        }]);
    };

    const runIA = async (id: number, args?: string) => {
        setIaStates(prev => ({ ...prev, [id]: { ...prev[id], running: true } }));
        
        let modelName = "gemini-2.5-flash";
        let prompt = `Analyze simulation state.`;

        // Simplified interaction for visual demo
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            // In a real app, we would send detailed JSON metrics
            const response = await ai.models.generateContent({
                model: modelName,
                contents: `You are IA${id} of the ABC Simulation. 
                Role: ${id===6 ? 'Scanner' : id===7 ? 'Repairer' : 'Analyst'}.
                Current Stats: ${JSON.stringify(metrics)}.
                User Input: ${args || 'None'}.
                Provide a short status report.`
            });

            const text = response.text || "Systems nominal.";
            
            setIaStates(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    running: false,
                    confidence: 0.9,
                    lastResponse: text
                }
            }));

            addLog(id, "Manual Cycle Complete", "INFO", "DONE");

        } catch (error: any) {
             setIaStates(prev => ({ ...prev, [id]: { ...prev[id], running: false } }));
             addLog(id, `Connection Error`, "ERROR", "FAIL");
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white p-2 gap-2 overflow-hidden">
             <div className="w-80 flex flex-col gap-2">
                 <div className="flex-1 overflow-hidden">
                     <ControlPanel 
                         params={params}
                         onParamChange={handleParamChange}
                         onStart={handleStart}
                         onPause={handlePause}
                         onReset={handleReset}
                         onRunAllIAs={handleRunAllIAs}
                         onLoadPreset={handleLoadPreset}
                         onSaveDeduction={handleSaveDeduction}
                     />
                 </div>
                 <div className="h-64 overflow-hidden">
                     <ResultsPanel 
                         iaStates={iaStates}
                         globalConsensus={globalConsensus}
                         notifications={notifications}
                         onExport={() => {}}
                     />
                 </div>
             </div>
             
             <div className="flex-1 flex flex-col gap-2">
                 <div className="flex-1 overflow-hidden">
                     <SimulationPanel 
                         metrics={metrics}
                         simulationStateRef={simulationStateRef}
                     />
                 </div>
             </div>

             <div className="w-80 flex flex-col gap-2">
                 <div className="flex-1 overflow-hidden">
                     <IAPanel 
                         chatHistory={chatHistory}
                         onSendMessage={handleSendMessage}
                         onRunIA={runIA}
                         iaLogs={iaLogs}
                     />
                 </div>
             </div>
        </div>
    );
};

export default App;
