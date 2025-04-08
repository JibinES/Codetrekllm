import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

export default function Header() {
  return (
    <AppBar 
      position="static" 
      elevation={4}
      sx={{ 
        borderRadius: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
          Codetrek.AI
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
