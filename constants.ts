
import { SimulationParameters } from './types';

export const IA_COLORS = {
    ia1: '#FF4444', // Experimental
    ia2: '#4444FF', // Theoretical
    ia3: '#44FF44', // Observer
    ia4: '#FF44FF', // Searcher
    ia5: '#FFFF44', // Integrator
    ia6: '#44FFFF', // Mediator/Scanner
    ia7: '#FF8844', // Programmer/Fixer
    system: '#4fc3f7',
    user: '#ffffff'
};

export const INITIAL_PARAMETERS: SimulationParameters = {
    scale: 0, // Planck Scale
    n_abc: 50, // Initial triangles
    centralMass: 1.0,
    timeSpeed: 1.0
};

export const PRESETS: Record<string, SimulationParameters> = {
    planckSoup: { scale: 0, n_abc: 100, centralMass: 0, timeSpeed: 1 },
    atomicFormation: { scale: 2, n_abc: 200, centralMass: 2, timeSpeed: 2 },
    blackHole: { scale: 6, n_abc: 500, centralMass: 10, timeSpeed: 0.5 },
    lightSpeedTest: { scale: 4, n_abc: 50, centralMass: 1, timeSpeed: 1 }
};

export const PLANCK_ENERGY = 1.9561e9;
export const SCALE_LABELS = ['Planck (Vibración)', 'Subatómico', 'Atómico', 'Molecular', 'Micro', 'Humano', 'Planetario', 'Estelar', 'Cósmico'];
export const C_SPEED = 299792458; 
