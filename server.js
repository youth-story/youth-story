require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const announcementRoutes = require('./routes/announcements');
const articleRoutes = require('./routes/articles');
const { errorHandler } = require('./middleware/error');
const app = express();
const PORT = process.env.PORT || 5000;
const retryAttempts = 3; // Maximum number of retry attempts
const retryInterval = 5000; // Delay between retries in milliseconds

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/articles', articleRoutes);

// Error handling middleware
app.use(errorHandler);

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
      // Start your Express server or perform other operations
      app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      if (retryAttempts > 0) {
        console.log(`Retrying connection in ${retryInterval / 1000} seconds...`);
        setTimeout(connectWithRetry, retryInterval);
        retryAttempts-=1;
      } else {
        console.error('Exceeded maximum retry attempts. Cannot establish database connection.');
        // Render an error page or redirect to an error route
        app.get('/', (req, res) => {
          res.status(500).send('Internal Server Error');
        });
      }
    });
};

connectWithRetry();