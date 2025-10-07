
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rabbitmqService = require('./services/rabbitmq');
const { authenticateToken, authConfig, JWT_SECRET } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// RabbitMQ Connection
rabbitmqService.connect();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = authConfig.users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username: user.username });
});

// Protected routes
app.use('/api/expenses', authenticateToken, require('./routes/expenses'));

// Static file serving for downloads
app.get('/api/download/:filename', authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, process.env.UPLOAD_PATH, filename);
  res.download(filepath);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
