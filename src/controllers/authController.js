/**
 * Authentication Controller
 * Handles user registration, login, and logout operations
 * Manages JWT tokens and HTTP-only cookies for secure authentication
 */
import db from "../database/pool.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { loginSchema } from "../utils/validators.js";
import { generateGradientColor } from "../utils/generateGradient.js";
import {
  activationExpiryTime,
  generateActivationCode,
  obfuscateName,
} from "../utils/generateObfuscateName.js";
import { sendMail } from "../utils/email.js";
import {
  GET_ACTIVE_UESR_BY_EMAIL_AND_STATUS,
  INSERT_REFRESH_TOKEN,
} from "../database/queries.js";
import { createAccessToken, createRefreshToken } from "../utils/token.js";
import { clearAuthCookies, setAuthCookies } from "../helpers/cookies.js";

dotenv.config();

// Optional: set COOKIE_DOMAIN in Render env vars when frontend and backend are on subdomains
// Example: ".your-domain.com" to share cookie across subdomains

/**
 * User Registration Handler
 * Creates a new user account with validation
 * Sends activation email with verification code
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  try {
    // Destructure user registration data from request body
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      role,
      dateOfBirth,
      password,
    } = req.body;

    // Hash the password for secure storage
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate user account setup data
    const gradienColor = generateGradientColor();
    const activationCode = generateActivationCode();
    const confrimationId = obfuscateName(10);
    const expireAt = activationExpiryTime();

    // CHECK 1: Verify email doesn't already exist
    const existingUserResult = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      console.log(`Registration failed: Email already in use - ${email}`);
      return res.status(401).json({
        error: "This email is already registered.",
      });
    }

    // INSERT: Create new user in database
    const result = await db.query(
      `INSERT INTO users(
        first_name, last_name, phone_number, gender, date_of_birth,
        email, password, role, activation_code, gradient_color, activation_expires_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, email, first_name`,
      [
        firstName,
        lastName,
        phoneNumber,
        gender,
        dateOfBirth,
        email,
        hashPassword,
        role,
        activationCode,
        gradienColor,
        expireAt,
      ]
    );

    // SUCCESS: User created - send verification email
    if (result.rowCount > 0) {
      // Email HTML template with activation code
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;
            border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
          <h2 style="background-color:#2a9d8f; padding: 2rem 1.5rem; color: white; margin: 0;">
            EcoRise Global Initiative - Account Verification
          </h2>
          <div style="padding: 24px;">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Thank you for registering! Please verify your email using the code below.</p>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; text-align: center; margin: 20px 0;">
              <p style="font-size: 28px; font-weight: bold; color: #2a9d8f; margin: 0;">
                ${activationCode}
              </p>
            </div>
            
            <p>Enter this code when prompted to complete your account setup.</p>
            <p style="font-size: 12px; color: #666;">
              If you did not create this account, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Best regards,<br/>
              <strong>EcoRise Global Initiative Team</strong>
            </p>
          </div>
        </div>
      `;

      // Send verification email
      const subject = "Verify Your EcoRise Account";
      await sendMail({ to: email, subject, html });
      console.log(
        `Registration successful: Verification email sent to ${email}`
      );

      return res.status(201).json({
        success: true,
        message:
          "Account created successfully. Check your email for verification.",
        confrimation_url: `${
          process.env.CLIENT_URL
        }/account-confrimation?success=true&email=${encodeURIComponent(
          email
        )}&activation_id=egi_${encodeURIComponent(confrimationId)}`,
      });
    }
  } catch (error) {
    console.error(`Registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: "Failed to create account. Please try again later.",
    });
  }
};

/**
 * User Login Handler
 * Authenticates user credentials and issues JWT token
 * Sets secure HTTP-only cookie for session management
 *
 * Flow:
 * 1. Validate email and password format
 * 2. Query database for active user account
 * 3. Verify password using bcrypt
 * 4. Generate JWT token
 * 5. Set secure HTTP-only cookie
 *
 * @param {Object} req - Express request object with email and password
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
  try {
    // STEP 1: Validate input format
    const { error } = loginSchema.validate(req.body, {
      abortEarly: false,
    });

    // `/"/g` REMOVES ANY QUOTES BEFORE AND AFTER
    if (error) {
      const errorMessage = error.details[0].message.replace(/"/g, "");
      console.log({ JoiError: errorMessage });
      return res.status(400).json({ message: errorMessage });
    }

    const { email, password } = req.body;

    // STEP 2: Query database for active user account
    const activeUser = await db.query(GET_ACTIVE_UESR_BY_EMAIL_AND_STATUS, [
      email,
      "active",
    ]);

    // User not found in system
    if (activeUser.rows.length === 0) {
      console.log(`Login failed: Account not found - ${email}`);
      return res
        .status(400)
        .json({ message: "Invalid credentials or account does not exist" });
    }

    // STEP 3: Verify password against stored hash
    const user = activeUser.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(400).json({
        message: "Invalid credentials or account does not exist",
      });
    }
    6;
    // STEP 4: Generate JWT tokens (only after successful validation)
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();

    // STORE TOKEN DATA IN DB
    await db.query(INSERT_REFRESH_TOKEN, [refreshToken, user.id]);

    // STEP 5: STORE ACCESS AND REFRESH TOKENS IN COOKIES WITH HTTP ONLY
    setAuthCookies(res, accessToken);

    // SEND RESPONSE BACK TO CLIENT
    return res.status(200).json("user login successfully");
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};

/**
 * User Logout Handler
 * Clears the authentication cookie from client
 * Ends the user session
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logout = (req, res) => {
  clearAuthCookies(res);
  console.log("User logged out successfully");
  return res.json("user logged out");
};
