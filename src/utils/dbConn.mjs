import mongoose from 'mongoose';
import config from '../config/index.mjs';
import { dbLog } from './logHelper.mjs';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.dbUrl, {
      dbName: config.dbName, // Optional if already in URI
    });

    dbLog(`Db Connected: ${conn.connection.host}`);
  } catch (error) {
    dbLog("Db Connection Error:", error.message);
  }
};

export default connectDB;