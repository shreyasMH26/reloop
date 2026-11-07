import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './middleware/auth';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

// Map of userId -> Set of active WebSockets
const userSockets = new Map<string, Set<AuthenticatedSocket>>();

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedSocket, req) => {
    ws.isAlive = true;

    // Extract token from query or headers
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token') || (req.headers.cookie?.match(/reloop_token=([^;]+)/)?.[1]);

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      ws.userId = decoded.id;

      if (!userSockets.has(decoded.id)) {
        userSockets.set(decoded.id, new Set());
      }
      userSockets.get(decoded.id)!.add(ws);

      // Send initial connection acknowledgement
      ws.send(JSON.stringify({
        type: 'connection_ack',
        message: 'Connected to ReLoop Realtime Gateway',
        userId: decoded.id,
        timestamp: new Date().toISOString(),
      }));

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (messageRaw) => {
        try {
          const data = JSON.parse(messageRaw.toString());
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch {
          // ignore malformed client payloads
        }
      });

      ws.on('close', () => {
        if (ws.userId && userSockets.has(ws.userId)) {
          const userSet = userSockets.get(ws.userId)!;
          userSet.delete(ws);
          if (userSet.size === 0) {
            userSockets.delete(ws.userId);
          }
        }
      });

    } catch (err) {
      ws.close(4002, 'Invalid token');
    }
  });

  // Heartbeat interval to clean up dead sockets
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((client) => {
      const ws = client as AuthenticatedSocket;
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('⚡ [ReLoop WebSocket] Gateway initialized at /ws');
  return wss;
}

/**
 * Deliver a real-time event to a specific user
 */
export function sendUserEvent(userId: string, event: { type: string; payload: any }) {
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) return false;

  const payloadStr = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  });

  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payloadStr);
    }
  });
  return true;
}

/**
 * Broadcast an event to all connected users
 */
export function broadcastEvent(event: { type: string; payload: any }) {
  if (!wss) return;
  const payloadStr = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payloadStr);
    }
  });
}
