const express = require("express");
const cors = require("cors");
const path = require("path");
const { RtcTokenBuilder, RtcRole } = require("agora-token");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

// ✅ Token API
app.get("/api/token", (req, res) => {
  const channel = req.query.channel;
  if (!channel) return res.status(400).json({ error: "channel required" });

  const uid = req.query.uid || 0;
  const role = RtcRole.PUBLISHER;
  const expire = 3600; // 1 hour
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channel,
    uid,
    role,
    Math.floor(Date.now() / 1000) + expire
  );
  res.json({ token, appId: APP_ID, uid });
});

// ✅ Serve React build
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
