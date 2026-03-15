import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes.js';
import { createServer } from 'http';

const app = express();
app.use(express.json());

async function startServer() {
  try {
    const server = await registerRoutes(app);
    
    // CHANGE THIS LINE:
    const PORT = process.env.PORT || 5000; 
    
    // Change localhost to 0.0.0.0 to ensure it's accessible externally
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1); // Exit with error so Render knows it failed
  }
}

startServer();