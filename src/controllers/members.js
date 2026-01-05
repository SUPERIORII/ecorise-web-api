import db from "../database/pool.js";

export const getLatestMembers = async (req, res) => {
  const query = `SELECT s.id AS sociallink_id, s.facebook_Url, 
    s.whatsapp_Url, s.instagram_Url, s.user_id, u.username, u.shadowname AS psudo_name,
    u.user_profile, u.user_role FROM social_links AS s JOIN users 
    AS u ON(u.id=s.user_id) LIMIT $1`;
  try {
    const result = await db.query(query, [4]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.log("❌Internal server error");
    return res.status(500).json("Server Error:", err.message);
  }
};

export const getAllembers = (req, res) => {
  res.json("getting all users");
};
