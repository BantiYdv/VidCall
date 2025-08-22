const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
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
const buildPath = path.join(__dirname, "../frontend/build");
const indexPath = path.join(buildPath, "index.html");

// Check if build files exist
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  // Fallback for when build files don't exist
  app.get("*", (req, res) => {
    res.status(404).json({ 
      error: "Frontend not built",
      message: "Please run 'npm run build' to build the React app",
      buildPath: buildPath
    });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Build path: ${buildPath}`);
  console.log(`📄 Index file exists: ${fs.existsSync(indexPath)}`);
  
  if (!fs.existsSync(buildPath)) {
    console.log(`⚠️  Warning: Frontend build not found at ${buildPath}`);
    console.log(`   Please ensure the build process completed successfully.`);
  } else {
    console.log(`✅ Frontend build found and ready to serve`);
  }
});
