const express = require('express');
const { app, isAuthenticated } = require('./auth');
const sqlite3 = require('sqlite3').verbose();
const passport=require('passport')

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/home', isAuthenticated, (req, res) => {
  res.render('home', { user: req.user });
});

app.get('/add-student', isAuthenticated, (req, res) => {
  res.render('add-student');
});

app.post('/add-student', isAuthenticated, (req, res) => {
  const { name, className, uniqueId } = req.body;
  
  // Generate a sample JSON object
  const data = {
    // Add more fields as needed
  };

  // Insert student data into the database
  const sql = 'INSERT INTO students (name, class, unique_id, data) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, className, uniqueId, JSON.stringify(data)], function (err) {
    if (err) {
      console.error(err.message);
      return res.send('Error occurred while adding the student.');
    }
    console.log(`Added student with ID: ${this.lastID}`);
    res.redirect('/home');
  });
});


app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
