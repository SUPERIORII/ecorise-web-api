import db from "../database/pool.js";
import bcrypt from "bcrypt";
import { sendMail, sentAdminEmail, sentPartnersEmail } from "../utils/email.js";
import formatCount from "../utils/formatCount.js";
import cloudinary from "../config/cloudinary.js";

export const registerPartners = async (req, res) => {
  const { partnerName, partnerEmail, description, websiteUrl } = req.body;

  //   validate empty inputs
  if (!partnerName || !partnerEmail || !description || !websiteUrl) {
    console.log("register parent Error:", "missing fields required");

    return res.status(400).json({
      error: " missing field required",
      required: ["partnerName", "PartnerEmail", "description"],
    });
  }
  try {
    //   CHECK IF PARTNER EXIST
    const isPartnerExisting = await db.query(
      `SELECT * FROM partners WHERE partner_name=$1 AND partner_email=$2`,
      [partnerName, partnerEmail]
    );

    if (isPartnerExisting.rows.length > 0) {
      console.log(
        "Existing Partner Error:",
        isPartnerExisting.rows[0].partner_name
      );
      return res.status(400).json({
        error: `Partner name exist and have been taken`,
      });
    }

    // IF ALL DATA VERIFIED SUCCESSFULLY
    console.log("partner verified successfully:", partnerName);
    return res.status(200).json({
      message: "partner information verified successfully",
      nextStep: 2,
      success: true,
    });
  } catch (error) {
    console.log("Verifying Partner Error", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal Server Errror",
    });
  }
};

export const registerAdmins = async (req, res) => {
  const {
    // ✅ GET PARTNER DATA FROM STEP 1 (passed from frontend)
    partnerName,
    partnerEmail,
    // ADMIN DATA
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  //   validate empty inputs
  if (
    !partnerName ||
    !partnerEmail ||
    !firstName ||
    !lastName ||
    !email ||
    !password
  ) {
    console.log("register parent Error:", "missing fields required");

    return res.status(400).json({
      error: " missing field required",
      required: [
        "partnerName",
        "partnerEmail",
        "firstName",
        "lastname",
        "email",
        "password",
      ],
    });
  }
  try {
    //✅ CHECK AGAIN IF PARTNER ADMIN EXIST (in case someone else registered)
    const isPartnerExisting = await db.query(
      `SELECT * FROM partners WHERE partner_name=$1 AND partner_email=$2`,
      [partnerName, partnerEmail]
    );

    if (isPartnerExisting.rows.length > 0) {
      console.log(
        "Existing Partner Error:",
        isPartnerExisting.rows[0].partner_name
      );
      return res.status(400).json({
        error: `Partner name exist and have been taken`,
      });
    }

    // CHECK IF ADMIN EXISTS
    const row = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);

    if (row.rows.length > 0) {
      console.log("Email already exists");
      return res.status(400).json({
        error: `This email has already been used`,
      });
    }

    // IF ALL DATA VERIFIED SUCCESSFULLY
    console.log("Admin verified successfully:", {
      email,
      firstName,
      lastName,
    });
    return res.status(200).json({
      message: "Admin information verified successfully",
      nextStep: 3,
      success: true,
    });
  } catch (error) {
    console.log("Registering Partner Error", error.message);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
      error: error.message,
      message: "creating partner error",
    });
  }
};

export const registerReviewDetails = async (req, res) => {
  const {
    // ✅ GET SCHOOL DATA FROM STEP 1 (passed from frontend)
    partnerName,
    partnerEmail,
    description,
    websiteUrl,
    // ✅ GET SCHOOL DATA FROM STEP 2 (passed from frontend)
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  // // CLOUDINARY IMAGE
  const imageResult = await cloudinary.uploader
    .upload(req.file.path, {
      folder: "ecorise/upload",
      resource_type: "auto",
    })
    .catch((error) => {
      console.log(error);
    });

  // GENERATE IMAGE PATH IN CLOUDINARY MEDIA
  const logoUrl = imageResult.secure_url;

  console.log(imageResult);
  console.log(req.body);

  //   validate empty inputs
  if (
    !partnerName ||
    !partnerEmail ||
    !description ||
    !websiteUrl ||
    !firstName ||
    !lastName ||
    !email ||
    !password
  ) {
    console.log(
      "Reviewing Partner registration Error:",
      "missing fields required"
    );

    return res.status(400).json({
      message: " missing field required",
      required: [
        "partnerName",
        "partnerEmail",
        "description",
        "logoUrl",
        "websiteUrl",
        "firstName",
        "lastname",
        "email",
        "password",
      ],
    });
  }
  try {
    // CHECK IF PARTNER AND ADMIN ARE LINK
    // 1. Check for email conflict
    const emailConflict = await db.query(
      `SELECT users.id, users.first_name, users.last_name, users.email, users.role, partners.partner_name,
      partners.partner_email FROM users RIGHT JOIN partners ON (users.id=partners.partner_id)
      WHERE users.email = $1`,
      [email]
    );
    // 2. Check for partner name conflict
    const partnerNameConflict = await db.query(
      `SELECT users.id, users.first_name, users.last_name, users.email, users.role, partners.partner_name,
      partners.partner_email FROM users RIGHT JOIN partners ON (users.id=partners.partner_id)
      WHERE partners.partner_name = $1`,
      [partnerName]
    );

    let conflicts = [];
    let conflictLinks = {};
    if (emailConflict.rows.length > 0) {
      conflicts.push("email");
      conflictLinks.email = emailConflict.rows;
    }
    if (partnerNameConflict.rows.length > 0) {
      conflicts.push("partnerName");
      conflictLinks.partnerName = partnerNameConflict.rows;
    }
    if (conflicts.length > 0) {
      let errorMsg = "Sorry, ";
      if (conflicts.length === 2) {
        errorMsg +=
          "both Email and Partner Name are already linked to an account.";
      } else if (conflicts[0] === "email") {
        errorMsg += "Email is already linked to an account.";
      } else if (conflicts[0] === "partnerName") {
        errorMsg += "Partner Name is already linked to an account.";
      }
      return res.status(400).json({
        error: errorMsg,
        conflicts,
        conflictLinks,
      });
    }
    // HASH PASSWORD
    const hashPassword = await bcrypt.hash(password, 14);
    // 1. SAVE THE PARTNER ADMIN INFORMATION
    const partnerAdmin = await db.query(
      `INSERT INTO users (first_name,last_name, email, password, role) VALUES($1, $2, $3, $4, $5) RETURNING id`,
      [firstName, lastName, email, hashPassword, "partner"]
    );

    // CHECK IF PARTNER ADMIN IS SUCCESSFULLY SAVED
    if (partnerAdmin.rowCount > 0) {
      // 2. SAVE PARTNER INFORMATION
      const result = await db.query(
        `INSERT INTO partners (partner_name, partner_email, description,
          logo_url, website_url, partner_id) VALUES($1, $2, $3, $4, $5, $6)`,
        [
          partnerName,
          partnerEmail,
          description,
          logoUrl,
          websiteUrl,
          partnerAdmin.rows[0].id,
        ]
      );
      // // // CHECK IF ALL DATA SAFE SUCCESSFULLY
      if (result.rowCount > 0) {
        console.log("partner registered successfully");
        // SEND MAIL TO PARTNER EMAIL (now includes logo and website)
        await sentPartnersEmail(partnerName, partnerEmail);
        // SEND MAIL TO SUPER ADMIN EMAIL (now includes all details for HTML)
        await sentAdminEmail(
          partnerEmail,
          partnerName,
          firstName + lastName,
          websiteUrl
        );
        return res.status(200).json(
          `Thanks! you have successfully submitted your details for
            registration pending approval. Please check your email for all details.`
        );
      }
    }
  } catch (error) {
    console.log("Registering Partner Error", error.message);
    return res.status(500).json({
      message: "creating partner error",
      success: false,
      error: error.message,
    });
  }
};

export const getPartners = async (req, res) => {
  try {
    const [
      partners,
      activePartners,
      partnerCountyCount,
      newPartnerCountThisYear,
    ] = await Promise.all([
      db.query(
        `SELECT id, partner_name AS name, logo_url AS logoUrl, website_url AS websiteUrl, 
        description FROM partners WHERE status=$1 ORDER BY RANDOM()`,
        ["approved"]
      ),
      db.query(
        `SELECT COUNT(*) AS partnersCount FROM partners WHERE status=$1`,
        ["approved"]
      ),
      db.query(`SELECT COUNT(DISTINCT county) FROM partners`),
      db.query(
        `SELECT COUNT(*) FROM partners WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())`
      ),
    ]);

    console.log(newPartnerCountThisYear.rows[0].count);

    res.status(200).json({
      success: true,
      partners: partners.rows,
      stats: [
        {
          count:
            activePartners.rows.length === 0
              ? "0"
              : formatCount(activePartners.rows[0].partnerscount),
          label: "Global Partners",
          icon: "Users",
        },
        {
          count:
            partnerCountyCount.rows.length === 0
              ? "0"
              : formatCount(partnerCountyCount.rows[0].count),
          label: "Partners Countries",
          icon: "Globe",
        },
        {
          count:
            newPartnerCountThisYear.rows.length === 0
              ? "0"
              : formatCount(newPartnerCountThisYear.rows[0].count),
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
      message: "Getting Partners Errror",
    });
  }
};

// UPDATE PARTNER STATUS
export const updatePartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // GET STATUS FROM THE BODY
    const { status } = req.body;

    // CHECK IF STATUS DO NOT CONTAIN EITHER "approved or reject"
    const action = ["approve", "reject"];

    if (!action.includes(status)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // 1. UPDATE THE STATUS TO EITHER "approved or rejected"
    const newStatus = status === "approve" ? "approved" : "rejected";

    // 2. GET PARTNER INFO
    const row = await db.query(
      `SELECT partner_name, partner_email FROM partners WHERE id=$1`,
      [id]
    );

    if (row.rows.length === 0) {
      console.log("Finding partner Error:", "partner not found");
      return res.status(400).json({ error: "partner not found" });
    }
    const partner = row.rows[0];

    let subject, html;
    // CHECK IF NEWSTATUS IS EQUAL TO APPROVED
    if (newStatus === "approved") {
      const updateStatus = await db.query(
        `UPDATE partners SET status=$1 WHERE id=$2`,
        [newStatus, id]
      );

      // SEND APPROVED EMAIL TO PARTNER
      if (updateStatus.rowCount > 0) {
        subject = "Your Partner Application is Approved!";
        html = `
        <div style="font-family:Arial, sans-srif;
        max-width:600px; margin:auto; padding:20px; border-radius:10px; background:#f9fafb;">
        <h2>Congratulations, ${partner.partner_name}🎉</h2>
        <p>Your application to become a partner has been <strong>approved</strong>.</p>
        <p>You can now log in and start using the Ecorise Global Initiative Platform.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;
        background:#16a34a; color:#fff; padding: 12px 24px; border-radius:6px;
        text-decoration:none; font-weight:bold; margin-top:12px;">Go to Portal</a>
        <p style="margin-top:20px;">Welcome aboard, <br> EGI Team</p>
        </div>
        `;

        await sendMail({
          to: partner.partner_email,
          subject,
          html,
        });

        console.log("email sent successfully");
        console.log("partner updated successfully");

        return res
          .status(200)
          .json({ message: `Partner ${newStatus} and email sent.` });
      }
    } else {
      const deleteStatus = await db.query(`DELETE FROM partners WHERE id=$1`, [
        id,
      ]);

      // SEND REJECT EMAIL TO PARTNER
      if (deleteStatus.rowCount > 0) {
        subject = "Your Partner Application was rejected";
        html = `
        <div style="font-family:Arial, sans-srif;
        max-width:600px; margin:auto; padding:20px; border-radius:10px; background:#f9fafb;">
        <h2>Hello, ${partner.partner_name}🎉</h2>
        <p>We are sorry to inform you that your application to become a partner was <strong>rejected</strong>.</p>
        <p>You may contact us at  <a href="mailto:@${process.env.EMAIL_USER}" style="display:inline-block;
        text-decoration:none; font-weight:bold; margin-top:12px;">Support@Ecorise.org</a> for clarification.</p>
        <p style="margin-top:20px;">Best regards, <br> EGI Team</p>
        </div>
        `;

        await sendMail({
          to: partner.partner_email,
          subject,
          html,
        });

        console.log("email sent successfully");
        console.log("partner deleted successfully");
        return res
          .status(200)
          .json({ message: `Partner ${newStatus} and email sent.` });
      }
    }
  } catch (error) {
    console.log("Approving Partner Error:", error, message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Updating Partner Status Error",
    });
  }
};
