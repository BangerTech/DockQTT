import create from 'zustand';
import { MqttMessage, ConnectionConfig } from '../types';

interface MqttState {
  messages: MqttMessage[];
  topicMessages: Record<string, MqttMessage[]>;
  selectedTopic: string | null;
  connected: boolean;
  currentConnection: ConnectionConfig | null;
  addMessage: (message: MqttMessage) => void;
  setConnected: (status: boolean) => void;
  selectTopic: (topic: string | null) => void;
  disconnect: () => void;
  setCurrentConnection: (config: ConnectionConfig) => void;
}

export const useMqttStore = create<MqttState>((set, get) => ({
  messages: [],
  topicMessages: {},
  selectedTopic: null,
  connected: false,
  currentConnection: null,
  addMessage: (message) => {
    console.log('Store adding message:', message);
    set((state) => {
      const existingMessages = state.topicMessages[message.topic] || [];
      const updatedMessages = [message, ...existingMessages].slice(0, 100);
      
      console.log('Updated topic messages:', {
        topic: message.topic,
        messageCount: updatedMessages.length
      });
      
      return {
        messages: [message, ...state.messages].slice(0, 1000),
        topicMessages: {
          ...state.topicMessages,
          [message.topic]: updatedMessages,
        },
      };
    });
  },
  setConnected: (status) => set({ connected: status }),
  selectTopic: (topic) => set({ selectedTopic: topic }),
  disconnect: () => set({ 
    connected: false, 
    messages: [], 
    topicMessages: {}, 
    selectedTopic: null,
    currentConnection: null 
  }),
  setCurrentConnection: (config) => set({ currentConnection: config }),
})); 