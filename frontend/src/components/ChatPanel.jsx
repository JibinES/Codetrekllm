import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Tooltip,
  Typography
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import LevelButtons from './LevelButtons';
import TopicDropdown from './TopicDropdown';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function ChatPanel({ level, onLevelChange, topic, onTopicChange, topics }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (topic) {
      setMessages([{
        type: 'bot',
        content: `Hello! I can help you learn ${topic}. What would you like to know?`
      }]);
      scrollToBottom();
    }
  }, [topic]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { type: 'user', content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Uncomment below if using JWT auth
          // 'Authorization': `Bearer ${yourToken}`,
        },
        body: JSON.stringify({
          message: inputValue,
          topic: topic,
          level: level,
        })
      });

      const data = await response.json();

      const botResponse = {
        type: 'bot',
        content: data.reply || "No response from server.",
      };

      setMessages([...newMessages, botResponse]);
      scrollToBottom();
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: "Oops! Something went wrong connecting to the server.",
      };
      setMessages([...newMessages, errorMessage]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event) => {
    // TODO: Implement file upload logic to backend
  };

  const isTopicSelected = Boolean(topic);

  const renderMessage = (message) => {
    if (message.type === 'code-output') {
      return (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Code Output:
            </Typography>
          </Box>
          <Box sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '12px',
                backgroundColor: 'transparent',
              }}
            >
              {typeof message.content.output === 'object' 
                ? JSON.stringify(message.content.output, null, 2)
                : String(message.content.output)}
            </SyntaxHighlighter>
          </Box>
          {!message.content.success && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'error.main',
                mt: 1,
                display: 'block'
              }}
            >
              Execution failed
            </Typography>
          )}
        </Box>
      );
    }

    return <Typography>{message.content}</Typography>;
  };

  return (
    <Paper
      sx={{
        flex: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 4,
      }}
    >
      <LevelButtons level={level} onLevelChange={onLevelChange} />
      <TopicDropdown topic={topic} onTopicChange={onTopicChange} topics={topics} />
      
      {/* Messages Container */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {!isTopicSelected ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              opacity: 0.7
            }}
          >
            <Typography variant="body1">
              Please select a topic to start the conversation
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.type === 'code-output' ? 'flex-start' : 
                  message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxWidth: message.type === 'code-output' ? '100%' : '80%',
                  backgroundColor: 'transparent',
                  border: '1px solid',
                  borderColor: message.type === 'user' 
                    ? 'rgba(255, 51, 102, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                }}
              >
                {renderMessage(message)}
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Prompt Area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          mt: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 1,
          opacity: isTopicSelected ? 1 : 0.5,
          pointerEvents: isTopicSelected ? 'auto' : 'none',
        }}
      >
        <TextField
          variant="outlined"
          placeholder={isTopicSelected ? "Type your message..." : "Select a topic to start chatting"}
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={!isTopicSelected}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 51, 102, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              }
            }
          }}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".js,.pdf,.jpg,.jpeg,.png,.txt,.doc,.docx,.json"
          style={{ display: 'none' }}
        />
        
        <Tooltip title={isTopicSelected ? "Upload File" : "Select a topic first"}>
          <span>
            <IconButton
              onClick={() => fileInputRef.current.click()}
              disabled={!isTopicSelected}
              sx={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <UploadFileIcon />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title={isTopicSelected ? "Send message" : "Select a topic first"}>
          <span>
            <IconButton 
              onClick={handleSendMessage}
              disabled={!isTopicSelected || loading}
              sx={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}
