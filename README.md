# Doctor-Patient Video Call Application

A full-stack web application for doctor-patient video consultations built with React, Node.js, Express, and Agora.io WebRTC.

## Features

- 🔐 **Authentication System**: JWT-based login/registration with role-based access
- 👨‍⚕️ **Role-based Access**: Separate dashboards for doctors and patients
- 📹 **Video Calls**: Real-time video communication using Agora.io
- 🎤 **Audio/Video Controls**: Mute/unmute audio, enable/disable video
- 📱 **Responsive Design**: Clean, modern UI that works on all devices
- 🔒 **Secure**: HTTPS-ready with proper authentication and authorization

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Agora Web SDK** - Video calling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Agora Access Token** - Token generation
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Agora.io account and credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VidCall
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to root
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Agora Configuration
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

### 4. Get Agora.io Credentials

1. Sign up at [Agora.io](https://www.agora.io/)
2. Create a new project
3. Get your App ID and App Certificate
4. Add them to your `.env` file

### 5. Run the Application

```bash
# Start both frontend and backend
npm start
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

## Usage

### Demo Accounts

The application comes with pre-configured demo accounts:

**Doctor Account:**
- Email: `doctor@example.com`
- Password: `password`

**Patient Account:**
- Email: `patient@example.com`
- Password: `password`

### How to Use

1. **Login/Register**: Use the demo accounts or create new ones
2. **Dashboard**: View available doctors/patients based on your role
3. **Start Call**: Click "Start Call" on any user to initiate a video call
4. **Video Call**: Use the controls to manage audio/video and end the call

## Project Structure

```
project-root/
├── server/                 # Backend (Node.js + Express)
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── agora.js       # Agora token generation
│   │   └── users.js       # User management
│   ├── index.js           # Main server file
│   ├── package.json       # Server dependencies
│   └── .env              # Environment variables
├── client/                # Frontend (React)
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # React components
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── Dashboard.js
│   │   │   └── VideoCall.js
│   │   ├── contexts/     # React contexts
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   ├── package.json      # Client dependencies
│   └── tailwind.config.js
├── package.json          # Root package.json
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/patients` - Get all patients
- `GET /api/users/:id` - Get user by ID

### Agora
- `POST /api/agora/token` - Generate Agora token
- `POST /api/agora/room` - Create room

## Development

### Running in Development Mode

```bash
# Run both frontend and backend in development mode
npm run dev
```

### Building for Production

```bash
# Build the React app
npm run build
```

### Individual Commands

```bash
# Run only the server
npm run server

# Run only the client
npm run client

# Run server in development mode
npm run server:dev

# Run client in development mode
npm run client:dev
```

## Security Considerations

- Change the JWT secret in production
- Use HTTPS in production
- Implement rate limiting (already configured)
- Add input validation and sanitization
- Use environment variables for sensitive data
- Consider adding database for user storage

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in `.env` file
2. **Agora token errors**: Verify your Agora credentials
3. **CORS errors**: Check CLIENT_URL in `.env`
4. **Video not working**: Ensure camera/microphone permissions

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
