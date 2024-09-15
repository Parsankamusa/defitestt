const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const cron = require("node-cron");
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const userRouter = require('./routes/api/user.route');
const walletRouter = require('./routes/api/wallet.route');
const subscriberRouter = require('./routes/api/subscriber.route');
const ieo = require('./routes/api/ieo.route');
const p2p = require('./routes/api/p2p.route');
const WalletService = require('./services/wallet.service');

// Cron job
cron.schedule('*/10 * * * *', () => {
  WalletService.updateTopTokens().then(() => {
    console.log("Top Token data updated");
  });
});

// Initialize Express app
const app = express();

// Load environment variables
dotenv.config();

// Parse JSON bodies
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// CORS middleware
// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Enable pre-flight requests
app.options("*", cors({
  origin: 'http://192.168.0.109:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session middleware
app.use(session({
  key: "user_sid",
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 86400000,
  },
}));

// Set port from environment variable or default to 5000
const port = Number(process.env.PORT || 5000);

console.log(`Server is running on port ${port}`);

// Mount routers
app.use('/api/users', userRouter);
app.use('/api/wallets', walletRouter);
app.use('/api/subscribers', subscriberRouter);
app.use('/api/ieo', ieo);
app.use('/api/p2p', p2p);

// Debugging route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: err.message });
// });

// Starting the server
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});


app.listen(port, () => 
  console.log(`🚀 Server running on port ${port}!`)
);

module.exports = app;

