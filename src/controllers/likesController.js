import { getIO } from "../config/socket.config.js";
import db from "../database/pool.js";
import jwt from "jsonwebtoken";

const io = getIO();

export const getLikes = async (req, res) => {
  const { contentId, contentType, userId } = req.query;
  const id = Number(userId) || null;

  console.log("userId:", id);

  try {
    const result = await db.query(
      `SELECT user_id FROM likes WHERE content_id=$1 AND content_type=$2`,
      [contentId, contentType]
    );

    const mapUserId = result.rows.map((existingId) => existingId.user_id);

    const isUserId = mapUserId.includes(id);
    console.log(isUserId);

    //SEND THE LIKE COUNT TO USER
    return res.status(200).json({
      likes: result.rows.map((likes) => likes.user_id),
      isUserId,
    });
  } catch (error) {
    console.log("Getting Likes Error:", error);
    res.json({
      success: false,
      error: error.message,
      message: "Internal Server Errror",
    });
  }
};

export const addDeleteLikes = async (req, res) => {
  // STORE EITHER USERID OR GUEST ID IN A CONTAINER
  const { contentId, contentType } = req.body;
  const token = req.cookies.infoToken;
  const socket = getIO();
  let isLike;

  try {
    // GET LOGIN USER ID
    if (!token)
      return res.status(400).json({
        success: "false",
        message: "Please Login to like this content",
      });

    // VERIFY USER TOKEN THE FORMATION WITH THE USER ID
    const verifyToken = jwt.verify(token, process.env.SECRET);
    // CHECK FOR EXISTING LIKE
    const isExisting = await db.query(
      `SELECT user_id FROM likes WHERE content_id=$1 AND content_type=$2`,
      [contentId, contentType]
    );

    const mapUserId = isExisting.rows.map((existingId) => existingId.user_id);
    if (mapUserId.includes(verifyToken.userId)) {
      // UNLIKE
      await db.query(
        `DELETE FROM likes WHERE user_id=$1 AND content_id=$2 AND content_type=$3`,
        [verifyToken.userId, contentId, contentType]
      );
      // SET THE DELETED LIKE TO FALSE
      isLike = false;
    } else {
      // LIKE
      await db.query(
        `INSERT INTO likes(user_id, content_id, content_type) VALUES($1,$2,$3)
        ON CONFLICT (user_id, content_id, content_type) DO NOTHING`,
        [verifyToken.userId, contentId, contentType]
      );
      isLike = true;
    }

    // GET UPDATED COUNT
    const getUpdatedLike = await db.query(
      "SELECT user_id FROM likes WHERE content_id=$1 AND content_type=$2",
      [contentId, contentType]
    );

    // BROADCAST UPDATED LIKES THROUGH SOCKET IO
    socket.emit("updatedLike", {
      contentId,
      updatedLikes: getUpdatedLike.rows,
      isLike: isLike,
      userId: verifyToken.userId,
    });

    // SEND THE RESULT TO THE USER
    return res.status(201).json({
      isLike: isLike,
      message: isLike ? "content has been liked" : "like deleted successfully",
      updatedLikes: getUpdatedLike.rows,
    });
  } catch (error) {
    console.log("Adding Like error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal Server Errror",
    });
  }
};
