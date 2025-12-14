
export type NodeType = 'a' | 'b' | 'c';

export interface ABCNode {
    id: number;
    type: NodeType;
    x: number;
    y: number;
    charge: number;
    color: string;
    // Physics properties
    energy: number;
    velocity: { x: number; y: number };
    // Math/Geometry properties
    accumulatedAction: number; // Fundamental Theorem of Calculus (Integral of Lagrangian)
    vibrationPhase: number; // For "String/Ray" visualization
    vibrationFreq: number;
}

export interface Quark {
    id: number;
    type: 'up' | 'down' | 'strange' | 'unknown';
    charge: number;
    nodes: number[]; // IDs of constituent ABC nodes
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    color: string;
    accumulatedAction: number;
}

export interface Atom {
    id: number;
    type: 'proton' | 'neutron' | 'electron'; // Added electron
    quarks: number[]; // IDs of constituent quarks
    charge: number;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
}

export interface Molecule {
    id: number;
    atoms: number[];
    type: 'simple' | 'complex';
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    bonds: number;
}

export interface SimulationParameters {
    scale: number; // 0=Planck ... 8=Universe
    n_abc: number; // Number of triangles
    // Thermodynamics & Gravity emerge from these, but we keep mass for the central "distortion"
    centralMass: number; 
    timeSpeed: number; 
}

export interface ClockState {
    ticks: number;
    state: string;
    dilation: number;
}

export interface IAState {
    confidence: number;
    running: boolean;
    results: any[];
    lastResponse?: string;
    status: 'idle' | 'scanning' | 'repairing' | 'error';
}

export interface GlobalState {
    nodes: ABCNode[];
    quarks: Quark[];
    atoms: Atom[];
    molecules: Molecule[];
    time: number;
    running: boolean;
    clocks: {
        earth: ClockState;
        rocket: ClockState;
    };
    parameters: SimulationParameters;
    statistics: {
        meanEnergy: number;
        stdDevEnergy: number; // Probability & Stats
        entropy: number; // Thermodynamics
    };
    fabricDeformation: number[][]; // For grid visualization
    spaceship: {
        x: number;
        y: number;
        v: number; // % of c
    };
    sharedMemory: {
        errors: string[];
        patches: string[];
        userDeductions: string;
    };
}

export interface ChatMessage {
    sender: string;
    message: string;
    color: string;
    timestamp: Date;
}
