//verbose is execution mode
const sqlite3 = require('sqlite3').verbose();

//connect to database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to election database.');
});

module.exports = db;