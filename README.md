<<<<<<< HEAD
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
=======
# VidCall - Doctor-Patient Video Call Platform

A modern, full-stack video calling platform designed specifically for doctor-patient consultations. Built with React, Node.js, Express, and Agora.io for real-time video communication.

## 🚀 Features

- **Role-based Authentication**: Separate login for doctors and patients
- **Real-time Video Calls**: High-quality video calls powered by Agora.io
- **Appointment Management**: Schedule and manage consultations
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Secure**: JWT authentication and role-based access control
- **Real-time Features**: Socket.IO for live updates

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Agora RTC SDK** - Video calling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Agora Access Token** - Secure token generation

## 📁 Project Structure

```
VidCall/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── server/                 # Node.js backend
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── shared/                 # Shared utilities
├── package.json            # Root package.json
└── README.md              # This file
>>>>>>> 255de916552bff7f18f7b9a3cc614985a3f8a220
```

## 🚀 Quick Start

<<<<<<< HEAD
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
=======
### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Agora.io account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd VidCall
```

### 2. Install Dependencies

```bash
npm run install-all
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your Agora.io credentials:

```env
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
JWT_SECRET=your_jwt_secret_here
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Get Agora.io Credentials

1. Sign up at [Agora.io](https://www.agora.io/)
2. Create a new project
3. Get your App ID and App Certificate
4. Add them to your `.env` file

### 5. Start Development Servers

```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 5173) servers.

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 👥 Demo Accounts

### Doctor Account
- Username: `doctor1`
- Password: `password`

### Patient Account
- Username: `patient1`
- Password: `password`

## 📱 Usage

### For Patients
1. Login with patient credentials
2. View available doctors
3. Schedule appointments
4. Join video calls for consultations
5. Access emergency call feature

### For Doctors
1. Login with doctor credentials
2. View scheduled appointments
3. Join patient consultations
4. Access emergency rooms
5. Manage patient calls

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - User login
- `GET /api/user` - Get user profile

### Video Calls
- `GET /api/token` - Get Agora RTC token

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/doctors` - Get available doctors

## 🚀 Deployment

### Render Deployment

1. **Connect Repository**: Link your GitHub repository to Render
2. **Configure Build Settings**:
   - Build Command: `npm run install-all && npm run build`
   - Start Command: `npm start`
3. **Environment Variables**: Add all variables from `.env`
4. **Deploy**: Render will automatically build and deploy your app

### Environment Variables for Production

```env
AGORA_APP_ID=your_production_agora_app_id
AGORA_APP_CERTIFICATE=your_production_agora_certificate
JWT_SECRET=your_secure_jwt_secret
PORT=10000
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Doctors and patients have different permissions
- **Channel Validation**: Users can only join appropriate channels
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured for production security

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Video call interface with dark theme
- **Modern Icons**: Lucide React icons throughout
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build frontend for production
npm run install-all  # Install all dependencies
```

### Code Structure

- **Components**: Modular React components
- **API Integration**: Centralized API calls
- **State Management**: React hooks for state
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS with custom components
>>>>>>> 255de916552bff7f18f7b9a3cc614985a3f8a220

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
<<<<<<< HEAD
4. Submit a pull request

## 📞 Support

For issues related to:
- **Agora SDK**: [Agora Documentation](https://docs.agora.io/)
- **React**: [React Documentation](https://reactjs.org/)
- **Render**: [Render Documentation](https://render.com/docs)

---

**Happy Video Calling! 🎥✨**
=======
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] File sharing during calls
- [ ] Screen sharing
- [ ] Chat functionality
- [ ] Appointment reminders
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

Built with ❤️ using modern web technologies
>>>>>>> 255de916552bff7f18f7b9a3cc614985a3f8a220
