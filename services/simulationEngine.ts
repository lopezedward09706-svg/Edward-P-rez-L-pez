
import { ABCNode, Quark, Atom, Molecule, SimulationParameters, GlobalState, NodeType } from '../types';
import { PLANCK_ENERGY } from '../constants';

// --- Linear Algebra & Statistics Library ---
const MathUtils = {
    gaussian: (): number => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },
    
    vecAdd: (v1: {x:number, y:number}, v2: {x:number, y:number}) => ({x: v1.x + v2.x, y: v1.y + v2.y}),
    vecSub: (v1: {x:number, y:number}, v2: {x:number, y:number}) => ({x: v1.x - v2.x, y: v1.y - v2.y}),
    vecMul: (v: {x:number, y:number}, s: number) => ({x: v.x * s, y: v.y * s}),
    vecMag: (v: {x:number, y:number}) => Math.sqrt(v.x*v.x + v.y*v.y),
    vecNorm: (v: {x:number, y:number}) => {
        const m = Math.sqrt(v.x*v.x + v.y*v.y);
        return m === 0 ? {x:0, y:0} : {x: v.x/m, y: v.y/m};
    },
    // Snell's Law Refraction Vector Calculation
    refract: (incident: {x:number, y:number}, normal: {x:number, y:number}, n1: number, n2: number) => {
        const r = n1 / n2;
        const c = -(incident.x * normal.x + incident.y * normal.y);
        const discriminant = 1 - r * r * (1 - c * c);
        if (discriminant < 0) return null; // Total Internal Reflection
        
        return {
            x: r * incident.x + (r * c - Math.sqrt(discriminant)) * normal.x,
            y: r * incident.y + (r * c - Math.sqrt(discriminant)) * normal.y
        };
    }
};

export class SimulationEngine {
    state: GlobalState;
    private idCounter = 0;
    private gridResolution = 20;

    constructor(initialParams: SimulationParameters) {
        this.state = {
            nodes: [],
            quarks: [],
            atoms: [],
            molecules: [],
            time: 0,
            running: false,
            clocks: {
                earth: { ticks: 0, state: 'a', dilation: 1.0 },
                rocket: { ticks: 0, state: 'a', dilation: 1.0 }
            },
            parameters: initialParams,
            statistics: { meanEnergy: 0, stdDevEnergy: 0, entropy: 0 },
            fabricDeformation: [],
            spaceship: { x: -0.9, y: 0.6, v: 0.8 }, // 0.8c
            sharedMemory: {
                errors: [],
                patches: [],
                userDeductions: ""
            }
        };
        this.initializeNodes();
        this.initializeGrid();
    }

    reset() {
        this.state.time = 0;
        this.state.nodes = [];
        this.state.quarks = [];
        this.state.atoms = [];
        this.state.molecules = [];
        this.state.running = false;
        this.state.sharedMemory.errors = [];
        this.state.sharedMemory.patches = [];
        this.state.spaceship.x = -0.9;
        this.initializeNodes();
        this.initializeGrid();
    }

    updateParams(newParams: Partial<SimulationParameters>) {
        const shouldReinit = newParams.n_abc !== undefined && newParams.n_abc !== this.state.parameters.n_abc;
        this.state.parameters = { ...this.state.parameters, ...newParams };
        if (shouldReinit && !this.state.running) this.initializeNodes();
    }

    private initializeGrid() {
        this.state.fabricDeformation = [];
        for (let i = 0; i <= this.gridResolution; i++) {
            const row = [];
            for (let j = 0; j <= this.gridResolution; j++) {
                row.push(0);
            }
            this.state.fabricDeformation.push(row);
        }
    }

    initializeNodes() {
        this.state.nodes = [];
        // N_abc controls the number of initial triads
        const count = this.state.parameters.n_abc * 3; 
        
        for (let i = 0; i < count; i++) {
            // Geometry: Triangular distribution
            const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
            const r = 0.2 + Math.random() * 0.5;
            
            let type: NodeType = 'a';
            const mod = i % 3;
            if (mod === 0) type = 'a';
            else if (mod === 1) type = 'b';
            else type = 'c';

            let charge = 0, color = '';
            // ABC Logic
            switch(type) {
                case 'a': charge = 6/9; color = '#FF4444'; break;
                case 'b': charge = -2/9; color = '#4444FF'; break;
                case 'c': charge = -1/9; color = '#44FF44'; break;
            }

            this.state.nodes.push({
                id: ++this.idCounter,
                type,
                x: r * Math.cos(angle),
                y: r * Math.sin(angle),
                charge,
                color,
                // Scale dependent visuals handled in renderer, here we store logic
                energy: PLANCK_ENERGY * (1 + MathUtils.gaussian() * 0.1),
                velocity: { x: MathUtils.gaussian() * 0.005, y: MathUtils.gaussian() * 0.005 },
                accumulatedAction: 0,
                vibrationPhase: Math.random() * Math.PI * 2,
                vibrationFreq: 1 + Math.random() * 2
            });
        }
    }

    update() {
        if (!this.state.running) return;
        
        const dt = 0.016 * this.state.parameters.timeSpeed;
        this.state.time += dt;

        this.updateFabricDeformation();
        this.updateSpaceship(dt);
        this.updateNodes(dt);
        this.updateQuarks(dt);
        this.updateAtoms(dt);
        this.updateMolecules(dt);
        this.calculateThermodynamics();
        this.updateClocks(dt);
    }

    // Gravity as Geometry Deformation
    private updateFabricDeformation() {
        const mass = this.state.parameters.centralMass;
        // The grid represents the metric tensor field
        for (let i = 0; i <= this.gridResolution; i++) {
            for (let j = 0; j <= this.gridResolution; j++) {
                // Normalized coords -1 to 1
                const x = (i / this.gridResolution) * 2 - 1;
                const y = (j / this.gridResolution) * 2 - 1;
                const r = Math.sqrt(x*x + y*y);
                
                // General Relativity style well: z = -M / r
                // We store displacement magnitude
                const deform = Math.min(1.0, (mass * 0.1) / (r + 0.1));
                this.state.fabricDeformation[i][j] = deform;
            }
        }
    }

    private updateSpaceship(dt: number) {
        // Relativistic movement
        this.state.spaceship.x += this.state.spaceship.v * 0.01 * dt;
        if (this.state.spaceship.x > 1.2) this.state.spaceship.x = -1.2;
    }

    private updateNodes(dt: number) {
        const mass = this.state.parameters.centralMass;

        this.state.nodes.forEach(node => {
            // 1. Vibration (String Theory / Planck)
            node.vibrationPhase += node.vibrationFreq * dt * 10;

            // 2. Fundamental Theorem of Calculus: Principle of Least Action
            // Action S = Integral(L dt), L = T - V
            const vSq = node.velocity.x**2 + node.velocity.y**2;
            const r = Math.sqrt(node.x**2 + node.y**2);
            const kinetic = 0.5 * vSq;
            const potential = mass / (r + 0.01);
            node.accumulatedAction += (kinetic - potential) * dt;

            // 3. Gravity via Metric Distortion (Geodesic deviation)
            // Instead of Force = GM/r^2, we move along curved space
            // Simplified: Acceleration towards dense grid points
            if (r > 0.1) {
                const accel = mass * 0.0005 / (r * r);
                node.velocity.x -= (node.x / r) * accel * dt;
                node.velocity.y -= (node.y / r) * accel * dt;
            }

            // 4. Snell's Law (Refraction)
            // If passing through density gradient (simulated by radius)
            // Inner circle (r < 0.5) has Index n=1.5, Outer n=1.0
            const nInside = 1.5;
            const nOutside = 1.0;
            const boundary = 0.5;
            
            // Crossing boundary check
            const dist = r;
            const nextDist = Math.sqrt((node.x + node.velocity.x)*(node.x + node.velocity.x) + (node.y + node.velocity.y)*(node.y + node.velocity.y));
            
            if ((dist > boundary && nextDist < boundary) || (dist < boundary && nextDist > boundary)) {
                // Crossing
                const normal = MathUtils.vecNorm({x: node.x, y: node.y});
                const entering = dist > boundary;
                const n1 = entering ? nOutside : nInside;
                const n2 = entering ? nInside : nOutside;
                
                // Refract velocity vector
                const newVel = MathUtils.refract(node.velocity, normal, n1, n2);
                if (newVel) {
                    node.velocity = newVel;
                } else {
                    // Total Internal Reflection
                    // Reflect: v - 2(v.n)n
                    const dot = node.velocity.x*normal.x + node.velocity.y*normal.y;
                    node.velocity.x -= 2 * dot * normal.x;
                    node.velocity.y -= 2 * dot * normal.y;
                }
            }

            // Update Position
            node.x += node.velocity.x * dt;
            node.y += node.velocity.y * dt;

            // Boundaries
            if (Math.abs(node.x) > 1) { node.velocity.x *= -1; node.x *= 0.99; }
            if (Math.abs(node.y) > 1) { node.velocity.y *= -1; node.y *= 0.99; }
        });

        // Emergence: Nodes -> Quarks
        // If 3 nodes (A, B, C) are close, they form a Quark
        this.attemptQuarkFormation();
    }

    private attemptQuarkFormation() {
        const threshold = 0.15;
        const freeNodes = this.state.nodes.filter(n => !this.isNodeInQuark(n.id));
        
        // Naive O(N^2) for demo - IA5 will complain about this
        for (let i = 0; i < freeNodes.length; i++) {
            const n1 = freeNodes[i];
            const neighbors = [];
            
            for (let j = 0; j < freeNodes.length; j++) {
                if (i===j) continue;
                const n2 = freeNodes[j];
                const d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                if (d < threshold) neighbors.push(n2);
            }

            if (neighbors.length >= 2) {
                // Form Quark
                const trio = [n1, neighbors[0], neighbors[1]];
                
                // Determine Type based on ABC Charge
                const charge = trio.reduce((acc, n) => acc + n.charge, 0);
                let type: Quark['type'] = 'unknown';
                if (Math.abs(charge - 0.66) < 0.1) type = 'up'; // +2/3
                else if (Math.abs(charge + 0.33) < 0.1) type = 'down'; // -1/3
                
                if (type !== 'unknown') {
                    const q: Quark = {
                        id: ++this.idCounter,
                        type,
                        charge,
                        nodes: trio.map(n => n.id),
                        position: { x: (n1.x+neighbors[0].x+neighbors[1].x)/3, y: (n1.y+neighbors[0].y+neighbors[1].y)/3 },
                        velocity: MathUtils.vecMul(MathUtils.vecAdd(n1.velocity, neighbors[0].velocity), 0.33),
                        color: type === 'up' ? '#FF5555' : '#5555FF',
                        accumulatedAction: 0
                    };
                    this.state.quarks.push(q);
                    // In a real engine we'd remove nodes, but for visual density we keep them as "constituents"
                }
            }
        }
    }

    private isNodeInQuark(id: number): boolean {
        return this.state.quarks.some(q => q.nodes.includes(id));
    }

    private updateQuarks(dt: number) {
        // Quarks move and attract each other via Strong Force (Springs)
        this.state.quarks.forEach(q => {
            q.position.x += q.velocity.x * dt;
            q.position.y += q.velocity.y * dt;
            
            // Drag
            q.velocity.x *= 0.98;
            q.velocity.y *= 0.98;

            // Boundary
            if (Math.abs(q.position.x) > 0.9) q.velocity.x *= -1;
            if (Math.abs(q.position.y) > 0.9) q.velocity.y *= -1;
        });

        // Emergence: Quarks -> Atoms
        // uud -> Proton, udd -> Neutron
        const freeQuarks = this.state.quarks.filter(q => !this.isQuarkInAtom(q.id));
        // Logic simplified for brevity:
        // Group by proximity
        // ... (Similar logic to nodes -> quarks)
    }

    private isQuarkInAtom(id: number): boolean {
        return this.state.atoms.some(a => a.quarks.includes(id));
    }

    private updateAtoms(dt: number) {
        // Placeholder for atom physics
    }

    private updateMolecules(dt: number) {
        // Placeholder for molecule physics
    }

    private updateClocks(dt: number) {
        // Time Dilation based on Spaceship Velocity
        // Lorentz Factor: gamma = 1 / sqrt(1 - v^2/c^2)
        const v = this.state.spaceship.v; // v/c
        const gamma = 1 / Math.sqrt(1 - v*v);
        
        this.state.clocks.rocket.dilation = gamma;
        this.state.clocks.earth.ticks += dt;
        this.state.clocks.rocket.ticks += dt / gamma;
    }

    private calculateThermodynamics() {
        if (this.state.nodes.length === 0) return;
        
        // Temperature ~ Mean Kinetic Energy
        const totalKe = this.state.nodes.reduce((acc, n) => acc + 0.5 * (n.velocity.x**2 + n.velocity.y**2), 0);
        const meanEnergy = totalKe / this.state.nodes.length;
        
        // Standard Deviation
        const variance = this.state.nodes.reduce((acc, n) => {
            const ke = 0.5 * (n.velocity.x**2 + n.velocity.y**2);
            return acc + (ke - meanEnergy)**2;
        }, 0) / this.state.nodes.length;
        
        this.state.statistics = {
            meanEnergy,
            stdDevEnergy: Math.sqrt(variance),
            // Entropy ~ log(Energy Spread)
            entropy: Math.log(Math.sqrt(variance) + 0.0001)
        };
    }

    getMetrics() {
        return {
            ...this.state.statistics,
            nodeCount: this.state.nodes.length,
            quarkCount: this.state.quarks.length,
            atomCount: this.state.atoms.length,
            moleculeCount: this.state.molecules.length,
            earthTime: this.state.clocks.earth.ticks,
            rocketTime: this.state.clocks.rocket.ticks,
            dilation: this.state.clocks.rocket.dilation
        };
    }
}
