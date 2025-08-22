import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const [roomName, setRoomName] = useState('');
  const [joinRoom, setJoinRoom] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;
    
    const channelName = user.role === 'doctor' 
      ? `doctor-${roomName}` 
      : `patient-${roomName}`;
    
    navigate(`/call/${channelName}`);
  };

  const handleJoinRoom = () => {
    if (!joinRoom.trim()) return;
    navigate(`/call/${joinRoom}`);
  };

  const getDefaultRooms = () => {
    if (user.role === 'doctor') {
      return [
        { name: 'doctor-room-1', displayName: 'Consultation Room 1' },
        { name: 'doctor-room-2', displayName: 'Consultation Room 2' },
        { name: 'doctor-emergency', displayName: 'Emergency Room' }
      ];
    } else {
      return [
        { name: 'patient-room-1', displayName: 'Patient Room 1' },
        { name: 'patient-room-2', displayName: 'Patient Room 2' },
        { name: 'patient-waiting', displayName: 'Waiting Room' }
      ];
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>VidCall Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <span className="user-role">{user.role}</span>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="card">
            <h2>Create New Room</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Create a new video call room for {user.role === 'doctor' ? 'consultation' : 'appointment'}.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder={`Enter ${user.role === 'doctor' ? 'room' : 'appointment'} name`}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                style={{ flex: 1 }}
                className="form-group input"
              />
              <button 
                className="btn" 
                onClick={handleCreateRoom}
                disabled={!roomName.trim()}
              >
                Create Room
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Join Existing Room</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Join an existing room by entering the room name.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Enter room name"
                value={joinRoom}
                onChange={(e) => setJoinRoom(e.target.value)}
                style={{ flex: 1 }}
                className="form-group input"
              />
              <button 
                className="btn" 
                onClick={handleJoinRoom}
                disabled={!joinRoom.trim()}
              >
                Join Room
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Quick Join Rooms</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Click on any room below to join instantly.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {getDefaultRooms().map((room) => (
                <div 
                  key={room.name}
                  style={{ 
                    background: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
                  onClick={() => navigate(`/call/${room.name}`)}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{room.displayName}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>Room: {room.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
