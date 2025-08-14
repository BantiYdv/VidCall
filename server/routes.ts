import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertMessageSchema, type SocketMessage } from "@shared/schema";
import { z } from "zod";

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track room participants
  const roomParticipants = new Map<string, Set<ExtendedWebSocket>>();

  // API Routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const data = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(data);
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid room data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create room" });
      }
    }
  });

  app.get("/api/rooms/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByRoom(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // WebSocket handling
  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('Client connected');

    ws.on('message', async (data) => {
      try {
        const message: SocketMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join-room':
            await handleJoinRoom(ws, message);
            break;
          case 'leave-room':
            await handleLeaveRoom(ws);
            break;
          case 'chat-message':
            await handleChatMessage(ws, message);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', async () => {
      await handleLeaveRoom(ws);
      console.log('Client disconnected');
    });
  });

  async function handleJoinRoom(ws: ExtendedWebSocket, message: SocketMessage) {
    const { roomId } = message;
    if (!roomId) return;

    // Check if room exists
    let room = await storage.getRoom(roomId);
    if (!room) {
      // Create room if it doesn't exist
      room = await storage.createRoom({ id: roomId });
    }

    // Check room capacity
    const participants = roomParticipants.get(roomId) || new Set();
    if (participants.size >= 2) {
      ws.send(JSON.stringify({
        type: 'room-full',
        roomId
      }));
      return;
    }

    // Remove from previous room if any
    if (ws.roomId) {
      await handleLeaveRoom(ws);
    }

    // Add to room
    ws.roomId = roomId;
    ws.userId = generateUserId();
    participants.add(ws);
    roomParticipants.set(roomId, participants);

    // Update room participant count
    await storage.updateRoomParticipantCount(roomId, participants.size);

    // Notify all participants in room
    broadcastToRoom(roomId, {
      type: 'user-joined',
      roomId,
      participantCount: participants.size
    });

    console.log(`User joined room ${roomId}, participants: ${participants.size}`);
  }

  async function handleLeaveRoom(ws: ExtendedWebSocket) {
    if (!ws.roomId) return;

    const participants = roomParticipants.get(ws.roomId);
    if (participants) {
      participants.delete(ws);
      
      if (participants.size === 0) {
        // Delete empty room
        roomParticipants.delete(ws.roomId);
        await storage.deleteRoom(ws.roomId);
      } else {
        // Update participant count
        await storage.updateRoomParticipantCount(ws.roomId, participants.size);
        
        // Notify remaining participants
        broadcastToRoom(ws.roomId, {
          type: 'user-left',
          roomId: ws.roomId,
          participantCount: participants.size
        });
      }
    }

    console.log(`User left room ${ws.roomId}`);
    ws.roomId = undefined;
    ws.userId = undefined;
  }

  async function handleChatMessage(ws: ExtendedWebSocket, message: SocketMessage) {
    if (!ws.roomId || !message.content || !message.sender) return;

    try {
      // Save message to storage
      const savedMessage = await storage.createMessage({
        roomId: ws.roomId,
        sender: message.sender,
        content: message.content
      });

      // Broadcast to all participants in room
      broadcastToRoom(ws.roomId, {
        type: 'chat-message',
        roomId: ws.roomId,
        message: savedMessage.content,
        sender: savedMessage.sender,
        timestamp: savedMessage.timestamp.getTime()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  function broadcastToRoom(roomId: string, message: SocketMessage) {
    const participants = roomParticipants.get(roomId);
    if (participants) {
      const messageStr = JSON.stringify(message);
      participants.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  function generateUserId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  return httpServer;
}
