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

export const useMqttStore = create<MqttStore>((set, get) => ({
  connected: false,
  currentConnection: null,
  topicMessages: {},
  selectedTopic: null,
  setConnected: (status) => {
    if (status !== get().connected) {
      set({ connected: status });
    }
  },
  setCurrentConnection: (config) => set({ currentConnection: config }),
  addMessage: (topic, message) => {
    const currentMessages = get().topicMessages[topic] || [];
    // Prüfe, ob die Nachricht bereits existiert
    const messageExists = currentMessages.some(
      (msg) => msg.timestamp === message.timestamp
    );
    
    if (!messageExists) {
      set((state) => ({
        topicMessages: {
          ...state.topicMessages,
          [topic]: [message, ...currentMessages].slice(0, 100),
        },
      }));
    }
  },
  selectTopic: (topic) => set({ selectedTopic: topic }),
  disconnect: () => set({ 
    connected: false, 
    currentConnection: null,
    topicMessages: {},
    selectedTopic: null 
  }),
})); 