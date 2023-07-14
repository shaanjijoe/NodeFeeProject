const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Passport configuration
passport.use(
  new LocalStrategy((username, password, done) => {
    // Replace this with your own logic for user authentication
    if (username === 'admin' && password === 'password') {
      return done(null, { id: 1, username: 'admin' });
    }
    return done(null, false);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Replace this with your own logic to fetch user from the database
  if (id === 1) {
    done(null, { id: 1, username: 'admin' });
  } else {
    done(null, null);
  }
});

// Express middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
    // cookie: {
    //   maxAge: 30000 // Session expires after 1 hour of inactivity
    // }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/home',
//   failureRedirect: '/login'
// }));

// Helper function to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = {
  app,
  isAuthenticated
};
