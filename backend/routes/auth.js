const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
router.post('/register', async (req,res) => {
 const {username,password}=req.body || {};
 if(typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) return res.status(400).json({error:'Fyll i alla fält'});
 try { const hash=await bcrypt.hash(password,10); const {rows}=await db.query('INSERT INTO users(username,password) VALUES($1,$2) RETURNING id,username',[username,hash]);res.status(201).json(rows[0]); }
 catch(e){if(e.code==='23505')return res.status(409).json({error:'Användarnamnet är redan taget'});console.error(e);res.status(500).json({error:'Serverfel'});}
});
router.post('/login',async(req,res)=>{
 const {username,password}=req.body || {};
 if(typeof username!=='string'||typeof password!=='string')return res.status(400).json({error:'Ange användarnamn och lösenord'});
 try {const {rows}=await db.query('SELECT * FROM users WHERE username=$1',[username]);const user=rows[0];if(!user||!await bcrypt.compare(password,user.password))return res.status(401).json({error:'Fel användarnamn eller lösenord'});
 const token=jwt.sign({id:user.id,username:user.username},process.env.JWT_SECRET,{expiresIn:'7d'});res.json({token,username:user.username});}
 catch(e){console.error(e);res.status(500).json({error:'Serverfel'});}
});
module.exports=router;
