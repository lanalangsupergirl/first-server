import { db, errorHandler } from "./utils.js";

export async function LogIn(user) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT login, password FROM authentication WHERE login = ? AND password = ?",
      [user.login, user.password],
      (err, row) => {
        if (err) {
          errorHandler;
        }
        resolve(row);
      }
    );
  }).then((data) => {
    console.log('data', data)
    if (!data) {
      return "false";
    } else {
      return "true";
    }
  });
}
