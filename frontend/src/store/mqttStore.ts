import { create } from 'zustand';
import { ConnectionConfig, MqttMessage } from '../types';

interface MqttStore {
  connected: boolean;
  currentConnection: ConnectionConfig | null;
  topicMessages: Record<string, MqttMessage[]>;
  selectedTopic: string | null;
  setConnected: (status: boolean) => void;
  setCurrentConnection: (config: ConnectionConfig | null) => void;
  addMessage: (topic: string, message: MqttMessage) => void;
  selectTopic: (topic: string | null) => void;
  disconnect: () => void;
}

export const useMqttStore = create<MqttStore>((set) => ({
  connected: false,
  currentConnection: null,
  topicMessages: {},
  selectedTopic: null,
  setConnected: (status) => set({ connected: status }),
  setCurrentConnection: (config) => set({ currentConnection: config }),
  addMessage: (topic, message) => 
    set((state) => ({
      topicMessages: {
        ...state.topicMessages,
        [topic]: [message, ...(state.topicMessages[topic] || [])].slice(0, 100), // Keep last 100 messages
      },
    })),
  selectTopic: (topic) => set({ selectedTopic: topic }),
  disconnect: () => set({ 
    connected: false, 
    currentConnection: null, 
    topicMessages: {},
    selectedTopic: null 
  }),
})); 