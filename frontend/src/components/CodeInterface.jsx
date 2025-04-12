import React, { useState, useEffect } from 'react';
import { Paper, Box, IconButton, Typography, Snackbar, Button } from '@mui/material';
import Editor from "@monaco-editor/react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axios from 'axios';

export default function CodeInterface({ currentQuestion, onCodeRun, onGuideReply }) {
  const [code, setCode] = useState('// Start coding here...');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setShowCopyNotification(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleRunCode = () => {
    try {
      if (code.includes('import') || code.includes('require')) {
        throw new Error('Import statements are not allowed for security reasons');
      }
      const result = Function(code)();
      onCodeRun({
        type: 'code-output',
        content: {
          code: code,
          output: result,
          success: true
        }
      });
    } catch (error) {
      onCodeRun({
        type: 'code-output',
        content: {
          code: code,
          output: error.message,
          success: false
        }
      });
    }
  };

  const handleGuideMe = async () => {
    try {
      console.log('Guide Me button clicked');
      const response = await axios.post('/api/guide-me/', {
        title: currentQuestion?.title,
        description: currentQuestion?.description,
        difficulty: currentQuestion?.difficulty
      });
  
      const reply = response.data.guide || 'No response from AI.';
      console.log('Received guide reply:', reply);
  
      // Send directly to chat panel as a bot message
      if (typeof onGuideReply === 'function') {
        console.log('Calling onGuideReply with reply');
        onGuideReply(reply);
      } else {
        console.error('onGuideReply is not a function');
      }
  
      setNotificationMessage("AI guidance received.");
    } catch (error) {
      console.error('Error getting guidance:', error);
      setNotificationMessage("Error getting guidance.");
    }
    setShowNotification(true);
  };    

  const handleTestLogic = async () => {
    try {
      console.log('Test Logic button clicked');
      const response = await axios.post('/api/evaluate-code/', {
        title: currentQuestion?.title,
        description: currentQuestion?.description,
        code: code
      });
  
      const result = response.data.feedback || 'No response from evaluator.';
      console.log('Received evaluation result:', result);
  
      // Only send to chat as a bot message - no longer duplicating in output
      if (typeof onGuideReply === 'function') {
        onGuideReply(`## Code Evaluation\n${result}`);
      }
  
      setNotificationMessage("Code evaluation completed.");
    } catch (error) {
      console.error('Error evaluating code:', error);
      setNotificationMessage("Error evaluating code.");
    }
    setShowNotification(true);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Editor Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Code Editor
          </Typography>
          <Box>
            <IconButton
              onClick={handleCopyCode}
              size="small"
              sx={{ mr: 1 }}
              title="Copy code"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleRunCode}
              size="small"
              color="primary"
              title="Run code"
              sx={{ mr: 1 }}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              title="Editor settings"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Code Editor */}
        <Box sx={{ flex: 1, minHeight: '500px' }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 1,
          mt: 2,
        }}
      >
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<DescriptionIcon />}
          onClick={handleGuideMe}
          disabled={!currentQuestion}
        >
          Guide me
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<InsertDriveFileIcon />}
          onClick={handleTestLogic}
          disabled={!currentQuestion || !code.trim() || code === '// Start coding here...'}
        >
          Test my logic
        </Button>
      </Box>

      {/* Notifications */}
      <Snackbar
        open={showCopyNotification}
        autoHideDuration={2000}
        onClose={() => setShowCopyNotification(false)}
        message="Code copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}