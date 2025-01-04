import React, { useState } from 'react';
import {
  Card,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const Publisher = () => {
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const [qos, setQos] = useState(0);

  const handlePublish = () => {
    // Implement publish logic
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Publish Message
      </Typography>
      
      <TextField
        fullWidth
        label="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>QoS</InputLabel>
        <Select
          value={qos}
          label="QoS"
          onChange={(e) => setQos(Number(e.target.value))}
        >
          <MenuItem value={0}>0 - At most once</MenuItem>
          <MenuItem value={1}>1 - At least once</MenuItem>
          <MenuItem value={2}>2 - Exactly once</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        margin="normal"
      />

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handlePublish}
          size="large"
        >
          Publish
        </Button>
      </Box>
    </Card>
  );
};

export default Publisher; 