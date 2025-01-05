import React, { useMemo } from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Paper, Typography } from '@mui/material';

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

export default function TopicTree({ topics, selectedTopic, onSelectTopic }: TopicTreeProps) {
  console.log('TopicTree render with topics:', topics);
  console.log('Selected topic:', selectedTopic);

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

  const renderTree = (nodes: TopicNode[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={node.name}
        onClick={() => {
          console.log('Clicked node:', node.id);
          node.isLeaf && onSelectTopic(node.id);
        }}
        sx={{
          '& .MuiTreeItem-content': {
            padding: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText'
            },
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        }}
      >
        {Array.isArray(node.children) && node.children.length > 0 && renderTree(node.children)}
      </TreeItem>
    ));
  };

  console.log('TreeView props:', {
    expanded: topicTree.map(node => node.id),
    selected: selectedTopic || '',
    children: topicTree.length
  });

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.default'
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
          Topics
        </Typography>
      </Box>

      {/* Tree View */}
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        px: 1,
        py: 2
      }}>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={topicTree.map(node => node.id)}
          selected={selectedTopic || ''}
          sx={{
            '& .MuiTreeItem-root': {
              '& .MuiTreeItem-content': {
                py: 0.75,
                px: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiTypography-root': {
                    color: 'inherit'
                  }
                },
                '&:hover:not(.Mui-selected)': {
                  bgcolor: 'action.hover'
                }
              },
              '& .MuiTreeItem-group': {
                ml: 2,
                borderLeft: 1,
                borderColor: 'divider',
                pt: 0.5
              }
            }
          }}
        >
          {renderTree(topicTree)}
        </TreeView>
      </Box>
    </Box>
  );
} 