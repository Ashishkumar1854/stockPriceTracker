const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Mount routers (auth, users, companies)
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/companies", require("./routes/companies"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Backend listening ${PORT}`));
