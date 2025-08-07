const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

require("./index.js");

app.get("/", (req, res) => {
  res.send("Blaze WhatsApp Bot is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
