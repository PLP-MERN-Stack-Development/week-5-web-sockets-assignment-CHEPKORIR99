// src/App.jsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [inputName, setInputName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_list', setUsers);
    socket.on('typing_users', setTypingUsers);

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message });
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', e.target.value.length > 0);
  };

  const joinChat = () => {
    socket.emit('user_join', inputName);
    setUsername(inputName);
  };

  return (
    <div>
      {!username ? (
        <div>
          <h2>Enter your name to join</h2>
          <input value={inputName} onChange={(e) => setInputName(e.target.value)} />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}</h2>
          <div style={{ height: 300, overflowY: 'scroll' }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <strong>{msg.sender}</strong>: {msg.message}
              </div>
            ))}
          </div>
          <div>
            <input value={message} onChange={handleTyping} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage}>Send</button>
          </div>
          <div>
            <p>Users online: {users.length}</p>
            <p>Typing: {typingUsers.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;