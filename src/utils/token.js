import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

/**
 * User access token for authentication and authorization
 * @param {Object} payload - Any data to store in jasonwebtoken when signating the payload
 */

export const createAccessToken = (user) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return token;
};

export const createRefreshToken = () => {
  try {
    //  STEP 1: GENERATE REFRESH TOKEN
    // const token = jwt.sign(
    //   { userId: user.id, role: user.role },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   {
    //     expiresIn: "7d",
    //   }
    // );
    // // STEP 2: ENCRYPT REFERSH TOKEN
    // const encryptedToken = encryption(token);

    // return encryptedToken;

    const token = crypto.randomBytes(64).toString("hex");
    return token;
  } catch (error) {
    console.log("Generating tokens Error:", error);
    return res.status(500);
  }
};
