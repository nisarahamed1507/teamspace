import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@fluentui/react-components';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for previous messages
    newSocket.on('previous-messages', (previousMessages) => {
      setMessages(previousMessages);
    });

    // Listen for new messages
    newSocket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

    const sendMessage = (e) => {
      e.preventDefault();
      if (newMessage.trim() && socket) {
        socket.emit('send-message', {
          text: newMessage,
          userId: user.id,
          userEmail: user.email,
          channel: 'general'
      });
      setNewMessage('');
  }
};

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (newMessage.trim() && socket) {
//       socket.emit('send-message', {
//         text: newMessage,
//         user: user.email || 'Anonymous'
//       });
//       setNewMessage('');
//     }
//   };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      padding: '2rem',
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '1rem' }}># General</div>
      
      {/* Messages Area */}
      <div style={{
        background: '#f9fafc',
        borderRadius: '4px',
        padding: '1rem',
        flex: 1,
        overflowY: 'auto',
        marginBottom: '1rem'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                <strong>{message.user}</strong> • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <div style={{ marginTop: '0.25rem' }}>{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button appearance="primary" type="submit">
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;
