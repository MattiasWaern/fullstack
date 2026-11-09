const router = require("express").Router();
const db = require("../database");
const requireAuth = require("../middleware/auth");
const validRating = (n) =>
  Number.isInteger(Number(n)) && Number(n) >= 1 && Number(n) <= 5;
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT reviews.*,books.title AS book_title,books.cover_url FROM reviews JOIN books ON reviews.book_id=books.id WHERE reviews.user_id=$1 ORDER BY reviews.created_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Kunde inte hämta recensioner" });
  }
});
router.post("/", requireAuth, async (req, res) => {
  const { book_id, rating, text } = req.body || {};
  if (
    !Number.isInteger(Number(book_id)) ||
    Number(book_id) < 1 ||
    !validRating(rating) ||
    typeof text !== "string" ||
    !text.trim()
  )
    return res
      .status(400)
      .json({ error: "Giltigt book_id, betyg (1–5) och text krävs" });
  try {
    const { rows } = await db.query(
      "INSERT INTO reviews(book_id,user_id,rating,text) VALUES($1,$2,$3,$4) RETURNING id,book_id,rating,text",
      [book_id, req.user.id, rating, text.trim()],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res
      .status(e.code === "23503" ? 404 : 500)
      .json({ error: "Kunde inte skapa recensionen" });
  }
});
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT user_id FROM reviews WHERE id=$1", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ error: "Recensionen hittades inte" });
    if (rows[0].user_id !== req.user.id)
      return res
        .status(403)
        .json({ error: "Du kan bara ta bort dina egna recensioner" });
    await db.query("DELETE FROM reviews WHERE id=$1", [req.params.id]);
    res.json({ message: "Recension borttagen" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Kunde inte ta bort recensionen" });
  }
});
router.put("/:id", requireAuth, async (req, res) => {
  const { rating, text } = req.body || {};
  if (!validRating(rating) || typeof text !== "string" || !text.trim())
    return res
      .status(400)
      .json({ error: "Giltigt betyg (1–5) och text krävs" });
  try {
    const { rows } = await db.query("SELECT user_id FROM reviews WHERE id=$1", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ error: "Recensionen hittades inte" });
    if (rows[0].user_id !== req.user.id)
      return res
        .status(403)
        .json({ error: "Du kan bara redigera dina egna recensioner" });
    await db.query("UPDATE reviews SET rating=$1,text=$2 WHERE id=$3", [
      rating,
      text.trim(),
      req.params.id,
    ]);
    res.json({ message: "Recensionen har uppdaterats" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Kunde inte uppdatera recensionen" });
  }
});
module.exports = router;
