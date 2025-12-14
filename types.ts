export type NodeType = 'a' | 'b' | 'c';

export interface ABCNode {
    id: number;
    type: NodeType;
    x: number;
    y: number;
    charge: number;
    color: string;
    radius: number;
    energy: number;
    velocity: { x: number; y: number };
}

export interface Quark {
    id: number;
    type: 'up' | 'down' | 'strange' | 'unknown';
    charge: number;
    nodes: number[];
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    color: string;
}

export interface Atom {
    type: 'proton' | 'neutron';
    quarks: number[];
    charge: number;
    position: { x: number; y: number };
}

export interface SimulationParameters {
    scale: number;
    mass: number;
    velocity: number;
    density: number;
    n_abc: number;
    strongEnergy: number;
    weakEnergy: number;
    radioPi: number;
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
    equations?: any[];
    matter?: any[];
    coordination?: any;
    modifications?: any[];
    lastResponse?: string;
}

export interface GlobalState {
    nodes: ABCNode[];
    quarks: Quark[];
    atoms: Atom[];
    time: number;
    running: boolean;
    clocks: {
        earth: ClockState;
        rocket: ClockState;
    };
    parameters: SimulationParameters;
}

export interface ChatMessage {
    sender: string;
    message: string;
    color: string;
    timestamp: Date;
}