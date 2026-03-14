import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes.js';
import { createServer } from 'http';

const app = express();
app.use(express.json());

async function startServer() {
  try {
    const server = await registerRoutes(app);
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
  }
}

startServer();
