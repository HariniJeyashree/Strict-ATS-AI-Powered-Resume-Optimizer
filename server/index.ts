import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes.js';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup __dirname for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

async function startServer() {
  try {
    // 1. Initialize API Routes
    const server = await registerRoutes(app);
    
    const PORT = process.env.PORT || 5000;
    // Resolve path to the 'dist' folder (Vite build output)
    const distPath = path.resolve(__dirname, '..', 'dist');

    // 2. Serve Static Frontend Files
    if (fs.existsSync(distPath)) {
      console.log(`✅ Frontend dist found at: ${distPath}`);
      app.use(express.static(distPath));
      
      // Catch-all route: Send index.html for any non-API request (React Router support)
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('⚠️ Warning: dist folder not found. Frontend will not be served.');
      app.get('/', (req, res) => {
        res.send('Backend is active. Run "npm run build" to generate frontend files.');
      });
    }

    // 3. Start the Server
    // Use 0.0.0.0 to ensure Render can route traffic to the container
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error('❌ CRITICAL: Server failed to start:', error);
    process.exit(1); // Ensure Render logs the failure and attempts a restart
  }
}

startServer();