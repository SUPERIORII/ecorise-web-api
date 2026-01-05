import db from "../database/pool.js";
import formatCount from "../utils/formatCount.js";

export const addProjects = async (req, res) => {
  try {
    const { description, projectImg, title } = req.body;
    // GET TITLE FROM DESCRIPTION
    const slug = title.replaceAll(" ", "-");
    console.log("Generated title slug:", slug);

    // CHECK REQUIRED MISSING FIELD
    if (!title || !description || !projectImg) {
      console.log("Required field are missing");

      return res.status(400).json({
        error: "Required field are missing",
        required: ["title", "projectImg", "description"],
      });
    }
    // CHECK IF PROJECT EXIST
    const isProjectExistResult = await db.query(
      "SELECT title, image_url FROM projects WHERE title=$1 OR image_url=$2",
      [title, projectImg]
    );
    const isProjectExist = isProjectExistResult.rows;
    if (isProjectExist.length > 0) {
      return res.status(400).json({
        error: "Project already exist.",
      });
    }

    // Store the project information in the database if all requirement is met
    const result = await db.query(
      `INSERT INTO projects(
      title,description, image_url, created_by, slug)
      VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [title, description, projectImg, req.user.userId, slug]
    );
    // show a message that the file is uploaded successfully
    if (result.rowCount > 0) {
      res.status(200).json({ message: "project uploaded successfully" });
    }
  } catch (error) {
    console.error("Adding Project Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProjects = async (req, res) => {
  try {
    // CHECK IF PROJECT EXIST
    const [
      projectsResult,
      ongoingCount,
      CompletedCount,
      regionCount,
      comingSoonCount,
    ] = await Promise.all([
      db.query(
        `SELECT id, title, description, image_url, status, slug, participants
            FROM projects ORDER BY created_at DESC`
      ),
      db.query(`SELECT COUNT(*) FROM projects WHERE status=$1`, ["ongoing"]),
      db.query(`SELECT COUNT(*) FROM projects WHERE status=$1`, ["completed"]),
      db.query(`SELECT COUNT(*) FROM projects WHERE status=$1`, [
        "coming_soon",
      ]),
      db.query(`SELECT COUNT(DISTINCT region) FROM projects`),
    ]);
    res.status(200).json({
      projectsResult: projectsResult.rows,
      stats: [
        {
          count: formatCount(ongoingCount.rows[0].count),
          label: "Ongoing Projects",
          icon: "Hammer",
        },
        {
          count: formatCount(CompletedCount.rows[0].count),
          label: "Projects Completed",
          icon: "CheckCircle",
        },
        {
          count: formatCount(regionCount.rows[0].count),
          label: "Impacting Region",
          icon: "Globe2",
        },
        {
          count: formatCount(comingSoonCount.rows[0].count),
          label: "Coming Soon",
          icon: "Clock",
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Fetching Projects error:", error);
  }
};

export const getSingleProject = async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await db.query(
      `SELECT p.* , u.id AS userId, u.first_name, u.last_name, u.profile_url AS userprofile, u.gradient_color FROM projects p JOIN users u ON p.created_by=u.id WHERE slug=$1`,
      [slug]
    );

    if (result.rows.length === 0) return res.json({ message: " Not found" });

    const project = result.rows[0];

    const formatedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      projectImage: project.image_url,
      author: project.first_name + project.last_name,
      image: project.userprofile,
      participant: project.participants,
      status: project.status,
      date: new Date(project.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      tags: ["Sustainability", "Lifestyle", "Inspiration", "Zero Waste"],
    };

    return res.status(200).json(formatedProject);
  } catch (error) {
    console.log("Getting Single news Details Error:", error.message);
    return res.status(500).json("Internal Server Error");
  }
};
