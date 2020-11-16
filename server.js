const express = require('express');
const db = require('./db/database');

const PORT = process.env.PORT || 3001;
const app = express();

const apiRoutes = require('./routes/apiRoutes');


//Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//use apiRoutes
app.use('/api', apiRoutes);

//takes 2 variables: err and database query response(here is rows)
//if no errors in query, the err value is null
// db.all(`SELECT * FROM candidates`, (err, rows) => {
//     console.log(rows);
// });


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
