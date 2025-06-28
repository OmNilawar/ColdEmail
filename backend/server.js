import express from 'express';
import connectDB from './Database/dbConfig.js';
import session from 'express-session';
import passport from './Config/passportConfig.js'; // Ensure passport is configured
import authRouter from './Routes/authRoutes.js'; // Import the auth routes
import emailRouter from './Routes/emailRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();

app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // true in production (with HTTPS)
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use the auth routes
app.use('/auth', authRouter);
app.use('/email', emailRouter);

app.get('/', (req, res) => {
  res.send('Cold Email AI Backend is running!');
});

app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});