import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertMessageSchema, type SocketMessage } from "@shared/schema";
import { z } from "zod";

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  userId?: string;
  isAuthenticated?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track room participants
  const roomParticipants = new Map<string, Set<ExtendedWebSocket>>();
  // Track user sessions to prevent duplicate joins
  const userSessions = new Map<string, { roomId: string, ws: ExtendedWebSocket }>();

  // Add CORS headers for all responses
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    // Add CSP headers to allow Agora connections
    res.header(
      "Content-Security-Policy",
      "default-src 'self'; connect-src 'self' https://*.agora.io https://*.agora.com wss://*.agora.io wss://*.agora.com; script-src 'self' 'unsafe-inline' https://replit.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https://*.agora.io https://*.agora.com;"
    );
    
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      return res.status(200).end();
    }
    next();
  });

  // API Routes
  app.get("/api/rooms", (req, res) => {
    const rooms = [];
    for (const [id, participants] of roomParticipants.entries()) {
      rooms.push({ id, participants: participants.size, status: participants.size >= 2 ? "full" : "open" });
    }
    res.json(rooms);
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

  app.post("/api/rooms/:id/join", async (req, res) => {
    const roomId = req.params.id;
    // Use in-memory map for participants (same as roomParticipants)
    let participants = roomParticipants.get(roomId);
    if (!participants) {
      participants = new Set();
      roomParticipants.set(roomId, participants);
    }
    if (participants.size >= 2) {
      return res.json({ status: "full" });
    }
    // Simulate a join (no user tracking here, just count)
    // In production, you would track userId/session
    participants.add(Math.random().toString(36).substring(2, 15));
    return res.json({ status: "ok" });
  });

  app.post("/api/rooms/:id/leave", (req, res) => {
    const roomId = req.params.id;
    // For demo: remove one participant from the set (simulate user leaving)
    const participants = roomParticipants.get(roomId);
    if (participants && participants.size > 0) {
      // Remove one participant (simulate)
      const first = participants.values().next().value;
      participants.delete(first);
      if (participants.size === 0) {
        roomParticipants.delete(roomId);
      }
    }
    res.json({ status: "ok" });
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
          case 'webrtc-offer':
          case 'webrtc-answer':
          case 'webrtc-ice-candidate':
            await handleWebRTCSignaling(ws, message);
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
    const { roomId, userId } = message;
    if (!roomId) return;

    // Generate or use provided userId
    const userIdentifier = userId || generateUserId();
    
    // Check if user is already in a room
    const existingSession = userSessions.get(userIdentifier);
    if (existingSession && existingSession.roomId === roomId) {
      // User is already in this room, just update the websocket connection
      existingSession.ws = ws;
      ws.userId = userIdentifier;
      ws.roomId = roomId;
      ws.isAuthenticated = true;
      
      // Send current room state
      const participants = roomParticipants.get(roomId);
      if (participants) {
        ws.send(JSON.stringify({
          type: 'user-joined',
          roomId,
          participantCount: participants.size,
          userId: userIdentifier
        }));
      }
      return;
    }
    
    // If user is in a different room, remove them from that room first
    if (existingSession && existingSession.roomId !== roomId) {
      await handleLeaveRoom(existingSession.ws);
    }

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
    ws.userId = userIdentifier;
    ws.isAuthenticated = true;
    participants.add(ws);
    roomParticipants.set(roomId, participants);
    
    // Track user session
    userSessions.set(userIdentifier, { roomId, ws });

    // Update room participant count
    await storage.updateRoomParticipantCount(roomId, participants.size);

    // Notify all participants in room
    broadcastToRoom(roomId, {
      type: 'user-joined',
      roomId,
      participantCount: participants.size,
      userId: userIdentifier
    });

    console.log(`User ${userIdentifier} joined room ${roomId}, participants: ${participants.size}`);
  }

  async function handleLeaveRoom(ws: ExtendedWebSocket) {
    if (!ws.roomId || !ws.userId) return;

    // Remove from user sessions
    if (ws.userId) {
      userSessions.delete(ws.userId);
    }

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
          participantCount: participants.size,
          userId: ws.userId
        });
      }
    }

    console.log(`User ${ws.userId} left room ${ws.roomId}`);
    ws.roomId = undefined;
    ws.userId = undefined;
    ws.isAuthenticated = false;
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
        content: savedMessage.content,
        sender: savedMessage.sender,
        timestamp: savedMessage.timestamp.getTime()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async function handleWebRTCSignaling(ws: ExtendedWebSocket, message: SocketMessage) {
    if (!ws.roomId) return;

    // Forward WebRTC signaling messages to other participants in the room
    const participants = roomParticipants.get(ws.roomId);
    if (participants) {
      participants.forEach(participant => {
        if (participant !== ws && participant.readyState === WebSocket.OPEN) {
          participant.send(JSON.stringify({
            ...message,
            userId: ws.userId
          }));
        }
      });
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