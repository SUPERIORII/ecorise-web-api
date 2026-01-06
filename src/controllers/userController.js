import db from "../database/pool.js";
import { verifyAccess } from "../helpers/verifytoken.js";
import { clearAuthCookies, setAuthCookies } from "../helpers/cookies.js";
import {
  GET_REFRESH_TOKEN,
  GET_UESR_BY_ID,
  REMOVE_ALL_USER_TOKEN,
} from "../database/queries.js";
import { createAccessToken, createRefreshToken } from "../utils/token.js";
import { rotateRefreshToken } from "../helpers/rotateRefreshToken.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`SELECT id, first_name, last_name,
      email, role, profile_url, gradient_color, status, created_at 
      FROM users`);

    if (result.rows.length === 0) {
      return res.status(401).json("No user found");
    }
    // REMOVE ALL PASSWORD AND SENT THE USER REMAINING DATA TO CLIENT
    const dataWithOutPassword = result.rows;
    res.json(dataWithOutPassword);
  } catch (error) {
    console.log("Getting all users error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: error.message,
        message: "Getting Users Error",
      });
  }
};

export const authUser = async (req, res) => {
  try {
    // ✅ GET HTTP ONLY COOKIES
    const accessToken = req.cookies.accessToken;

    // const refreshToken = req.cookies.refreshToken;

    // ❌CHECK IF TOKENS DOES NOT EXIST
    if (!accessToken) {
      clearAuthCookies(res);
      console.log("Not log in");
      return res.sendStatus(401);
    }

    // // ✅ IF ACCESS TOKEN VALID, RETURN THE USER
    const user = await verifyAccess(accessToken);
    if (user) return res.status(200).json(user);

    // 🔄️ IF ACCESS TOKEN EXPIRED - TRY REFRESH
    // if (!refreshToken) {
    //   clearAuthCookies(res);
    //   console.log("Refresh token not found");

    //   return res.sendStatus(401);
    // }

    // // STEP 1: CHECK REFRESH TOKEN IN DB
    // const { rows } = await db.query(GET_REFRESH_TOKEN, [refreshToken]);
    // const record = rows[0];

    // // STEP 2: IF TOKEN EXPIRED OR INVALID, CLEAR COOKIE AND DELETE FROM DB
    // if (!record || record.expires_at < new Date()) {
    //   // 🔐 IF REFRESH IS AVAILBLE, remove TOKEN IN DB
    //   if (record) {
    //     await db.query(REMOVE_ALL_USER_TOKEN, [record.user_id]);
    //   }
    //   clearAuthCookies(res);
    //   console.log("token expired or invalid");

    //   return res.sendStatus(401);
    // }

    // //🔄️ ROTATE TOKENS
    // const userResult = await db.query(GET_UESR_BY_ID, [
    //   record.user_id,
    //   "active",
    // ]);
    // const updatedUser = userResult.rows[0];
    // const newAccessToken = createAccessToken(updatedUser);
    // const newRefreshToken = createRefreshToken(updatedUser);

    // try {
    //   await rotateRefreshToken({
    //     oldTokenId: record.id,
    //     userId: updatedUser.id,
    //     newRefreshToken,
    //   });

    //   console.log("token rotation successful");
    // } catch (error) {
    //   await db.query(REMOVE_ALL_USER_TOKEN, [updatedUser.id]);
    //   clearAuthCookies(res);
    //   console.log("token insert failed");

    //   return res.sentStatus(401);
    // }

    // // STEP 5: STORE ACCESS AND REFRESH TOKENS IN COOKIES WITH HTTP ONLY
    // setAuthCookies(res, newAccessToken, newRefreshToken.content);
    // // GET USER DATA AND SENT BACK TO CLIENT
    // return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("authenticating:", error);
    return res.status(401).json({
      success: false,
      error: error.message,
      message: "Invalid or expired token",
    });
  }
};
