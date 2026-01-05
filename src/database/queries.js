export const GET_ACTIVE_UESR_BY_EMAIL_AND_STATUS = `
SELECT * FROM users AS u WHERE email = $1 AND status = $2`;

export const GET_UESR_BY_ID = `SELECT id, first_name, last_name, 
phone_number, email, gender, date_of_birth, role, status, profile_url, 
gradient_color, created_at FROM users AS u WHERE id=$1 AND status = $2`;

// REFRESH TOKEN QUERIES
export const GET_USER_REFRESH_TOKEN = `SELECT * FROM user_token WHERE user_id=$1`;
export const GET_REFRESH_TOKEN = `SELECT * FROM user_token WHERE refresh_token=$1`;
export const INSERT_REFRESH_TOKEN = `
INSERT INTO user_token (refresh_token, user_id, expires_at)
    VALUES($1,$2, NOW() + INTERVAL '7 days')
`;
export const UPDATE_USER_TOKEN = `UPDATE user_token SET refresh_token=$1 WHERE user_id=$2`;
export const REMOVE_ALL_USER_TOKEN = `DELETE FROM user_token WHERE user_id=$1`;
export const REMOVE_REFRESH_TOKEN_BY_ID = `DELETE FROM user_token WHERE id=$1`;
