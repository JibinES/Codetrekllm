import React from 'react';
import { Box, Button } from '@mui/material';

export default function LevelButtons({ level, onLevelChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        onClick={() => onLevelChange('easy')}
        variant="contained"
        color={level === 'easy' ? 'primary' : 'inherit'}
      >
        Easy
      </Button>
      <Button
        onClick={() => onLevelChange('medium')}
        variant="contained"
        color={level === 'medium' ? 'primary' : 'inherit'}
      >
        Medium
      </Button>
      <Button
        onClick={() => onLevelChange('hard')}
        variant="contained"
        color={level === 'hard' ? 'primary' : 'inherit'}
      >
        Hard
      </Button>
    </Box>
  );
}
