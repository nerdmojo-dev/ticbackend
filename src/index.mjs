
import express from "express";
import config from './config/index.mjs';
import connectDB from './utils/dbConn.mjs';
import morganLogger from './middleware/morganLogger.mjs';
import routes from './route/index.mjs';
import { appLog, dbLog } from './utils/logHelper.mjs';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganLogger); // Use the morgan logger middleware

routes(app);

app.listen(config.port,()=>{

    appLog(`Server is running on port ${config.port}`);
    dbLog(`Initiating db connection...`);
    connectDB();

    
})