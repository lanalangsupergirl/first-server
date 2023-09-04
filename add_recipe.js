import { db, errorHandler } from "./utils.js";

export async function addRecipe(recipe) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO recipes(title, description, macros, text) VALUES (?, ?, ?, ?)",
      [recipe.title, recipe.description, recipe.macros, recipe.text],
      errorHandler
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
      db.run(
        "INSERT INTO images(recipe_id, path) VALUES(?, ?)",
        [id, "/images/no_foto.png"],
        errorHandler
      );

      recipe.categories.forEach((category) => {
        db.get(
          "SELECT rowid, * FROM categories WHERE name = ?",
          [category],
          (err, result) => {
            if (err) {
              console.log(err);
              return;
            }

            db.run(
              "INSERT INTO recipeCat(recipe_id, category_id) VALUES (?, ?)",
              [id, result.rowid],
              errorHandler
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
              console.log(err);
              return;
            }

            db.run(
              "INSERT INTO recipeIng(recipe_id, ingredient_id) VALUES (?, ?)",
              [id, result.rowid],
              errorHandler
            );
          }
        );
      });
    })
    .catch(errorHandler);
}
