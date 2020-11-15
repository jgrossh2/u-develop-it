const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
//verbose is execution mode
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck');

//Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//connect to database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to election database.');
});
//takes 2 variables: err and database query response(here is rows)
//if no errors in query, the err value is null
// db.all(`SELECT * FROM candidates`, (err, rows) => {
//     console.log(rows);
// });
//GET a single candidate
app.get(`/api/candidate/:id`, (req, res) => {
    const sql = `SELECT * FROM candidates
                WHERE id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: row
        });
    });
});
//Delete a candidate
//? is placeholder making this a prepared statement, can be filled in 
//dynamically with real values at runtime
//1 is param argument that can be an array of multiple values
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }
        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});
//Get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});
//Create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_conected');
    if (errors) {
        const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
            VALUES (?,?,?)`;
        const params = [body.first_name, body.last_name, body.industry_connected];
        //ES5 function, not arrow function, to use `this`
        db.run(sql, params, function(err, result) {
            if (err) {
                res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
        });
    }
});

//Default response for any other requests(Not found) Catch all
app.use((req, res) => {
    res.status(404).end();
});
//start server after db connection
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
