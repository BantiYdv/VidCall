# VidCall - Doctor-Patient Video Call Platform

A secure, role-based video calling platform built with React, Node.js, and Agora.io SDK for healthcare professionals and patients.

## 🚀 Features

- **Role-based Authentication**: Separate login for doctors and patients
- **Secure Video Calls**: End-to-end encrypted video communication using Agora.io
- **Room Management**: Create and join video call rooms with role-based access control
- **Audio/Video Controls**: Mute/unmute audio, enable/disable video
- **Real-time Communication**: Low-latency video and audio streaming
- **Modern UI**: Responsive design with intuitive user interface
- **Production Ready**: Backend serves frontend for deployment on same domain

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Agora.io SDK** for video calling
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Agora RTC SDK** for video/audio handling
- **Axios** for API communication
- **Modern CSS** with responsive design

## 📋 Prerequisites

Before running this application, you need:

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Agora.io Account** with App ID and Certificate

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd VidCall

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Agora.io Setup

1. **Create an Agora Account**:
   - Go to [Agora.io](https://www.agora.io/)
   - Sign up for a free account
   - Navigate to the Console

2. **Create a New Project**:
   - Click "Create Project"
   - Enter a project name (e.g., "VidCall Platform")
   - Select "RTC" as the primary service
   - Click "Submit"

3. **Get Your Credentials**:
   - Copy the **App ID** from your project dashboard
   - Click "Generate" to create an **App Certificate**
   - Save both credentials securely

### 3. Environment Configuration

1. **Create Environment File**:
   ```bash
   cp env.example .env
   ```

2. **Configure Environment Variables**:
   ```env
   # Agora.io Configuration
   AGORA_APP_ID=your_agora_app_id_here
   AGORA_APP_CERTIFICATE=your_agora_app_certificate_here

   # JWT Secret for authentication
   JWT_SECRET=your_jwt_secret_here

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

   **Replace the placeholder values:**
   - `your_agora_app_id_here`: Your Agora App ID
   - `your_agora_app_certificate_here`: Your Agora App Certificate
   - `your_jwt_secret_here`: A secure random string for JWT signing

### 4. Build Frontend

```bash
# Build the React app for production
cd client
npm run build
cd ..
```

### 5. Start the Application

#### Development Mode
```bash
# Start both backend and frontend in development
npm run dev
```

#### Production Mode
```bash
# Start the production server
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3001/api

## 👥 Demo Accounts

The application comes with pre-configured demo accounts:

### Doctor Account
- **Username**: `doctor1`
- **Password**: `password`
- **Role**: Doctor
- **Name**: Dr. Smith

### Patient Account
- **Username**: `patient1`
- **Password**: `password`
- **Role**: Patient
- **Name**: John Doe

## 🎯 Usage Guide

### 1. Login
- Navigate to the application
- Use one of the demo accounts to log in
- The system will automatically redirect based on your role

### 2. Dashboard
- **Doctors**: Can create and join rooms starting with "doctor-"
- **Patients**: Can create and join rooms starting with "patient-"
- Use the quick join buttons or create custom rooms

### 3. Video Call
- Click on any room to join the video call
- Grant camera and microphone permissions when prompted
- Use the control buttons to:
  - 🔊 Mute/Unmute audio
  - 📹 Enable/Disable video
  - 📞 Leave the call

### 4. Room Sharing
- Share the room name with the other participant
- Both participants must join the same room to start the call
- Room names are role-restricted for security

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Doctors and patients can only access appropriate rooms
- **Secure Token Generation**: Agora tokens generated server-side with expiration
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 🏗️ Project Structure

```
VidCall/
├── server.js              # Main server file
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── env.example           # Environment template
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   └── VideoCall.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Set environment variables in Heroku dashboard
5. Deploy using Git

```bash
heroku create your-app-name
heroku config:set AGORA_APP_ID=your_app_id
heroku config:set AGORA_APP_CERTIFICATE=your_certificate
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

### Vercel/Netlify Deployment
1. Build the frontend: `cd client && npm run build`
2. Deploy the entire project to your preferred platform
3. Set environment variables in the platform dashboard

## 🔧 Customization

### Adding New Users
Edit the `users` array in `server.js`:

```javascript
const users = [
  {
    id: 3,
    username: "doctor2",
    password: "$2a$10$...", // Use bcrypt to hash passwords
    role: "doctor",
    name: "Dr. Johnson"
  }
];
```

### Database Integration
Replace the in-memory user storage with a database:

```javascript
// Example with MongoDB
const User = require('./models/User');
const users = await User.find({});
```

### Styling Customization
Modify the CSS files in `client/src/` to match your brand colors and design.

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to join the call"**
   - Check your Agora credentials in `.env`
   - Ensure the room name follows the naming convention
   - Verify your internet connection

2. **"Camera/Microphone not working"**
   - Check browser permissions
   - Ensure no other applications are using the camera/microphone
   - Try refreshing the page

3. **"Authentication failed"**
   - Verify JWT_SECRET is set in environment variables
   - Check if the token has expired
   - Clear browser localStorage and login again

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review Agora.io documentation
- Open an issue in the repository

---

**Note**: This is a demo application. For production use in healthcare, ensure compliance with relevant regulations (HIPAA, GDPR, etc.) and implement additional security measures.
