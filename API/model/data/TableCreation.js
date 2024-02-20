// import the pool & util module
const mysql = require('mysql');
const util = require('util');

// database pool
const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

// Promisify the pool query method to allow for async/await
const query = util.promisify(pool.query).bind(pool);

/**
 * Creates the document table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createDocumentTable() { 
  const documentQuery = ` 
  CREATE TABLE IF NOT EXISTS document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    archived_date Date
  )`;

  await query(documentQuery);
}

/**
 * Creates the version table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createVersionTable() {
  const versionQuery = `
  CREATE TABLE IF NOT EXISTS version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doc_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_date Date,
    FOREIGN KEY (doc_id) REFERENCES document(id)
  )`;

  await query(versionQuery);
}

/**
 * Creates the user table in the database.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createUserTable() {
  // identifier is the email identifier (first-[first2-first3...].lastname) of the user
  const versionQuery = `
  CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    archived_date Date default NULL
  )`;

  await query(versionQuery);
}

/**
 * Creates the user_version table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createUserVersionTable() {
  const userVersionQuery = `
  CREATE TABLE IF NOT EXISTS user_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    version_id INT NOT NULL,
    date Date NOT NULL,
    signature BLOB NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (version_id) REFERENCES version(id)
  )`;

  await query(userVersionQuery);
}

/**
 * Creates the authorized_user table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createAuthTable() {
  const authQuery = `
  CREATE TABLE IF NOT EXISTS authorized_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255) default NULL
  )`;

  await query(authQuery);
}

/**
 * Creates the necessary tables in the database.
 * @returns {Promise<void>} A promise that resolves when the tables are created.
 */
async function createTables() {
  await createDocumentTable();
  await createVersionTable();
  await createUserTable();
  await createUserVersionTable();
  await createAuthTable();

  pool.end();
}

module.exports = {
  createTables
};