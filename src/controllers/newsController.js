import db from "../database/pool.js";

// uploading news
export const addNews = async (req, res) => {
  try {
    const { description, newsImg, category, title } = req.body;

    const newsSlug = title.replaceAll(" ", "-");

    // check required missing field
    if (!description || !newsImg || !title) {
      console.log("Required field are missing");

      return res.status(401).json({
        error: "Required field are missing",
        required: ["description", "newsImg", "title", "category"],
      });
    }
    // check image and title in the database
    const result = await db.query(
      `SELECT * FROM news WHERE title=$1 OR image_url=$2`,
      [title, newsImg]
    );
    if (result.rows.length > 0) {
      return res.status(401).json({ error: "News already exists" });
    }
    // store the data
    const newsInfo = await db.query(
      `INSERT INTO news(title,descriptions, created_by,slug, image_url, category)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        title,
        description,
        req.user.userId,
        newsSlug,
        newsImg,
        category || "latest",
      ]
    );
    if (newsInfo.rowCount > 0) {
      return res.status(200).json({ message: "news uploaded successfully" });
    }
  } catch (error) {
    console.log("Adding News Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET NEWS
export const getnews = async (req, res) => {
  try {
    // CHECK IF PROJECT EXIST
    const [latest, pressRelease, story, research] = await Promise.all([
      db.query(
        `SELECT * FROM news WHERE category = $1 ORDER BY created_at DESC LIMIT 4`,
        ["latest"]
      ),
      db.query(
        `SELECT * FROM news WHERE category = $1 ORDER BY created_at DESC LIMIT 4`,
        ["press_release"]
      ),
      db.query(
        `SELECT * FROM news WHERE category = $1 ORDER BY created_at DESC LIMIT 4`,
        ["story"]
      ),
      db.query(
        `SELECT * FROM news WHERE category = $1 ORDER BY created_at DESC LIMIT 4`,
        ["research"]
      ),
    ]);

    res.status(200).json({
      latest: latest.rows,
      pressRelease: pressRelease.rows,
      story: story.rows,
      research: research.rows,
    });
  } catch (error) {
    console.log("Getting News Error:", error.message);

    return res.status(500).json({ error: "Internal Server Error" });
  }
};
