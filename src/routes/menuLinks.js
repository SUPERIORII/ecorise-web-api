import express from "express";
import db from "../database/pool.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ADDING TO THE DATABASE
router.post("/", (req, res) => {
  (async () => {
    const token = req.cookies.infoToken;
    if (!token) return res.status(403).json("token is not valid");
    try {
      const userData = jwt.verify(token, process.env.SECRET);
      // get the user and check their role
      const userInfoResult = await db.query(
        "SELECT users.user_role FROM users WHERE id=$1",
        [userData.userId]
      );
      const userRole = userInfoResult.rows[0]?.user_role;
      // create a page only if the user is a super admin
      if (userRole === "super admin") {
        const { menu_name, link, icon, userRole } = req.body;
        const query =
          "INSERT INTO menu_links (menu_name, link, icon, user_id, user_role) VALUES($1,$2,$3,$4,$5) RETURNING *";
        const result = await db.query(query, [
          menu_name,
          link,
          icon,
          userData.userId,
          userRole,
        ]);
        if (result.rowCount > 0) {
          res.status(200).json("Menu Link added successfully");
        } else {
          res.status(400).json("content is empty");
        }
      } else {
        res.status(401).json("You are not allow to create new pages");
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  })();
});

router.get("/", (req, res) => {
  (async () => {
    const token = req.cookies.infoToken;
    try {
      if (token) {
        const data = jwt.verify(token, process.env.SECRET);
        // get the user and check their role
        const userResult = await db.query(
          "SELECT u.user_role FROM users AS u WHERE id=$1",
          [data.userId]
        );
        const userRole = userResult.rows[0]?.user_role;
        // get the menu links based on the user role
        if (userRole === "admin" || userRole === "super admin") {
          // PostgreSQL does not have FIND_IN_SET, so use string_to_array and ANY
          const linksResult = await db.query(
            `SELECT * FROM menu_links WHERE user_role = $1`,
            [userRole]
          );
          res.status(200).json(linksResult.rows);
        } else {
          res.json("He is a guest");
        }
      } else {
        const linksResult = await db.query(
          "SELECT * FROM menu_links WHERE user_role = $1",
          ["guest"]
        );
        res.status(200).json(linksResult.rows);
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  })();

  // const query = "SELECT u.user_role FROM users AS u WHERE u.id=?";
  // // const query = "SELECT * FROM menu_links";
  // db.query(query, [id],(err, result) => {
  //   if (err) return res.status(500).json(err.message);
  //   res.status(200).json(result);
  // });
});

export default router;
