import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `Ecorise Global Initiative <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email messageId:", info.messageId);
    return info;
  } catch (error) {
    console.error("sending Email error:", error);
    throw error;
  }
};

// Send email to partner

export const sentPartnersEmail = async (partnerName, partnerEmail) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
        <h2 style="color:#2a9d8f;">Thank you for applying to partner with EcoRise Global Initiatives</h2>
        <p>Hi <strong>${partnerName}</strong>,</p>
        <p>Thank you for registring as a partner with <strong>EcoRise Global Initiatives</strong>.
        We've received your application and your information is currently under review by our team.</p><br/>
        <p>You will receive another email once a decision has been made.</p>
        <p>Best regards, <br/> <strong>The EGI Team</strong></p>
      </div>
    `;
    await transporter.sendMail({
      from: `Ecorise Global Initiatives <${process.env.EMAIL_USER}>`,
      to: partnerEmail,
      subject: "Thank you for registering as a partner",
      html,
    });

    console.log("Partner email sent successfully");
  } catch (error) {
    console.log("error Sending Partner Email:", error.message);
  }
};

// Send notification to admin

export const sentAdminEmail = async (
  partnerEmail,
  partnerName,
  adminName,
  websiteUrl
) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
        <h2 style="color="#4f46e5; margin-bottom:16px;">Mew Partner Application Pending Review</h2>
        <p>Hello <strong>Super Admin</strong>,</p>
        <p>A new partner application has been submitted on the <strong>EcoRise Global Initiatives platform</strong>.</p>
        <p><strong>Partner :</strong> ${partnerName}</p>
        <p><strong>Email :</strong> ${partnerEmail}</p>
        <p><strong>Partner Admin :</strong> ${adminName}</p>
        <p><strong>Partner Website Url : </strong> ${websiteUrl}</p>
        <p>please log in to your <strong>dashboard</strong> to approve or reject this application.</p>
        <a href="${process.env.CLIENT_URL}/dashboard/superadmin"
         style="display:inline-block;
      background:#16a34a; color:#fff; padding: 12px 24px; border-radius:6px;
      text-decoration:none; font-weight:bold; margin-top:12px;">Review Application</a>
        <p style="margin-top:20px;">Best Regard, <br/> <strong>The EGI System</strong></p>

      </div>
    `;
    await transporter.sendMail({
      from: `Ecorise Global Initiatives <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Partner Registration application pending review",
      html,
    });

    console.log("Admin email sent successfully");
  } catch (error) {
    console.log("error Sending Super Admin Email:", error.message);
  }
};
