import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

// Configuration
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const PORT = process.env.PORT || 3001;

// In-memory storage (replace with database in production)
const users = [
  {
    id: 1,
    username: "doctor1",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    role: "doctor",
    name: "Dr. Smith",
    specialization: "Cardiology"
  },
  {
    id: 2,
    username: "patient1",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    role: "patient",
    name: "John Doe",
    email: "john@example.com"
  }
];

const appointments = [
  {
    id: 1,
    doctorId: 1,
    patientId: 2,
    date: "2024-01-15",
    time: "10:00",
    status: "scheduled",
    channelName: "appointment-1"
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        specialization: user.specialization,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/token", authenticateToken, (req, res) => {
  try {
    const { channel, uid = "0" } = req.query;
    const { role: userRole } = req.user;

    if (!channel) {
      return res.status(400).json({ error: "Channel name required" });
    }

    // Validate channel access based on user role
    if (userRole === "doctor" && !channel.startsWith("doctor-") && !channel.startsWith("appointment-")) {
      return res.status(403).json({ error: "Doctors can only join doctor or appointment channels" });
    }

    if (userRole === "patient" && !channel.startsWith("patient-") && !channel.startsWith("appointment-")) {
      return res.status(403).json({ error: "Patients can only join patient or appointment channels" });
    }

    const role = RtcRole.PUBLISHER;
    const expireTime = 3600; // 1 hour
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      parseInt(uid),
      role,
      privilegeExpireTime
    );

    res.json({ 
      token, 
      appId: APP_ID,
      channel,
      userRole 
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.get("/api/user", authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    specialization: user.specialization,
    email: user.email
  });
});

// Appointment routes
app.get("/api/appointments", authenticateToken, (req, res) => {
  const { role, id } = req.user;
  
  let userAppointments;
  if (role === "doctor") {
    userAppointments = appointments.filter(apt => apt.doctorId === id);
  } else {
    userAppointments = appointments.filter(apt => apt.patientId === id);
  }
  
  res.json(userAppointments);
});

app.post("/api/appointments", authenticateToken, (req, res) => {
  const { doctorId, date, time } = req.body;
  const { id: patientId } = req.user;

  if (req.user.role !== "patient") {
    return res.status(403).json({ error: "Only patients can create appointments" });
  }

  const newAppointment = {
    id: appointments.length + 1,
    doctorId: parseInt(doctorId),
    patientId,
    date,
    time,
    status: "scheduled",
    channelName: `appointment-${appointments.length + 1}`
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

app.get("/api/doctors", authenticateToken, (req, res) => {
  const doctors = users.filter(user => user.role === "doctor");
  res.json(doctors);
});

// Socket.IO for real-time features
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend will be available at http://localhost:${PORT}`);
  console.log(`🔑 Make sure to set up your .env file with Agora credentials!`);
});
