// Hilfs-Funktionen für die Topic-Organisation
const organizeTopics = (messages) => {
  const groups = {};
  
  Object.entries(messages).forEach(([topic, data]) => {
    const parts = topic.split('/');
    const mainGroup = parts[0];
    const subGroup = parts[1] || 'general';
    
    if (!groups[mainGroup]) {
      groups[mainGroup] = {
        name: mainGroup,
        subGroups: {},
        totalMessages: 0
      };
    }
    
    if (!groups[mainGroup].subGroups[subGroup]) {
      groups[mainGroup].subGroups[subGroup] = {
        name: subGroup,
        topics: [],
        totalMessages: 0
      };
    }
    
    groups[mainGroup].subGroups[subGroup].topics.push({
      fullTopic: topic,
      name: parts.slice(2).join('/') || topic,
      lastMessage: data.message,
      count: data.count,
      timestamp: data.timestamp
    });
    
    groups[mainGroup].subGroups[subGroup].totalMessages += data.count;
    groups[mainGroup].totalMessages += data.count;
  });
  
  return groups;
};

// Formatiere MQTT Nachrichten für die Anzeige
const formatMessage = (message) => {
  try {
    // Versuche JSON zu parsen
    const parsed = JSON.parse(message);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Wenn kein JSON, zeige als normalen Text
    return message;
  }
};

export { organizeTopics, formatMessage }; 