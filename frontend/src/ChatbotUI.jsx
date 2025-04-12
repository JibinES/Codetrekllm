import React, { useState } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CodeInterface from './components/CodeInterface';

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1A1A1A",
      paper: "#252525",
    },
    text: {
      primary: "#F5F5F5",
      secondary: "#B3B3B3",
    },
    primary: {
      main: "#FF3366",
      light: "#FF6B99",
      dark: "#CC0033",
      contrastText: "#fff",
    },
    secondary: {
      main: "#990033",
      light: "#CC0044",
      dark: "#660022",
      contrastText: "#fff",
    },
    error: {
      main: "#FF1A1A",
      light: "#FF4D4D",
      dark: "#CC0000",
    },
    warning: {
      main: "#FF9900",
      light: "#FFAD33",
      dark: "#CC7A00",
    },
    success: {
      main: "#4D0099",
      light: "#6600CC",
      dark: "#330066",
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#FF3366',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      color: '#FF3366',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(37, 37, 37, 0.7)",
          borderRadius: 4,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 51, 102, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 51, 102, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF3366',
            }
          }
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 10px rgba(255, 51, 102, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #FF3366 30%, #FF6B99 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #CC0033 30%, #FF3366 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#252525',
          borderRadius: 6,
          border: '1px solid rgba(255, 51, 102, 0.1)',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#252525',
        },
        option: {
          '&[data-focus="true"]': {
            backgroundColor: 'rgba(255, 51, 102, 0.15)',
          },
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(255, 51, 102, 0.25)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 4,
  },
  shadows: [
    'none',
    '0 0 1px rgba(255,51,102,0.1), 0 2px 4px rgba(0,0,0,0.2)',
  ],
});

// Topics List
const TOPICS = [
  'Arrays',
  'Linked Lists',
  'Sorting',
  'Dynamic Programming',
  'Trees',
  'Graphs',
];

export default function ChatbotUI() {
  const [level, setLevel] = useState('easy');
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const handleLevelChange = (selectedLevel) => {
    setLevel(selectedLevel);
  };

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
  };

  // This function gets called from CodeInterface to add bot messages
  const handleBotReply = (replyText) => {
    console.log('Adding bot reply to messages:', replyText);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: replyText
    }]);
  };
  
  // This function gets called when code is run or evaluated
  const handleCodeRun = (result) => {
    console.log('Code execution result:', result);
    // If this is an evaluation result that should be visible in the chat
    if (result.type === 'evaluate') {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `## Code Evaluation Result\n${result.content.output}`
      }]);
    } else {
      setMessages(prev => [...prev, {
        type: result.type,
        content: result.content
      }]);
    }
  };
  
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: darkTheme.palette.background.default,
    color: 'text.primary',
    overflow: 'hidden',
  };

  const contentStyles = {
    display: 'flex',
    flex: 1,
    padding: 3,
    gap: 3,
    overflow: 'hidden',
    '& > *': {
      flex: '1 1 50%',
      minWidth: '400px',
      maxWidth: '50%',
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={containerStyles}>
        <Header />
        <Box sx={contentStyles}>
          <ChatPanel
            level={level}
            onLevelChange={handleLevelChange}
            topic={topic}
            onTopicChange={handleTopicChange}
            topics={TOPICS}
            messages={messages}
            setMessages={setMessages}
            onNewQuestion={setCurrentQuestion}
            onCodeRun={handleCodeRun}
          />
          <CodeInterface
            onCodeRun={handleCodeRun}
            currentQuestion={currentQuestion}
            onGuideReply={handleBotReply}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}