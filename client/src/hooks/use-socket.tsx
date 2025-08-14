import { useEffect, useRef, useState } from 'react';
import type { SocketMessage } from '@shared/schema';

export interface UseSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: SocketMessage) => void;
}

export function useSocket(onMessage?: (message: SocketMessage) => void): UseSocketReturn {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(() => {
            console.log(`Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, 1000 * reconnectAttempts.current);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);
    }

    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = (message: SocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected, queueing message');
      // Queue the message and try to send it when connected
      setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
        }
      }, 100);
    }
  };

  return { socket, isConnected, sendMessage };
}
