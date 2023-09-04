import sqlite3 from "sqlite3";

export function openDb(dbname, path) {
  return new dbname.Database(path, dbname.OPEN_READWRITE, (err) => {
    if (err) {
      process.stderr.write(err);
      return;
    }
  });
}

export let db = openDb(sqlite3, "./recipes.db");

export function errorHandler(err) {
  if (err) {
    console.log(err);
    return;
  }
}
