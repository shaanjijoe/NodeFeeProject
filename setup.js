const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the database.');

  // Create the users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        db.close();
        return;
      }
      console.log('Users table created.');

      // Insert or update the sample user
      const username = 'exampleuser';
      const password = 'examplepassword';

      db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) {
          console.error('Error inserting user:', err.message);
          db.close();
          return;
        }

        if (this.changes > 0) {
          console.log('User inserted.');
        } else {
          // User already exists, update the password
          db.run('UPDATE users SET password = ? WHERE username = ?', [password, username], (err) => {
            if (err) {
              console.error('Error updating user:', err.message);
              db.close();
              return;
            }
            console.log('User updated.');
          });
        }

        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database connection:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    }
  );
});
