import ApplicationResponse from "../utils/ApplicationResponse.mjs";

export default function healthCheck(req, res) {
    res.status(200).json(ApplicationResponse.success("Health check successful", null));
}