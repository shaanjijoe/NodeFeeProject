const { Strategy: LocalStrategy } = require('passport-local');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

function initialize(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'username', passwordField: 'password' },
      (username, password, done) => {
        db.get('SELECT * FROM users WHERE username = ?', username, (err, row) => {
          if (err) {
            return done(err);
          }
          if (!row) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (row.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, row);
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', id, (err, row) => {
      done(err, row);
    });
  });
}

module.exports = initialize;
