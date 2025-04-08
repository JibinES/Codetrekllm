import React, { useState } from 'react';
import { Typography, Autocomplete, TextField, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function TopicDropdown({ topic = '', onTopicChange }) {
  const [inputValue, setInputValue] = useState('');

  const topics = [
    "Arrays",
    "Linked Lists",
    "Sorting",
    "Dynamic Programming",
    "Trees",
    "Graphs"
  ];

  return (
    <Autocomplete
      options={topics}
      value={topic || null}
      onChange={(event, newValue) => {
        onTopicChange(newValue || '');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      popupIcon={<SearchIcon />}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="What topic do you want to learn today?"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.2)'
            },
            '& .MuiIconButton-root': {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }}
        />
      )}
    />
  );
}