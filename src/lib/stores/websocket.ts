import { writable, type Writable } from 'svelte/store';

export function createWebSocket<TReadMessage = string, TSendMessage = string>(
    url: string,
    overrideMessage = false,
    route: 'dashboard' | string = ''
) {
    const messages: Writable<TReadMessage[]> = writable([]);
    let socket: WebSocket;

    function connect() {
        socket = new WebSocket(url);

        socket.addEventListener('open', () => {
            console.log('Connected to WebSocket');
            socket.send('SUBSCRIBE:' + route);
        });

        socket.addEventListener('message', (event: MessageEvent) => {
            const parsedData = JSON.parse(event.data);
            if (overrideMessage) {
                messages.set([parsedData]);
            } else {
                messages.update((msgs) => [...msgs, parsedData]);
            }
        });

        socket.addEventListener('close', () => {
            console.log('WebSocket disconnected. Reconnecting...');
            setTimeout(connect, 3000); // Auto-reconnect
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket Error:', error);
        });
    }

    function sendMessage(msg: TSendMessage) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
        } else {
            console.error('WebSocket not connected!');
        }
    }

    connect();

    return { subscribe: messages.subscribe, sendMessage };
}
