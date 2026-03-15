import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes.js';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Add this to check for the folder

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

async function startServer() {
  try {
    const server = await registerRoutes(app);
    const PORT = process.env.PORT || 5000;
    const distPath = path.join(__dirname, '../dist');

    // Only serve static files if the dist folder actually exists
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      
      // Catch-all route for SPA (React)
      app.get('*', (req, res, next) => {
        // If it's an API call, don't send index.html
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Local development message
      app.get('/', (req, res) => {
        res.send('Backend is running. Run "npm run build" to generate the frontend dist folder.');
      });
    }

    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

startServer();