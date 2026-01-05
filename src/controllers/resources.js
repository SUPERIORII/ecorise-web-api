import db from "../database/pool.js";

// get latest news

export const getResources = async (req, res) => {
  const query = `SELECT * FROM resources ORDER BY created_date DESC LIMIT $1`;
  try {
    const result = await db.query(query, [2]);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

// get all news

export const getAllResources = async (req, res) => {
  const query = `SELECT * FROM resources ORDER BY created_date DESC`;
  try {
    const result = await db.query(query);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
