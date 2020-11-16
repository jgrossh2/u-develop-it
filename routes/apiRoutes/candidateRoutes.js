const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');
//Get all candidates
router.get('/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id`;
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
//GET a single candidate
router.get('/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id 
                WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

//Create a candidate
router.post('/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_conected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
      }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected, party_id)
        VALUES (?,?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected, body.party_id];
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
});
router.put('/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');
    //candidate is allowed to not have party affiliation
    if (errors) {
    res.status(400).json({ error: errors });
    return;
    }
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
  
    db.run(sql, params, function(err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: req.body,
        changes: this.changes
      });
    });
  });
  
//Delete a candidate
//? is placeholder making this a prepared statement, can be filled in 
//dynamically with real values at runtime
//1 is param argument that can be an array of multiple values
router.delete('/candidate/:id', (req, res) => {
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

module.exports = router;
