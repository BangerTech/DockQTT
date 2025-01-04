import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography,
  styled 
} from '@mui/material';
import { useConnection } from '../context/ConnectionContext';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: '0 auto',
  marginTop: '10vh',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  borderRadius: 12,
}));

const WelcomePage = () => {
  const { connect } = useConnection();
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await connect(
        formData.host,
        formData.port,
        formData.username || undefined,
        formData.password || undefined
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: 3
    }}>
      <StyledCard>
        <Typography variant="h4" gutterBottom align="center" 
          sx={{ fontWeight: 600, color: '#1a73e8' }}>
          MQTT Explorer
        </Typography>
        
        <form onSubmit={handleConnect}>
          <TextField
            fullWidth
            label="Broker Host"
            margin="normal"
            value={formData.host}
            onChange={(e) => setFormData({...formData, host: e.target.value})}
          />
          <TextField
            fullWidth
            label="Port"
            margin="normal"
            value={formData.port}
            onChange={(e) => setFormData({...formData, port: e.target.value})}
          />
          <TextField
            fullWidth
            label="Username (optional)"
            margin="normal"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <TextField
            fullWidth
            type="password"
            label="Password (optional)"
            margin="normal"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <Button 
            fullWidth 
            variant="contained"
            size="large"
            type="submit"
            sx={{ 
              mt: 3, 
              mb: 2,
              height: 48,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Connect
          </Button>
        </form>
      </StyledCard>
    </Box>
  );
};

export default WelcomePage; 