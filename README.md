# 🎥 Agora Video Call App

A complete video calling application built with React frontend and Node.js backend, using Agora.io for real-time video communication. Deployable on Render with a single domain.

## ✨ Features

- **Real-time Video Calls**: High-quality video and audio communication
- **Simple Interface**: Clean, modern UI for easy video calling
- **Cross-platform**: Works on desktop and mobile browsers
- **Single Domain**: Frontend and backend served from one URL
- **Easy Deployment**: Ready for Render deployment

## 🏗️ Project Structure

```
my-agora-app/
│
├── backend/
│   ├── server.js          # Express server with token API
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── agora.js       # Agora SDK integration
│   │   └── App.css        # Styling
│   ├── public/
│   └── package.json       # Frontend dependencies
│
├── package.json           # Root scripts
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd my-agora-app
npm run install
```

### 2. Set Up Agora Credentials

1. Go to [Agora.io](https://www.agora.io/) and create an account
2. Create a new project and get your App ID and App Certificate
3. Copy `backend/env.example` to `backend/.env`
4. Update the `.env` file with your credentials:

```env
APP_ID=your_agora_app_id_here
APP_CERTIFICATE=your_agora_app_certificate_here
PORT=5000
```

### 3. Build and Run

```bash
# Build the React app
npm run build

# Start the server
npm start
```

The app will be available at `http://localhost:5000`

## 🛠️ Development

For development with hot reloading:

```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend
cd frontend && npm start
```

## 🌐 Deployment on Render

### 1. Connect Your Repository

1. Push your code to GitHub
2. Connect your repository to Render

### 2. Create a Web Service

1. **Name**: `my-agora-app`
2. **Environment**: `Node`
3. **Build Command**: `npm run install && npm run build`
4. **Start Command**: `npm start`
5. **Root Directory**: Leave empty (root of repo)

### 3. Environment Variables

Add these environment variables in Render:

- `APP_ID`: Your Agora App ID
- `APP_CERTIFICATE`: Your Agora App Certificate
- `PORT`: `10000` (Render's default)

### 4. Deploy

Click "Create Web Service" and wait for deployment. Your app will be available at your Render URL!

## 📱 Usage

1. **Join a Call**: Click "Join Call" to start a video call
2. **Allow Permissions**: Grant camera and microphone access
3. **Share the Link**: Send the URL to others to join the same call
4. **Leave Call**: Click "Leave Call" to end the session

## 🔧 API Endpoints

### GET `/api/token`
Generates Agora RTC tokens for video calls.

**Query Parameters:**
- `channel` (required): Channel name for the call
- `uid` (optional): User ID (default: 0)

**Response:**
```json
{
  "token": "agora_rtc_token",
  "appId": "your_app_id",
  "uid": 0
}
```

## 🛡️ Security

- Tokens are generated server-side with proper expiration
- No sensitive credentials exposed to the client
- CORS configured for secure cross-origin requests

## 🎨 Customization

### Styling
Modify `frontend/src/App.css` to customize the appearance.

### Channel Names
Change the channel name in `frontend/src/App.js`:

```javascript
const newTracks = await joinChannel("your-custom-channel");
```

### Video Quality
Adjust video settings in `frontend/src/agora.js`:

```javascript
const client = AgoraRTC.createClient({ 
  mode: "rtc", 
  codec: "vp8" // or "h264"
});
```

## 🐛 Troubleshooting

### Common Issues

1. **"Camera/Microphone not working"**
   - Ensure HTTPS in production (required for media access)
   - Check browser permissions
   - Try refreshing the page

2. **"Token generation failed"**
   - Verify Agora credentials in `.env`
   - Check server logs for errors

3. **"Can't join channel"**
   - Ensure backend is running
   - Check network connectivity
   - Verify channel name format

### Debug Mode

Enable console logging by adding this to `frontend/src/agora.js`:

```javascript
AgoraRTC.setLogLevel(0); // 0 = DEBUG, 1 = INFO, 2 = WARNING, 3 = ERROR
```

## 📄 License

MIT License - feel free to use this project for your own applications!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues related to:
- **Agora SDK**: [Agora Documentation](https://docs.agora.io/)
- **React**: [React Documentation](https://reactjs.org/)
- **Render**: [Render Documentation](https://render.com/docs)

---

**Happy Video Calling! 🎥✨**
