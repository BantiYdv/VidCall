import { type Room, type InsertRoom, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room management
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: string): Promise<Room | undefined>;
  updateRoomParticipantCount(id: string, count: number): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
  deleteRoom(id: string): Promise<void>;
  
  // Message management
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByRoom(roomId: string): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private messages: Map<string, Message>;

  constructor() {
    this.rooms = new Map();
    this.messages = new Map();
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      ...insertRoom,
      participantCount: 0,
      createdAt: new Date(),
    };
    this.rooms.set(room.id, room);
    return room;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async updateRoomParticipantCount(id: string, count: number): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (room) {
      room.participantCount = count;
      this.rooms.set(id, room);
      return room;
    }
    return undefined;
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.participantCount > 0);
  }

  async deleteRoom(id: string): Promise<void> {
    this.rooms.delete(id);
    // Also delete all messages for this room
    const messagesToDelete = Array.from(this.messages.keys()).filter(msgId => {
      const message = this.messages.get(msgId);
      return message?.roomId === id;
    });
    messagesToDelete.forEach(msgId => this.messages.delete(msgId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
