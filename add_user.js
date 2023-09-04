import { db, errorHandler } from "./utils.js";

export async function addUser(user) {
  // TODO: а для чего именно тут два промиса? что делает один и что второй
  return new Promise((resolve, reject) => {
    new Promise((res, rej) => {
      db.all("SELECT login FROM authentication", [], (err, rows) => {
        if (err) {
          rej(err);
        }
        res(rows);
      });
    }).then((data) => {
      // TODO: убрать
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

      // TODO: сейчас сделано так, что ты ВСЮ таблицу забираешь в переменную и в коде сервера вот тут
      // проверяешь нет ли там пользователя. теперь представь, что у тебя в этой таблице миллион записей
      // и у тебя сотня пользователей решила добавить себя на сайте в один и тот же момент
      // что сделает твой скрипт? верно, вытащит миллион записей в оперативную память 100 раз одновременно
      // поздравляю, ты уронила сервер
      // эту проверку надо переписать на SELECT запрос, который проверит, есть ли записи с таким логином в таблице
      let exists = data.some((el) => {
        return el.login === user.login;
      });

      console.log("exists", exists);

      if (exists === true) {
        reject(new Error("false"));
        // TODO: почему бы не сделать тут return, сразу завершив выполнение, а код, идущий далее в
        // else просто вынести из else?
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
  }).catch((err) => err.message); // TODO: вот что конкретно тут должно происходить? мы получаем
  // ошибку а потом просто опрашиваем ее сообщение, в пустоту. никуда не выводим, ничего не делаем
  // с ним, просто его берем в никуда
}
