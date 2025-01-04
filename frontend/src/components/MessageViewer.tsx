import React from 'react';
import {
  Box,
  Card,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';

type ViewMode = 'raw' | 'json' | 'table';

const MessageViewer = () => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('json');

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Messages</Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="raw">Raw</ToggleButton>
          <ToggleButton value="json">JSON</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
        {/* Message content will be rendered here */}
      </Box>
    </Card>
  );
};

export default MessageViewer; 