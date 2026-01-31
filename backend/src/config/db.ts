import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');

    console.log(`MongoDB verbunden: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    process.exit(1);
  }
};

export default connectDB;
