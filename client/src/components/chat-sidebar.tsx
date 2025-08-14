import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send } from 'lucide-react';
import type { Message } from '@shared/schema';

interface ChatSidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  messages: Message[];
  currentUser: string;
}

export function ChatSidebar({ 
  roomId, 
  isOpen, 
  onClose, 
  onSendMessage, 
  messages, 
  currentUser 
}: ChatSidebarProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage) return;
    
    onSendMessage(trimmedMessage);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-google-dark">Chat</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-google-gray hover:text-google-dark"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-google-gray text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {messages.map((message) => {
          const isOwn = message.sender === currentUser;
          
          return (
            <div key={message.id} className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : ''}`}>
              {isOwn ? (
                <>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end space-x-2 mb-1">
                      <span className="text-xs text-google-gray">
                        {formatTime(new Date(message.timestamp))}
                      </span>
                      <span className="font-medium text-sm text-google-dark">
                        {message.sender}
                      </span>
                    </div>
                    <div className="bg-google-blue text-white rounded-2xl rounded-tr-sm px-3 py-2 inline-block max-w-xs">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {getInitials(message.sender)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {getInitials(message.sender)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-google-dark">
                        {message.sender}
                      </span>
                      <span className="text-xs text-google-gray">
                        {formatTime(new Date(message.timestamp))}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-xs">
                      <p className="text-sm text-google-dark">{message.content}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-google-blue hover:bg-blue-600"
            disabled={!messageInput.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
