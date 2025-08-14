import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey(),
  participantCount: integer("participant_count").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  roomId: true,
  sender: true,
  content: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// WebSocket message types
export interface SocketMessage {
  type: 'join-room' | 'leave-room' | 'chat-message' | 'room-full' | 'user-joined' | 'user-left' | 'room-created';
  roomId?: string;
  message?: string;
  sender?: string;
  timestamp?: number;
  participantCount?: number;
}
