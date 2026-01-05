export const CREATE_USER_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'others')),
    date_of_birth DATE NOT NULL,
    activation_code INT,
    activation_expires_at TIMESTAMP,
    role VARCHAR(20) CHECK (role IN ('partner', 'donor', 'admin', 'superadmin')),
    status VARCHAR(30) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
    profile_url VARCHAR(255),
    gradient_color VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

export const CREATE_TOKEN_TABLE = `
  CREATE TABLE IF NOT EXISTS user_Token(
  id SERIAL PRIMARY KEY, 
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL, 
    created_at TIMESTAMP DEFAULT NOW()
  )`;

export const IDX_REFRESH_TOKEN_USER_ID = ` CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON user_Token(user_id)`;
export const IDX_REFRESH_TOKEN_EXPIRES_AT = ` CREATE INDEX IF NOT EXISTS idx_refresh_token_expires_at ON user_Token(expires_at)`;
