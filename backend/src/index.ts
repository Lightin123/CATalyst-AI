import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length, "Ends with:", process.env.DATABASE_URL?.split('?')[1]);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CATalyst AI Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
