import { SimulationParameters } from './types';

export const IA_COLORS = {
    ia1: '#FF4444',
    ia2: '#4444FF',
    ia3: '#44FF44',
    ia4: '#FF44FF',
    ia5: '#FFFF44',
    ia6: '#44FFFF',
    ia7: '#FF8844',
    system: '#4fc3f7',
    user: '#ffffff'
};

export const INITIAL_PARAMETERS: SimulationParameters = {
    scale: 0,
    mass: 0,
    velocity: 0,
    density: 1.0,
    n_abc: 3,
    strongEnergy: 1.0,
    weakEnergy: 0.01,
    radioPi: 1.0
};

export const PRESETS: Record<string, SimulationParameters> = {
    blackHole: { scale: 0, mass: 4.8, velocity: 0, density: 3.0, n_abc: 9, strongEnergy: 10, weakEnergy: 0.001, radioPi: 0.1 },
    bigBang: { scale: 0, mass: -4.0, velocity: 0, density: 3.0, n_abc: 3, strongEnergy: 1, weakEnergy: 1, radioPi: 3.0 },
    quarkFormation: { scale: 0, mass: 0.3, velocity: 0, density: 1.618, n_abc: 6, strongEnergy: 5, weakEnergy: 0.1, radioPi: 1.618 },
    atomCreation: { scale: 2, mass: 0, velocity: 0, density: 2.0, n_abc: 9, strongEnergy: 8, weakEnergy: 0.01, radioPi: 1.0 },
    cosmicExpansion: { scale: 8, mass: 0, velocity: 67, density: 0.3, n_abc: 3, strongEnergy: 0.1, weakEnergy: 0.1, radioPi: 2.0 },
    quantumFoam: { scale: 0, mass: 0, velocity: 33.3, density: 1.618, n_abc: 9, strongEnergy: 0.5, weakEnergy: 0.5, radioPi: 1.0 },
    timeCrystal: { scale: 1, mass: 0, velocity: 50, density: 2.5, n_abc: 7, strongEnergy: 2, weakEnergy: 0.05, radioPi: 1.5 },
    matterGenesis: { scale: 0, mass: 1.5, velocity: 25, density: 2.0, n_abc: 9, strongEnergy: 7, weakEnergy: 0.02, radioPi: 1.2 }
};

export const PLANCK_ENERGY = 1.9561e9;
export const SCALE_LABELS = ['Planck', 'Núcleo', 'Átomo', 'Virus', 'Humano', 'Tierra', 'Solar', 'Galaxia', 'Universo'];