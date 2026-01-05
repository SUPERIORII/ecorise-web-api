import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// const algorithm = "aes-256-cbc";
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
const iv = crypto.randomBytes(16); // 96-bit nonce
console.log(key.length);

if (key.length !== 32) {
  throw new Error("AES-256-cbc require a 32-byte key");
}
/**
 * Encryption Handler
 * 1. Create encryption value with crypto cipher
 * 2. Return the encrypted data and the Initialization Vector (IV) as object for decryption
 * @param {String} plainText -Any Data to be received and encrypted with cipher
 * @returns {Object} - Object
 */

export const encryption = (plainText) => {
  // return encryptedToken;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  // const authTag = cipher.getAuthTag();

  // THE RETURN VALUE
  return encrypted;
  return {
    iv: iv.toString("base64"),
    content: encrypted,
    tag: authTag.toString("base64"),
  };
};

/**
 * Decryption Handler
 * 1. Decrypt encryption value to plain text
 * 2. Return the encrypted data and the Initialization Vector (IV) for decryption
 * @param {Object} payload -Any Data to be received and encrypted with cipher
 */

export const decryption = (encryptedText) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
