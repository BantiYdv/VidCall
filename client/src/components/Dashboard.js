import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  LogOut, 
  Phone, 
  User, 
  Users, 
  Video, 
  MessageSquare,
  Shield,
  Heart
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'doctor' ? '/api/users/patients' : '/api/users/doctors';
      const response = await axios.get(endpoint);
      setUsers(response.data[user.role === 'doctor' ? 'patients' : 'doctors']);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = async (otherUser) => {
    try {
      const roomData = {
        doctorId: user.role === 'doctor' ? user.id : otherUser.id,
        patientId: user.role === 'patient' ? user.id : otherUser.id
      };

      const response = await axios.post('/api/agora/room', roomData);
      const { roomId } = response.data;
      
      navigate(`/call/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to initiate call');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
                {user.role === 'doctor' ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <Heart className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'doctor' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'doctor' ? 'Doctor' : 'Patient'}
                  </span>
                  {user.role === 'doctor' && user.specialization && (
                    <span className="text-sm text-gray-500">
                      {user.specialization}
                    </span>
                  )}
                  {user.role === 'patient' && user.age && (
                    <span className="text-sm text-gray-500">
                      Age: {user.age}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>
                {user.role === 'doctor' ? 'Available Patients' : 'Available Doctors'}
              </span>
            </h3>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No {user.role === 'doctor' ? 'patients' : 'doctors'} available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((otherUser) => (
                <div key={otherUser.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{otherUser.name}</h4>
                      <p className="text-sm text-gray-600">{otherUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      otherUser.role === 'doctor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {otherUser.role === 'doctor' ? 'Doctor' : 'Patient'}
                    </span>
                    {otherUser.role === 'doctor' && otherUser.specialization && (
                      <span className="text-xs text-gray-500">
                        {otherUser.specialization}
                      </span>
                    )}
                    {otherUser.role === 'patient' && otherUser.age && (
                      <span className="text-xs text-gray-500">
                        Age: {otherUser.age}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => initiateCall(otherUser)}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2 py-2"
                    >
                      <Video className="h-4 w-4" />
                      <span>Start Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
