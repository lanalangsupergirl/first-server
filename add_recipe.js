import sqlite3 from "sqlite3";

export async function addRecipe(recipe) {
  return new Promise((resolve, reject) => {

    let db = new sqlite3.Database(
      "./recipes.db",
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          process.stderr.write(err);
          return;
        }
      }
    );

    db.run(
      "INSERT INTO recipes(title, description, macros, text) VALUES (?, ?, ?, ?)",
      [recipe.title, recipe.description, recipe.macros, recipe.text],
      (err) => {
        if (err) {
          process.stderr.write(err);
          return;
        }
      }
    );

    db.get("SELECT last_insert_rowid() as last_id", [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.last_id);
    });
  })
    .then((id) => {
      console.log("id", id);
      console.log("recipe", recipe);
      //тут все уже не работает, а раньше то работало

      db.run(
        "INSERT INTO images(recipe_id, path) VALUES(?, ?)",
        [id, "/images/no_foto.png"],
        (err) => {
          if (err) {
            process.stderr.write(err);
            return;
          }
        }
      );

      recipe.categories.forEach((category) => {
        db.get(
          "SELECT rowid, * FROM categories WHERE name = ?",
          [category],
          (err, result) => {
            if (err) {
              process.stderr.write(err);
              return;
            }

            db.run(
              "INSERT INTO recipeCat(recipe_id, category_id) VALUES (?, ?)",
              [id, result.rowid],
              (err) => {
                if (err) {
                  process.stderr.write(err);
                  return;
                }
              }
            );
          }
        );
      });

      recipe.ingredients.forEach((ingredient) => {
        console.log(ingredient);
        db.get(
          "SELECT rowid, * FROM ingredients WHERE name = ?",
          [ingredient],
          (err, result) => {
            if (err) {
              process.stderr.write(err);
              return;
            }

            db.run(
              "INSERT INTO recipeIng(recipe_id, ingredient_id) VALUES (?, ?)",
              [id, result.rowid],
              (err) => {
                if (err) {
                  process.stderr.write(err);
                  return;
                }
              }
            );
          }
        );
      });
    })
    .catch((err) => {
      if (err) {
        process.stderr.write(err);
        return;
      }
    });
}
