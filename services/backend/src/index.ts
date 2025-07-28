import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './socket';
import { startNudgeCronJob } from './cron';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, { cors: { origin: '*' } });
initializeSocket(io);

// Start the cron job for the Nudge Engine
startNudgeCronJob(io);

app.get('/', (req, res) => res.send('Amara V3 Backend is alive!'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Amara Server listening on port ${PORT}`));