import mongoose from 'mongoose';
import config from '../config/index.mjs';
import { dbLog } from './logHelper.mjs';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(config.dbUrl);
  dbLog('MongoDB connected');
  return mongoose.connection;
};

export default connectDB;
