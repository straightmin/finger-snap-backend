// src/server.ts
import express from 'express';
import authRoutes from './routes/auth.routes'; // ✅ default import 그대로

const app = express();
app.use(express.json());

// 두 번째 인자는 이미 'Router' (함수) → .default 붙이면 객체가 돼버림!
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('PORT : 3000'));