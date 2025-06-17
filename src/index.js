// index.js

require('dotenv').config();   // .env 읽어오기
console.log('PORT:', process.env.PORT);

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// === Route 모음 ===
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);
// ===================

app.listen(port, () => {
  console.log(`Finger-Snap API listening on http://localhost:${port}`);
});
