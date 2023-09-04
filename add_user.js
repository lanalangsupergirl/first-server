import { db, errorHandler } from "./utils.js";

export async function addUser(user) {
  return new Promise((resolve, reject) => {
    new Promise((res, rej) => {
      db.all("SELECT login FROM authentication", [], (err, rows) => {
        if (err) {
          rej(err);
        }
        res(rows);
      });
    }).then((data) => {
      if (data === []) {
        new Promise(() => {
          db.run(
            "INSERT INTO authentication(login, password) VALUES (?, ? )",
            [user.login, user.password],
            errorHandler
          );
          resolve("true");
        });
      }

      let exists = data.some((el) => {
        return el.login === user.login;
      });

      console.log("exists", exists);

      if (exists === true) {
        reject(new Error("false"));
      } else {
        new Promise(() => {
          db.run(
            "INSERT INTO authentication(login, password) VALUES (?, ? )",
            [user.login, user.password],
            errorHandler
          );
          resolve("true");
        });
      }
    });
  }).catch((err) => err.message);
}
