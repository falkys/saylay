const { CreateStorage } = require("database-sempai");

const db = new CreateStorage({
  path: "database",
  table: ["settings"],
  extname: ".json",
});
module.exports = db;