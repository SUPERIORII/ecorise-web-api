import db from "../database/pool.js";

export const getMenus = async (req, res) => {
  const role = req.user.role;
  console.log("Role:", role);
  try {
    const result = await db.query(
      `SELECT * FROM menus WHERE role=$1 ORDER BY position`,
      [role]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
