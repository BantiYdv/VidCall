# Video Call Application

## Overview

This is a real-time video calling application built with React frontend and Express backend. The application enables users to create and join video call rooms with integrated chat functionality. It features a modern UI built with shadcn/ui components and uses WebSocket connections for real-time communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Routing**: Wouter for client-side routing with pages for landing and video calls
- **State Management**: TanStack React Query for server state management
- **Real-time Communication**: WebSocket integration with custom hooks

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for room management and WebSocket server for real-time features
- **Session Management**: In-memory storage with fallback for PostgreSQL via Drizzle ORM
- **Development Setup**: Vite middleware integration for hot module replacement

### Data Storage Solutions
- **Primary**: In-memory storage (`MemStorage` class) for development and testing
- **Production Ready**: PostgreSQL database configured via Drizzle ORM
- **Schema**: Rooms and messages tables with proper relationships and timestamps
- **Migration Support**: Drizzle-kit for database schema management

### Authentication and Authorization
- **Current State**: Basic session-based approach without formal authentication
- **User Identity**: Auto-generated user names for demonstration purposes
- **Room Access**: Simple room ID-based access control

### Real-time Features
- **WebSocket Server**: Custom WebSocket implementation for room communication
- **Message Broadcasting**: Real-time chat messages and room participant updates
- **Connection Management**: Automatic reconnection with exponential backoff
- **Room State**: Live participant count tracking and user join/leave notifications

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database connectivity
- **drizzle-orm**: Type-safe ORM for database operations and schema management
- **express**: Web server framework for REST API endpoints
- **ws**: WebSocket library for real-time communication

### Frontend UI Dependencies
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Build tool and development server with HMR support
- **typescript**: Type checking and enhanced developer experience
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **esbuild**: Fast JavaScript bundler for production builds

### Database and Schema
- **drizzle-kit**: Database migration and schema management tools
- **drizzle-zod**: Integration between Drizzle ORM and Zod for validation
- **zod**: Runtime type validation and schema parsing

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx** and **tailwind-merge**: Conditional CSS class management
- **class-variance-authority**: Type-safe styling variants system