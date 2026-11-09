const router = require("express").Router();
const db = require("../database");
const requireAuth = require("../middleware/auth");
const fail = (res, e, message) => {
  console.error(e);
  return res.status(500).json({ error: message });
};
const validId = (id) => Number.isSafeInteger(Number(id)) && Number(id) > 0;
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT books.*,users.username AS created_by_username,AVG(reviews.rating)::float AS avg_rating,COUNT(reviews.id)::integer AS review_count FROM books LEFT JOIN users ON books.created_by=users.id LEFT JOIN reviews ON books.id=reviews.book_id GROUP BY books.id,users.username ORDER BY books.created_at DESC`,
    );
    res.json(rows);
  } catch (e) {
    fail(res, e, "Kunde inte hämta böcker");
  }
});
router.get("/search", async (req, res) => {
  const q = req.query.q;
  if (typeof q !== "string" || !q.trim())
    return res.status(400).json({ error: "Sökterm saknas" });
  try {
    const { rows } = await db.query(
      "SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1 OR isbn=$2",
      [`%${q}%`, q],
    );
    res.json(rows);
  } catch (e) {
    fail(res, e, "Kunde inte söka böcker");
  }
});
router.get("/my/want-to-read", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT books.* FROM books JOIN want_to_read ON books.id=want_to_read.book_id WHERE want_to_read.user_id=$1 ORDER BY want_to_read.created_at DESC",
      [req.user.id],
    );
    res.json(rows);
  } catch (e) {
    fail(res, e, "Kunde inte hämta din lista");
  }
});
router.get("/my/reading-progress", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT rp.current_page,rp.book_id,b.title,b.author,b.cover_url,b.page_count FROM reading_progress rp JOIN books b ON rp.book_id=b.id WHERE rp.user_id=$1 ORDER BY rp.updated_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (e) {
    fail(res, e, "Kunde inte hämta lässtatus");
  }
});


router.post("/:id/progress", requireAuth, async (req, res) => {
  const page = req.body?.current_page;
  if (!Number.isSafeInteger(page) || page < 0)
    return res
      .status(400)
      .json({ error: "current_page måste vara ett heltal från 0" });
  if (!validId(req.params.id))
    return res.status(400).json({ error: "Ogiltigt bok-ID" });
  try {
    const { rows } = await db.query(
      "SELECT page_count FROM books WHERE id=$1",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Boken hittades inte" });
    if (rows[0].page_count != null && page > rows[0].page_count)
      return res
        .status(400)
        .json({ error: `Boken har bara ${rows[0].page_count} sidor!` });
    await db.query(
      `INSERT INTO reading_progress(user_id,book_id,current_page,updated_at) VALUES($1,$2,$3,CURRENT_TIMESTAMP) ON CONFLICT(user_id,book_id) DO UPDATE SET current_page=EXCLUDED.current_page,updated_at=CURRENT_TIMESTAMP`,
      [req.user.id, req.params.id, page],
    );
    res.json({ message: "Framsteg sparade", current_page: page });
  } catch (e) {
    fail(res, e, "Kunde inte spara framsteg");
  }
});

router.delete("/:id/progress", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ error: "Ogiltigt bok-ID" });
  }

  try {
    const { rowCount } = await db.query(
      "DELETE FROM reading_progress WHERE user_id=$1 AND book_id=$2",
      [req.user.id, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        error: "Boken finns inte i din Reading Tracker"
      });
    }

    res.json({
      message: "Boken har tagits bort från Reading Tracker"
    });
  } catch (e) {
    return fail(res, e, "Kunde inte ta bort läsframsteg");
  }
});

router.get("/:id", async (req, res) => {
  if (!validId(req.params.id))
    return res.status(400).json({ error: "Ogiltigt bok-ID" });
  try {
    const { rows } = await db.query(
      "SELECT books.*,users.username AS created_by_username FROM books LEFT JOIN users ON books.created_by=users.id WHERE books.id=$1",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Boken hittades inte" });
    res.json(rows[0]);
  } catch (e) {
    fail(res, e, "Kunde inte hämta boken");
  }
});
const fields = [
  "title",
  "author",
  "description",
  "cover_url",
  "genre",
  "page_count",
  "release_year",
  "publisher",
  "isbn",
];
router.post("/", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.title?.trim() || !b.author?.trim())
    return res.status(400).json({ error: "Titel och författare krävs" });
  const values = fields.map((f) => b[f] ?? null);
  values[5] = values[5] || null;
  values[6] = values[6] || null;
  values[8] = values[8] || null;
  try {
    const { rows } = await db.query(
      `INSERT INTO books(${fields.join(",")},created_by) VALUES(${values.map((_, i) => "$" + (i + 1)).join(",")},$10) RETURNING *`,
      [...values, req.user.id],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505")
      return res
        .status(400)
        .json({ error: "En bok med detta ISBN finns redan" });
    fail(res, e, "Kunde inte spara boken");
  }
});
router.post("/:id/want-to-read", requireAuth, async (req, res) => {
  try {
    await db.query(
      "INSERT INTO want_to_read(user_id,book_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [req.user.id, req.params.id],
    );
    res.json({ message: "Tillagd i din läslista" });
  } catch (e) {
    if (e.code === "23503")
      return res.status(404).json({ error: "Boken hittades inte" });
    fail(res, e, "Kunde inte spara");
  }
});
router.delete("/:id/want-to-read", requireAuth, async (req, res) => {
  try {
    await db.query("DELETE FROM want_to_read WHERE user_id=$1 AND book_id=$2", [
      req.user.id,
      req.params.id,
    ]);
    res.json({ message: "Borttagen från din läslista" });
  } catch (e) {
    fail(res, e, "Kunde inte ta bort");
  }
});
router.get("/:id/want-to-read-status", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "SELECT 1 FROM want_to_read WHERE user_id=$1 AND book_id=$2",
      [req.user.id, req.params.id],
    );
    res.json({ isWantToRead: rowCount > 0 });
  } catch (e) {
    fail(res, e, "Kunde inte hämta status");
  }
});
router.put("/:id", requireAuth, async (req, res) => {
  const b = req.body || {};
  try {
    const { rows } = await db.query(
      "SELECT created_by FROM books WHERE id=$1",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Boken hittades inte" });
    if (rows[0].created_by !== req.user.id)
      return res
        .status(403)
        .json({ error: "Du kan bara redigera dina egna böcker" });
    if (!b.title?.trim() || !b.author?.trim())
      return res.status(400).json({ error: "Titel och författare krävs" });
    const values = fields.map((f) => b[f] ?? null);
    values[5] = values[5] || null;
    values[6] = values[6] || null;
    values[8] = values[8] || null;
    await db.query(
      `UPDATE books SET ${fields.map((f, i) => `${f}=$${i + 1}`).join(",")} WHERE id=$10`,
      [...values, req.params.id],
    );
    res.json({ message: "Boken uppdaterad" });
  } catch (e) {
    if (e.code === "23505")
      return res
        .status(400)
        .json({ error: "En bok med detta ISBN finns redan" });
    fail(res, e, "Kunde inte uppdatera boken");
  }
});
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT created_by FROM books WHERE id=$1",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Boken hittades inte" });
    if (rows[0].created_by !== req.user.id)
      return res
        .status(403)
        .json({ error: "Du kan bara ta bort dina egna böcker" });
    await db.query("DELETE FROM books WHERE id=$1", [req.params.id]);
    res.json({ message: "Boken raderad permanent" });
  } catch (e) {
    fail(res, e, "Ett fel uppstod i databasen");
  }
});
router.get("/:id/reviews", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT reviews.*,users.username FROM reviews JOIN users ON reviews.user_id=users.id WHERE reviews.book_id=$1 ORDER BY reviews.created_at DESC",
      [req.params.id],
    );
    res.json(rows);
  } catch (e) {
    fail(res, e, "Kunde inte hämta recensioner");
  }
});
module.exports = router;
