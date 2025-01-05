import React, { useMemo, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Collapse, IconButton, Stack, Tooltip, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTheme } from '@mui/material/styles';

interface TopicTreeProps {
  topics: {
    [key: string]: {
      message: string;
      timestamp: number;
    };
  };
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
}

interface TopicNode {
  id: string;
  name: string;
  children: TopicNode[];
  isLeaf?: boolean;
}

const TreeNode = ({ node, level = 0, selectedTopic, onSelectTopic, topics }: {
  node: TopicNode;
  level?: number;
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  topics: Record<string, { message: string; timestamp: number }>;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasMessage = node.isLeaf && topics[node.id]?.message;
  const message = hasMessage ? topics[node.id].message : null;
  const theme = useTheme();

  return (
    <Box>
      <ListItem 
        disablePadding 
        sx={{ 
          pl: level * 1.5,
          borderLeft: level > 0 ? `2px solid ${theme.palette.divider}` : 'none',
          transition: 'all 0.2s'
        }}
      >
        <ListItemButton
          onClick={() => {
            if (node.children.length > 0) {
              setIsExpanded(!isExpanded);
            } else if (node.isLeaf) {
              onSelectTopic(node.id);
            }
          }}
          selected={selectedTopic === node.id}
          sx={{
            borderRadius: 2,
            my: 0.3,
            transition: 'all 0.2s',
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'common.white',
              boxShadow: theme.shadows[3],
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            },
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateX(4px)'
            }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" width="100%">
            {node.children.length > 0 ? (
              <IconButton
                size="small"
                sx={{
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            ) : (
              <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: hasMessage ? 'success.main' : 'text.disabled' }} />
              </Box>
            )}
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontWeight: node.children.length > 0 ? 600 : 400,
                  color: 'inherit'
                }}
              >
                {node.name}
              </Typography>
              {hasMessage && (
                <Tooltip title={message}>
                  <Typography 
                    variant="caption"
                    sx={{ 
                      display: 'block',
                      color: 'inherit',
                      opacity: 0.7,
                      fontSize: '0.7rem',
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {message?.substring(0, 40)}
                    {message?.length > 40 ? '...' : ''}
                  </Typography>
                </Tooltip>
              )}
            </Box>

            {node.isLeaf && topics[node.id]?.timestamp && (
              <Chip
                size="small"
                label={new Date(topics[node.id].timestamp).toLocaleTimeString()}
                sx={{ 
                  height: 20,
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: '0.65rem'
                  }
                }}
              />
            )}
          </Stack>
        </ListItemButton>
      </ListItem>
      
      <Collapse in={isExpanded}>
        <List disablePadding>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedTopic={selectedTopic}
              onSelectTopic={onSelectTopic}
              topics={topics}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

export default function TopicTree({ topics, selectedTopic, onSelectTopic }: TopicTreeProps) {
  const topicTree = useMemo(() => {
    const buildTree = () => {
      const tree: TopicNode[] = [];
      const sortedTopics = Object.keys(topics).sort();

      console.log('Building tree for topics:', sortedTopics);

      sortedTopics.forEach(topic => {
        const parts = topic.split('/');
        let currentLevel = tree;

        parts.forEach((part, index) => {
          let node = currentLevel.find(n => n.name === part);
          
          if (!node) {
            node = {
              id: parts.slice(0, index + 1).join('/'),
              name: part,
              children: [],
              isLeaf: index === parts.length - 1
            };
            currentLevel.push(node);
          }
          
          currentLevel = node.children;
        });
      });

      return tree;
    };

    const result = buildTree();
    console.log('Built tree structure:', JSON.stringify(result, null, 2));
    return result;
  }, [topics]);

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          Topics ({Object.keys(topics).length})
        </Typography>
      </Box>

      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        p: 2
      }}>
        <List disablePadding>
          {topicTree.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              selectedTopic={selectedTopic}
              onSelectTopic={onSelectTopic}
              topics={topics}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
} 