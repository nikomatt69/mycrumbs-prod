import { WebSocket } from "ws";

export const createWebSocketConnection = (url: string) => {
  const ws = new WebSocket(url);

  ws.on('open', () => {
    console.log('Connected to WebSocket server');
  });

  ws.on('message', (data) => {
    console.log('Received message:', data);
  });

  ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return ws;
};
