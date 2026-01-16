const isProduction = process.env.NODE_ENV === "production";

/**
 * @param {Object} res
 *
 * @param {String} accessToken - Jwt string
 * @param {String} refreshToken - jwt string encoded with Cypher
 */

export const setAuthCookies = (res, accessToken) => {
    const isProduction = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction, // 🔑 Only secure in prod
    sameSite: isProduction ? "lax" : "lax", // or "lax" works for both
    path: "/",
    maxAge: 60 * 60 * 1000, // LAST FOR ONE HOUR
  });
};

/**
 *
 * @param {Object} res - Express Request Object
 * @returns Object with success and message
 */
export const clearAuthCookies = (res) => {
  return res.clearCookie("accessToken");
};
