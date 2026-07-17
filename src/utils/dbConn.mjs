import mongoose from 'mongoose';
import config from '../config/index.mjs';
import { dbLog } from './logHelper.mjs';

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...:"+config.dbUrl);
    const conn = await mongoose.connect(config.dbUrl);

    dbLog(`Db Connected: ${conn.connection.host}`);
  } catch (error) {
    dbLog("Db Connection Error:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;