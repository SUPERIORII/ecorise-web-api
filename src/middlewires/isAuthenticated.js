import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
/**
 *
 * @param {Object} req - Express Request Object
 * @param {Object} res - Express Response Object
 * @param {Object} next - Express Next object
 */

export const isAuthenticated = async (req, res, next) => {
  try {
    // STEP 1: GET SIGNED COOKIE
    const token = req.cookies.accessToken;
    //CHECK THERE IS NO TOKEN
    if (!token) return res.status(401).json({ message: "Not logged in" });
    // GET THE USER AND SAVE IT IN THE REQUEST OBJECT
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;
    // res.status(200).json(req.user);
    next();
  } catch (error) {
    console.log("Authenticating User Error:", error.message);
    res.status(500).json("Authenticating user error");
  }
};
