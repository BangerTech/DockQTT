import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MqttService } from './services/mqtt.service';
import { ConnectionConfig } from './types';

const app = express();
const server = http.createServer(app);

// CORS-Konfiguration aktualisieren
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.2.86:3000',
  'http://127.0.0.1:3000'
];

// CORS für Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// CORS für Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://frontend:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

const mqttService = new MqttService(io);

app.use(express.json());

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// MQTT connection endpoint
app.post('/api/connect', async (req, res) => {
  try {
    const config = req.body as ConnectionConfig;
    await mqttService.connect(config);
    res.json({ success: true });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ 
      error: 'Connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MQTT publish endpoint
app.post('/api/publish', (req, res) => {
  try {
    const { topic, message } = req.body;
    mqttService.publish(topic, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish message' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('a user connected');
  // Handle socket events here
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mqttService.disconnect();
    process.exit(0);
  });
}); 