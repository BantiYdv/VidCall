import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Video, Coffee } from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [activeRooms, setActiveRooms] = useState([]);
  const [waitingRoom, setWaitingRoom] = useState('');
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 3000);
    return () => clearInterval(interval);
  }, [waitingRoom]);

  const fetchActiveRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const rooms = await response.json();
      setActiveRooms(rooms);
      // If waiting, check if another user joined
      if (waitingRoom) {
        const found = rooms.find((r: any) => r.id === waitingRoom);
        if (found && found.participants === 2) {
          setLocation(`/call/${waitingRoom}`);
        }
      }
    } catch (error) {
      // ignore
    }
  };

  const createRoom = async () => {
    const newRoomId = generateRoomId();
    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newRoomId }),
    });
    await fetch(`/api/rooms/${newRoomId}/join`, { method: 'POST' });
    setWaitingRoom(newRoomId);
    setWaiting(true);
  };

  const joinRoom = async (id: string) => {
    const res = await fetch(`/api/rooms/${id}/join`, { method: 'POST' });
    const data = await res.json();
    if (data.status === 'ok') {
      setLocation(`/call/${id}`);
    }
  };

  const leaveWaitingRoom = async () => {
    if (waitingRoom) {
      await fetch(`/api/rooms/${waitingRoom}/leave`, { method: 'POST' });
    }
    setWaiting(false);
    setWaitingRoom('');
  };

  const generateRoomId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  if (waiting && waitingRoom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-google-dark mb-2">Waiting for another user to join Room {waitingRoom}</h3>
            <p className="text-google-gray mb-4">Share this code: <span className="font-mono font-bold">{waitingRoom}</span></p>
            <Button onClick={() => { setWaiting(false); setWaitingRoom(''); }} variant="secondary">Leave Room</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center mb-12">
          <Button onClick={createRoom} className="bg-google-blue hover:bg-blue-600 text-white py-4 px-8 shadow-lg text-lg flex items-center">
            <Plus className="mr-2" size={20} />
            Create Room
          </Button>
        </div>
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
                        {room.participants}/2 participants - {room.status === "full" ? "Full" : "Open"}
                      </span>
                    </div>
                    {room.status !== "full" && (
                      <Button
                        onClick={() => joinRoom(room.id)}
                        variant="default"
                      >
                        Join
                      </Button>
                    )}
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
