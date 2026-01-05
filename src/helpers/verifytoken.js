import jwt from "jsonwebtoken";
import db from "../database/pool.js";
import { config } from "dotenv";
import { GET_UESR_BY_ID, GET_REFRESH_TOKEN } from "../database/queries.js";
import { clearAuthCookies } from "./cookies.js";

config();

export const verifyAccess = async (accessToken) => {
  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const result = await db.query(GET_UESR_BY_ID, [payload.userId, "active"]);
    const user = result.rows[0];
    return user;
  } catch (error) {
    return null;
  }
};

export const verifyRefresh = async (res, refreshToken) => {
  try {
    // STEP 2: IF NO TOKEN AVAILABLE OR TOKEN EXPIRED, CLEAR COOKIE AND DELETE FROM DB
    if (!record || record.created_at < new Date()) {
      return clearAuthCookies(res);
    }
    // STEP 3: IF REFRESH TOKEN IS VALID, ROTATE TOKENS BY GENERATING BOTH ACCESS AND REFRESH TOKENS
    // STEP 4: SAVE REFRESH TOKEN IN DB
    // STEP 5: STORE BOTH TOKENS COOKIE IN HTTP ONLY
    // STEP 6: RETURN TOKENS
    return {
      record,
      tokenNotExist: !record,
      isTokenExpired: record.created_at < new Date(),
    };
    // STEP 2: VERIFY IF TOKEN IS VALID
    const verifyResult = jwt.verify(
      decryptedToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(verifyResult);

    // IF REFRESH TOKEN EXPIRED, GENERATE NEW REFRESH AND ACCESS TOKENS
    const newToken = generateTokens(
      { userId: verifyResult.userId, role: verifyResult.role },
      verifyResult.userId
    );
    // RETURN NEW TOKENS
    return newToken;
  } catch (error) {
    console.log("veriying Refresh Token Error:", error.message);

    return null;
  }
};
