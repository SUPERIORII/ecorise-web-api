import db from "../database/pool.js";

export const searchAllUsers = async (req, res) => {
  // QUERY FROM SEARCH URL
  const query = req.query.q?.trim();
  const page = parseInt(req.query.page, 10) || 1;
  //   NUMBER OF ITEM TO RETURN
  const pageSize = parseInt(req.query.pageSize, 10) || 10;

  //   NUMBER OF ITEMS TO SKIP
  const offSet = (page - 1) * pageSize;

  //     QUERY PARAMETER
  const searchValue = `%${query}%`;

  //   CHECK IF QUERY IS EMPTY
  if (!query || query.length <= 0) return res.json([]);

  const [rowResult, countResult] = await Promise.all([
    db.query(
      `SELECT id, first_name, last_name, email, role, profile_url, created_at, status FROM users WHERE 
        first_name ILIKE $1 OR last_name ILike $1 OR email ILIKE $1 ORDER BY first_name ASC LIMIT $2 OFFSET $3
        `,
      [searchValue, pageSize, offSet]
    ),

    db.query(
      `SELECT COUNT (*) FROM users WHERE first_name ILIKE $1 OR last_name ILike $1 OR email ILIKE $1 `,
      [searchValue]
    ),
  ]);
  res.json({
    rowResult: rowResult.rows,
    countResult: parseInt(countResult.rows[0].count, 10),
    page: page,
    pageSize: pageSize,
    offSet: offSet,
  });
};
