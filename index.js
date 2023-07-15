const express = require('express');
const { app, isAuthenticated } = require('./auth');
const sqlite3 = require('sqlite3').verbose();
const passport=require('passport')
const path = require('path');

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));


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
    fee:[]
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


//
// ...

app.get('/find-info', isAuthenticated, (req, res) => {
  res.render('find-info', { students: [] });
});

app.post('/find-info', isAuthenticated, (req, res) => {
  const { name } = req.body;

  // Check if the search query is empty
  if (!name) {
    return res.render('find-info', { students: [] });
  }

  // Query the database to find student information
  const sql = 'SELECT * FROM students WHERE name LIKE ?';
  const searchTerm = `%${name}%`;
  db.all(sql, [searchTerm], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.send('Error occurred while fetching student information.');
    }

    if (rows && rows.length > 0) {
      res.render('find-info', { students: rows });
    } else {
      res.render('find-info', { students: [] });
    }
  });
});

// ...

// ...







app.get('/fee-payment', isAuthenticated, (req, res) => {
  res.render('fee-payment', { student: null });
});

app.post('/fee-payment', isAuthenticated, (req, res) => {
  const { uniqueId } = req.body;
  console.log(uniqueId);
  // Query the database to find the student by unique_id
  const sql = 'SELECT * FROM students WHERE unique_id = ?';
  db.get(sql, [uniqueId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.send('Error occurred while fetching student information.');
    }

    if (!row) {
      return res.render('fee-payment', { student: null, studentData: null, currentDate: new Date().toISOString().split('T')[0] });
    }

    const studentData = JSON.parse(row.data);

    res.render('fee-payment', { student: row, studentData, currentDate: new Date().toISOString().split('T')[0] });
  });
});


app.post('/fee-payment/submit', isAuthenticated, (req, res) => {
  const { uniqueId, amount, date } = req.body;

  // Query the database to find the student by unique_id
  const sql = 'SELECT * FROM students WHERE unique_id = ?';
  db.get(sql, [uniqueId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.send('Error occurred while fetching student information.');
    }

    if (!row) {
      return res.send('No student found with that unique ID.');
    }

    const studentData = JSON.parse(row.data);
    if (!studentData.fee) {
      studentData.fee = [];
    }

    const payment = {
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0]
    };


    studentData.fee.push(payment);
    console.log(studentData)
    const updateSql = 'UPDATE students SET data = ? WHERE unique_id = ?';
    db.run(updateSql, [JSON.stringify(studentData), uniqueId], (err) => {
      if (err) {
        console.error(err.message);
        return res.send('Error occurred while updating fee payment.');
      }
      res.redirect('/fee-payment');
    });
  });
});


// ...

app.get('/update-info', isAuthenticated, (req, res) => {
  const { uniqueId } = req.query;
  if (!uniqueId) {
    return res.render('update-info', { student: null, studentData: null });
  }

  const sql = 'SELECT * FROM students WHERE unique_id = ?';
  db.get(sql, [uniqueId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.send('Error occurred while fetching student information.');
    }

    if (!row) {
      return res.render('update-info', { student: false });
    }

    const studentData = JSON.parse(row.data);

    res.render('update-info', { student: row, studentData });
  });
});

// ...



// app.get('/update-info/:uniqueId', isAuthenticated, (req, res) => {
//   const { uniqueId } = req.params;
//   const sql = 'SELECT * FROM students WHERE unique_id = ?';
//   db.get(sql, [uniqueId], (err, row) => {
//     if (err) {
//       console.error(err.message);
//       return res.send('Error occurred while fetching student information.');
//     }

//     if (!row) {
//       return res.render('update-info', { student: null });
//     }

//     const studentData = JSON.parse(row.data);

//     res.render('update-info', { student: row, studentData });
//   });
// });

// ...

app.post('/update-info/submit', isAuthenticated, (req, res) => {
  const { uniqueId, name, class: studentClass, ...updatedFields } = req.body;

  const studentData = JSON.stringify(updatedFields);

  const sql = 'UPDATE students SET name = ?, class = ?, data = ? WHERE unique_id = ?';
  db.run(sql, [name, studentClass, studentData, uniqueId], (err) => {
    if (err) {
      console.error(err.message);
      return res.send('Error occurred while updating student information.');
    }

    res.redirect('/update-info');
  });
});

// ...

// ...





app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login'); // Redirect to login page after logout
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
