import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

export default app;
