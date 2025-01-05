import create from 'zustand';
import { MqttMessage } from '../types';

interface MqttState {
  messages: MqttMessage[];
  topicMessages: Record<string, MqttMessage>;
  connected: boolean;
  addMessage: (message: MqttMessage) => void;
  setConnected: (status: boolean) => void;
}

export const useMqttStore = create<MqttState>((set) => ({
  messages: [],
  topicMessages: {},
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
})); 