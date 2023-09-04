import { db, errorHandler } from "./utils.js";

db.serialize();

db.run("DROP TABLE IF EXISTS authentication", [], errorHandler);

db.run(
  "CREATE TABLE authentication(id INTEGER PRIMARY KEY, login TEXT NOT NULL, password TEXT NOT NULL)"
);