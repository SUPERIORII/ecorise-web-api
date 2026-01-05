import db from "../database/pool.js";
export const generateGuestId = async (contentType) => {
  // GETTING THE TOTAL COUNT OF LIKES
  const count = await db.query(
    `SELECT COUNT(*) FROM likes WHERE content_type=$1 AND guest_id IS NOT NULL`,
    [contentType]
  );
  const totalLikes = parseInt(count.rows[0].count) + 1;
  //   GENERATE A UNIQUE FOUR DIGIT ID FROM THE TOTAL LIKE COUNT
  const timeStamp = Date.now().toString().slice(10, 13);
  const padStart = totalLikes.toString().padStart(3, 0);

  // RETURN THE GENERATED GUEST ID
  const generatedId = `guest_${padStart}`;
  return generatedId;
};
