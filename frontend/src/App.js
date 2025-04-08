import React, { useEffect } from 'react';
import axios from 'axios';
import ChatbotUI from './ChatbotUI';

function App() {
  useEffect(() => {
    axios.get('http://localhost:8000/api/ping/')
      .then(res => console.log("✅ Backend Response:", res.data))
      .catch(err => console.error("❌ Ping Failed", err));
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <ChatbotUI />
    </div>
  );
}

export default App;
