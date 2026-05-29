import express from 'express';
import cors from 'cors';
import generateRoutes from './routes/generate.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'crosspost-backend' });
});

app.use('/api', generateRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CrossPost backend running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[crosspost] ANTHROPIC_API_KEY not set. AI content generation will be unavailable.');
    console.warn('[crosspost] Copy .env.example to .env and add your Anthropic API key.');
  }
});
