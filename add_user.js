import { db, errorHandler } from "./utils.js";

export async function addUser(user) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT login FROM authentication WHERE login = ?",
      [user.login],
      (err, row) => {
        if (err) {
          errorHandler;
        }
        resolve(row);
      }
    );
  })
    .then((data) => {
      if (data) {
        return "false";
      }

      let result = new Promise((res, rej) => {
        db.run(
          "INSERT INTO authentication(login, password) VALUES (?, ? )",
          [user.login, user.password],
          errorHandler
        );
        res("true");
      });

      return result;
    })
    .catch(errorHandler);
}
