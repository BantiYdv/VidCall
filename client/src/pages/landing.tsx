import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Video, Plus, LogIn, Users, Coffee } from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [roomId, setRoomId] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const fetchActiveRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const rooms = await response.json();
      setActiveRooms(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const createRoom = () => {
    const newRoomId = generateRoomId();
    toast({
      title: "Room Created",
      description: `Room ${newRoomId} created successfully!`,
    });
    setLocation(`/call/${newRoomId}`);
  };

  const joinRoom = () => {
    const trimmedRoomId = roomId.trim().toUpperCase();
    
    if (!trimmedRoomId) {
      toast({
        title: "Error",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }

    if (trimmedRoomId.length < 3) {
      toast({
        title: "Error", 
        description: "Room ID must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    setLocation(`/call/${trimmedRoomId}`);
  };

  const generateRoomId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-google-blue rounded-lg flex items-center justify-center">
                <Video className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-google-dark">VideoConnect</h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-google-gray hover:text-google-dark transition-colors">Features</a>
              <a href="#" className="text-google-gray hover:text-google-dark transition-colors">Support</a>
              <Button variant="outline" className="text-google-blue border-google-blue hover:bg-blue-50">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-google-dark mb-6">
            Secure Video Calling<br />
            <span className="text-google-blue">Made Simple</span>
          </h2>
          <p className="text-xl text-google-gray max-w-2xl mx-auto mb-8">
            Create or join a room for instant video calls. Maximum 2 users per room with end-to-end encryption and crystal clear video quality.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create Room Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-google-dark mb-2">Create Room</h3>
              <p className="text-google-gray mb-6">Start a new video call room and invite others</p>
              <Button 
                onClick={createRoom}
                className="w-full bg-google-blue hover:bg-blue-600 text-white py-4 shadow-lg"
                size="lg"
              >
                <Video className="mr-2" size={20} />
                Create New Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-google-dark mb-2">Join Room</h3>
              <p className="text-google-gray mb-6">Enter a room ID to join an existing call</p>
              <div className="space-y-4">
                <Input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Room ID (e.g., ABC123)"
                  className="text-center"
                />
                <Button 
                  onClick={joinRoom}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 shadow-lg"
                  size="lg"
                >
                  <LogIn className="mr-2" size={20} />
                  Join Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Rooms */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-google-dark mb-4 flex items-center">
              <Users className="text-google-blue mr-2" size={24} />
              Available Rooms
            </h3>
            <div className="space-y-3">
              {activeRooms.length === 0 ? (
                <div className="text-center py-8 text-google-gray">
                  <Coffee className="mx-auto mb-4 opacity-50" size={48} />
                  <p>No active rooms. Create one to get started!</p>
                </div>
              ) : (
                activeRooms.map((room: any) => (
                  <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-semibold">Room {room.id}</span>
                      <span className="ml-2 text-sm text-google-gray">
                        {room.participantCount}/2 participants
                      </span>
                    </div>
                    <Button
                      onClick={() => setLocation(`/call/${room.id}`)}
                      disabled={room.participantCount >= 2}
                      variant={room.participantCount >= 2 ? "secondary" : "default"}
                    >
                      {room.participantCount >= 2 ? "Full" : "Join"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
