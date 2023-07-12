const express = require('express');
const passport = require('passport');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const initializePassport = require('./passport-config');

// Set up SQLite database
const db = new sqlite3.Database('database.db');

// Middleware
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
initializePassport(passport);

// Routes
app.get('/', (req, res) => {
  res.render('login.ejs');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
  })
);

app.get('/home', (req, res) => {
  res.render('home.ejs');
});


const addStudentRouter = require('./routes/addStudent');
// const feePaymentRouter = require('./routes/feePayment');
// const updateInfoRouter = require('./routes/updateInfo');
// const searchRouter = require('./routes/search');

app.use('/add-student', addStudentRouter);
// app.use('/fee-payment', feePaymentRouter);
// app.use('/update-info', updateInfoRouter);
// app.use('/search', searchRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
