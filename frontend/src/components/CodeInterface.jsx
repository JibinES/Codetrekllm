import React, { useState } from 'react';
import { Paper, Box, IconButton, Typography, Snackbar, Button } from '@mui/material';
import Editor from "@monaco-editor/react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function CodeInterface({ onCodeRun }) {
  const [code, setCode] = useState('// Start coding here...');
  const [showCopyNotification, setShowCopyNotification] = useState(false);

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
      // Safety check for eval
      if (code.includes('import') || code.includes('require')) {
        throw new Error('Import statements are not allowed for security reasons');
      }
      // eslint-disable-next-line no-new-func
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
        >
          Guide me
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<InsertDriveFileIcon />}
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
    </Box>
  );
}
