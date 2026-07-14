import healthCheck from "./health.mjs";

export default (app)=>{
    app.use("/health", healthCheck);

}