import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";

router.get("/me", (req, res) => {
  // const token = req.cookies.infoToken;
  const token = req.cookies.accessToken;

  // CHECK IF USER IS LOGGED IN
  if (!token) return res.status(401).json({ authenticated: false });

  // CHECK IF TOKEN IS VALID AND NOT EXPIRED
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;

    return res.status(200).json({
      authenticated: true,
      user: { id: decoded.userId, role: decoded.role },
    });
  } catch (error) {
    console.log("jwt error", error.message);
    console.log("jwt error", error.name);
    return res.status(401).json({ authenticated: false });
  }
});

export default router;
