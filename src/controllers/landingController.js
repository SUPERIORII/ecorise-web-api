import db from "../database/pool.js";

// All news
export const getLandingData = async (req, res) => {
  // get home news
  try {
    const [heroSectionResult, projectsResult, newsResult] = await Promise.all([
      db.query(
        `SELECT id, image_url FROM hero_section ORDER BY created_at DESC LIMIT 3`
      ),
      db.query(
        `SELECT id, title, description, image_url, status, slug FROM projects ORDER BY RANDOM() LIMIT 3`
      ),
      db.query(`SELECT * FROM news ORDER BY RANDOM() LIMIT 3`),
    ]);

    res.status(200).json({
      heroSectionImages: heroSectionResult.rows,
      projects: projectsResult.rows,
      news: newsResult.rows,
    });
  } catch (err) {
    console.log("home data Error", err.message);
    return res.status(500).json({
      error: "Internal server error",
      message: "Error fetching home data",
    });
  }
};
