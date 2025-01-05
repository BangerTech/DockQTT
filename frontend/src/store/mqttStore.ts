import { create } from 'zustand';
import { ConnectionConfig, MqttMessage, TopicNode } from '../types';

interface MqttStore {
  connected: boolean;
  config: ConnectionConfig | null;
  topics: TopicNode[];
  selectedTopic: string | null;
  messages: Record<string, MqttMessage[]>;
  viewMode: 'raw' | 'json' | 'table';
  setConnected: (status: boolean) => void;
  setConfig: (config: ConnectionConfig) => void;
  addMessage: (message: MqttMessage) => void;
  setViewMode: (mode: 'raw' | 'json' | 'table') => void;
  setSelectedTopic: (topic: string | null) => void;
}

export const useMqttStore = create<MqttStore>((set) => ({
  connected: false,
  config: null,
  topics: [],
  selectedTopic: null,
  messages: {},
  viewMode: 'json',
  
  setConnected: (status) => set({ connected: status }),
  setConfig: (config) => set({ config }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  
  addMessage: (message) => set((state) => {
    const messages = { ...state.messages };
    if (!messages[message.topic]) {
      messages[message.topic] = [];
    }
    messages[message.topic] = [message, ...messages[message.topic]].slice(0, 100);
    return { messages };
  }),
})); 