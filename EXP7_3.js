import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:3001");
const CHAT_ROOM = "main_room";

const styles = {
  chatApp: { fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' },
  header: { backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', borderBottom: '1px solid #ccc' },
  messagesContainer: { height: '400px', overflowY: 'auto', padding: '10px', backgroundColor: '#f9f9f9' },
  message: { marginBottom: '10px' },
  systemMessage: { fontStyle: 'italic', color: '#888', textAlign: 'center' },
  userMessage: {},
  messageMeta: { fontSize: '0.8em', color: '#555' },
  inputArea: { display: 'flex', borderTop: '1px solid #ccc' },
  textInput: { flex: 1, border: 'none', padding: '10px', fontSize: '1em' },
  sendButton: { border: 'none', backgroundColor: '#007bff', color: 'white', padding: '10px 15px', cursor: 'pointer' },
  loginContainer: { padding: '20px', textAlign: 'center' }
};

function Chat() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (currentMessage.trim() !== "") {
      socket.emit("send_message", { room: CHAT_ROOM, message: currentMessage });
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const messageListener = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("receive_message", messageListener);
    return () => socket.off("receive_message", messageListener);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.chatApp}>
      <div style={styles.header}>
        <h2>Real-Time Chat</h2>
      </div>
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            {msg.user === 'System' ? (
              <div style={styles.systemMessage}>{msg.message}</div>
            ) : (
              <div style={styles.userMessage}>
                <div style={styles.messageMeta}>
                  <strong>{msg.user}</strong> [{msg.time}]
                </div>
                <div>{msg.message}</div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          style={styles.textInput}
          value={currentMessage}
          placeholder="Type your message..."
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button style={styles.sendButton} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    if (username.trim() !== "") {
      socket.emit("join_room", { room: CHAT_ROOM, username: username });
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ ...styles.chatApp, ...styles.loginContainer }}>
        <h2>Enter Your Name</h2>
        <input
          type="text"
          style={{...styles.textInput, border: '1px solid #ccc', marginBottom: '10px'}}
          placeholder="e.g., Alice"
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button style={styles.sendButton} onClick={handleLogin}>Join Chat</button>
      </div>
    );
  }

  return <Chat />;
}

export default App;