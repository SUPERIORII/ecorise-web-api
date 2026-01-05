// ACCOUNT VERIFICATION CODE
import db from "../database/pool.js";
import {
  activationExpiryTime,
  generateActivationCode,
} from "../utils/generateObfuscateName.js";

import { sendMail } from "../utils/email.js";

export const verifyCode = async (req, res) => {
  const { confrimCode, email } = req.body;

  console.log(req.body);

  try {
    // FETCH USERS ACTIVATION CODE AND TIME IT WILL EXPIRE
    const result = await db.query(
      `SELECT activation_code, activation_expires_at FROM users WHERE email=$1`,
      [email]
    );
    // CHECK IF THE USER DO NOT EXIST
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];

    //   CHECK IF CODE EXIPIRE
    if (new Date() > new Date(user.activation_expires_at))
      return res.status(400).json({ message: "code expires" });

    // CHECK IF CODE DO NOT MATCH
    console.log(user.activation_code);

    if (parseInt(confrimCode, 10) !== user.activation_code)
      return res.status(400).json({ message: "Invalid code" });

    //   ACTIVE USER STATUS
    await db.query(
      `UPDATE users SET status=$1 ,activation_code=$2,
       activation_expires_at=$3 WHERE email=$4 `,
      ["active", null, null, email]
    );

    res.status(200).json({ message: "user successfully activated" });
  } catch (err) {
    console.log("Error Verifying User: ", err.message);
  }
};

export const resendCode = async (req, res) => {
  const { email } = req.body;
  const activationCode = generateActivationCode(6);
  const expireAt = activationExpiryTime();

  try {
    // FETCH USERS ACTIVATION CODE AND TIME IT WILL EXPIRE
    const result = await db.query(
      `SELECT activation_code, activation_expires_at FROM users WHERE email=$1`,
      [email]
    );
    // CHECK IF USER DO NOT EXIST
    if (result.rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid User request" });

    // // UPDATE THE USER TABLE WITH THE NEW ACTIVATION CODE
    await db.query(
      `UPDATE users SET activation_code=$1, activation_expires_at=$2 WHERE email=$3`,
      [activationCode, expireAt, email]
    );

    // SEND THE NEW ACTIVATION CODE TO THE USER EMAIL
    const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;
          border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
        <h2 style="background-color:#2a9d8f; padding-top: 4rem; padding-left: 1.5rem; padding-bottom: 1rem; color: white;">EcoRise Verification Code</h2>
        <p> your resend verification code to activate your account is:</p><br/>
         <strong style="text-align: center; display: flex; justify-content: center;">${activationCode}</strong>,</p>
        <p>If you did not request this code, please ignore this email. </p>
        <p>Best regards, <br/> <strong>The EGI Team</strong></p>
      </div>`;

    sendMail({ to: email, subject: "Resend Verificaton Email", html });

    return res.status(200).json({
      success: true,
      message: "Verification code resend successfully",
    });
  } catch (error) {
    console.log("Resending verification code error:", error);
  }
};
