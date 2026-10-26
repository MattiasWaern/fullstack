require("dotenv").config();
const express = require("express");
const cors = require("cors");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET saknas");
const app = express();
const origins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: origins }));
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/reviews", require("./routes/reviews"));
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server körs på port ${port}`));
