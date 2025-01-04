import React from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Typography } from '@mui/material';

interface TopicNode {
  id: string;
  name: string;
  children?: TopicNode[];
}

const TopicTree = () => {
  const [topics, setTopics] = React.useState<TopicNode[]>([]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Topics
      </Typography>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {topics.map((topic) => (
          <TreeItem
            key={topic.id}
            nodeId={topic.id}
            label={topic.name}
          />
        ))}
      </TreeView>
    </Box>
  );
};

export default TopicTree; 