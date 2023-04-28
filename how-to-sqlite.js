//add column in existing table

// sql = `ALTER TABLE images ADD COLUMN recipe_id INTEGER NOT NULL`;
// db.run(sql, [], (err) => {
//       if (err) return console.error(err.message);
//     })
// sql = `SELECT * FROM recipes`;
// db.all(sql, [], (err, rows) => {
//   if (err) return console.error(err.message);
//   rows.forEach(row => console.log(row))
// })

// sql = `DROP TABLE IF EXISTS recipes`;
// db.run(sql, [], (err) => {
//   if(err) return console.error(err.message)})

//create table
// sql = `CREATE TABLE recipes(id INTEGER PRIMARY KEY,title,description,macros,text,categories,ingredients,images)`;
// db.run(sql);

// sql = `DROP TABLE recipes`;
// db.run(sql, [], (err) => {
//   if(err) return console.error(err.message)})

//insert data to table
// sql = `INSERT INTO recipes(title,description,macros,text,categories,ingredients,images) VALUES (?,?,?,?,?,?,?)`;

// db.run(
//   sql,
//   [ "Хачапурь-Легенда",
//   "Тот самый физикловский легендарный хачапурь",
//    "333 ккал БЖУ 27,10/16,96/16,94",
//    ["белок", "выпечка", "сушка"],
//    ["творог", "яйца", "сыр"],
//     "### Ингредиенты: \n --- \n **Основа** \n * Кудесница мука ржаная 10 г \n * Кудесница мука рисовая 10 г \n * Творог 5% 80 г \n * Яйцо куриное 43 г \n * Предгорье Кавказа Сыр Сулугуни 40г \n ### Способ приготовления: \n 1. Поставить духовку греться на 200 градусов, режим верх-низ 2. Творог, белок, муку (+соль, разрыхлитель, чуток сахзама) смешать\n 3. Полученную массу выложить на противень в виде лепёшки/лодочки, поставить в духовку\n 4. Потереть сыр\n 5. Через 15 минут, когда лодочка 'загорела', добавить сыр в лодку, в центр положить желток\n 6. Снова поставить в духовку, уменьшив температуру.\n 7. Дождаться, пока сыр расплавится\n ---\n **Нюансы**\n * Тесто не будет похоже на тесто, будет липкая масса\n * Форму делаем при помощи ложки или влажных рук\n * После выпекания становится вполне нормальной булкой\n * Менять сыр на обезжиренный не нужно\n Иначе в расплавленном виде он станет похож на резину\n * Творог вполне можно заменить на обезжиренный\n * Рисовая мука даёт корочку, ржаная - приятный привкус хлеба\n",
//     ["/images/img2_1.png"]],
//   (err) => {
//     if (err) return console.error(err.message);
//   }
// );
// sql = `INSERT INTO recipes(title,description,macros,text,categories,ingredients,images) VALUES (?,?,?,?,?,?,?)`;
// db.run(sql, [dataRecipes], (err) => {
//       if (err) return console.error(err.message);
//   })

// query data
// sql = `SELECT * FROM recipes`;
// db.all(sql, [], (err, rows) => {
//   if (err) return console.error(err.message);
//   rows.forEach(row => console.log(row))
// })

//update data
// sql = `UPDATE recipes SET title = ? WHERE id = ?`
// db.run(sql, ["Не Прага", 1], (err) => {
//      if (err) return console.error(err.message);
//   })

//delete data
// sql = `DELETE FROM recipes WHERE id = ?`
// db.run(sql, [1], (err) => {
//      if (err) return console.error(err.message);
//   })
