import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface MessageViewerProps {
  topic: string | null;
  message: string | null;
  timestamp?: number;
}

export default function MessageViewer({ topic, message, timestamp }: MessageViewerProps) {
  const isJson = message && message.startsWith('{');
  const formattedMessage = isJson ? JSON.stringify(JSON.parse(message), null, 2) : message;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {topic ? (
        <>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              Topic
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, fontFamily: 'monospace' }}>
              {topic}
            </Typography>
            {timestamp && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Letzte Aktualisierung: {new Date(timestamp).toLocaleString('de-DE')}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
            <Typography variant="overline" color="text.secondary">
              Message
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                mt: 2,
                p: 2,
                bgcolor: 'grey.50',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: 'calc(100vh - 400px)'
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {formattedMessage}
              </pre>
            </Paper>
          </Box>
        </>
      ) : (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6">
            Kein Topic ausgewählt
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Wählen Sie ein Topic aus der linken Seitenleiste aus
          </Typography>
        </Box>
      )}
    </Box>
  );
} 