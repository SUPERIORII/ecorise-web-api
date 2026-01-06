import db from "../database/pool.js";

export const getGetInvolved = async (req, res) => {
  res.json("I am getting involved");
  try {
    const [volunteersCount, partnerCountyCount, newPartnerCountThisYear] =
      await Promise.all([
        db.query(`SELECT COUNT(*) FROM volunteers`),
        db.query(`SELECT COUNT(DISTINCT county) FROM partners`),
        db.query(
          `SELECT COUNT(*) FROM partners WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())`
        ),
      ]);

    console.log({ volunteersCount });

    res.status(200).json({
      success: true,
      partners: partners.rows,
      stats: [
        {
          count: formatCount(activePartners.rows[0].partnerscount),
          label: "Global Partners",
          icon: "Users",
        },
        {
          count: formatCount(partnerCountyCount.rows[0].count),
          label: "Partners Countries",
          icon: "Globe",
        },
        {
          count: formatCount(newPartnerCountThisYear.rows[0].count),
          label: "New Partners This Year",
          icon: "HandshakeIcon",
        },
      ],
    });
  } catch (error) {
    console.log({ error: error });
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal Server Errror",
    });
  }
};
