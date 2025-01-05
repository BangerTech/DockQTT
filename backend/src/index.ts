import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { MqttHandler } from './mqtt-handler';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

const mqttHandler = new MqttHandler(wss);

app.post('/connect', async (req: express.Request, res: express.Response) => {
  console.log('Received connection request:', req.body);
  
  const { host, port, username, password } = req.body;
  try {
    await mqttHandler.connect({ host, port, username, password });
    res.json({ success: true });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 