const express = require("express");
const router = express.Router();

// local signup/login (skeleton)
router.post("/signup", async (req, res) => {
  // validate, hash password, insert user in Postgres
  res.json({ ok: true });
});
router.post("/login", async (req, res) => {
  // verify, issue access token / refresh token cookie
  res.json({ ok: true });
});

module.exports = router;
