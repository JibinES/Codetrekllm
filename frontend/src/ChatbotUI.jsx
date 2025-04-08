import React, { useState } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CodeInterface from './components/CodeInterface';
import { chat, evaluate, login, register, upload } from './services/api';

// Theme Configuration
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1A1A1A", // Almost black
      paper: "#252525", // Dark charcoal
    },
    text: {
      primary: "#F5F5F5", // Almost white
      secondary: "#B3B3B3", // Light gray
    },
    primary: {
      main: "#FF3366", // Dark pink
      light: "#FF6B99",
      dark: "#CC0033",
      contrastText: "#fff",
    },
    secondary: {
      main: "#990033", // Deep red
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
      main: "#4D0099", // Deep purple for success
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
      color: '#FF3366', // Dark pink headers
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
              borderColor: 'rgba(255, 51, 102, 0.3)', // Dark pink border
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
    // Add more shadows if needed
  ],
});

// Constants
const TOPICS = [
  'Arrays',
  'Linked Lists',
  'Sorting',
  'Dynamic Programming',
  'Trees',
  'Graphs',
];

// Main Component
export default function ChatbotUI() {
  const [level, setLevel] = useState('easy');
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState([]);

  const handleLevelChange = (selectedLevel) => {
    setLevel(selectedLevel);
  };

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
  };

  const handleCodeRun = (result) => {
    const panel = document.querySelector('[role="tabpanel"]');
    if (panel) {
      panel.scrollTop = panel.scrollHeight;
    }
    setMessages(prev => [...prev, {
      type: 'code-output',
      content: result
    }]);
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
      flex: '1 1 50%', // Equal width for both panels
      minWidth: '400px', // Minimum width
      maxWidth: '50%', // Maximum width
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
          />
          <CodeInterface onCodeRun={handleCodeRun} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}