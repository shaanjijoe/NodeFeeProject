const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('database.db');

// Create the "users" table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);


db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  class TEXT,
  unique_id TEXT,
  data TEXT
);`);

// Insert sample users
const users = [
  { username: 'admin', password: 'password' }
];

users.forEach((user) => {
  const { username, password } = user;
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(query, [username, password], (err) => {
    if (err) {
      console.error('Error inserting user:', err);
    } else {
      console.log('User inserted:', user);
    }
  });
});

// Close the database connection
db.close();
