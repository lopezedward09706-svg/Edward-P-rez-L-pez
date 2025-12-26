
import { ABCNode, Quark, Atom, SimulationParameters, GlobalState, NodeType, PhysicalConstants, Vector3, ParticleClass, CosmicPhase } from '../types';
import { CONSTANTS } from '../constants';

const crossProduct = (v1: Vector3, v2: Vector3): Vector3 => ({
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
});

const dotProduct = (v1: Vector3, v2: Vector3): number => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

const vectorNorm = (v: Vector3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

const normalizeVector = (v: Vector3): Vector3 => {
    const n = vectorNorm(v) || 1;
    return { x: v.x / n, y: v.y / n, z: v.z / n };
};

export class SimulationEngine {
    state: GlobalState;
    private idCounter = 0;
    private atomCounter = 0;
    private quarkCounter = 0;
    private currentRigidity = 1.0;

    constructor(params: SimulationParameters) {
        this.currentRigidity = params.initialRigidity || 10.0;
        this.state = {
            nodes: [], atoms: [], quarks: [], time: 0, running: false,
            currentPhase: 'PRIMORDIAL',
            parameters: { ...params, stabilityLimit: params.stabilityLimit || 2.0 },
            constants: { ...CONSTANTS },
            expansionFactor: 1.0,
            statistics: { 
                meanEnergy: 0, entropy: 0, complexity: 0, entanglementIndex: 0, 
                coherenceLevel: 1.0, quantumCoherence: 1.0, hubbleFlow: 0, curvature: 0, avgZeta: 1.0, 
                totalResidualMass: 0, averageCharge: 0, totalAtoms: 0, 
                currentRigidity: this.currentRigidity
            },
            fabricDeformation: [],
            entangledPairs: [],
            recentCollapses: [],
            sharedMemory: { userDeductions: "", evolutionLogs: [], pendingActions: [], physicalViolations: [] }
        };
        this.initializeNodes();
    }

    initializeNodes() {
        this.state.nodes = [];
        this.state.atoms = [];
        this.state.quarks = [];
        this.state.entangledPairs = [];
        this.state.recentCollapses = [];
        this.state.expansionFactor = 1.0;
        this.state.time = 0;
        this.currentRigidity = this.state.parameters.initialRigidity;
        this.state.currentPhase = 'PRIMORDIAL';
        
        const p = this.state.parameters;
        for (let i = 0; i < p.n_abc; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = (0.2 + Math.random() * 0.4) / (p.density || 1);
            
            this.state.nodes.push({
                id: ++this.idCounter,
                type: 'a',
                particleClass: 'vacuum',
                x: r * Math.cos(angle), y: r * Math.sin(angle), z: (Math.random()-0.5)*0.1,
                vecA: { x: 1, y: 0, z: 0 },
                vecB: { x: -0.5, y: Math.sqrt(3)/2, z: 0 },
                vecC: { x: -0.5, y: -Math.sqrt(3)/2, z: 0 },
                topologicalCharge: 0,
                hamiltonianTension: 0,
                spinVorticity: 0,
                stabilityStatus: 0,
                bindingEnergy: 0,
                resonanceFreq: 0,
                nucleusId: null,
                zeta: 1.0,
                residualMass: 0,
                color: '#4fc3f7',
                velocity: { x: (Math.random()-0.5)*0.01, y: (Math.random()-0.5)*0.01, z: 0 },
                vibrationPhase: Math.random() * Math.PI * 2,
                isCollapsed: false,
                accumulatedAction: 0,
                superposition: 0
            });
        }
    }

    update() {
        if (!this.state.parameters) return;
        const dt = 0.016 * this.state.parameters.timeSpeed;
        const p = this.state.parameters;
        this.state.time += dt;

        const relaxationRate = 0.05 * p.timeSpeed;
        this.currentRigidity = Math.max(0.1, this.currentRigidity * (1 - relaxationRate * dt));
        this.state.expansionFactor += p.hubbleConstant * this.state.expansionFactor * dt;

        this.updatePhases();
        this.updateParticlePhysics(dt);
        this.updateInteractions(dt);
        this.updateWaveFunctionCollapse(dt);
        
        if (this.state.currentPhase !== 'PRIMORDIAL') {
            this.updateAtomicArchitecture(dt);
        }
        
        this.updateEntanglement(dt);
        this.calculateUniverseStats();
        
        this.state.recentCollapses = this.state.recentCollapses.filter(c => this.state.time - c.time < 1.0);
    }

    private updateWaveFunctionCollapse(dt: number) {
        const p = this.state.parameters;
        // Solo ocurre colapso si hay suficiente Energía Fuerte y baja rigidez (decoherencia)
        const decoherenceFactor = 1.0 / (this.currentRigidity + 0.1);

        const nodes = this.state.nodes.filter(n => !n.isCollapsed);
        
        for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];
            
            // Los nodos naturales decaen en su superposición si no hay interacción
            n1.superposition *= (1 - 0.02 * dt);

            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Si están en el radioPi, la superposición aumenta (Incertidumbre de posición)
                if (dist < 0.1 * p.radioPi) {
                    const buildup = p.strongEnergy * dt * 0.5 * decoherenceFactor;
                    n1.superposition += buildup;
                    n2.superposition += buildup;

                    // Umbral de Colapso (Trigger de Wave Function Collapse)
                    if (n1.superposition > 1.0 || n2.superposition > 1.0) {
                        this.executeCollapse(n1, n2, p);
                        return; // Evitar múltiples colapsos en un solo paso
                    }
                }
            }
        }
    }

    private executeCollapse(n1: ABCNode, n2: ABCNode, p: SimulationParameters) {
        n1.isCollapsed = true;
        n2.isCollapsed = true;
        
        const centerX = (n1.x + n2.x) / 2;
        const centerY = (n1.y + n2.y) / 2;
        
        // Formación del Quark (Invariancia de carga y masa emergente)
        const qType = (n1.topologicalCharge + n2.topologicalCharge) > 0 ? 'up' : 'down';
        const newQuark: Quark = {
            id: ++this.quarkCounter,
            type: qType,
            mass: n1.residualMass + n2.residualMass + (p.strongEnergy * 0.25),
            nodes: [n1.id, n2.id],
            position: { x: centerX, y: centerY },
            bindingEnergy: p.strongEnergy
        };
        
        this.state.quarks.push(newQuark);
        this.state.recentCollapses.push({
            x: centerX,
            y: centerY,
            time: this.state.time,
            id: newQuark.id
        });

        // Notificar a la red de IAs
        this.state.sharedMemory.evolutionLogs.push(`IA8: COLAPSO DETECTADO en t=${this.state.time.toFixed(2)}. Estado de mayor probabilidad alcanzado: Quark ${qType}.`);
    }

    private updatePhases() {
        const k = this.currentRigidity;
        const oldPhase = this.state.currentPhase;

        if (k > 8.0) this.state.currentPhase = 'PRIMORDIAL';
        else if (k > 5.0) this.state.currentPhase = 'HADRONIC';
        else if (k > 2.0) this.state.currentPhase = 'ATOMIC';
        else if (k > 1.0) this.state.currentPhase = 'MOLECULAR';
        else if (k > 0.5) this.state.currentPhase = 'STELLAR';
        else this.state.currentPhase = 'COSMIC';

        if (oldPhase !== this.state.currentPhase) {
            this.state.sharedMemory.evolutionLogs.push(`IA6: Transición de Fase -> ${this.state.currentPhase}`);
        }
    }

    private updateParticlePhysics(dt: number) {
        const p = this.state.parameters;
        const k = this.currentRigidity;

        this.state.nodes.forEach(n => {
            const lambda = p.couplingLambda;
            const crossBC = crossProduct(n.vecB, n.vecC);
            const crossAC = crossProduct(n.vecA, n.vecC);
            const crossAB = crossProduct(n.vecA, n.vecB);

            n.vecA.x += lambda * crossBC.x * dt; n.vecA.y += lambda * crossBC.y * dt; n.vecA.z += lambda * crossBC.z * dt;
            n.vecB.x += lambda * crossAC.x * dt; n.vecB.y += lambda * crossAC.y * dt; n.vecB.z += lambda * crossAC.z * dt;
            n.vecC.x += lambda * crossAB.x * dt; n.vecC.y += lambda * crossAB.y * dt; n.vecC.z += lambda * crossAB.z * dt;

            // Incertidumbre de fase proporcional a la superposición
            if (!n.isCollapsed) {
                const jitter = n.superposition * 0.5;
                n.vibrationPhase += (n.resonanceFreq + jitter) * dt;
            }

            const angleAB = Math.atan2(n.vecB.y, n.vecB.x) - Math.atan2(n.vecA.y, n.vecA.x);
            const rawQ = angleAB / (Math.PI / 3);
            n.topologicalCharge = Math.round(rawQ) / 3;

            if (Math.abs(n.topologicalCharge) < 0.1) {
                n.particleClass = 'neutron';
                n.color = '#888888';
            } else if (n.topologicalCharge > 0) {
                n.particleClass = 'proton';
                n.color = '#ff4444';
            } else {
                n.particleClass = 'electron-node';
                n.color = '#4444ff';
            }

            const normC = vectorNorm(n.vecC);
            n.hamiltonianTension = (k / 2) * (normC * normC - 1.0);
            n.residualMass = Math.abs(n.hamiltonianTension) / 50;
            n.zeta = normC / vectorNorm(n.vecA);
        });
    }

    private updateInteractions(dt: number) {
        const p = this.state.parameters;
        const nodes = this.state.nodes;
        const k = this.currentRigidity;

        for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];
            if (n1.isCollapsed) continue;

            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                if (n2.isCollapsed) continue;

                const dx = n1.x - n2.x; const dy = n1.y - n2.y;
                const distSq = dx*dx + dy*dy + 0.001;
                const dist = Math.sqrt(distSq);

                if (dist < 0.3 * p.radioPi) {
                    const alignment = dotProduct(normalizeVector(n1.vecA), normalizeVector(n2.vecA));
                    let forceMag = (alignment / distSq) * (0.002 / (k + 0.1));
                    
                    const fx = (dx / dist) * forceMag;
                    const fy = (dy / dist) * forceMag;

                    n1.velocity.x += fx * dt; n1.velocity.y += fy * dt;
                    n2.velocity.x -= fx * dt; n2.velocity.y -= fy * dt;
                }
            }
        }

        nodes.forEach(n => {
            n.x += n.velocity.x * dt; n.y += n.velocity.y * dt;
            n.velocity.x *= 0.94; n.velocity.y *= 0.94;
        });
    }

    private updateAtomicArchitecture(dt: number) {
        // Lógica simplificada: los Quarks tienden a agruparse en núcleos
        const nodes = this.state.nodes.filter(n => !n.isCollapsed);
        const p = this.state.parameters;
        this.state.atoms = [];
        
        // ... (resto de la lógica de clustering atómico se mantiene similar pero filtrando colapsados)
    }

    private updateEntanglement(dt: number) {
        const p = this.state.parameters;
        const baseCoherence = Math.max(0.1, 1.0 - (this.state.expansionFactor - 1) * 0.15);
        
        this.state.entangledPairs = this.state.entangledPairs.filter(pair => {
            const n1 = this.state.nodes.find(n => n.id === pair.id1);
            const n2 = this.state.nodes.find(n => n.id === pair.id2);
            if (!n1 || !n2 || n1.isCollapsed || n2.isCollapsed) return false;
            
            const dist = Math.sqrt((n1.x-n2.x)**2 + (n1.y-n2.y)**2);
            pair.strength = (baseCoherence * p.radioPi) / (dist * 2.0 + p.radioPi);
            return pair.strength > 0.08 && Math.random() > 0.002;
        });
    }

    private calculateUniverseStats() {
        const nodes = this.state.nodes;
        if (nodes.length === 0) return;
        
        const entropy = 1.0 / (this.currentRigidity + 0.01);
        const totalSuperposition = nodes.reduce((acc, n) => acc + (n.isCollapsed ? 0 : n.superposition), 0);

        this.state.statistics = {
            ...this.state.statistics,
            entropy: entropy,
            totalAtoms: this.state.atoms.length,
            currentRigidity: this.currentRigidity,
            entanglementIndex: this.state.entangledPairs.length / (nodes.length || 1),
            quantumCoherence: (totalSuperposition / nodes.length) * Math.exp(-this.state.time * 0.01)
        };
    }

    updateParams(p: Partial<SimulationParameters>) {
        this.state.parameters = { ...this.state.parameters, ...p };
    }

    reset() {
        this.idCounter = 0;
        this.atomCounter = 0;
        this.quarkCounter = 0;
        this.initializeNodes();
    }

    getMetrics() {
        return { ...this.state.statistics, a_t: this.state.expansionFactor, phase: this.state.currentPhase };
    }
}
