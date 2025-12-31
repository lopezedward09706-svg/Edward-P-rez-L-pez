
export interface BridgeTelemetry {
    gamma: number;
    phi: number;
    score: number;
}

export class QuantumBridge {
    private static instance: QuantumBridge;
    private activeConnections: Set<MessageEventSource> = new Set();

    private constructor() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    public static getInstance(): QuantumBridge {
        if (!QuantumBridge.instance) {
            QuantumBridge.instance = new QuantumBridge();
        }
        return QuantumBridge.instance;
    }

    private handleMessage(event: MessageEvent) {
        if (event.data?.type === 'RQNT_DATA_REQUEST') {
            if (event.source) {
                this.activeConnections.add(event.source);
                // Respond immediately if requested
                console.log('RQNT: Petición de sincronización recibida.');
            }
        }
    }

    public broadcast(payload: BridgeTelemetry) {
        this.activeConnections.forEach(source => {
            try {
                (source as Window).postMessage({
                    type: 'RQNT_TELEMETRY_DATA',
                    payload
                }, '*');
            } catch (e) {
                this.activeConnections.delete(source);
            }
        });
    }

    public get connectionCount(): number {
        return this.activeConnections.size;
    }
}
