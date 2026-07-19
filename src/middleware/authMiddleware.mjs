import jwt from "jsonwebtoken";
import User from "../models/user.mjs";
import ApplicationResponse from "../utils/ApplicationResponse.mjs";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(
        ApplicationResponse.error(
          null,
          "No token provided"
        )
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(ApplicationResponse.error(
        null,
        "User not found"
      ));
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json(ApplicationResponse.error(
      null,
      "Invalid or expired token"
    ));
  }
};

export default authMiddleware;