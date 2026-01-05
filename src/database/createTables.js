import { CREATE_TOKEN_TABLE, CREATE_USER_TABLE,IDX_REFRESH_TOKEN_EXPIRES_AT,IDX_REFRESH_TOKEN_USER_ID } from "./tables.js";

/**
 * Table Creation Handler
 * @param {object} db - parameter to crate the table
 */

// creating all the tables of the database
export const createTables = async (db) => {
  // USERS TABLE QUERY

  await db.query(CREATE_USER_TABLE);

  await db.query(CREATE_TOKEN_TABLE);
  await db.query(IDX_REFRESH_TOKEN_USER_ID );
  await db.query(IDX_REFRESH_TOKEN_EXPIRES_AT);

  // const dropDatabaseQuery = await db.query("DROP DATABASE egi_database");

  // console.log(dropDatabaseQuery);

  // HERO SECTION QUERY
  await db.query(`CREATE TABLE IF NOT EXISTS hero_section (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  )`);

  // -- ABOUT SECTION QUERY
  await db.query(`CREATE TABLE IF NOT EXISTS about_section (
    id SERIAL PRIMARY KEY,
    summary TEXT NOT NULL,
    link VARCHAR(255)
  )`);

  //PROJECT TABLE QUERY
  await db.query(`CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('ongoing', 'completed', 'coming_soon')) NOT NULL DEFAULT 'ongoing',
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    participants INT,
    region VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // IMPACT STATS
  await db.query(`CREATE TABLE IF NOT EXISTS impact_stats (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value INT NOT NULL
  )`);

  // NEWS / ARTICLES QUERY
  await db.query(`CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    descriptions TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(20) CHECK (category IN ('latest', 'press_release', 'story', 'research')) DEFAULT 'latest',
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // EVENT QUERY
  await db.query(`CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    image_url VARCHAR(255)
  )`);

  // PARTNERS / SPONSORS QUERY
  await db.query(`CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    partner_name VARCHAR(255) NOT NULL,
    partner_email VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    county VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    partner_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // MENU NAVIGATION TABLE
  await db.query(`CREATE TABLE IF NOT EXISTS menus(
    id SERIAL PRIMARY KEY,
   role VARCHAR(50) NOT NULL,
   label VARCHAR(100) NOT NULL,
   path VARCHAR(255) NOT NULL,
   icon VARCHAR(255) NOT NULL,
   position INT DEFAULT 0
  )`);

  // LIKE TABLE
  await db.query(`CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INT NULL,
    content_id INT NOT NULL,
    content_type VARCHAR(20) CHECK (content_type IN ('news','project')) NOT NULL,
    is_like BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_like UNIQUE (user_id, content_id, content_type)
    )`);

  console.log("tables created successfully");
};
