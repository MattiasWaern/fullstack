const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

router.post("/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password)
    return res.status(400).json({ error: "Fyll i alla fält" });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      "INSERT INTO users(username,password) VALUES($1,$2) RETURNING id,username",
      [username.trim(), hash],
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Användarnamnet är redan taget" });
    console.error(err);
    return res.status(500).json({ error: "Kunde inte registrera användaren" });
  }
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "Fyll i alla fält" });
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Fel användarnamn eller lösenord" });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Kunde inte logga in" });
  }
});
module.exports = router;
