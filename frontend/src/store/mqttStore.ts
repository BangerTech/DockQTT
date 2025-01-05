import create from 'zustand';
import { MqttMessage } from '../types';

interface MqttState {
  messages: MqttMessage[];
  topicMessages: Record<string, MqttMessage>;
  selectedTopic: string | null;
  connected: boolean;
  addMessage: (message: MqttMessage) => void;
  setConnected: (status: boolean) => void;
  selectTopic: (topic: string | null) => void;
}

export const useMqttStore = create<MqttState>((set) => ({
  messages: [],
  topicMessages: {},
  selectedTopic: null,
  connected: false,
  addMessage: (message) => set((state) => {
    const newTopicMessages = {
      ...state.topicMessages,
      [message.topic]: message,
    };
    
    return {
      messages: [message, ...state.messages].slice(0, 1000),
      topicMessages: newTopicMessages,
    };
  }),
  setConnected: (status) => set({ connected: status }),
  selectTopic: (topic) => set({ selectedTopic: topic }),
})); 