import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TopicTree from './TopicTree';
import MessageViewer from './MessageViewer';
import Publisher from './Publisher';

interface Topic {
  message: string;
  timestamp: number;
}

interface Topics {
  [key: string]: Topic;
}

const DRAWER_WIDTH = 320;
const TOOLBAR_HEIGHT = 64;

export default function Dashboard() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topics>({});
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTopicsUpdate = useCallback((data: any) => {
    console.log('Received topic update:', data);
    setTopics(prev => {
      const newTopics = {
        ...prev,
        ...data
      };
      console.log('New topics state:', newTopics);
      return newTopics;
    });
  }, []);

  useEffect(() => {
    const wsInstance = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);

    wsInstance.onopen = () => {
      console.log('WebSocket connected');
    };

    wsInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'topics') {
          handleTopicsUpdate(data.data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    setWs(wsInstance);

    return () => {
      wsInstance.close();
    };
  }, [handleTopicsUpdate]);

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ minHeight: TOOLBAR_HEIGHT }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'text.primary'
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            MQTT Explorer
          </Typography>
          <Typography 
            variant="body2"
            sx={{ 
              ml: 2,
              color: 'text.secondary',
              bgcolor: 'action.selected',
              px: 1.5,
              py: 0.5,
              borderRadius: 1
            }}
          >
            {Object.keys(topics).length} Topics
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'hidden'
          },
        }}
      >
        <Toolbar sx={{ minHeight: TOOLBAR_HEIGHT }} />
        <Box sx={{ 
          height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <TopicTree 
            topics={topics} 
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        </Box>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          pt: `calc(${TOOLBAR_HEIGHT}px + 24px)`,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid item xs={12} sx={{ flexGrow: 1 }}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <MessageViewer 
                topic={selectedTopic} 
                message={selectedTopic ? topics[selectedTopic]?.message : null}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Publisher />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 