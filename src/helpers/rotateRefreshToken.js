import db from "../database/pool.js";
import {
  INSERT_REFRESH_TOKEN,
  REMOVE_REFRESH_TOKEN_BY_ID,
} from "../database/queries.js";

export const rotateRefreshToken = async ({
  oldTokenId,
  userId,
  newRefreshToken,
}) => {
  try {
    const result = await db.query(REMOVE_REFRESH_TOKEN_BY_ID, [oldTokenId]);

    if (result.rowCount === 0) {
      throw new Error("Refresh token reuse detected");
    }

    await db.query(INSERT_REFRESH_TOKEN, [
      newRefreshToken.iv,
      newRefreshToken.content,
      newRefreshToken.tag,
      userId,
    ]);
  } catch (error) {
    throw error;
  }
};
