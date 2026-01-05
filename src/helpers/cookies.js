import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

/**
 * @param {Object} res
 *
 * @param {String} accessToken - Jwt string
 * @param {String} refreshToken - jwt string encoded with Cypher
 */

export const setAuthCookies = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 3600000, // LAST FOR ONE HOUR
  });
  console.log("environment:", process.env.NODE_ENV, isProduction);
};

/**
 *
 * @param {Object} res - Express Request Object
 * @returns Object with success and message
 */
export const clearAuthCookies = (res) => {
  return res.clearCookie("accessToken");
};
