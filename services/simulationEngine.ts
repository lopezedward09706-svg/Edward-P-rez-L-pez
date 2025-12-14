import { ABCNode, Quark, Atom, SimulationParameters, GlobalState, NodeType } from '../types';
import { PLANCK_ENERGY } from '../constants';

export class SimulationEngine {
    state: GlobalState;

    constructor(initialParams: SimulationParameters) {
        this.state = {
            nodes: [],
            quarks: [],
            atoms: [],
            time: 0,
            running: false,
            clocks: {
                earth: { ticks: 0, state: 'a', dilation: 1.0 },
                rocket: { ticks: 0, state: 'a', dilation: 1.0 }
            },
            parameters: initialParams
        };
        this.initializeNodes();
    }

    reset() {
        this.state.time = 0;
        this.state.nodes = [];
        this.state.quarks = [];
        this.state.atoms = [];
        this.state.clocks = {
            earth: { ticks: 0, state: 'a', dilation: 1.0 },
            rocket: { ticks: 0, state: 'a', dilation: 1.0 }
        };
        this.state.running = false;
        this.initializeNodes();
    }

    updateParams(newParams: Partial<SimulationParameters>) {
        const densityChanged = newParams.density !== undefined && newParams.density !== this.state.parameters.density;
        this.state.parameters = { ...this.state.parameters, ...newParams };
        
        if (densityChanged && !this.state.running) {
            this.initializeNodes();
        }
    }

    initializeNodes() {
        this.state.nodes = [];
        const nodeCount = Math.floor(30 * this.state.parameters.density);

        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * 2 * Math.PI;
            const radius = 0.3 + 0.4 * Math.random();
            const rand = Math.random();
            
            let type: NodeType = 'a';
            if (rand < 0.33) type = 'a';
            else if (rand < 0.66) type = 'b';
            else type = 'c';

            let charge = 0, color = '', radiusVis = 0;
            switch(type) {
                case 'a': charge = 6/9; color = '#FF4444'; radiusVis = 5; break;
                case 'b': charge = -2/9; color = '#4444FF'; radiusVis = 4; break;
                case 'c': charge = -1/9; color = '#44FF44'; radiusVis = 3; break;
            }

            this.state.nodes.push({
                id: i,
                type,
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                charge,
                color,
                radius: radiusVis,
                energy: PLANCK_ENERGY * (type === 'a' ? 1.0 : type === 'b' ? 0.1 : 0.01),
                velocity: { x: 0, y: 0 }
            });
        }
        
        // Reset higher structures
        this.state.quarks = [];
        this.state.atoms = [];
    }

    update() {
        if (!this.state.running) return;

        this.state.time += 0.016;
        this.updateABCNetwork();
        this.updateQuantumClocks();
        this.attemptMatterFormation();
    }

    private updateABCNetwork() {
        const params = this.state.parameters;
        this.state.nodes.forEach(node => {
            // Random movement
            node.x += (Math.random() - 0.5) * 0.01 * params.density;
            node.y += (Math.random() - 0.5) * 0.01 * params.density;

            // Mass effect
            if (params.mass !== 0) {
                const distance = Math.sqrt(node.x * node.x + node.y * node.y);
                if (distance > 0.1) {
                    const force = -params.mass * 0.0001 / (distance * distance);
                    node.x += force * node.x / distance;
                    node.y += force * node.y / distance;
                }
            }

            // Boundaries
            const limit = 0.8;
            if (Math.abs(node.x) > limit) node.x = limit * Math.sign(node.x);
            if (Math.abs(node.y) > limit) node.y = limit * Math.sign(node.y);
        });
    }

    private updateQuantumClocks() {
        const velocity = this.state.parameters.velocity / 100;
        const gamma = 1 / Math.sqrt(Math.max(0.0001, 1 - velocity * velocity));
        
        this.state.clocks.rocket.dilation = gamma;
        this.state.clocks.earth.dilation = 1.0;

        const baseTickRate = 0.1;
        this.state.clocks.earth.ticks += baseTickRate;
        this.state.clocks.rocket.ticks += baseTickRate / gamma;

        const states = ['a', 'b', 'c'];
        this.state.clocks.earth.state = states[Math.floor(this.state.clocks.earth.ticks) % 3];
        this.state.clocks.rocket.state = states[Math.floor(this.state.clocks.rocket.ticks) % 3];
    }

    private attemptMatterFormation() {
        const params = this.state.parameters;
        const { quarks, atoms } = this.state;

        // Form Quarks
        if (Math.random() < 0.01 * params.strongEnergy) {
            const nearby = this.findNearbyNodesForQuark();
            if (nearby.length >= 3) {
                const quark = this.formQuarkFromNodes(nearby.slice(0, 3));
                if (quark) quarks.push(quark);
            }
        }

        // Form Atoms
        if (Math.random() < 0.001 * params.strongEnergy && quarks.length >= 3) {
            const atom = this.attemptAtomFormation();
            if (atom) atoms.push(atom);
        }
    }

    private findNearbyNodesForQuark(): ABCNode[] {
        const candidates: { node: ABCNode, dist: number }[] = [];
        // Simplified approach for performance: just pick a random node and find neighbors
        if (this.state.nodes.length === 0) return [];
        
        const centerNode = this.state.nodes[Math.floor(Math.random() * this.state.nodes.length)];
        
        for (const node of this.state.nodes) {
            if (node.id === centerNode.id) continue;
             const dx = node.x - centerNode.x;
             const dy = node.y - centerNode.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist < 0.2) candidates.push({ node, dist });
        }
        
        candidates.sort((a, b) => a.dist - b.dist);
        return [centerNode, ...candidates.map(c => c.node)].slice(0, 3);
    }

    private formQuarkFromNodes(nodes: ABCNode[]): Quark | null {
        if (nodes.length < 3) return null;
        
        let totalCharge = 0;
        const typeCounts = { a: 0, b: 0, c: 0 };
        nodes.forEach(n => {
            totalCharge += n.charge;
            typeCounts[n.type]++;
        });

        let type: Quark['type'] = 'unknown';
        if (Math.abs(totalCharge - 2/3) < 0.1) type = 'up';
        else if (Math.abs(totalCharge + 1/3) < 0.1) type = 'down';
        else if (Math.abs(totalCharge + 1/3) < 0.2 && typeCounts.c > 1) type = 'strange';

        if (type !== 'unknown') {
            return {
                id: this.state.quarks.length,
                type,
                charge: totalCharge,
                nodes: nodes.map(n => n.id),
                position: {
                    x: nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length,
                    y: nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length
                },
                color: type === 'up' ? '#FF6666' : type === 'down' ? '#6666FF' : '#66FF66'
            };
        }
        return null;
    }

    private attemptAtomFormation(): Atom | null {
        const protons = this.state.quarks.filter(q => q.type === 'up');
        const downQuarks = this.state.quarks.filter(q => q.type === 'down');

        if (protons.length >= 2 && downQuarks.length >= 1) {
            return {
                type: 'proton',
                quarks: [protons[0].id, protons[1].id, downQuarks[0].id],
                charge: 1,
                position: {
                    x: (protons[0].position.x + protons[1].position.x + downQuarks[0].position.x) / 3,
                    y: (protons[0].position.y + protons[1].position.y + downQuarks[0].position.y) / 3
                }
            };
        } else if (protons.length >= 1 && downQuarks.length >= 2) {
             return {
                type: 'neutron',
                quarks: [protons[0].id, downQuarks[0].id, downQuarks[1].id],
                charge: 0,
                position: {
                    x: (protons[0].position.x + downQuarks[0].position.x + downQuarks[1].position.x) / 3,
                    y: (protons[0].position.y + downQuarks[0].position.y + downQuarks[1].position.y) / 3
                }
            };
        }
        return null;
    }

    getMetrics() {
        const totalEnergy = this.state.nodes.reduce((sum, node) => sum + node.energy, 0);
        
        let avgDist = 0.1;
        if (this.state.nodes.length > 1) {
             // Sample distance
             let count = 0;
             let sum = 0;
             for(let i=0; i<Math.min(50, this.state.nodes.length); i++) {
                 const n1 = this.state.nodes[i];
                 const n2 = this.state.nodes[(i+1)%this.state.nodes.length];
                 const dx = n1.x - n2.x;
                 const dy = n1.y - n2.y;
                 sum += Math.sqrt(dx*dx + dy*dy);
                 count++;
             }
             if (count > 0) avgDist = sum / count;
        }

        const activity = this.state.nodes.length * this.state.parameters.density;
        
        return {
            nodeCount: this.state.nodes.length,
            quarkCount: this.state.quarks.length,
            atomCount: this.state.atoms.length,
            totalEnergy,
            avgCurvature: (1 / (avgDist + 0.01)),
            temperature: 2.7 + activity * 0.1,
            dilation: this.state.clocks.rocket.dilation,
            earthTime: this.state.clocks.earth.ticks,
            rocketTime: this.state.clocks.rocket.ticks,
            earthState: this.state.clocks.earth.state,
            rocketState: this.state.clocks.rocket.state
        };
    }
}