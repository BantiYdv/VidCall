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
```

## 🚀 Quick Start

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
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
