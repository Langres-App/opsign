const executeWithCleanup = require('./databaseCleanup');

/**
 * Creates the document table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createDocumentTable(query) {
  const documentQuery = ` 
  CREATE TABLE IF NOT EXISTS document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    archived_date Datetime
  )`;

  await query(documentQuery);
}

/**
 * Creates the version table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createVersionTable(query) {
  const versionQuery = `
  CREATE TABLE IF NOT EXISTS version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doc_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_date Date NOT NULL,
    FOREIGN KEY (doc_id) REFERENCES document(id) ON DELETE CASCADE
  )`;

  await query(versionQuery);
}

/**
 * Creates the user table in the database.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createUserTable(query) {
  // identifier is the email identifier (first-[first2-first3...].lastname) of the user
  const versionQuery = `
  CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    archived_date Datetime default NULL
  )`;

  await query(versionQuery);
}

/**
 * Creates the user_version table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createUserVersionTable(query) {
  const userVersionQuery = `
  CREATE TABLE IF NOT EXISTS user_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    version_id INT NOT NULL,
    date Datetime,
    signature BLOB,
    signing_token VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES version(id) ON DELETE CASCADE,
    UNIQUE(user_id, version_id)
  )`;

  await query(userVersionQuery);
}

/**
 * Creates the authorized_user table in the database if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 */
async function createAuthTable(query) {
  const authQuery = `
  CREATE TABLE IF NOT EXISTS authorized_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255) default NULL,
    token_expiration Datetime default NULL
  )`;

  await query(authQuery);
}

/**
 * Creates the necessary tables in the database.
 * @returns {Promise<void>} A promise that resolves when the tables are created.
 */
async function createTables() {

  executeWithCleanup(async (query) => {
    await createDocumentTable(query);
    await createVersionTable(query);
    await createUserTable(query);
    await createUserVersionTable(query);
    await createAuthTable(query);
  });
}

module.exports = {
  createTables
};