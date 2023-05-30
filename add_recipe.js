import sqlite3 from "sqlite3";
import { openDb } from "./utils.js";

let db = openDb(sqlite3, "./recipes.db");

export async function addRecipe(recipe) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO recipes(title, description, macros, text) VALUES (?, ?, ?, ?)",
      [recipe.title, recipe.description, recipe.macros, recipe.text],
      (err) => {
        if (err) {
          console.log(err);
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
