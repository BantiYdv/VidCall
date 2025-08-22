const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const router = express.Router();

// Generate Agora token for video call
router.post('/token', (req, res) => {
  try {
    const { channelName, uid, role } = req.body;

    // Validate input
    if (!channelName || !uid || !role) {
      return res.status(400).json({ error: 'Channel name, UID, and role are required' });
    }

    // Get Agora credentials from environment variables
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appID || !appCertificate) {
      return res.status(500).json({ error: 'Agora credentials not configured' });
    }

    // Set token expiry time (24 hours)
    const expirationTimeInSeconds = 3600 * 24;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build token with the provided UID
    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
      privilegeExpiredTs
    );

    res.json({
      token,
      appID,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Generate room ID
router.post('/room', (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({ error: 'Doctor ID and Patient ID are required' });
    }

    // Create a unique room ID based on the participants
    const roomId = `room_${doctorId}_${patientId}_${Date.now()}`;

    res.json({
      roomId,
      doctorId,
      patientId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

module.exports = router;
