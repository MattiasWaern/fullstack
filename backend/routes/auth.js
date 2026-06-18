const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');


router.post('/register', (req, res) => {
    const { username, password} = req.body;
    if(!username || !password)
        return res.status(400).json({error: 'Fyll i alla fält'});


    const hash = bcrypt.hashSync(password, 10);
    try{
        const stmt = db.prepare('INSERT INTO users(username, password) VALUES (?, ?)');
        const result = stmt.run(username, hash);
        res.status(201).json({id: result.lastInsertRowId, username});
    } catch {
        res.status(409).json({error: 'Användernamnet är redan taget'});
    }
});


router.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if(!user || !bcrypt.compareSync(password, user.password))
        return res.status(401).json({error: 'Fel användarnamn eller lösenord'});


    const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '7d'});
    res.json({token, username: user.username});
});

module.exports = router;