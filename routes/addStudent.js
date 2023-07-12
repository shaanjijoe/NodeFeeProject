const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('database.db');

router.get('/', (req, res) => {
  res.render('add-student.ejs', { successMessage: '', errorMessage: '' });
});

router.post('/', (req, res) => {
  const { studentId, studentName, studentClass } = req.body;

  // Save the student details to the database
  db.run(
    'INSERT INTO students (studentId, studentName, studentClass, data) VALUES (?, ?, ?, ?)',
    [studentId, studentName, studentClass, '{}'],
    (err) => {
      if (err) {
        console.error('Error inserting student:', err.message);
        res.render('add-student.ejs', { successMessage: '', errorMessage: 'Failed to add student' });
      } else {
        console.log('Student inserted successfully.');
        res.render('add-student.ejs', { successMessage: 'Student added successfully', errorMessage: '' });
      }
    }
  );
});

module.exports = router;
