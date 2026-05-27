import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import upscRoutes from './routes/upsc.js';
import codingRoutes from './routes/coding.js';
import fitnessRoutes from './routes/fitness.js';
import focusRoutes from './routes/focus.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/upsc', upscRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
